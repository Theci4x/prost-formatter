create table if not exists public.restaurant_subscriptions (
  restaurant_id uuid primary key references public.restaurants (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text,
  status text not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurant_subscriptions enable row level security;

create policy "restaurant_subscriptions_select_own" on public.restaurant_subscriptions
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

-- Les écritures (création/mise à jour du statut d'abonnement) passent
-- uniquement par le webhook Stripe, exécuté avec la clé de service — pas
-- de policy insert/update/delete pour les utilisateurs authentifiés.
