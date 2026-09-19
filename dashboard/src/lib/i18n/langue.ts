import "server-only";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * La langue du tableau de bord.
 *
 * Elle ne passe pas par l'adresse, contrairement à ce que recommande la
 * documentation de Next pour un site public. La raison est simple : le
 * tableau de bord est derrière une authentification et porte « noindex ».
 * Des sous-chemins « /fr/dashboard » n'apporteraient aucun référencement
 * et obligeraient à déplacer toutes les routes, réécrire chaque lien et
 * chaque redirection. Le choix vit donc sur le compte.
 *
 * Il est rangé dans les métadonnées de l'utilisateur plutôt que dans une
 * table : pas de migration, et la valeur suit la personne d'un
 * établissement à l'autre — un gérant qui lit l'anglais le lit partout.
 */

export const LANGUES = ["fr", "en", "zh"] as const;
export type Langue = (typeof LANGUES)[number];

export const NOM_LANGUE: Record<Langue, string> = {
  fr: "Français",
  en: "English",
  zh: "中文",
};

export function estLangue(valeur: unknown): valeur is Langue {
  return (LANGUES as readonly unknown[]).includes(valeur);
}

/**
 * Celle du compte, ou le français.
 *
 * Ne lève jamais : une session expirée ou une base indisponible doivent
 * donner un écran en français, pas une page d'erreur.
 */
export async function langueUtilisateur(): Promise<Langue> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const choisie = user?.user_metadata?.langue;
    return estLangue(choisie) ? choisie : "fr";
  } catch {
    return "fr";
  }
}

/** Le nom du témoin qui garde le choix d'un visiteur pas encore inscrit. */
export const COOKIE_LANGUE = "klarr_langue";

/**
 * La langue d'un visiteur, avant tout compte.
 *
 * Son choix d'abord, s'il en a fait un ; sinon celle de son navigateur,
 * comme le recommande la documentation de Next. Un restaurateur chinois
 * arrive donc en chinois sans avoir rien à cliquer — et ce qu'il choisit
 * le suit jusque dans son compte, puisque l'inscription y reporte le
 * témoin.
 */
export async function langueVisiteur(): Promise<Langue> {
  try {
    const choisie = (await cookies()).get(COOKIE_LANGUE)?.value;
    if (estLangue(choisie)) return choisie;

    const entete = (await headers()).get("accept-language") ?? "";
    // « zh-CN,zh;q=0.9,fr;q=0.8 » : on prend la première connue.
    for (const morceau of entete.split(",")) {
      const code = morceau.split(";")[0]?.trim().slice(0, 2).toLowerCase();
      if (estLangue(code)) return code;
    }
  } catch {
    // Rendu statique, sans requête : le français fait un repli correct.
  }
  return "fr";
}
