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

export function FacebookConnectButton({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const configId = process.env.NEXT_PUBLIC_FACEBOOK_LOGIN_CONFIG_ID;

  useEffect(() => {
    if (appId) loadFacebookSdk(appId);
  }, [appId]);

  function handleClick() {
    setError(null);

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

    setLoading(true);

    window.FB.login(
      (response) => {
        const accessToken = response.authResponse?.accessToken;
        if (!accessToken) {
          setLoading(false);
          setError("Connexion annulée ou refusée.");
          return;
        }

        fetch("/api/facebook/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, restaurantId }),
        })
          .then((res) => res.json())
          .then((data: { ok?: boolean; error?: string }) => {
            if (data.ok) {
              router.push(`/dashboard/${restaurantId}/social?connected=1`);
              router.refresh();
            } else {
              setLoading(false);
              setError(data.error ?? "La connexion a échoué. Réessaie.");
            }
          })
          .catch(() => {
            setLoading(false);
            setError("La connexion a échoué. Réessaie.");
          });
      },
      { config_id: configId },
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
        {loading ? "Connexion..." : "Connecter Facebook / Instagram"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
