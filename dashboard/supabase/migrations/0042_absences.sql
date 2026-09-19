-- Le no-show ne se mesurait nulle part. Une table réservée que personne
-- n'honore restait « confirmée » pour l'éternité : elle gonflait les
-- couverts du mois, et le restaurateur qui voulait savoir combien de
-- places il avait perdues n'avait que sa mémoire.
--
-- On ne change pas le statut pour autant. La réservation a bien été
-- confirmée — c'est même tout le problème. L'absence est un fait qui
-- s'ajoute, constaté après le service, et qui se défait si on s'est
-- trompé.
alter table public.restaurant_reservations
  add column if not exists absence_constatee_le timestamptz;

-- Qui l'a constatée. En brigade, « ils ne sont jamais venus » se discute
-- le lendemain : savoir qui a coché évite d'avoir à deviner.
alter table public.restaurant_reservations
  add column if not exists absence_constatee_par uuid
  references auth.users (id) on delete set null;

-- L'historique d'un client se cherche par son adresse, dans son
-- établissement. Sans index, la fiche d'une réservation relirait toutes
-- les réservations de la maison pour compter deux absences.
create index if not exists reservations_absences_client_idx
  on public.restaurant_reservations (restaurant_id, client_email)
  where absence_constatee_le is not null;
