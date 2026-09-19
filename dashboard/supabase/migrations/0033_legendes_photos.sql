-- Les légendes de photos.
--
-- Un client qui ouvre la galerie voit une suite d'images sans savoir
-- laquelle est la salle du bas, laquelle est la cave, laquelle est le bar
-- du sous-sol. Le restaurateur, lui, sait exactement ce qu'il montre : il
-- lui manquait juste l'endroit où l'écrire.
--
-- Une colonne facultative : une photo sans légende reste une photo
-- parfaitement valable, et aucune de celles déjà en ligne n'est à reprendre.
alter table public.restaurant_photos
  add column if not exists legende text;
