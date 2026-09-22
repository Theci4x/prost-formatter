-- La dernière analyse SEO, gardée.
--
-- Elle ne vivait que dans l'état du composant : elle disparaissait au
-- moindre rechargement, et le restaurateur la relançait. Or chaque
-- relance est un appel à un modèle — payé, et long. Une analyse qu'on
-- perd en changeant d'onglet se paie deux fois pour le même texte.
--
-- On garde la dernière, et elle seule : un historique ne servirait
-- personne ici. Ce qui compte au moment où l'écran s'ouvre, c'est le
-- dernier conseil reçu, et la date qui dit s'il est encore d'actualité.
--
-- Les mots-clés sont rangés avec elle. Sans eux, l'écran ne peut pas dire
-- ce qui a bougé depuis — et c'est la seule raison honnête de proposer
-- une relance. « Relancer parce que c'est possible » fait dépenser ;
-- « trois mots-clés ajoutés depuis » fait décider.

alter table restaurants
  add column if not exists seo_analyse text,
  add column if not exists seo_analyse_le timestamptz,
  add column if not exists seo_analyse_mots_cles text[];

comment on column restaurants.seo_analyse is 'La dernière analyse SEO rendue par le modèle, en markdown. Nulle tant qu aucune analyse n a été lancée.';

comment on column restaurants.seo_analyse_le is 'Quand elle a été produite. Affichée à côté d elle : un conseil de référencement vieillit.';

comment on column restaurants.seo_analyse_mots_cles is 'Les mots-clés ciblés au moment de l analyse. Sert à dire ce qui a changé depuis, et donc si une relance vaut son coût.';
