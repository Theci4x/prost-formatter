"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FacebookLoginResponse = {
  authResponse?: { accessToken?: string };
};

declare global {
  interface Window {
    FB?: {
      init: (params: Record<string, unknown>) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        params: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const SDK_SCRIPT_ID = "facebook-jssdk";

function loadFacebookSdk(appId: string) {
  if (document.getElementById(SDK_SCRIPT_ID)) return;

  window.fbAsyncInit = function fbAsyncInit() {
    window.FB?.init({ appId, xfbml: false, version: "v21.0" });
  };

  const script = document.createElement("script");
  script.id = SDK_SCRIPT_ID;
  script.src = "https://connect.facebook.net/fr_FR/sdk.js";
  script.async = true;
  document.body.appendChild(script);
}

type FacebookPageOption = { id: string; name: string };

type ExchangeResponse = {
  ok?: boolean;
  error?: string;
  pages?: FacebookPageOption[];
};

export function FacebookConnectButton({
  restaurantId,
  // Page sur laquelle revenir une fois la connexion faite : le bouton est
  // affiche depuis "Connexions" comme depuis "Reseaux sociaux".
  returnTo = "social",
  label = "Connecter Facebook / Instagram",
}: {
  restaurantId: string;
  returnTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pageOptions, setPageOptions] = useState<FacebookPageOption[] | null>(null);

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const configId = process.env.NEXT_PUBLIC_FACEBOOK_LOGIN_CONFIG_ID;

  useEffect(() => {
    if (appId) loadFacebookSdk(appId);
  }, [appId]);

  function exchange(token: string, pageId?: string) {
    setLoading(true);
    setError(null);

    fetch("/api/facebook/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token, restaurantId, pageId }),
    })
      .then((res) => res.json())
      .then((data: ExchangeResponse) => {
        if (data.ok) {
          router.push(`/dashboard/${restaurantId}/${returnTo}?connected=1`);
          router.refresh();
          return;
        }
        if (data.pages) {
          // Plusieurs Pages Facebook disponibles : on garde le token pour
          // finaliser la connexion une fois que l'utilisateur a choisi.
          setAccessToken(token);
          setPageOptions(data.pages);
          setLoading(false);
          return;
        }
        setLoading(false);
        setError(data.error ?? "La connexion a échoué. Réessaie.");
      })
      .catch(() => {
        setLoading(false);
        setError("La connexion a échoué. Réessaie.");
      });
  }

  function handleClick() {
    setError(null);
    setPageOptions(null);

    if (!appId || !configId) {
      setError(
        "Configuration Facebook manquante (NEXT_PUBLIC_FACEBOOK_APP_ID / NEXT_PUBLIC_FACEBOOK_LOGIN_CONFIG_ID).",
      );
      return;
    }
    if (!window.FB) {
      setError("Le SDK Facebook se charge encore, réessaie dans quelques secondes.");
      return;
    }

    window.FB.login(
      (response) => {
        const token = response.authResponse?.accessToken;
        if (!token) {
          setError("Connexion annulée ou refusée.");
          return;
        }
        exchange(token);
      },
      { config_id: configId },
    );
  }

  if (pageOptions && accessToken) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600">
          Plusieurs Pages Facebook sont associées à ton compte. Laquelle
          correspond à ce restaurant ?
        </p>
        <div className="flex flex-col gap-2">
          {pageOptions.map((page) => (
            <button
              key={page.id}
              type="button"
              disabled={loading}
              onClick={() => exchange(accessToken, page.id)}
              className="rounded-md border border-zinc-200 px-4 py-2 text-left text-sm font-medium text-zinc-900 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
            >
              {page.name}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {loading ? "Connexion..." : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
