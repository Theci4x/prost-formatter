-- Le devis, tel qu'un restaurateur l'établit vraiment.
--
-- Trois manques, découverts au premier usage.
--
-- La TVA d'abord. La 0056 posait un taux unique par devis, en affirmant
-- qu'aucun restaurateur ne tiendrait une ventilation par ligne. C'est
-- l'inverse : un menu à 10 % et un forfait boissons à 20 % sur la même
-- privatisation est le cas ordinaire, et la ventilation par taux est
-- obligatoire sur le document. Le taux descend donc sur la ligne.
--
-- Le catalogue ensuite. Un restaurateur propose trois ou quatre formules,
-- toute l'année. Les ressaisir à chaque devis est le genre de corvée qui
-- fait renoncer à l'outil et reprendre le tableur.
--
-- Les mentions enfin. Un devis est un document contractuel : il porte
-- l'identité de l'entreprise, ses conditions de règlement et d'annulation.
-- Ce n'est pas le même texte que les mentions légales de la page de
-- réservation, et il se fige à l'envoi — ce que le client a accepté ne
-- change pas parce que la maison a révisé ses conditions en mars.

-- ---------------------------------------------------------------------
-- 1. Un taux de TVA par ligne
-- ---------------------------------------------------------------------

alter table public.devis_lignes
  add column if not exists tva_taux numeric(4, 2) not null default 10.00;

-- Les devis déjà établis gardent le taux qu'ils portaient : leurs lignes
-- héritent du taux global plutôt que du défaut de la colonne.
update public.devis_lignes l
set tva_taux = d.tva_taux
from public.devis d
where d.id = l.devis_id and l.tva_taux = 10.00 and d.tva_taux <> 10.00;

-- `devis.tva_taux` survit, mais change de rôle : il n'est plus le taux du
-- devis, c'est celui que l'éditeur propose pour une ligne neuve. Un
-- restaurant qui ne sert pas d'alcool garde ainsi ses 10 % sans y penser.
comment on column public.devis.tva_taux is
  'Taux proposé pour une nouvelle ligne. Le taux appliqué est celui de la ligne.';

-- ---------------------------------------------------------------------
-- 2. Le catalogue des prestations
-- ---------------------------------------------------------------------

create table if not exists public.devis_prestations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  libelle text not null,
  prix_unitaire_centimes integer not null check (prix_unitaire_centimes >= 0),
  tva_taux numeric(4, 2) not null default 10.00,
  -- Le nombre qui vient d'habitude avec cette prestation. NULL quand il
  -- dépend du nombre de convives, ce qui est le cas le plus fréquent :
  -- l'éditeur reprend alors les couverts demandés.
  quantite_par_defaut numeric(10, 2) check (quantite_par_defaut is null or quantite_par_defaut > 0),
  derniere_utilisation timestamptz,
  created_at timestamptz not null default now(),
  constraint prestation_libelle_non_vide check (length(btrim(libelle)) > 0)
);

-- Deux fois « Menu Saint-Sylvestre » dans le même catalogue n'aide
-- personne : enregistrer une prestation déjà connue la met à jour.
create unique index if not exists devis_prestations_libelle_unique
  on public.devis_prestations (restaurant_id, lower(btrim(libelle)));

-- Les plus récemment servies en tête : c'est l'ordre dans lequel on les
-- propose, et il se règle tout seul à l'usage.
create index if not exists devis_prestations_maison_idx
  on public.devis_prestations (restaurant_id, derniere_utilisation desc nulls last);

alter table public.devis_prestations enable row level security;

create policy "devis_prestations_select" on public.devis_prestations
  for select using (public.peut_voir(restaurant_id));
create policy "devis_prestations_ecriture" on public.devis_prestations
  for all using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

-- ---------------------------------------------------------------------
-- 3. Les mentions du devis
-- ---------------------------------------------------------------------

-- Le pied de devis de la maison : identité de l'entreprise, conditions de
-- règlement et d'annulation. Distinct de `mentions_legales`, qui sert la
-- page de réservation et dit autre chose.
alter table public.restaurants
  add column if not exists devis_mentions text;

-- Ce qui a été envoyé au client, figé. Un devis accepté doit pouvoir se
-- relire des mois plus tard tel qu'il a été signé.
alter table public.devis
  add column if not exists mentions text;
