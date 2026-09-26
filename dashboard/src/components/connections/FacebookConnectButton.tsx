"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Langue } from "@/lib/i18n/langues";
import { traducteur } from "@/lib/i18n/t";
import { CONNEXIONS } from "@/lib/i18n/pages/connexions";

type FacebookLoginResponse = {
  status?: string;
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

/**
 * Les autorisations du flux classique.
 *
 * "Facebook Login for Business" (le flux par `config_id`) porte ses
 * autorisations dans la configuration, côté Meta. Mais ce produit exige que
 * l'App appartienne à un portefeuille business vérifié : tant que celui-ci
 * n'existe pas, aucune configuration n'est créable, donc aucun `config_id`.
 * Le flux classique, lui, demande ses autorisations ici même et fonctionne
 * dès le mode développement, avec les comptes administrateurs de l'App.
 *
 * La liste tient à ce que le code lit réellement : les Pages et leurs
 * statistiques, les Pages détenues par un portefeuille, le compte Instagram
 * professionnel rattaché. Rien pour publier — Klarr ne publie pas.
 */
const SCOPES_CLASSIQUES = [
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
  "instagram_basic",
].join(",");

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
  label,
  langue = "fr",
}: {
  restaurantId: string;
  returnTo?: string;
  label?: string;
  langue?: Langue;
}) {
  const t = traducteur(langue, CONNEXIONS);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pageOptions, setPageOptions] = useState<FacebookPageOption[] | null>(
    null,
  );

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
        setError(t(data.error ?? "La connexion a échoué. Réessaie."));
      })
      .catch(() => {
        setLoading(false);
        setError(t("La connexion a échoué. Réessaie."));
      });
  }

  function handleClick() {
    setError(null);
    setPageOptions(null);

    if (!appId) {
      setError(
        t("Configuration Facebook manquante (NEXT_PUBLIC_FACEBOOK_APP_ID)."),
      );
      return;
    }
    if (!window.FB) {
      setError(
        t("Le SDK Facebook se charge encore, réessaie dans quelques secondes."),
      );
      return;
    }

    // Deux flux pour une seule App. Avec un `config_id`, c'est "Login for
    // Business" — celui qu'on veut en production, parce que le restaurateur
    // y choisit son portefeuille et ses Pages dans l'écran de Meta. Sans
    // lui, on retombe sur le flux classique : moins joli, mais il marche
    // sans portefeuille business, donc sans attendre la vérification.
    const parametres: Record<string, unknown> = configId
      ? { config_id: configId }
      : { scope: SCOPES_CLASSIQUES, return_scopes: true };

    window.FB.login((response) => {
      const token = response.authResponse?.accessToken;
      if (!token) {
        // `status` vaut la peine d'être dit : "unknown" sur une fenêtre
        // fermée, "not_authorized" sur un refus d'autorisations. Sans lui
        // le restaurateur relance dix fois le même geste sans savoir ce
        // qui a manqué.
        setError(
          response.status === "not_authorized"
            ? t(
                "Les autorisations ont été refusées. Relance la connexion et accepte l'accès aux Pages.",
              )
            : t(
                "Connexion annulée. La fenêtre Facebook s'est fermée avant la fin.",
              ),
        );
        return;
      }
      exchange(token);
    }, parametres);
  }

  if (pageOptions && accessToken) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600">
          {t(
            "Plusieurs Pages Facebook sont associées à ton compte. Laquelle correspond à ce restaurant ?",
          )}
        </p>
        <div className="flex flex-col gap-2">
          {pageOptions.map((page) => (
            <button
              key={page.id}
              type="button"
              disabled={loading}
              onClick={() => exchange(accessToken, page.id)}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
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
        className="rounded-lg bg-brand-navy px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {loading
          ? t("Connexion...")
          : (label ?? t("Connecter Facebook / Instagram"))}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
