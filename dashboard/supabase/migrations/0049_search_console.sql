-- Les mots-clés ciblés vivaient dans leur coin : le restaurateur écrivait
-- « restaurant allemand Paris », Claude commentait la pertinence du choix,
-- et personne ne savait s'il ressortait dessus, à quelle place, ni si
-- quiconque tapait réellement cette expression. Un conseil en chambre.
--
-- Search Console donne les requêtes réellement tapées par ceux qui l'ont
-- trouvé, avec leurs impressions, leurs clics et leur position moyenne.
-- C'est ce qui sépare « vous ciblez » de « vous ressortez huitième, et
-- trois cent quarante personnes vous ont vu ce mois-ci ».
--
-- La propriété se range sur l'établissement plutôt que sur la connexion
-- Google : un même compte Google peut administrer plusieurs sites, et
-- c'est le restaurant qui en désigne un — pas le compte.
alter table public.restaurants
  add column if not exists search_console_site text;
