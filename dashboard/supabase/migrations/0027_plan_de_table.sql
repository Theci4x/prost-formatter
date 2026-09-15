-- Le plan de salle : où sont les tables, et qui on met où.
--
-- Choix assumé de cette version : le moteur de disponibilité continue de
-- compter des COUVERTS, pas des tables. Le plan sert à PLACER, pas à
-- vendre. Autrement dit, Klarr refuse toujours une réservation parce que la
-- salle est pleine en couverts, jamais parce qu'il ne reste plus de table
-- de quatre. C'est ce que fait le restaurateur aujourd'hui avec son cahier,
-- et ça évite de réécrire tout le moteur pour un gain incertain — un
-- établissement qui pousse les tables pour asseoir un groupe de six sur du
-- 4+2 serait refusé par un moteur qui raisonne en tables.
--
-- La conséquence à connaître : la somme des places du plan peut différer de
-- la capacité de l'espace. L'écran le signale, il ne l'impose pas.
create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  -- Une table appartient à une salle : c'est ce qui permet de ne proposer,
  -- au moment de placer, que les tables de la salle réservée.
  espace_id uuid not null references public.restaurant_espaces (id) on delete cascade,
  -- Ce que le service dit à voix haute : « le 12 », « la terrasse 3 ».
  -- Du texte, pas un entier : « 12 bis » et « B4 » existent.
  nom text not null,
  places integer not null check (places > 0),
  forme text not null default 'ronde' check (forme in ('ronde', 'carree', 'rectangle')),
  -- Position sur une grille, en cases entières. Une grille plutôt que des
  -- pixels : le plan reste lisible sur un téléphone en salle, et deux
  -- tables ne peuvent pas se chevaucher à moitié.
  x integer not null check (x >= 0),
  y integer not null check (y >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deux tables ne portent pas le même numéro dans la même salle : sans ça,
-- « mets-les au 12 » devient ambigu au pire moment.
create unique index if not exists tables_nom_idx
  on public.restaurant_tables (espace_id, lower(nom));
-- Et deux tables n'occupent pas la même case du plan.
create unique index if not exists tables_position_idx
  on public.restaurant_tables (espace_id, x, y);
create index if not exists tables_restaurant_idx
  on public.restaurant_tables (restaurant_id, espace_id);

-- Où est assis ce groupe. Facultatif : une réservation non placée reste
-- parfaitement valable, elle attend juste que le service décide. La table
-- supprimée libère la réservation au lieu de l'effacer.
alter table public.restaurant_reservations
  add column if not exists table_id uuid
  references public.restaurant_tables (id) on delete set null;

create index if not exists reservations_table_idx
  on public.restaurant_reservations (table_id, date_reservation);


-- Mêmes règles qu'ailleurs pour la configuration du plan : le service le
-- lit, le gérant le dessine. Placer un groupe, en revanche, c'est du
-- service — ça passe par restaurant_reservations, dont l'écriture est déjà
-- ouverte au rôle « service ».
alter table public.restaurant_tables enable row level security;

drop policy if exists "restaurant_tables_select" on public.restaurant_tables;
drop policy if exists "restaurant_tables_insert" on public.restaurant_tables;
drop policy if exists "restaurant_tables_update" on public.restaurant_tables;
drop policy if exists "restaurant_tables_delete" on public.restaurant_tables;

create policy "restaurant_tables_select" on public.restaurant_tables
  for select using (public.peut_voir(restaurant_id));
create policy "restaurant_tables_insert" on public.restaurant_tables
  for insert with check (public.peut_gerer(restaurant_id));
create policy "restaurant_tables_update" on public.restaurant_tables
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
create policy "restaurant_tables_delete" on public.restaurant_tables
  for delete using (public.peut_gerer(restaurant_id));
