-- Connexion TikTok (Login Kit) par restaurant. Même principe que
-- social_connections (Facebook) : chaque restaurateur connecte lui-même son
-- propre compte TikTok. Lecture seule, pas de publication.
--
-- Comme pour la visibilité IA : la 0009 n'était jamais passée en production,
-- et la 0025 — qui a refait toutes les policies — saute les tables absentes
-- sans rien dire. On recrée donc la table ici, avec les conventions
-- d'aujourd'hui (peut_gerer plutôt que proprietaire_id).

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

-- Rejouable : on retire d'abord les policies existantes, y compris celles
-- de la 0009 si elles traînent sur une base où elle serait passée.
do $$
declare
  politique text;
begin
  for politique in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'tiktok_connections'
  loop
    execute format(
      'drop policy if exists %I on public.tiktok_connections', politique
    );
  end loop;
end $$;

create policy tiktok_connections_select on public.tiktok_connections
  for select using (public.peut_gerer(restaurant_id));
create policy tiktok_connections_insert on public.tiktok_connections
  for insert with check (public.peut_gerer(restaurant_id));
create policy tiktok_connections_update on public.tiktok_connections
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
create policy tiktok_connections_delete on public.tiktok_connections
  for delete using (public.peut_gerer(restaurant_id));
