/**
 * Lequel de ces établissements est le sien ?
 *
 * Jusqu'ici on prenait le premier résultat de Google, sans vérifier. Sur
 * « Prost » ça tombait juste ; sur « Le Bistrot », « La Table », « Chez
 * Marcel » — il y en a trente par ville — on envoyait au restaurateur
 * l'audit de quelqu'un d'autre, par courriel, avec le logo de Klarr
 * dessus. Une réponse fausse et sûre d'elle coûte plus cher qu'une
 * question de plus : celui qui voit la note d'un concurrent sur sa propre
 * fiche ne rappelle pas.
 *
 * On ne tranche donc que lorsqu'un seul candidat porte vraiment son nom.
 * Sinon on lui montre la liste et il choisit.
 */

export type Candidat = {
  id: string;
  nom: string;
  adresse: string;
};

/**
 * Le nom réduit à ce qui compte pour le comparer : sans accents, sans
 * ponctuation, sans casse. « L'Hôtel-Dieu » et « lhotel dieu » sont le
 * même établissement, et un restaurateur ne tape jamais les accents.
 */
export function normaliser(nom: string): string {
  return (
    nom
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      // L'apostrophe disparaît au lieu de devenir une espace : « L'Escale »
      // donne « lescale », que « Escale » retrouve par inclusion. Coupée en
      // deux mots, elle ne l'aurait pas été.
      .replace(/['\u2019]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
  );
}

/**
 * Vrai quand les deux noms se contiennent l'un l'autre : « Prost » trouve
 * « Bar Prost », et « Le Prost » trouve « Prost ». On ne cherche pas la
 * ressemblance approximative — deux noms voisins mais distincts (« Le
 * Comptoir » et « Le Comptoir Général ») sont justement le cas où il faut
 * demander plutôt que deviner.
 */
export function correspond(candidat: string, recherche: string): boolean {
  const a = normaliser(candidat);
  const b = normaliser(recherche);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

export type Verdict =
  | { certain: Candidat }
  | { choix: Candidat[] }
  | { aucun: true };

/**
 * Tranche, ou rend la main.
 *
 * Un seul candidat au nom concordant : c'est lui, on ne dérange personne.
 * Plusieurs, ou aucun : on montre la liste. Zéro résultat : il n'y a rien
 * à montrer, l'établissement n'est pas sur Google — ce qui est en soi le
 * résultat de l'audit.
 */
export function trancher(candidats: Candidat[], recherche: string): Verdict {
  if (candidats.length === 0) return { aucun: true };

  const concordants = candidats.filter((c) => correspond(c.nom, recherche));
  if (concordants.length === 1) return { certain: concordants[0]! };

  return { choix: candidats };
}
