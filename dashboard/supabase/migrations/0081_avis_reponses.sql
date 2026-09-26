-- Les réponses aux avis, et à quels avis on a répondu.
--
-- Klarr rédige la réponse ; le restaurateur la colle lui-même sur Google
-- tant que l'API de publication n'est pas ouverte. Sans trace, l'écran
-- des avis reproposait chaque fois les mêmes avis comme « à traiter », et
-- personne ne savait lesquels avaient déjà eu une réponse.
--
-- Un avis n'a pas d'identifiant stable commun aux plateformes : `cle`
-- l'identifie par plateforme, auteur et date de publication, ce que les
-- API renvoient à l'identique d'un appel à l'autre.
--
-- `source` dit comment la réponse est partie : « manuel » (copiée par le
-- restaurateur) aujourd'hui, « api » le jour où Klarr publiera lui-même.

create table if not exists public.restaurant_avis_reponses (
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  cle text not null,
  plateforme text not null,
  auteur text,
  note smallint,
  reponse text not null,
  source text not null default 'manuel',
  repondu_le timestamptz not null default now(),

  primary key (restaurant_id, cle),

  constraint avis_reponse_cle_bornee check (length(cle) between 1 and 300),
  constraint avis_reponse_non_vide check (length(btrim(reponse)) > 0),
  constraint avis_reponse_source_connue check (source in ('manuel', 'api'))
);

alter table public.restaurant_avis_reponses enable row level security;

drop policy if exists "avis_reponses_select" on public.restaurant_avis_reponses;
create policy "avis_reponses_select" on public.restaurant_avis_reponses
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "avis_reponses_ecriture" on public.restaurant_avis_reponses;
create policy "avis_reponses_ecriture" on public.restaurant_avis_reponses
  for all using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
