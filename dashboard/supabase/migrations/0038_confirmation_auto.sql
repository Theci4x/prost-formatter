-- Valider chaque réservation à la main, c'est tenable à trois demandes par
-- semaine et intenable dès qu'il y en a vingt. Le restaurateur finit par
-- confirmer en bloc sans regarder, ce qui revient à ne pas confirmer — en
-- plus lent, et avec des clients qui attendent une réponse pendant ce temps.
--
-- La confirmation devient donc automatique, sauf pour les demandes de
-- dernière minute : celles-là, on veut les voir passer.
alter table public.restaurants
  add column if not exists confirmation_auto boolean not null default true;

-- En deçà de ce délai avant le service, la demande attend une validation
-- humaine. Vingt-quatre heures par défaut : une table pour demain soir se
-- confirme toute seule, une table pour ce soir se regarde.
-- Mettre 0 revient à tout confirmer automatiquement.
alter table public.restaurants
  add column if not exists confirmation_auto_delai_heures integer not null default 24;

alter table public.restaurants
  drop constraint if exists confirmation_delai_positif;
alter table public.restaurants
  add constraint confirmation_delai_positif
  check (confirmation_auto_delai_heures between 0 and 336);

-- L'adresse à laquelle le restaurant reçoit ses alertes, et à laquelle le
-- client répond quand il veut prévenir d'un empêchement. Amorcée avec
-- l'adresse du propriétaire : sans ça, la confirmation automatique ferait
-- entrer des réservations que personne ne verrait passer.
alter table public.restaurants
  add column if not exists email_contact text;

update public.restaurants as r
set email_contact = u.email
from auth.users as u
where u.id = r.proprietaire_id
  and r.email_contact is null;

-- Ce qui a été envoyé, et quand. Sans cette trace, un renvoi de page ou un
-- double clic expédierait deux fois le même message au client — et une
-- panne d'envoi serait invisible.
create table if not exists public.reservation_courriels (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null
    references public.restaurant_reservations (id) on delete cascade,
  -- « recue », « confirmee », « refusee », « alerte_restaurateur »…
  genre text not null,
  destinataire text not null,
  envoye_le timestamptz not null default now(),
  -- Renseignée quand l'envoi a échoué : on garde la trace de la tentative
  -- plutôt que de laisser croire que le client a été prévenu.
  erreur text
);

-- Un genre donné ne part qu'une fois par réservation.
create unique index if not exists reservation_courriels_unicite_idx
  on public.reservation_courriels (reservation_id, genre);

alter table public.reservation_courriels enable row level security;

-- Personne n'y accède depuis le navigateur : ces lignes sont écrites et
-- lues par le serveur, avec la clé de service. Aucune politique, donc
-- aucun accès — c'est le comportement voulu.
