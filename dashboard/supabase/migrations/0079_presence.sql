-- La présence du restaurant sur les plateformes qui comptent.
--
-- Une ligne par plateforme vérifiée : le restaurateur a cherché sa fiche,
-- et dit ce qu'il a trouvé. Klarr ne la vérifie pas lui-même — ni Apple,
-- ni Bing, ni PagesJaunes n'offrent de lecture sans dossier d'accès — et
-- la colonne `statut` dit donc ce que le restaurateur a constaté, rien de
-- plus. Une plateforme sans ligne n'a simplement pas encore été vérifiée.
--
-- Google, Facebook, Instagram, TripAdvisor et la vitrine n'ont pas besoin
-- de ligne quand Klarr les connaît déjà par leurs propres tables : l'écran
-- les lit là, et cette table ne sert qu'à ce que Klarr ne peut pas voir.

create table if not exists public.restaurant_presence (
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  plateforme text not null,
  statut text not null,
  verifie_le timestamptz not null default now(),

  primary key (restaurant_id, plateforme),

  constraint presence_statut_connu
    check (statut in ('a_jour', 'a_corriger', 'absente')),
  constraint presence_plateforme_bornee
    check (length(plateforme) between 1 and 40)
);

alter table public.restaurant_presence enable row level security;

drop policy if exists "presence_select" on public.restaurant_presence;
create policy "presence_select" on public.restaurant_presence
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "presence_ecriture" on public.restaurant_presence;
create policy "presence_ecriture" on public.restaurant_presence
  for all using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
