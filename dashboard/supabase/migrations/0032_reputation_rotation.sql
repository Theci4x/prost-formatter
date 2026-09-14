-- La rotation des relevés de réputation.
--
-- Jusqu'ici le cron interrogeait chaque nuit tous les établissements. À
-- cinq, c'est instantané et gratuit. À cinq cents, c'est une facture Google
-- Places multipliée par cent, et une tâche qui dépasse largement la minute
-- que Vercel lui accorde : elle serait coupée au même endroit chaque nuit,
-- et les derniers établissements de la liste ne seraient jamais relevés —
-- sans que rien ne le signale.
--
-- Cette colonne dit quand chaque établissement a été relevé pour la
-- dernière fois. Le cron prend les plus anciens d'abord, les jamais relevés
-- (colonne à NULL) en tête : chacun passe donc une fois par semaine, un
-- nouvel inscrit passe dès la nuit suivante une fois le parc à jour, et une
-- tâche interrompue reprend exactement là où elle s'était arrêtée.
alter table public.restaurants
  add column if not exists reputation_relevee_le timestamptz;

-- L'index sert l'unique requête du cron. « nulls first » est écrit
-- explicitement : sur un tri croissant, Postgres place les NULL en dernier,
-- ce qui ferait attendre une semaine à chaque nouvel établissement.
-- « created_at » départage les jamais relevés, qui sont tous à NULL : sans
-- lui, leur ordre serait celui que la base veut bien rendre.
create index if not exists restaurants_reputation_relevee_le_idx
  on public.restaurants (reputation_relevee_le asc nulls first, created_at asc);

-- Note sur les droits : cette colonne reste techniquement modifiable par le
-- restaurateur, comme le reste de sa fiche — les règles d'accès de Klarr
-- sont au niveau de la ligne, pas de la colonne. La protéger demanderait un
-- déclencheur qui, s'il identifiait mal le rôle, annulerait les écritures du
-- cron lui-même : la rotation n'avancerait plus, en silence. Une panne pire
-- que l'abus qu'elle éviterait. Le tableau de bord n'écrit jamais cette
-- colonne, et la remettre à NULL ne ferait relever qu'un établissement.
