-- Connexion TikTok (Login Kit) par restaurant. Meme principe que
-- social_connections (Facebook) : chaque restaurateur connecte lui-meme
-- son propre compte TikTok. Lecture seule (pas de publication).

create table if not exists public.tiktok_connections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  tiktok_open_id text not null,
  tiktok_username text,
  display_name text,
  avatar_url text,
  follower_count integer,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id)
);

alter table public.tiktok_connections enable row level security;

create policy "tiktok_connections_select_own"
  on public.tiktok_connections for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = tiktok_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "tiktok_connections_insert_own"
  on public.tiktok_connections for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = tiktok_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "tiktok_connections_update_own"
  on public.tiktok_connections for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = tiktok_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = tiktok_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "tiktok_connections_delete_own"
  on public.tiktok_connections for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = tiktok_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
