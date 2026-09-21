-- La roue devient une source de consentement comme une autre.
--
-- Le fichier client (0063) n'acceptait que trois origines : une
-- réservation, une expérience, un import. Une adresse laissée pour tourner
-- la roue n'entrait dans aucune, et la contrainte l'aurait refusée.
--
-- On l'ajoute plutôt que de la ranger sous « expérience » : le jour où
-- quelqu'un demande d'où vient une adresse — et le RGPD donne ce droit —,
-- la réponse doit être vraie.

alter table public.restaurant_contacts
  drop constraint if exists contact_source_connue;

alter table public.restaurant_contacts
  add constraint contact_source_connue check (
    consentement_source is null
    or consentement_source in ('reservation', 'experience', 'import', 'roue')
  );
