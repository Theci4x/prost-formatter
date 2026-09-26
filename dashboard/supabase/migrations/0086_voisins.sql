-- Les voisins : cinq restaurants proches que la maison choisit de suivre,
-- et leur note Google relevée chaque semaine.
--
-- Pas plus de cinq, et choisis par le restaurateur : c'est lui qui sait
-- qui lui prend ses clients, et chaque voisin suivi coûte un appel Google
-- par semaine.

create table if not exists public.restaurant_voisins (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  place_id text not null,
  nom text not null,
  adresse text,
  distance_m integer,
  ajoute_le timestamptz not null default now(),
  unique (restaurant_id, place_id)
);

create table if not exists public.restaurant_voisins_releves (
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  place_id text not null,
  releve_le date not null default current_date,
  note numeric(2, 1),
  nombre_avis integer,
  primary key (restaurant_id, place_id, releve_le)
);

create index if not exists voisins_releves_idx
  on public.restaurant_voisins_releves (restaurant_id, releve_le desc);

alter table public.restaurant_voisins enable row level security;
alter table public.restaurant_voisins_releves enable row level security;

drop policy if exists "voisins_select" on public.restaurant_voisins;
create policy "voisins_select" on public.restaurant_voisins
  for select using (public.peut_voir(restaurant_id));
drop policy if exists "voisins_insert" on public.restaurant_voisins;
create policy "voisins_insert" on public.restaurant_voisins
  for insert with check (public.peut_gerer(restaurant_id));
drop policy if exists "voisins_delete" on public.restaurant_voisins;
create policy "voisins_delete" on public.restaurant_voisins
  for delete using (public.peut_gerer(restaurant_id));

drop policy if exists "voisins_releves_select" on public.restaurant_voisins_releves;
create policy "voisins_releves_select" on public.restaurant_voisins_releves
  for select using (public.peut_voir(restaurant_id));
-- Le premier relevé est posé à l'ajout, depuis la session du restaurateur ;
-- les suivants par la tâche de la semaine, avec la clé de service.
drop policy if exists "voisins_releves_insert" on public.restaurant_voisins_releves;
create policy "voisins_releves_insert" on public.restaurant_voisins_releves
  for insert with check (public.peut_gerer(restaurant_id));
drop policy if exists "voisins_releves_update" on public.restaurant_voisins_releves;
create policy "voisins_releves_update" on public.restaurant_voisins_releves
  for update using (public.peut_gerer(restaurant_id));
