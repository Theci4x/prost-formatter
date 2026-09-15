-- Un e-mail refusé restait refusé. Le client réservait, la table était
-- prise, le carnet était juste — et lui n'avait rien reçu, sans que
-- personne ne s'en aperçoive. Une panne de dix minutes chez le
-- fournisseur, et ce sont tous les clients de ces dix minutes qui se
-- présentent sans confirmation en poche.
--
-- On garde donc de quoi retenter : combien de fois on a essayé, et quand
-- pour la dernière fois.

-- Une ligne écrite avant cette migration a bien eu une tentative : c'est
-- ce que raconte « envoye_le ». Le défaut à 1 dit la vérité sur
-- l'existant, là où 0 ferait croire qu'on n'a jamais essayé.
alter table public.reservation_courriels
  add column if not exists tentatives integer not null default 1;

alter table public.reservation_courriels
  add column if not exists derniere_tentative timestamptz;

-- La tâche de nuit cherche exactement ceci : les lignes en erreur qu'on
-- n'a pas encore abandonnées. Sans index, elle relit toute la table
-- chaque nuit — supportable au début, plus du tout à dix mille lignes.
create index if not exists reservation_courriels_a_retenter_idx
  on public.reservation_courriels (envoye_le)
  where erreur is not null;
