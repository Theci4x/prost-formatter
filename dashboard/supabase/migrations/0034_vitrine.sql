-- La vitrine : le site du restaurant, engendré de ce qu'il a déjà saisi.
--
-- Le premier reproche de l'audit de visibilité est toujours le même :
-- « aucun site déclaré, pilier Visibilité IA à zéro ». Le restaurateur a
-- pourtant déjà tout dans Klarr — nom, adresse, horaires, photos, carte,
-- note. Il ne lui manquait qu'une page qui rassemble, et une adresse à
-- donner à Google.
--
-- Publier reste un choix explicite, comme pour la carte : une fiche remplie
-- pour essayer n'a rien à faire sur une adresse publique, et un
-- restaurateur doit pouvoir tout saisir avant de se montrer.
alter table public.restaurants
  add column if not exists site_publie boolean not null default false;
