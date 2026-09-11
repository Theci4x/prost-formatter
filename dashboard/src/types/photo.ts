export type RestaurantPhoto = {
  id: string;
  restaurant_id: string;
  // Null pour une photo générale de l'établissement.
  espace_id: string | null;
  storage_path: string;
  url: string;
  ordre: number;
  created_at: string;
};
