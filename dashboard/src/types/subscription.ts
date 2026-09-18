export type RestaurantSubscription = {
  restaurant_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  /** Résiliation demandée : le service court jusqu'au terme, puis s'arrête. */
  cancel_at_period_end?: boolean;
  created_at: string;
  updated_at: string;
};
