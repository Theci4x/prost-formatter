-- La demande d'avis envoyée le lendemain de la visite.
--
-- Active par défaut : c'est un remerciement suivi d'une invitation,
-- envoyé une fois par client et par trimestre au plus, avec un lien de
-- désinscription. La maison peut la couper depuis la page des avis.
alter table public.restaurants
  add column if not exists avis_apres_visite boolean not null default true;

-- La tâche du matin cherche qui l'a déjà reçue ces 90 derniers jours.
create index if not exists reservation_courriels_avis_idx
  on public.reservation_courriels (destinataire, envoye_le)
  where genre = 'avis';
