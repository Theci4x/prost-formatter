/**
 * Le tirage de la roue.
 *
 * Tout est ici, en fonctions pures, et c'est le point : une roue distribue
 * des cafés, des desserts et des remises sur l'addition. Ce qui donne de
 * l'argent doit pouvoir se vérifier sans base de données et sans
 * navigateur.
 *
 * Deux règles que le reste du fichier applique :
 *
 * — **Le tirage se fait sur le serveur.** Une roue dont le résultat se
 *   décide dans le navigateur se truque en trois lignes de console, et
 *   c'est le restaurateur qui paie les lots. L'animation s'aligne sur le
 *   résultat reçu, jamais l'inverse.
 *
 * — **La note du client n'entre nulle part.** Elle n'est ni demandée, ni
 *   connue, ni un paramètre du tirage. Un lot qui dépendrait de l'étoile
 *   serait un avis acheté ; ici le lot tombe pareil pour une étoile et
 *   pour cinq.
 */

export type Lot = {
  id: string;
  libelle: string;
  gagnant: boolean;
  /** Poids relatif. Zéro retire la case du tirage sans la supprimer. */
  poids: number;
  /** Plafond de lots à distribuer. `null` = sans plafond. */
  stock: number | null;
  /** Combien ont déjà été distribués. */
  distribues: number;
};

export type Tirage = {
  lot: Lot;
  /** L'index du lot dans la liste donnée, pour aligner l'animation. */
  index: number;
};

/** Un lot encore distribuable, et qui pèse quelque chose. */
export function tirable(lot: Lot): boolean {
  if (lot.poids <= 0) return false;
  if (lot.stock === null) return true;
  return lot.distribues < lot.stock;
}

/**
 * Tire une case.
 *
 * Le hasard est injecté : c'est ce qui permet de vérifier la répartition
 * au lieu de l'espérer. `hasard()` rend un nombre dans [0, 1[.
 *
 * Rend `null` quand plus rien n'est distribuable — toutes les cases à
 * zéro, ou tous les stocks épuisés. L'appelant doit alors fermer le jeu
 * plutôt que d'inventer un lot qui n'existe plus.
 */
export function tirer(
  lots: Lot[],
  hasard: () => number = Math.random,
): Tirage | null {
  const candidats = lots
    .map((lot, index) => ({ lot, index }))
    .filter(({ lot }) => tirable(lot));
  if (candidats.length === 0) return null;

  const total = candidats.reduce((somme, { lot }) => somme + lot.poids, 0);
  if (total <= 0) return null;

  // `hasard()` peut rendre exactement 0 mais jamais 1 : le seuil tombe
  // donc toujours à l'intérieur d'une case.
  let seuil = hasard() * total;
  for (const candidat of candidats) {
    seuil -= candidat.lot.poids;
    if (seuil < 0) return candidat;
  }
  // Inatteignable en théorie ; un arrondi flottant suffit à le rendre
  // possible, et rendre la dernière case vaut mieux que rendre rien.
  return candidats[candidats.length - 1];
}

/**
 * Les caractères d'un code de retrait.
 *
 * Ni I ni 1, ni O ni 0 : le code se lit à voix haute au serveur, parfois
 * en plein service, et « IO01 » se saisit de travers une fois sur deux.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const LONGUEUR_CODE = 6;

export function codeDeRetrait(hasard: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < LONGUEUR_CODE; i += 1) {
    code += ALPHABET[Math.floor(hasard() * ALPHABET.length)];
  }
  return code;
}

/** Le dernier jour où le lot se présente, au format « 2026-10-21 ». */
export function expireLe(depuis: Date, validiteJours: number): string {
  const fin = new Date(depuis.getTime());
  fin.setDate(fin.getDate() + validiteJours);
  return fin.toISOString().slice(0, 10);
}

/**
 * Cette adresse peut-elle rejouer ?
 *
 * Sans cette règle, une même personne vide le stock de la soirée depuis
 * sa table. Un délai à zéro la désactive — ce qui ne se justifie que pour
 * un soir particulier, pas pour un totem posé à l'année.
 */
export function peutRejouer(
  dernierePartie: Date | null,
  delaiJours: number,
  maintenant: Date = new Date(),
): boolean {
  if (dernierePartie === null) return true;
  if (delaiJours <= 0) return true;
  const ecoule = maintenant.getTime() - dernierePartie.getTime();
  return ecoule >= delaiJours * 24 * 60 * 60 * 1000;
}
