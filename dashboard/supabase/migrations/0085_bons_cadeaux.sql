-- Les bons cadeaux, vendus en ligne sur le compte Stripe du restaurant.
--
-- Klarr ne touche pas l'argent : le paiement est créé sur le compte
-- connecté, comme un acompte. Ce qui vit ici, c'est le bon lui-même —
-- son code, son solde, son échéance — et chaque passage en caisse.

alter table public.restaurants
  add column if not exists bons_cadeaux_actifs boolean not null default false;
alter table public.restaurants
  add column if not exists bons_cadeaux_montants integer[] not null
    default '{5000,8000,10000}';
alter table public.restaurants
  add column if not exists bons_cadeaux_validite_mois integer not null
    default 12;
alter table public.restaurants
  add column if not exists bons_cadeaux_texte text;

create table if not exists public.restaurant_bons_cadeaux (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  -- Ce que le bénéficiaire montre en caisse. Unique partout : un code
  -- tapé dans le mauvais établissement ne doit rien trouver.
  code text not null unique,
  montant_centimes integer not null check (montant_centimes > 0),
  solde_centimes integer not null check (solde_centimes >= 0),
  acheteur_nom text not null,
  acheteur_email text not null,
  beneficiaire_nom text,
  beneficiaire_email text,
  message text,
  langue text not null default 'fr',
  -- 'attente' tant que Stripe n'a pas confirmé ; 'valide' ensuite ;
  -- 'annule' quand la maison le rembourse ou l'annule.
  statut text not null default 'attente'
    check (statut in ('attente', 'valide', 'annule')),
  -- 'vente' pour un bon payé en ligne, 'offert' pour un geste de la maison.
  origine text not null default 'vente'
    check (origine in ('vente', 'offert')),
  -- La seule autorisation de l'acheteur pour revoir son bon.
  paiement_token text not null unique,
  stripe_session_id text,
  stripe_payment_intent_id text,
  paye_le timestamptz,
  expire_le date,
  created_at timestamptz not null default now(),
  constraint bon_solde_plafonne check (solde_centimes <= montant_centimes)
);

create index if not exists bons_restaurant_idx
  on public.restaurant_bons_cadeaux (restaurant_id, created_at desc);

-- Chaque passage en caisse : combien, quand, par qui. Un solde sans
-- historique ne se défend pas le jour où un client le conteste.
create table if not exists public.restaurant_bons_utilisations (
  id uuid primary key default gen_random_uuid(),
  bon_id uuid not null
    references public.restaurant_bons_cadeaux (id) on delete cascade,
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  montant_centimes integer not null check (montant_centimes > 0),
  utilise_le timestamptz not null default now(),
  par uuid references auth.users (id) on delete set null
);

create index if not exists bons_utilisations_bon_idx
  on public.restaurant_bons_utilisations (bon_id);

alter table public.restaurant_bons_cadeaux enable row level security;
alter table public.restaurant_bons_utilisations enable row level security;

-- La maison lit ses bons et les encaisse ; l'achat, lui, passe par le
-- serveur avec la clé de service, depuis la page publique.
drop policy if exists "bons_select" on public.restaurant_bons_cadeaux;
create policy "bons_select" on public.restaurant_bons_cadeaux
  for select using (public.peut_voir(restaurant_id));
drop policy if exists "bons_insert" on public.restaurant_bons_cadeaux;
create policy "bons_insert" on public.restaurant_bons_cadeaux
  for insert with check (public.peut_gerer(restaurant_id));
drop policy if exists "bons_update" on public.restaurant_bons_cadeaux;
create policy "bons_update" on public.restaurant_bons_cadeaux
  for update using (public.peut_gerer(restaurant_id));

drop policy if exists "bons_utilisations_select"
  on public.restaurant_bons_utilisations;
create policy "bons_utilisations_select" on public.restaurant_bons_utilisations
  for select using (public.peut_voir(restaurant_id));
drop policy if exists "bons_utilisations_insert"
  on public.restaurant_bons_utilisations;
create policy "bons_utilisations_insert" on public.restaurant_bons_utilisations
  for insert with check (public.peut_gerer(restaurant_id));

-- Déduire d'un bon, en une seule instruction : le solde est relu et
-- débité dans la même transaction, pour que deux serveurs qui encaissent
-- le même bon au même moment ne le fassent pas passer deux fois.
create or replace function public.utiliser_bon_cadeau(
  p_bon_id uuid,
  p_montant integer
) returns integer
language plpgsql
security invoker
as $$
declare
  v_restaurant uuid;
  v_solde integer;
begin
  if p_montant is null or p_montant <= 0 then
    raise exception 'montant invalide';
  end if;

  update public.restaurant_bons_cadeaux
     set solde_centimes = solde_centimes - p_montant
   where id = p_bon_id
     and statut = 'valide'
     and solde_centimes >= p_montant
     and (expire_le is null or expire_le >= current_date)
  returning restaurant_id, solde_centimes into v_restaurant, v_solde;

  if v_restaurant is null then
    raise exception 'bon non utilisable';
  end if;

  insert into public.restaurant_bons_utilisations
    (bon_id, restaurant_id, montant_centimes, par)
  values (p_bon_id, v_restaurant, p_montant, auth.uid());

  return v_solde;
end;
$$;
