-- Le retour qu'un client préfère dire en privé.
--
-- Le totem NFC posé sur la table ouvre une page qui propose deux chemins,
-- présentés à égalité : laisser un avis public, ou dire à la maison ce qui
-- n'a pas été. Rien n'est trié — on ne demande pas de note avant de
-- décider où envoyer les gens, ce que les plateformes d'avis interdisent
-- et savent détecter. Le client choisit, et le mécontent choisit souvent
-- le canal où il sera lu plutôt que celui où il sera vu.
--
-- Ce qu'on y gagne dépasse l'avis évité : une étoile en moins ne dit pas
-- ce qui s'est passé, un message le dit.

create table if not exists public.restaurant_retours (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  message text not null,
  -- De quoi rappeler, si le client le veut bien. Facultatif : exiger une
  -- adresse ferait taire ceux qui ont le plus à dire.
  contact text,
  traite boolean not null default false,
  created_at timestamptz not null default now(),
  constraint retour_message_non_vide check (length(btrim(message)) > 0),
  constraint retour_message_borne check (length(message) <= 4000)
);

create index if not exists restaurant_retours_restaurant_idx
  on public.restaurant_retours (restaurant_id, created_at desc);

alter table public.restaurant_retours enable row level security;

-- L'écriture passe par la clé de service, derrière le compteur de limites
-- des formulaires publics : ouvrir la table à « anon » reviendrait à poser
-- une boîte à lettres sans fond sur la voie publique.
drop policy if exists "retours_select" on public.restaurant_retours;
create policy "retours_select" on public.restaurant_retours
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "retours_update" on public.restaurant_retours;
create policy "retours_update" on public.restaurant_retours
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

drop policy if exists "retours_delete" on public.restaurant_retours;
create policy "retours_delete" on public.restaurant_retours
  for delete using (public.peut_gerer(restaurant_id));
