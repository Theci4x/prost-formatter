-- La vitrine ouvrait sur une grille de vignettes. Un site de restaurant
-- s'ouvre sur une image : c'est elle qui décide, en une seconde, si le
-- visiteur lit la suite. Et sans choix explicite, la première photo de la
-- grille était simplement la plus ancienne mise en ligne — l'ordre du
-- hasard, pas celui du restaurateur.

-- La photo qui ouvre la vitrine. Une référence plutôt qu'un drapeau sur
-- la photo : une seule peut être la couverture, et la base le garantit
-- toute seule, sans qu'une action ait à en décocher une autre.
alter table public.restaurants
  add column if not exists photo_couverture_id uuid
  references public.restaurant_photos (id) on delete set null;

-- « on delete set null » : une couverture supprimée depuis la page Photos
-- ne laisse pas la vitrine pointer vers une image qui n'existe plus. La
-- page reprend alors la première photo de l'établissement, comme avant
-- qu'un choix soit fait.
