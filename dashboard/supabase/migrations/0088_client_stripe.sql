-- Le client Stripe d'un établissement, avant tout abonnement.
--
-- Jusqu'ici le client Stripe naissait au premier paiement, et son
-- identifiant ne vivait que sur la ligne d'abonnement. Un restaurateur en
-- essai ne pouvait donc pas remplir ses informations de facturation :
-- elles n'avaient nulle part où aller. On garde ici le client créé pour
-- lui ; la page de paiement le reprendra, et la facture portera d'emblée
-- sa raison sociale, son adresse et son numéro de TVA.
--
-- Écrit par le serveur seul, avec la clé de service.

alter table public.restaurants
  add column if not exists stripe_client_id text;
