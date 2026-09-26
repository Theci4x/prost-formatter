-- Les réservations reprises d'un autre outil (TheFork, Zenchef…).
--
-- Une origine à part, et pas « restaurateur » : ces tables ont été prises
-- ailleurs, le client a déjà reçu sa confirmation de l'autre outil. Klarr
-- ne doit donc pas lui en renvoyer une, ni lui écrire la veille — deux
-- rappels de deux expéditeurs différents pour un même dîner, c'est le
-- client qui appelle pour savoir lequel croire.

alter table public.restaurant_reservations
  drop constraint if exists restaurant_reservations_origine_check;

alter table public.restaurant_reservations
  add constraint restaurant_reservations_origine_check
  check (origine in ('client', 'restaurateur', 'import'));
