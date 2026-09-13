export type AiVisibilityQuestion = {
  id: string;
  restaurant_id: string;
  question: string;
  created_at: string;
};

export type AiVisibilityCheck = {
  id: string;
  question_id: string;
  restaurant_id: string;
  fournisseur: string;
  modele: string;
  est_cite: boolean;
  rang: number | null;
  concurrents: string[];
  reponse: string;
  created_at: string;
};
