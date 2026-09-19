-- Les publications sur la fiche Google, rédigées à l'avance.
--
-- Un post Google vit une semaine et disparaît. Le restaurateur qui en tire
-- quelque chose est celui qui en publie un chaque semaine — donc celui qui
-- les écrit tous d'un coup, le lundi matin, plutôt que de s'en souvenir
-- sept fois. La programmation n'est pas un raffinement : c'est la seule
-- forme sous laquelle cette fonctionnalité sert à quelqu'un.
--
-- L'envoi vers Google demande un accès aux Business Profile APIs que
-- Google accorde sur dossier. Tout ce qui précède l'envoi — la rédaction,
-- la photo, la file d'attente — n'en dépend pas et fonctionne sans lui ;
-- le jour où l'accès arrive, la file se vide sans qu'on touche au code.

create table if not exists public.restaurant_posts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  texte text not null,
  -- La photo qui accompagne. Elle vit déjà dans Klarr : on renvoie son
  -- adresse publique à Google plutôt que de la téléverser deux fois.
  photo_id uuid references public.restaurant_photos (id) on delete set null,
  -- Le bouton de la publication : réserver, appeler, en savoir plus.
  bouton text check (bouton in ('reserver', 'appeler', 'en_savoir_plus')),
  bouton_url text,
  publier_le timestamptz not null,
  publie_le timestamptz,
  statut text not null default 'programme'
    check (statut in ('programme', 'publie', 'echec')),
  -- Comme pour les courriels : ce qui a raté se voit et se rejoue, plutôt
  -- que de disparaître dans un journal que personne ne lit.
  tentatives integer not null default 0,
  derniere_erreur text,
  -- L'identifiant rendu par Google, de quoi retrouver la publication.
  google_post_name text,
  created_at timestamptz not null default now(),
  constraint post_texte_non_vide check (length(btrim(texte)) > 0)
);

create index if not exists restaurant_posts_a_publier_idx
  on public.restaurant_posts (publier_le)
  where statut = 'programme';

create index if not exists restaurant_posts_restaurant_idx
  on public.restaurant_posts (restaurant_id, publier_le desc);

alter table public.restaurant_posts enable row level security;

drop policy if exists "posts_select" on public.restaurant_posts;
create policy "posts_select" on public.restaurant_posts
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "posts_insert" on public.restaurant_posts;
create policy "posts_insert" on public.restaurant_posts
  for insert with check (public.peut_gerer(restaurant_id));

drop policy if exists "posts_update" on public.restaurant_posts;
create policy "posts_update" on public.restaurant_posts
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

drop policy if exists "posts_delete" on public.restaurant_posts;
create policy "posts_delete" on public.restaurant_posts
  for delete using (public.peut_gerer(restaurant_id));

-- Le compte Google qui détient la fiche. La connexion ne retenait que
-- l'établissement — « locations/123 » — ce qui suffit pour lire ses
-- informations mais pas pour publier : l'API de publication veut le
-- chemin complet, compte compris. On le retient donc au moment où le
-- restaurateur choisit sa fiche, plutôt que de le redeviner chaque nuit.
alter table public.google_business_connections
  add column if not exists account_name text;
