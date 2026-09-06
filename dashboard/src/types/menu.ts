export type MenuItem = {
  id: string;
  restaurant_id: string;
  categorie: string;
  nom: string;
  description: string | null;
  prix: number | null;
  ordre: number;
  created_at: string;
};
