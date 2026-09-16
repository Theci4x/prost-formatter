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
    return {
      ...VIDE,
      connecte: true,
      erreur:
        "Search Console n'a pas répondu. Vérifie que le compte Google relié " +
        "a bien accès à la propriété.",
    };
  }
}
