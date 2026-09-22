import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/google/connection";
import {
  listerProprietes,
  requetesDeLaPeriode,
  type ProprieteSearchConsole,
  type RequeteMesuree,
} from "@/lib/google/search-console";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Ce que Search Console sait de cet établissement.
 *
 * Un seul point d'entrée pour l'écran et pour l'analyse : les deux ont
 * besoin des mêmes chiffres, et les laisser interroger Google chacun de
 * leur côté doublerait les appels sans rien apporter.
 *
 * Ne lève jamais. La page SEO vit très bien sans Search Console — c'est
 * d'ailleurs ainsi qu'elle a vécu jusqu'ici — et une panne chez Google ne
 * doit pas emporter les mots-clés et l'audit avec elle.
 */
export type EtatSearchConsole = {
  /** Faux quand aucun compte Google n'est relié à l'établissement. */
  connecte: boolean;
  /** Les propriétés vérifiées du compte, pour que le restaurateur choisisse. */
  proprietes: ProprieteSearchConsole[];
  /** Celle qu'il a désignée. Null tant qu'il n'a pas choisi. */
  site: string | null;
  requetes: RequeteMesuree[];
  erreur: string | null;
};

const VIDE: EtatSearchConsole = {
  connecte: false,
  proprietes: [],
  site: null,
  requetes: [],
  erreur: null,
};

export async function etatSearchConsole(
  supabase: SupabaseClient,
  restaurantId: string,
  siteChoisi: string | null,
): Promise<EtatSearchConsole> {
  try {
    const { data } = await supabase
      .from("google_business_connections")
      .select("restaurant_id, access_token, refresh_token, token_expires_at")
      .eq("restaurant_id", restaurantId)
      .maybeSingle();

    if (!data) return VIDE;

    const accessToken = await getValidAccessToken(
      supabase,
      data as {
        restaurant_id: string;
        access_token: string;
        refresh_token: string;
        token_expires_at: string;
      },
    );

    const proprietes = await listerProprietes(accessToken);

    // Une seule propriété et aucun choix fait : la désigner d'office
    // épargne un clic qui n'apprend rien à personne.
    const site =
      siteChoisi ?? (proprietes.length === 1 ? proprietes[0].site : null);

    if (!site) {
      return {
        connecte: true,
        proprietes,
        site: null,
        requetes: [],
        erreur: null,
      };
    }

    const requetes = await requetesDeLaPeriode({ accessToken, site });
    return { connecte: true, proprietes, site, requetes, erreur: null };
  } catch (erreur) {
    console.error("[search-console]", erreur);
    return { ...VIDE, connecte: true, erreur: expliquer(erreur) };
  }
}

/**
 * Traduire l'échec de Google en une phrase qui dise quoi faire.
 *
 * Il n'y avait qu'un message pour tous les cas : « vérifie que le compte
 * a bien accès à la propriété ». C'était vrai une fois sur trois, et
 * inutilisable les deux autres — un restaurateur qui lit ça va regarder
 * ses droits Search Console alors que le problème est ailleurs, et il
 * n'a aucun moyen de le savoir.
 *
 * Google dit ce qui ne va pas, et nos deux fonctions recopient sa
 * réponse dans le message de l'erreur. Il suffit de la lire.
 */
function expliquer(erreur: unknown): string {
  const texte = erreur instanceof Error ? erreur.message : String(erreur);

  // Le projet Google Cloud n'a pas activé l'API Search Console. C'est une
  // API distincte de celle des fiches et de celle des lieux : on peut
  // très bien avoir les deux autres et pas celle-ci.
  if (
    /accessNotConfigured|has not been used in project|SERVICE_DISABLED/i.test(
      texte,
    )
  ) {
    return (
      "L'API Search Console n'est pas activée dans le projet Google Cloud " +
      "de Klarr. Ce n'est pas un réglage de votre côté : prévenez-nous à " +
      "contact@klarr.net."
    );
  }

  // Le compte a été relié avant que Klarr demande l'accès à Search
  // Console. Google n'accorde jamais une autorisation après coup : le
  // jeton rangé ne porte que ce qui a été accepté le jour du
  // branchement, et seul un nouveau passage par l'écran de consentement
  // le remplace.
  if (
    /insufficient|invalid_grant|ACCESS_TOKEN_SCOPE|unauthorized|401/i.test(
      texte,
    )
  ) {
    return (
      "Le compte Google a été relié avant que Klarr demande l'accès à " +
      "Search Console. Ouvrez Connexions, déconnectez Google puis " +
      "reconnectez-le : l'autorisation sera demandée cette fois-ci."
    );
  }

  // Le compte est bien autorisé, mais pas sur cette propriété-là.
  if (/403|forbidden|permission/i.test(texte)) {
    return (
      "Le compte Google relié n'a pas accès à cette propriété Search " +
      "Console. Vérifiez qu'il y figure comme propriétaire ou utilisateur " +
      "dans les paramètres de la propriété."
    );
  }

  if (/404|notFound/i.test(texte)) {
    return (
      "Cette propriété n'existe plus dans Search Console. Choisissez-en " +
      "une autre, ou laissez le champ vide."
    );
  }

  return (
    "Search Console n'a pas répondu. Si cela dure, écrivez-nous à " +
    "contact@klarr.net."
  );
}
