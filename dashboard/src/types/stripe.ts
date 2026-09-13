/** Le compte Stripe du restaurateur relié à Klarr (Connect, compte Standard). */
export type StripeConnexion = {
  id: string;
  restaurant_id: string;
  stripe_account_id: string;
  nom_affiche: string | null;
  paiements_actifs: boolean;
  dossier_complet: boolean;
  created_at: string;
  updated_at: string;
};
