-- Une salle de 92 places n'a pas 92 places de 17h30 à 2h du matin.
--
-- Jusqu'ici une réservation portait une date et un service, jamais une heure
-- d'arrivée : la jauge d'un espace était donc consommée pour le service
-- entier. Une table de 18h et une table de 23h se disputaient les mêmes
-- couverts alors qu'elles ne se croisent jamais — l'établissement vendait
-- deux à trois fois moins qu'il ne pouvait.

-- Combien de temps une table reste occupée. Deux heures par défaut : c'est
-- la valeur qu'un restaurateur donne quand on lui pose la question, et le
-- midi se règle ensuite à part puisque la durée vit sur le service.
alter table public.restaurant_services
  add column if not exists duree_minutes integer not null default 120;

alter table public.restaurant_services
  drop constraint if exists service_duree_positive;
alter table public.restaurant_services
  add constraint service_duree_positive
  check (duree_minutes between 15 and 720);

-- L'heure à laquelle le client arrive. Nullable : les réservations déjà
-- enregistrées n'en ont pas, et une réservation dont le service a été
-- supprimé n'a plus de quoi en déduire une.
alter table public.restaurant_reservations
  add column if not exists heure_arrivee time;

-- Les réservations existantes sont réputées arriver à l'ouverture de leur
-- service. C'est faux dans le détail, mais jamais au point de créer un
-- surbooking : une arrivée placée au plus tôt bloque le début du service,
-- pas la fin. Le restaurateur corrige à la main les quelques cas qui
-- comptent, et le moteur traite comme avant celles qui restent sans heure.
update public.restaurant_reservations as r
set heure_arrivee = s.heure_debut
from public.restaurant_services as s
where r.service_id = s.id
  and r.heure_arrivee is null;

-- Le calcul de disponibilité interroge un espace, une date et une heure.
drop index if exists reservations_creneau_idx;
create index if not exists reservations_creneau_idx
  on public.restaurant_reservations
  (espace_id, date_reservation, service_id, heure_arrivee);
