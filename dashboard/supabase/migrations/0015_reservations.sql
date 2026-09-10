-- Réservation d'espaces : le même moteur sert la table classique et la
-- privatisation. Un espace a une capacité en couverts ; une réservation de
-- type « table » en consomme une partie, une « privatisation » le prend en
-- entier et interdit toute autre réservation sur le même créneau.

create table if not exists public.restaurant_espaces (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,
  description text,
  capacite integer not null check (capacite > 0),
  -- Nombre de couverts en dessous duquel une privatisation est refusée.
  -- NULL = cet espace ne se privatise pas (une terrasse de passage, par
  -- exemple), ce qui évite une colonne « privatisable » redondante.
  privatisation_minimum integer check (privatisation_minimum > 0),
  -- Faux pour un espace réservé aux privatisations, qu'on ne veut pas voir
  -- entamé par des tables isolées.
  accepte_table boolean not null default true,
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint privatisation_minimum_sous_capacite
    check (privatisation_minimum is null or privatisation_minimum <= capacite)
);

-- Créneaux pendant lesquels l'établissement prend des réservations. Les
-- jours sont stockés selon la convention ISO (1 = lundi … 7 = dimanche),
-- celle que renvoie déjà PostgreSQL pour extract(isodow).
create table if not exists public.restaurant_services (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,
  jours smallint[] not null check (
    array_length(jours, 1) between 1 and 7
    and jours <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]
  ),
  heure_debut time not null,
  heure_fin time not null,
  -- Délai de prévenance : aucune demande acceptée en deçà.
  delai_heures integer not null default 72 check (delai_heures >= 0),
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  constraint service_fin_apres_debut check (heure_fin > heure_debut)
);

create index if not exists restaurant_espaces_restaurant_idx
  on public.restaurant_espaces (restaurant_id, ordre);
create index if not exists restaurant_services_restaurant_idx
  on public.restaurant_services (restaurant_id, ordre);

alter table public.restaurant_espaces enable row level security;
alter table public.restaurant_services enable row level security;

create policy "restaurant_espaces_select_own" on public.restaurant_espaces
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_espaces_insert_own" on public.restaurant_espaces
  for insert with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_espaces_update_own" on public.restaurant_espaces
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

create policy "restaurant_espaces_delete_own" on public.restaurant_espaces
  for delete using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_services_select_own" on public.restaurant_services
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_services_insert_own" on public.restaurant_services
  for insert with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_services_update_own" on public.restaurant_services
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

create policy "restaurant_services_delete_own" on public.restaurant_services
  for delete using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );
