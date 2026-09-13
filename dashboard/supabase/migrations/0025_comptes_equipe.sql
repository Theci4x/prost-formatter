-- Un serveur n'a pas à voir la fiche Google, les jetons Facebook ni
-- l'abonnement du restaurant. Jusqu'ici, seul le propriétaire du compte
-- pouvait entrer : lui prêter ses identifiants était la seule façon de faire
-- travailler son équipe — donc lui donner tout.
--
-- Trois niveaux :
--   propriétaire  celui qui a créé l'établissement. Tout, sans exception.
--   gérant        tout le quotidien, sauf l'argent et l'équipe : ni
--                 abonnement, ni compte Stripe, ni ajout de collègues.
--   service       les réservations et l'écran de salle. Rien d'autre.
--
-- Le rattachement se fait par adresse e-mail : le restaurateur inscrit
-- l'adresse de son serveur, qui crée son compte Klarr avec cette même
-- adresse et se retrouve dans l'établissement. Aucun envoi d'e-mail n'est
-- nécessaire, ce que Klarr ne sait pas encore faire.
create table if not exists public.restaurant_membres (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  -- Stockée en minuscules : « Jean@X.fr » et « jean@x.fr » sont la même
  -- personne, et une majuscule ne doit pas fermer la porte.
  email text not null,
  role text not null,
  -- Renseigné au premier accès, pour information : la reconnaissance se fait
  -- sur l'adresse, ce qui évite de bloquer un compte pas encore créé.
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, email)
);

alter table public.restaurant_membres
  drop constraint if exists membre_role_check;
alter table public.restaurant_membres
  add constraint membre_role_check check (role in ('gerant', 'service'));

alter table public.restaurant_membres
  drop constraint if exists membre_email_minuscule;
alter table public.restaurant_membres
  add constraint membre_email_minuscule check (email = lower(email));

create index if not exists membres_email_idx
  on public.restaurant_membres (lower(email));


-- ─── Les fonctions d'accès ─────────────────────────────────────────────────
-- « security definer » parce qu'elles lisent restaurant_membres depuis les
-- politiques de restaurant_membres elle-même : sans ça, la vérification
-- s'appellerait sans fin. search_path figé pour qu'un schéma détourné ne
-- puisse pas leur faire lire une autre table.

create or replace function public.est_proprietaire(rid uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.restaurants r
    where r.id = rid and r.proprietaire_id = auth.uid()
  );
$$;

create or replace function public.a_le_role(rid uuid, roles text[])
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select public.est_proprietaire(rid) or exists (
    select 1 from public.restaurant_membres m
    where m.restaurant_id = rid
      and m.role = any(roles)
      and (
        m.user_id = auth.uid()
        -- L'adresse du jeton, à défaut de rattachement déjà fait.
        or m.email = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

-- Lire : tout le monde, service compris.
create or replace function public.peut_voir(rid uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select public.a_le_role(rid, array['gerant', 'service']); $$;

-- Administrer le quotidien : propriétaire et gérant.
create or replace function public.peut_gerer(rid uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$ select public.a_le_role(rid, array['gerant']); $$;

revoke all on function public.est_proprietaire(uuid) from public;
revoke all on function public.a_le_role(uuid, text[]) from public;
revoke all on function public.peut_voir(uuid) from public;
revoke all on function public.peut_gerer(uuid) from public;
grant execute on function public.est_proprietaire(uuid) to authenticated;
grant execute on function public.a_le_role(uuid, text[]) to authenticated;
grant execute on function public.peut_voir(uuid) to authenticated;
grant execute on function public.peut_gerer(uuid) to authenticated;


-- ─── Réécriture des politiques ─────────────────────────────────────────────
-- Les anciennes sont supprimées par leur nom réel plutôt que deviné : le
-- projet en compte des dizaines, et en oublier une laisserait une porte
-- ouverte sur l'ancienne règle.
do $$
declare
  cible text;
  politique text;
  tables text[] := array[
    'restaurants', 'restaurant_espaces', 'restaurant_services',
    'restaurant_reservations', 'restaurant_fermetures', 'restaurant_photos',
    'restaurant_menu_items', 'restaurant_keywords',
    'google_business_connections', 'social_connections', 'tiktok_connections',
    'restaurant_subscriptions', 'restaurant_stripe_connexions',
    'restaurant_reputation_snapshots',
    'ai_visibility_questions', 'ai_visibility_checks'
  ];
begin
  foreach cible in array tables loop
    if to_regclass('public.' || cible) is null then continue; end if;
    for politique in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = cible
    loop
      execute format('drop policy if exists %I on public.%I', politique, cible);
    end loop;
  end loop;
end $$;


-- L'établissement lui-même.
create policy "restaurants_select" on public.restaurants
  for select using (proprietaire_id = auth.uid() or public.peut_voir(id));
create policy "restaurants_insert" on public.restaurants
  for insert with check (proprietaire_id = auth.uid());
create policy "restaurants_update" on public.restaurants
  for update using (public.peut_gerer(id)) with check (public.peut_gerer(id));
-- Supprimer un établissement efface ses réservations et ses photos : c'est
-- au propriétaire seul, jamais à un gérant.
create policy "restaurants_delete" on public.restaurants
  for delete using (proprietaire_id = auth.uid());


-- Les tables que le service doit lire et écrire : les réservations, et elles
-- seules. Prendre un appel et trancher une demande font partie du métier.
create policy "reservations_select" on public.restaurant_reservations
  for select using (public.peut_voir(restaurant_id));
create policy "reservations_insert" on public.restaurant_reservations
  for insert with check (public.peut_voir(restaurant_id));
create policy "reservations_update" on public.restaurant_reservations
  for update using (public.peut_voir(restaurant_id))
  with check (public.peut_voir(restaurant_id));
-- Effacer une réservation, non : on l'annule, ce qui en garde la trace.
create policy "reservations_delete" on public.restaurant_reservations
  for delete using (public.peut_gerer(restaurant_id));


-- Ce que le service lit sans pouvoir le modifier : sans les espaces, les
-- services et les fermetures, l'écran de salle n'afficherait rien.
do $$
declare cible text;
begin
  foreach cible in array array[
    'restaurant_espaces', 'restaurant_services', 'restaurant_fermetures',
    'restaurant_photos', 'restaurant_reputation_snapshots'
  ] loop
    execute format($f$
      create policy %1$I on public.%2$I for select
        using (public.peut_voir(restaurant_id));
      create policy %3$I on public.%2$I for insert
        with check (public.peut_gerer(restaurant_id));
      create policy %4$I on public.%2$I for update
        using (public.peut_gerer(restaurant_id))
        with check (public.peut_gerer(restaurant_id));
      create policy %5$I on public.%2$I for delete
        using (public.peut_gerer(restaurant_id));
    $f$, cible || '_select', cible, cible || '_insert',
         cible || '_update', cible || '_delete');
  end loop;
end $$;


-- Ce que le service n'a aucune raison de voir. Les connexions portent des
-- jetons d'accès aux comptes Google, Facebook et TikTok du restaurant : les
-- montrer à toute la salle reviendrait à les distribuer.
do $$
declare cible text;
begin
  foreach cible in array array[
    'restaurant_menu_items', 'restaurant_keywords',
    'google_business_connections', 'social_connections', 'tiktok_connections',
    'ai_visibility_questions', 'ai_visibility_checks'
  ] loop
    if to_regclass('public.' || cible) is null then continue; end if;
    execute format($f$
      create policy %1$I on public.%2$I for select
        using (public.peut_gerer(restaurant_id));
      create policy %3$I on public.%2$I for insert
        with check (public.peut_gerer(restaurant_id));
      create policy %4$I on public.%2$I for update
        using (public.peut_gerer(restaurant_id))
        with check (public.peut_gerer(restaurant_id));
      create policy %5$I on public.%2$I for delete
        using (public.peut_gerer(restaurant_id));
    $f$, cible || '_select', cible, cible || '_insert',
         cible || '_update', cible || '_delete');
  end loop;
end $$;


-- L'argent : au propriétaire seul. L'abonnement reste écrit par le webhook
-- Stripe, avec la clé de service, qui ne passe pas par ces politiques.
create policy "subscriptions_select" on public.restaurant_subscriptions
  for select using (public.est_proprietaire(restaurant_id));

create policy "stripe_connexions_select" on public.restaurant_stripe_connexions
  for select using (public.peut_gerer(restaurant_id));
create policy "stripe_connexions_insert" on public.restaurant_stripe_connexions
  for insert with check (public.est_proprietaire(restaurant_id));
create policy "stripe_connexions_update" on public.restaurant_stripe_connexions
  for update using (public.est_proprietaire(restaurant_id))
  with check (public.est_proprietaire(restaurant_id));
create policy "stripe_connexions_delete" on public.restaurant_stripe_connexions
  for delete using (public.est_proprietaire(restaurant_id));


-- L'équipe : chacun voit avec qui il travaille, le propriétaire seul décide.
alter table public.restaurant_membres enable row level security;

drop policy if exists "membres_select" on public.restaurant_membres;
create policy "membres_select" on public.restaurant_membres
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "membres_insert" on public.restaurant_membres;
create policy "membres_insert" on public.restaurant_membres
  for insert with check (public.est_proprietaire(restaurant_id));

drop policy if exists "membres_update" on public.restaurant_membres;
create policy "membres_update" on public.restaurant_membres
  for update using (public.est_proprietaire(restaurant_id))
  with check (public.est_proprietaire(restaurant_id));

drop policy if exists "membres_delete" on public.restaurant_membres;
create policy "membres_delete" on public.restaurant_membres
  for delete using (public.est_proprietaire(restaurant_id));


-- Le stockage des photos suivait la seule propriété : un gérant ne pouvait
-- pas téléverser. On aligne sur les mêmes règles que la table des photos.
drop policy if exists "storage_restaurant_photos_insert_own" on storage.objects;
create policy "storage_restaurant_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-photos'
    and public.peut_gerer(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "storage_restaurant_photos_delete_own" on storage.objects;
create policy "storage_restaurant_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'restaurant-photos'
    and public.peut_gerer(((storage.foldername(name))[1])::uuid)
  );
