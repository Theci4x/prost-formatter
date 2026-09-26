-- Le plan de salle passe d'une grille de cases à un plan libre.
--
-- La première version posait les tables sur une grille de 12 × 8 : une case,
-- une table, toutes de la même taille. C'est faux pour une vraie salle. Une
-- ronde de deux au comptoir et une tablée de dix au fond n'occupent pas la
-- même place, une banquette est longue et étroite, et aucun restaurant n'a
-- ses tables alignées au carreau. Le restaurateur doit pouvoir dessiner SA
-- salle, pas la remplir dans une grille qu'on lui impose.
--
-- Les positions deviennent donc des coordonnées libres, en points, avec une
-- taille et une rotation par table.

-- Dimensions de la table, en points du plan. Les valeurs par défaut valent
-- une case de l'ancienne grille : les tables déjà dessinées gardent leur
-- taille apparente.
alter table public.restaurant_tables
  add column if not exists largeur integer not null default 64
    check (largeur > 0),
  add column if not exists hauteur integer not null default 64
    check (hauteur > 0),
  -- En degrés. Une banquette contre un mur oblique, une table d'angle : la
  -- rotation est ce qui distingue un plan reconnaissable d'un schéma.
  add column if not exists rotation integer not null default 0
    check (rotation >= 0 and rotation < 360);

-- Conversion des plans existants : une case de l'ancienne grille devient un
-- pas de 80 points. Ne s'applique qu'aux plans encore entièrement dans les
-- bornes de l'ancienne grille (x < 12, y < 8) et jamais convertis — un plan
-- déjà en coordonnées libres a forcément des valeurs plus grandes, et une
-- seconde exécution ne le déplacerait donc pas.
do $$
declare r record;
begin
  for r in
    select espace_id from public.restaurant_tables
    group by espace_id having max(x) < 12 and max(y) < 8
  loop
    update public.restaurant_tables
    set x = x * 80, y = y * 80
    where espace_id = r.espace_id;
  end loop;
end $$;

-- Deux tables peuvent désormais se toucher, voire se superposer : on
-- rapproche des tables tous les jours, et un plan est un dessin, pas un
-- damier. La contrainte d'unicité sur la position n'a donc plus lieu
-- d'être. Celle sur le numéro reste : « mets-les au 12 » doit désigner une
-- seule table.
drop index if exists public.tables_position_idx;

-- Les formes s'élargissent. La banquette n'est pas une table rectangulaire :
-- elle est adossée à un mur et ne se contourne pas, ce qui change la façon
-- dont on y assied un groupe.
alter table public.restaurant_tables
  drop constraint if exists restaurant_tables_forme_check;
alter table public.restaurant_tables
  add constraint restaurant_tables_forme_check
  check (forme in ('ronde', 'carree', 'rectangle', 'banquette', 'haute'));

-- Repères fixes de la salle : le bar, l'entrée, un poteau, les toilettes.
-- Ils ne reçoivent personne, mais sans eux le chef de rang ne reconnaît pas
-- sa salle sur l'écran, et le plan ne sert plus à rien.
create table if not exists public.restaurant_reperes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  espace_id uuid not null references public.restaurant_espaces (id) on delete cascade,
  type text not null default 'mur'
    check (type in ('mur', 'bar', 'entree', 'cuisine', 'toilettes', 'poteau')),
  -- Facultatif : un mur n'a pas besoin d'être nommé, « Terrasse » si.
  libelle text,
  x integer not null,
  y integer not null,
  largeur integer not null check (largeur > 0),
  hauteur integer not null check (hauteur > 0),
  rotation integer not null default 0 check (rotation >= 0 and rotation < 360),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reperes_espace_idx
  on public.restaurant_reperes (restaurant_id, espace_id);

alter table public.restaurant_reperes enable row level security;

drop policy if exists "restaurant_reperes_select" on public.restaurant_reperes;
drop policy if exists "restaurant_reperes_insert" on public.restaurant_reperes;
drop policy if exists "restaurant_reperes_update" on public.restaurant_reperes;
drop policy if exists "restaurant_reperes_delete" on public.restaurant_reperes;

create policy "restaurant_reperes_select" on public.restaurant_reperes
  for select using (public.peut_voir(restaurant_id));
create policy "restaurant_reperes_insert" on public.restaurant_reperes
  for insert with check (public.peut_gerer(restaurant_id));
create policy "restaurant_reperes_update" on public.restaurant_reperes
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
create policy "restaurant_reperes_delete" on public.restaurant_reperes
  for delete using (public.peut_gerer(restaurant_id));
