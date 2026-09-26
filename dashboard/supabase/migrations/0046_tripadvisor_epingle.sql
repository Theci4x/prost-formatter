-- Klarr retrouvait l'établissement chez Tripadvisor en cherchant son nom
-- et son adresse, à chaque affichage. Quand ça tombait juste, personne
-- n'avait rien à faire — et c'est une bonne chose. Quand ça tombait à
-- côté, personne ne pouvait rien y faire non plus.
--
-- Le mauvais cas n'est pas l'absence de résultat, c'est le mauvais
-- résultat : deux « Le Bistrot » dans la même ville, et le restaurateur
-- lit sur son tableau de bord les avis de son voisin sans jamais
-- l'apprendre. Une note empruntée ne se rattrape pas par des excuses.
--
-- L'identifiant s'épingle donc, une fois, quand le restaurateur confirme
-- — comme google_place_id le fait déjà de son côté. NULL tant qu'il n'a
-- rien confirmé : la recherche automatique reste le comportement par
-- défaut, elle ne demande rien à personne et se trompe rarement.
alter table public.restaurants
  add column if not exists tripadvisor_location_id text;
