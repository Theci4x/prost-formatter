/**
 * Le plan de salle, côté valeurs partagées : ces constantes sont lues par
 * les formulaires, qui tournent dans le navigateur, autant que par les
 * actions serveur.
 */

export type FormeTable =
  | "ronde"
  | "carree"
  | "rectangle"
  | "banquette"
  | "haute";

export type TableSalle = {
  id: string;
  restaurant_id: string;
  espace_id: string;
  nom: string;
  places: number;
  forme: FormeTable;
  // Position et taille en points du plan, librement choisies.
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  rotation: number;
};

export type TypeRepere =
  | "mur"
  | "bar"
  | "entree"
  | "cuisine"
  | "toilettes"
  | "poteau";

export type Repere = {
  id: string;
  restaurant_id: string;
  espace_id: string;
  type: TypeRepere;
  libelle: string | null;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  rotation: number;
};

export const LIBELLES_REPERE: Record<TypeRepere, string> = {
  mur: "Mur",
  bar: "Bar",
  entree: "Entrée",
  cuisine: "Cuisine",
  toilettes: "Toilettes",
  poteau: "Poteau",
};

/**
 * Le plan, en points. Une salle de restaurant parisienne fait rarement plus
 * de vingt mètres de long : à 40 points le mètre, 1600 × 1000 couvre large
 * sans que le plan devienne un territoire où l'on se perd.
 */
export const PLAN_LARGEUR = 1600;
export const PLAN_HAUTEUR = 1000;
/** Le pas d'aimantation : assez fin pour être libre, assez gros pour aligner. */
export const PAS = 10;

export type ModeleTable = {
  cle: string;
  libelle: string;
  forme: FormeTable;
  places: number;
  largeur: number;
  hauteur: number;
};

/**
 * La palette : ce qu'on pose sur le plan. Des gabarits plutôt que des
 * poignées de redimensionnement — un restaurateur sait qu'il a « une ronde
 * de quatre », il n'a pas envie de la dessiner au point près.
 */
export const MODELES: ModeleTable[] = [
  { cle: "ronde-2", libelle: "Ronde 2", forme: "ronde", places: 2, largeur: 60, hauteur: 60 },
  { cle: "ronde-4", libelle: "Ronde 4", forme: "ronde", places: 4, largeur: 80, hauteur: 80 },
  { cle: "ronde-6", libelle: "Ronde 6", forme: "ronde", places: 6, largeur: 100, hauteur: 100 },
  { cle: "ronde-8", libelle: "Ronde 8", forme: "ronde", places: 8, largeur: 120, hauteur: 120 },
  { cle: "carree-2", libelle: "Carrée 2", forme: "carree", places: 2, largeur: 60, hauteur: 60 },
  { cle: "carree-4", libelle: "Carrée 4", forme: "carree", places: 4, largeur: 80, hauteur: 80 },
  { cle: "rect-4", libelle: "Rect. 4", forme: "rectangle", places: 4, largeur: 120, hauteur: 70 },
  { cle: "rect-6", libelle: "Rect. 6", forme: "rectangle", places: 6, largeur: 160, hauteur: 70 },
  { cle: "rect-8", libelle: "Rect. 8", forme: "rectangle", places: 8, largeur: 200, hauteur: 70 },
  { cle: "rect-10", libelle: "Rect. 10", forme: "rectangle", places: 10, largeur: 240, hauteur: 70 },
  { cle: "banquette-4", libelle: "Banquette 4", forme: "banquette", places: 4, largeur: 160, hauteur: 50 },
  { cle: "banquette-6", libelle: "Banquette 6", forme: "banquette", places: 6, largeur: 220, hauteur: 50 },
  { cle: "haute-2", libelle: "Haute 2", forme: "haute", places: 2, largeur: 50, hauteur: 50 },
  { cle: "haute-4", libelle: "Haute 4", forme: "haute", places: 4, largeur: 110, hauteur: 50 },
];

export type ModeleRepere = {
  cle: TypeRepere;
  libelle: string;
  largeur: number;
  hauteur: number;
};

export const MODELES_REPERE: ModeleRepere[] = [
  { cle: "mur", libelle: "Mur", largeur: 240, hauteur: 16 },
  { cle: "bar", libelle: "Bar", largeur: 280, hauteur: 60 },
  { cle: "entree", libelle: "Entrée", largeur: 100, hauteur: 20 },
  { cle: "cuisine", libelle: "Cuisine", largeur: 160, hauteur: 100 },
  { cle: "toilettes", libelle: "Toilettes", largeur: 100, hauteur: 80 },
  { cle: "poteau", libelle: "Poteau", largeur: 30, hauteur: 30 },
];

export function modeleParCle(cle: string): ModeleTable | null {
  return MODELES.find((modele) => modele.cle === cle) ?? null;
}

export function libelleForme(forme: FormeTable): string {
  const libelles: Record<FormeTable, string> = {
    ronde: "Ronde",
    carree: "Carrée",
    rectangle: "Rectangulaire",
    banquette: "Banquette",
    haute: "Table haute",
  };
  return libelles[forme];
}
