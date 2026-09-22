-- La langue du client, rangée avec sa réservation.
--
-- Les messages qui l'entourent partent d'un serveur, longtemps après la
-- requête qui les a déclenchés : le rappel part la veille au soir, le lien
-- de paiement quand le restaurateur accepte, parfois le lendemain. À ces
-- moments-là il n'y a plus personne au bout du fil à qui redemander sa
-- langue — ni témoin, ni en-tête, ni navigateur.
--
-- Elle se lit donc une fois, quand le client remplit le formulaire, et
-- elle reste. Exactement comme pour le lot de la roue de la fortune.
--
-- Nulle sur les réservations d'avant cette migration : les messages y
-- retombent sur le français, qui est ce qu'elles ont déjà reçu.

alter table restaurant_reservations
  add column if not exists langue text;

comment on column restaurant_reservations.langue is 'La langue du client au moment de la réservation (fr, en, zh). Null avant la 0074 : les messages retombent alors sur le français.';
