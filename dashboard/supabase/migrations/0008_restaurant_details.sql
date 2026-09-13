-- Enrichissement de la fiche restaurant : coordonnées, horaires
-- d'ouverture et menu (carte).

alter table public.restaurants
  add column if not exists telephone text,
  add column if not exists site_web text,
  add column if not exists description text,
  -- Horaires par jour, ex : {"lundi": {"ferme": false, "ouverture": "11:30", "fermeture": "22:00"}, ...}
  add column if not exists horaires jsonb not null default '{}'::jsonb;

create table if not exists public.restaurant_menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  categorie text not null,
  nom text not null,
  description text,
  prix numeric(6, 2),
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.restaurant_menu_items enable row level security;

create policy "menu_items_select_own"
  on public.restaurant_menu_items for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_menu_items.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "menu_items_insert_own"
  on public.restaurant_menu_items for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_menu_items.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "menu_items_update_own"
  on public.restaurant_menu_items for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_menu_items.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_menu_items.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "menu_items_delete_own"
  on public.restaurant_menu_items for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_menu_items.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
