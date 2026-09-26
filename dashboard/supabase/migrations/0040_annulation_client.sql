-- Un client empêché n'avait aucun moyen d'annuler. Il pouvait répondre à
-- l'e-mail ou téléphoner — c'est-à-dire déranger quelqu'un en plein
-- service pour rendre une table. Dans les faits, il ne fait rien : la
-- table reste bloquée, personne ne s'assied dessus, et l'établissement
-- compte un no-show qui n'en était pas un.
--
-- Une table rendue à temps, c'est une table qui resert. Encore faut-il
-- que la rendre demande un clic.

-- Le jeton qui identifie la réservation dans le lien d'annulation. Séparé
-- du jeton de paiement : un lien d'annulation circule par e-mail et peut
-- être transféré, il ne doit jamais donner accès à un règlement.
alter table public.restaurant_reservations
  add column if not exists annulation_token text;

-- Les réservations déjà enregistrées en reçoivent un : sans ça, un client
-- dont la table est déjà prise resterait sans recours, et le rappel de la
-- veille n'aurait pas de lien à lui donner.
update public.restaurant_reservations
set annulation_token = replace(gen_random_uuid()::text, '-', '')
where annulation_token is null;

-- Deux réservations ne peuvent pas partager un jeton : c'est lui, et lui
-- seul, qui autorise l'annulation.
create unique index if not exists reservations_annulation_token_idx
  on public.restaurant_reservations (annulation_token);

-- Qui a annulé. Le restaurateur doit pouvoir distinguer d'un coup d'œil
-- la table qu'il a lui-même refusée de celle que le client a rendue : la
-- seconde est une bonne nouvelle, elle se revend.
alter table public.restaurant_reservations
  add column if not exists annulee_par text;

alter table public.restaurant_reservations
  drop constraint if exists annulee_par_connu;
alter table public.restaurant_reservations
  add constraint annulee_par_connu
  check (annulee_par is null or annulee_par in ('client', 'restaurant'));
