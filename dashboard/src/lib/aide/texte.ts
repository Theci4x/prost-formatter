/**
 * Le découpage en mots de la recherche d'aide.
 *
 * À part d'`articles.ts` parce que le navigateur en a besoin aussi : la
 * page d'aide filtre pendant qu'on tape, et importer `articles.ts` côté
 * client y embarquerait tout le mode d'emploi.
 */

/** Sans accents ni casse : « acompte » doit trouver « Acomptes ». */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * La racine d'un mot, grossièrement : ses cinq premières lettres.
 *
 * Sans ça, « fermeture » ne trouve pas l'article « Fermer un jour » — les
 * deux mots n'ont aucun préfixe commun au sens strict, alors qu'ils parlent
 * évidemment de la même chose. Cinq lettres suffisent en français pour
 * rapprocher fermer/fermeture ou réserver/réservation, sans confondre carte
 * et carton.
 */
export function racine(mot: string): string {
  return mot.length <= 5 ? mot : mot.slice(0, 5);
}

export function mots(texte: string): string[] {
  return normaliser(texte).split(" ").filter(Boolean);
}
