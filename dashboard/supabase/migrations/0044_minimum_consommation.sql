-- Klarr savait réclamer de l'argent — un acompte, une empreinte de carte —
-- mais pas annoncer un engagement. Or la privatisation se vend le plus
-- souvent ainsi : la salle ne coûte rien, et l'on s'engage à consommer un
-- montant minimum. C'est ce que le client doit lire avant de réserver, et
-- ce que le restaurateur doit retrouver dans son carnet le jour venu.

-- Le minimum demandé pour privatiser cet espace, en centimes. NULL quand
-- il n'y en a pas.
alter table public.restaurant_espaces
  add column if not exists minimum_consommation_centimes integer;

alter table public.restaurant_espaces
  drop constraint if exists minimum_consommation_positif;
alter table public.restaurant_espaces
  add constraint minimum_consommation_positif
  check (
    minimum_consommation_centimes is null
    or minimum_consommation_centimes > 0
  );

-- Hors taxes ou toutes taxes comprises. Une privatisation d'entreprise se
-- négocie en HT, un anniversaire en TTC : afficher l'un pour l'autre fait
-- une différence de vingt pour cent, et une discussion au moment de
-- l'addition.
alter table public.restaurant_espaces
  add column if not exists minimum_consommation_ht boolean not null default true;

-- Le montant est recopié sur la réservation au moment où elle est prise.
-- Même raison que pour l'acompte : si le tarif de l'espace change ensuite,
-- ce qui a été annoncé au client ne doit pas bouger sous ses pieds.
alter table public.restaurant_reservations
  add column if not exists minimum_consommation_centimes integer;

alter table public.restaurant_reservations
  add column if not exists minimum_consommation_ht boolean;
