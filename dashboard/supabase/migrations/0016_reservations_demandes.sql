-- Demandes de réservation. Le même enregistrement sert la table classique et
-- la privatisation : c'est « type » qui décide si la demande consomme une
-- partie de la capacité de l'espace ou la totalité.
create table if not exists public.restaurant_reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  espace_id uuid not null references public.restaurant_espaces (id) on delete cascade,
  -- Le service peut disparaître de la configuration sans qu'on veuille
  -- effacer l'historique des réservations passées.
  service_id uuid references public.restaurant_services (id) on delete set null,
  date_reservation date not null,
  couverts integer not null check (couverts > 0),
  type text not null check (type in ('table', 'privatisation')),
  statut text not null default 'demande'
    check (statut in ('demande', 'confirmee', 'refusee', 'annulee')),

  client_nom text not null,
  client_email text not null,
  client_telephone text,
  occasion text,
  message text,

  -- Une demande non confirmée pose une option qui expire : sans ça, trois
  -- curieux gèlent les trois espaces d'un vendredi soir.
  option_expire_le timestamptz,
  -- Visible du seul restaurateur, jamais du client.
  note_interne text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_creneau_idx
  on public.restaurant_reservations (espace_id, date_reservation, service_id);
create index if not exists reservations_restaurant_idx
  on public.restaurant_reservations (restaurant_id, date_reservation);

alter table public.restaurant_reservations enable row level security;

-- Le restaurateur voit et gère les réservations de ses établissements. Les
-- demandes venues du formulaire public sont écrites par le serveur avec la
-- clé de service : aucune politique d'insertion publique n'est ouverte, si
-- bien qu'on ne peut pas créer une réservation sans passer par les
-- vérifications de disponibilité.
create policy "reservations_select_own" on public.restaurant_reservations
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "reservations_update_own" on public.restaurant_reservations
  for update using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "reservations_delete_own" on public.restaurant_reservations
  for delete using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

-- Adresse publique de la page de réservation : « prost-paris » plutôt qu'un
-- identifiant technique. Unique, donc utilisable telle quelle dans une URL.
alter table public.restaurants
  add column if not exists slug_reservation text unique;
