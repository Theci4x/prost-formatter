-- L'état de la fiche Google, relevé avec la note.
--
-- Google connaît trois états : ouvert, fermé temporairement, fermé
-- définitivement. Le deuxième est le seul qui se retourne contre le
-- restaurateur sans qu'il s'en aperçoive : il le pose lui-même pendant des
-- travaux — ce qui est juste —, puis il rouvre la salle, rouvre son carnet,
-- et oublie la fiche. Google, lui, continue de ne proposer l'établissement
-- à personne.
--
-- On range la valeur brute de Google plutôt qu'un booléen : « fermé
-- définitivement » ne se traite pas comme « fermé temporairement », et une
-- colonne « ferme boolean » nous obligerait à remigrer le jour où on veut
-- les distinguer.
--
-- Nulle tant que le relevé n'a pas eu lieu. La rotation dure une semaine,
-- donc un établissement inscrit ce soir n'a pas d'état avant demain matin :
-- l'écran doit lire « inconnu », jamais « fermé ».

alter table restaurants
  add column if not exists google_statut text,
  add column if not exists google_statut_releve_le timestamptz;

-- Une seule chaîne par commentaire, sans continuation : ce fichier se
-- colle dans l'éditeur SQL de Supabase, et deux littéraux à recoller
-- dépendent d'un retour à la ligne qu'un copier-coller peut avaler.
comment on column restaurants.google_statut is 'Statut de la fiche Google, tel que Places le rend : OPERATIONAL, CLOSED_TEMPORARILY, CLOSED_PERMANENTLY. Null si jamais relevé.';

comment on column restaurants.google_statut_releve_le is 'Quand ce statut a été relevé. Sert à ne pas alerter sur une lecture trop vieille pour être crue.';
