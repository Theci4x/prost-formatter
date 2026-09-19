/**
 * La carte, côté valeurs partagées : lues par les formulaires, qui tournent
 * dans le navigateur, autant que par les actions serveur.
 */

export type MenuItem = {
  id: string;
  restaurant_id: string;
  categorie: string;
  nom: string;
  description: string | null;
  // En centimes, comme tout ce qui touche à l'argent dans Klarr. NULL quand
  // le prix ne s'affiche pas (« selon arrivage », un menu à composer).
  prix_centimes: number | null;
  // Position sur toute la carte, pas seulement dans sa catégorie : les
  // catégories s'affichent dans l'ordre de leur premier plat.
  ordre: number;
  // Décroché de la carte sans être effacé.
  actif: boolean;
  // Une seule photo par plat. NULL tant qu'il n'y en a pas : sur une carte,
  // la moitié des plats n'est jamais photographiée, et c'est très bien.
  photo_url: string | null;
  photo_storage_path: string | null;
  // Traductions par code de langue. Voir la migration 0029 pour la forme.
  traductions: Traductions;
  created_at: string;
};

/** Les langues proposées au client. Le français est la langue de saisie. */
export type Langue = "fr" | "en";

export const LANGUES: { code: Langue; libelle: string; drapeau: string }[] = [
  { code: "fr", libelle: "Français", drapeau: "FR" },
  { code: "en", libelle: "English", drapeau: "EN" },
];

export type TraductionPlat = {
  nom: string;
  description: string | null;
  categorie: string;
  // Le texte français d'où vient cette traduction, pour repérer celles que
  // le restaurateur a rendues caduques en corrigeant son plat.
  source: { nom: string; description: string | null; categorie: string };
};

export type Traductions = Partial<Record<Exclude<Langue, "fr">, TraductionPlat>>;

export type MenuValeurs = {
  categorie: string;
  nom: string;
  description: string;
  // Saisi en euros, tel que tapé.
  prix: string;
};

export const MENU_VIDE: MenuValeurs = {
  categorie: "",
  nom: "",
  description: "",
  prix: "",
};

/**
 * Les catégories proposées, dans l'ordre d'un repas. Ce ne sont que des
 * suggestions : le champ reste libre, un bar à vins n'a pas d'entrées.
 */
export const CATEGORIES_SUGGEREES = [
  "Entrées",
  "Plats",
  "Desserts",
  "Fromages",
  "Boissons",
  "Vins",
] as const;
