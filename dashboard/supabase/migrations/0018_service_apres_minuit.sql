-- Un service peut finir après minuit : un dîner de 17h30 à 2h du matin est la
-- normalité d'un bar-restaurant, pas une exception. La contrainte imposait
-- une fin strictement postérieure au début, ce qui rendait ces horaires
-- impossibles à saisir.
--
-- Le service reste rattaché au jour où il commence : un samedi soir qui se
-- termine à 2h appartient au samedi, pas au dimanche. Rien d'autre ne change
-- dans le calcul des disponibilités, l'heure de fin n'y servant qu'à
-- l'affichage.
alter table public.restaurant_services
  drop constraint if exists service_fin_apres_debut;

-- Début et fin identiques resteraient ambigus : service vide, ou de vingt-
-- quatre heures ?
alter table public.restaurant_services
  add constraint service_debut_different_de_fin
  check (heure_fin <> heure_debut);
