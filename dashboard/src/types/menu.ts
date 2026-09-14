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
  created_at: string;
};

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
