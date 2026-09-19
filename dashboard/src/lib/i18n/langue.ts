import "server-only";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COOKIE_LANGUE, estLangue, type Langue } from "@/lib/i18n/langues";

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

export {
  COOKIE_LANGUE,
  LANGUES,
  NOM_LANGUE,
  CODE_LANGUE,
  estLangue,
  type Langue,
} from "@/lib/i18n/langues";

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

/**
 * La langue d'une page *indexée*.
 *
 * Même chose que `langueVisiteur`, sauf qu'on n'y regarde pas
 * « Accept-Language ». C'est délibéré, et ça vaut pour toute page que
 * Google lit.
 *
 * Un robot d'indexation envoie l'en-tête de son choix, souvent
 * « en-US », parfois rien. Si la page d'accueil s'y pliait, Google
 * indexerait la version anglaise d'un site dont toutes les autres pages
 * — le journal, les mentions, le comparatif — sont en français, et la
 * fiche de résultat cesserait de correspondre à la page. Pire : le
 * balisage FAQ suit la langue affichée, et un balisage qui contredit le
 * texte visible est une raison documentée de perdre l'affichage enrichi.
 *
 * Donc : le français pour tout le monde, et une autre langue seulement
 * pour qui l'a demandée en cliquant. Le choix, lui, se propage
 * normalement vers la connexion et le tableau de bord, qui portent
 * « noindex » et peuvent, eux, deviner.
 */
export async function langueIndexable(): Promise<Langue> {
  try {
    const choisie = (await cookies()).get(COOKIE_LANGUE)?.value;
    if (estLangue(choisie)) return choisie;
  } catch {
    // Rendu statique, sans requête : le français, comme pour un robot.
  }
  return "fr";
}
