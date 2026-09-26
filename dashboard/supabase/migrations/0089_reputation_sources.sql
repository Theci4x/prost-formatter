-- URLs publiques choisies par le restaurateur pour le relevé sans API.
-- On ne tente pas de deviner une fiche : deux homonymes peuvent produire une
-- note fausse, ce qui est pire qu'une fiche non configurée.
alter table public.restaurants
  add column if not exists yelp_url text,
  add column if not exists tripadvisor_url text;

alter table public.restaurants
  drop constraint if exists restaurants_yelp_url_https,
  drop constraint if exists restaurants_tripadvisor_url_https;

alter table public.restaurants
  add constraint restaurants_yelp_url_https
    check (yelp_url is null or yelp_url ~* '^https?://([^/]+\.)?yelp\.(com|fr)(/|$)'),
  add constraint restaurants_tripadvisor_url_https
    check (tripadvisor_url is null or tripadvisor_url ~* '^https?://([^/]+\.)?tripadvisor\.(com|fr)(/|$)');

create index if not exists restaurants_reputation_sources_idx
  on public.restaurants (yelp_url, tripadvisor_url)
  where yelp_url is not null or tripadvisor_url is not null;

notify pgrst, 'reload schema';
