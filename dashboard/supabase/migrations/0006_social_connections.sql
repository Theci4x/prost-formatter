-- Connexion Facebook (et Instagram Business, lie via la page Facebook)
-- par restaurant. Meme principe que google_business_connections : chaque
-- restaurateur connecte lui-meme son propre compte.

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  facebook_page_id text not null,
  facebook_page_name text,
  facebook_page_access_token text not null,
  instagram_business_account_id text,
  instagram_username text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id)
);

alter table public.social_connections enable row level security;

create policy "social_connections_select_own"
  on public.social_connections for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = social_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "social_connections_insert_own"
  on public.social_connections for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = social_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "social_connections_update_own"
  on public.social_connections for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = social_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = social_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "social_connections_delete_own"
  on public.social_connections for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = social_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
