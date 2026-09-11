-- Vacances, jour férié, salle prise par une privatisation traitée hors Klarr :
-- le restaurateur doit pouvoir fermer une date sans démonter sa configuration
-- de services. Sans ça, la page publique continue de prendre des réservations
-- pendant qu'il est fermé — et c'est le client qui découvre la porte close.
create table if not exists public.restaurant_fermetures (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  -- Null ferme tout l'établissement. Renseigné, seul cet espace ferme : la
  -- salle du bas est privatisée, le reste du restaurant travaille.
  espace_id uuid references public.restaurant_espaces (id) on delete cascade,
  date_debut date not null,
  date_fin date not null,
  -- Affiché au client sur la page publique : « Fermé — congés d'été » vaut
  -- mieux qu'un créneau qui disparaît sans explication.
  motif text,
  created_at timestamptz not null default now(),
  constraint fermeture_fin_apres_debut check (date_fin >= date_debut)
);

create index if not exists fermetures_restaurant_idx
  on public.restaurant_fermetures (restaurant_id, date_debut, date_fin);

alter table public.restaurant_fermetures enable row level security;

-- La page publique lit les fermetures avec la clé de service, comme le reste
-- du moteur de disponibilité : aucune politique publique n'est ouverte.
drop policy if exists "fermetures_select_own" on public.restaurant_fermetures;
create policy "fermetures_select_own" on public.restaurant_fermetures
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

drop policy if exists "fermetures_insert_own" on public.restaurant_fermetures;
create policy "fermetures_insert_own" on public.restaurant_fermetures
  for insert with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

drop policy if exists "fermetures_delete_own" on public.restaurant_fermetures;
create policy "fermetures_delete_own" on public.restaurant_fermetures
  for delete using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );
