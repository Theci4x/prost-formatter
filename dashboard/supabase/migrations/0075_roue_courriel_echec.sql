-- Pourquoi la lettre du lot n'est pas partie.
--
-- L'envoi rendait un résultat que personne ne lisait. Un client gagnait,
-- l'écran lui annonçait « le code part aussi par e-mail », et si le
-- fournisseur refusait — adresse en faute de frappe, domaine bloqué,
-- panne — la lettre disparaissait sans laisser de trace. Ni le client ni
-- le restaurateur ne pouvaient le savoir : il ne restait qu'une ligne
-- dans les journaux de Vercel, que personne ne lit sans raison de le
-- faire.
--
-- Les réservations ont déjà cette colonne, sous le nom « erreur », dans
-- « reservation_courriels ». La roue la rattrape.
--
-- Nulle quand tout s'est bien passé, et nulle aussi sur un lot perdant :
-- là, il n'y avait rien à envoyer.

alter table restaurant_roue_parties
  add column if not exists courriel_erreur text;

comment on column restaurant_roue_parties.courriel_erreur is 'Pourquoi la lettre du lot n''est pas partie. Nulle si elle est partie, ou si le lot était perdant.';
