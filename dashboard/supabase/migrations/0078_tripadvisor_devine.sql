-- L'établissement Tripadvisor trouvé par la recherche automatique, gardé.
--
-- Tripadvisor facture chaque établissement renvoyé par un appel, et une
-- recherche en renvoie jusqu'à dix. Le relevé de la semaine la refaisait
-- à chaque passage pour retrouver le même restaurant : dix fois le prix
-- d'une simple lecture de note, chaque semaine, pour rien.
--
-- L'identifiant trouvé la première fois se garde donc ici. Il reste
-- distinct de `tripadvisor_location_id`, qui est celui que le
-- restaurateur a confirmé : une devinette n'est pas une confirmation, et
-- l'écran doit toujours pouvoir dire « trouvé automatiquement ». Confirmer
-- un autre établissement, ou revenir à la recherche, efface la devinette.
alter table public.restaurants
  add column if not exists tripadvisor_location_devine text;

notify pgrst, 'reload schema';
