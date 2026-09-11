-- La page de réservation doit appartenir au restaurant, pas à Klarr : son
-- logo en tête, ses mentions légales en pied. C'est lui qui contracte avec
-- le client, pas nous.
alter table public.restaurants
  add column if not exists logo_url text,
  add column if not exists logo_storage_path text,
  add column if not exists mentions_legales text;

-- Le restaurateur prend la plupart de ses réservations au téléphone. Sans
-- elles, les jauges sont fausses et une salle finit promise deux fois. On
-- garde d'où vient chaque réservation, ne serait-ce que pour que le
-- restaurateur s'y retrouve.
alter table public.restaurant_reservations
  add column if not exists origine text not null default 'client'
  check (origine in ('client', 'restaurateur'));

-- Consentement au démarchage commercial du restaurant, séparé de la
-- réservation elle-même : le RGPD interdit de déduire l'un de l'autre, et
-- la case doit être décochée au départ.
alter table public.restaurant_reservations
  add column if not exists accepte_communications boolean not null default false;
