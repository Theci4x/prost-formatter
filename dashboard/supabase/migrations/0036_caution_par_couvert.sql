-- La caution se règle comme l'acompte, et les deux ont un seuil.
--
-- La caution ne se disait qu'en forfait : « mille euros pour la salle ».
-- Un restaurateur raisonne le plus souvent par convive — « cinquante euros
-- par personne » —, parce que c'est le nombre de convives qui fait le
-- risque, pas la pièce.
--
-- Et personne ne veut réclamer une empreinte de carte à six personnes qui
-- privatisent la petite salle un mardi. Le seuil dit à partir de combien de
-- convives la garantie se déclenche ; en dessous, on ne demande rien.
alter table public.restaurant_espaces
  add column if not exists caution_mode text not null default 'forfait',
  -- Un seul seuil pour la garantie choisie : le formulaire n'en propose
  -- qu'une à la fois — acompte OU caution — et deux colonnes à moitié
  -- remplies se contrediraient tôt ou tard.
  add column if not exists garantie_seuil_couverts integer;

alter table public.restaurant_espaces
  drop constraint if exists espace_caution_mode_check;
alter table public.restaurant_espaces
  add constraint espace_caution_mode_check
  check (caution_mode in ('forfait', 'par_couvert'));

alter table public.restaurant_espaces
  drop constraint if exists espace_garantie_seuil_check;
alter table public.restaurant_espaces
  add constraint espace_garantie_seuil_check
  check (garantie_seuil_couverts is null or garantie_seuil_couverts > 0);
