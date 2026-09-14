/**
 * Le plan de salle, côté valeurs partagées : ces constantes sont lues par
 * les formulaires, qui tournent dans le navigateur, autant que par les
 * actions serveur.
 */

export type FormeTable = "ronde" | "carree" | "rectangle";

export type TableSalle = {
  id: string;
  restaurant_id: string;
  espace_id: string;
  nom: string;
  places: number;
  forme: FormeTable;
  x: number;
  y: number;
};

export const FORMES: { valeur: FormeTable; libelle: string }[] = [
  { valeur: "ronde", libelle: "Ronde" },
  { valeur: "carree", libelle: "Carrée" },
  { valeur: "rectangle", libelle: "Rectangulaire" },
];

/**
 * La grille du plan. Des cases plutôt que des pixels : le plan reste lisible
 * sur le téléphone du chef de rang, deux tables ne se chevauchent jamais à
 * moitié, et une position se répare à la main dans la base si besoin.
 */
export const GRILLE_COLONNES = 12;
export const GRILLE_LIGNES = 8;

export type TableValeurs = {
  nom: string;
  places: string;
  forme: FormeTable;
};

export const TABLE_VIDE: TableValeurs = {
  nom: "",
  places: "2",
  forme: "ronde",
};

export function libelleForme(forme: FormeTable): string {
  return FORMES.find((f) => f.valeur === forme)?.libelle ?? "Ronde";
}
