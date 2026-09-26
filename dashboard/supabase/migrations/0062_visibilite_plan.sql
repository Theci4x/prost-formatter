-- Le plan d'action tiré des analyses de visibilité IA.
--
-- Savoir qu'on n'est pas cité ne sert à rien : la question du restaurateur
-- est « je fais quoi lundi ». Le plan est écrit à partir des analyses ET de
-- ce que Klarr sait de l'établissement (description, carte, photos, FAQ,
-- espaces privatisables, requêtes Google), ce qu'aucun outil de suivi seul
-- ne peut faire.
--
-- Une ligne par établissement : le plan se remplace, il ne s'empile pas.
-- Un historique de conseils périmés n'aiderait personne.
create table if not exists public.ai_visibility_plans (
  restaurant_id uuid primary key
    references public.restaurants (id) on delete cascade,
  actions jsonb not null default '[]'::jsonb,
  genere_le timestamptz not null default now()
);

alter table public.ai_visibility_plans enable row level security;

do $$
declare
  politique text;
begin
  for politique in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'ai_visibility_plans'
  loop
    execute format(
      'drop policy if exists %I on public.ai_visibility_plans', politique
    );
  end loop;
end $$;

create policy ai_visibility_plans_select on public.ai_visibility_plans
  for select using (public.peut_gerer(restaurant_id));
create policy ai_visibility_plans_insert on public.ai_visibility_plans
  for insert with check (public.peut_gerer(restaurant_id));
create policy ai_visibility_plans_update on public.ai_visibility_plans
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
create policy ai_visibility_plans_delete on public.ai_visibility_plans
  for delete using (public.peut_gerer(restaurant_id));
