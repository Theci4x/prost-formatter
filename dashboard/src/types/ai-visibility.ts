import type { Intention } from "@/lib/ai-visibility/intentions";

export type AiVisibilityQuestion = {
  id: string;
  restaurant_id: string;
  question: string;
  /** Ce que cherche le client qui la pose. Voir lib/ai-visibility/intentions. */
  intention: Intention;
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
