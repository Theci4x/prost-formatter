-- Quand la fiche du restaurant a changé pour la dernière fois.
--
-- Seulement ce qu'on recopie ailleurs : nom, adresse, téléphone, site et
-- horaires. Une description retouchée ne rend fausse aucune fiche Apple
-- ou PagesJaunes ; un téléphone changé, si. L'écran « Présence en ligne »
-- compare cette date à celle de chaque vérification pour dire quelles
-- plateformes reprendre.
--
-- NULL tant que rien n'a changé depuis la migration : les fiches déjà
-- vérifiées ne sont pas signalées à tort.

alter table public.restaurants
  add column if not exists fiche_modifiee_le timestamptz;
