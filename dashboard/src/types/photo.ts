export type RestaurantPhoto = {
  id: string;
  restaurant_id: string;
  // Null pour une photo générale de l'établissement.
  espace_id: string | null;
  storage_path: string;
  url: string;
  ordre: number;
  // Ce que le restaurateur veut qu'on lise sous la photo : « Salle
  // speakeasy, au sous-sol ». Facultative — et absente des photos mises en
  // ligne avant que les légendes n'existent.
  legende?: string | null;
  created_at: string;
};
