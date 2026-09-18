-- L'acompte encaissé ailleurs.
--
-- Klarr ne savait recevoir un acompte que d'une seule façon : par Stripe,
-- sur le compte du restaurateur. Or un client d'entreprise paie par
-- virement, un habitué tend des espèces au comptoir, un comité
-- d'entreprise envoie un bon de commande. Dans tous ces cas la
-- réservation restait « acompte en attente », et l'option s'éteignait
-- d'elle-même au bout de quarante-huit heures — une salle vendue,
-- encaissée, et rendue disponible par le logiciel.
--
-- Le restaurateur peut donc constater l'encaissement lui-même. Le drapeau
-- dit par quel chemin l'argent est arrivé : Klarr n'a rien vu passer, il
-- ne doit pas laisser croire le contraire à la comptabilité.
alter table public.restaurant_reservations
  add column if not exists acompte_hors_ligne boolean not null default false;

comment on column public.restaurant_reservations.acompte_hors_ligne is
  'Acompte constaté par le restaurateur (virement, espèces, chèque) : aucun paiement Stripe ne lui correspond.';
