/**
 * Un titre changé en ancre d'URL : « À nous demander » → « a-nous-demander ».
 *
 * Extrait du rendu des articles le jour où la carte publique en a eu
 * besoin pour ses onglets de catégories : le fichier d'origine tire
 * `marked` avec lui, et une page qui ne rend aucun markdown n'a pas à
 * embarquer un analyseur markdown pour translittérer six mots.
 */
export function ancre(titre: string): string {
  const base = titre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "section";
}
