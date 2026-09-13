-- Le restaurateur encaisse ses clients sur SON compte Stripe, pas sur celui
-- de Klarr : acompte de privatisation, empreinte de carte, expérience
-- prépayée. L'argent ne transite jamais par nous.
--
-- Comptes « Standard » : le restaurateur garde son tableau de bord Stripe,
-- ses virements, ses litiges et ses remboursements. Klarr n'est pas
-- intermédiaire de paiement, n'a pas de KYC à porter et ne répond pas des
-- impayés. C'est aussi ce qui rend crédible le « 0 % de commission » :
-- techniquement, nous ne sommes pas sur le chemin de l'argent.
create table if not exists public.restaurant_stripe_connexions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  -- L'identifiant du compte connecté (acct_…). Aucun jeton n'est conservé :
  -- pour un compte Standard, Klarr agit avec sa propre clé et l'en-tête
  -- Stripe-Account. Le jeton d'accès renvoyé par l'OAuth vaut clé secrète du
  -- restaurateur et n'expire pas — le garder serait une responsabilité que
  -- rien n'oblige à prendre.
  stripe_account_id text not null,
  -- Nom tel que Stripe l'affiche, pour que le restaurateur reconnaisse le
  -- compte qu'il a relié sans aller le vérifier chez Stripe.
  nom_affiche text,
  -- Recopié au moment de la connexion : un compte relié mais dont le dossier
  -- Stripe est incomplet n'encaisse rien, et il faut le dire tout de suite.
  paiements_actifs boolean not null default false,
  dossier_complet boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id)
);

alter table public.restaurant_stripe_connexions enable row level security;

drop policy if exists "stripe_connexions_select_own" on public.restaurant_stripe_connexions;
create policy "stripe_connexions_select_own"
  on public.restaurant_stripe_connexions for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_stripe_connexions.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

drop policy if exists "stripe_connexions_insert_own" on public.restaurant_stripe_connexions;
create policy "stripe_connexions_insert_own"
  on public.restaurant_stripe_connexions for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_stripe_connexions.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

drop policy if exists "stripe_connexions_update_own" on public.restaurant_stripe_connexions;
create policy "stripe_connexions_update_own"
  on public.restaurant_stripe_connexions for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_stripe_connexions.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_stripe_connexions.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

drop policy if exists "stripe_connexions_delete_own" on public.restaurant_stripe_connexions;
create policy "stripe_connexions_delete_own"
  on public.restaurant_stripe_connexions for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_stripe_connexions.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
