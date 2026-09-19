-- Le devis d'une privatisation.
--
-- Klarr savait déjà réclamer un acompte, poser une caution et relancer
-- avant l'échéance. Il lui manquait le document : la proposition chiffrée,
-- ligne par ligne, qu'un restaurateur envoie pour un anniversaire de
-- trente couverts et que le client accepte avant de payer.
--
-- Un devis appartient à une demande de réservation : il répond à quelqu'un
-- qui a demandé une salle, il ne se crée pas dans le vide. Le parcours du
-- client reste donc simple — il demande, on lui répond.
create table if not exists public.devis (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  reservation_id uuid not null references public.restaurant_reservations (id) on delete cascade,
  -- « DEV-2026-0007 » : ce que le client cite au téléphone, et ce que le
  -- restaurateur retrouve dans sa comptabilité.
  numero text not null,
  -- L'adresse publique du devis. Long et imprévisible : le connaître suffit
  -- à le lire, le perdre ne donne accès à rien d'autre.
  jeton text not null unique,
  statut text not null default 'brouillon'
    check (statut in ('brouillon', 'envoye', 'accepte', 'refuse')),
  -- Le mot d'accompagnement, écrit par le restaurateur.
  message text,
  -- La TVA de la restauration sur place est à 10 % ; les alcools à 20 %.
  -- Un seul taux par devis : deux taux demandent une ventilation par ligne,
  -- et aucun restaurateur ne la tiendra à la main pour une privatisation.
  tva_taux numeric(4, 2) not null default 10.00,
  -- Ce qu'on demandera à l'acceptation. NULL : rien à payer d'avance.
  acompte_centimes integer check (acompte_centimes is null or acompte_centimes > 0),
  -- Passé cette date, le devis ne s'accepte plus : les prix d'un traiteur
  -- ne tiennent pas six mois, et une proposition sans fin est une promesse
  -- qu'on n'a pas voulu faire.
  valide_jusquau date not null,
  envoye_le timestamptz,
  accepte_le timestamptz,
  refuse_le timestamptz,
  refus_motif text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Deux devis d'un même restaurant ne portent jamais le même numéro.
  constraint devis_numero_unique unique (restaurant_id, numero)
);

-- Les lignes, dans l'ordre où le restaurateur les a posées.
create table if not exists public.devis_lignes (
  id uuid primary key default gen_random_uuid(),
  devis_id uuid not null references public.devis (id) on delete cascade,
  libelle text not null,
  -- Décimale : « 2,5 heures de mise à disposition » existe autant que
  -- « 30 couverts ».
  quantite numeric(10, 2) not null default 1 check (quantite > 0),
  -- En centimes, comme partout ailleurs : un prix qui s'additionne ne se
  -- range pas dans un flottant.
  prix_unitaire_centimes integer not null check (prix_unitaire_centimes >= 0),
  ordre integer not null default 0,
  constraint ligne_libelle_non_vide check (length(btrim(libelle)) > 0)
);

create index if not exists devis_reservation_idx
  on public.devis (reservation_id);
create index if not exists devis_restaurant_idx
  on public.devis (restaurant_id, created_at desc);
create index if not exists devis_lignes_devis_idx
  on public.devis_lignes (devis_id, ordre);

alter table public.devis enable row level security;
alter table public.devis_lignes enable row level security;

-- Le restaurateur mène son devis. Le client, lui, ne passe jamais par la
-- RLS : sa page publique s'ouvre avec le jeton, servie par la clé de
-- service — comme le lien de paiement.
create policy "devis_select" on public.devis
  for select using (public.peut_voir(restaurant_id));
create policy "devis_insert" on public.devis
  for insert with check (public.peut_gerer(restaurant_id));
create policy "devis_update" on public.devis
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
create policy "devis_delete" on public.devis
  for delete using (public.peut_gerer(restaurant_id));

create policy "devis_lignes_select" on public.devis_lignes
  for select using (
    exists (
      select 1 from public.devis d
      where d.id = devis_lignes.devis_id and public.peut_voir(d.restaurant_id)
    )
  );
create policy "devis_lignes_ecriture" on public.devis_lignes
  for all using (
    exists (
      select 1 from public.devis d
      where d.id = devis_lignes.devis_id and public.peut_gerer(d.restaurant_id)
    )
  )
  with check (
    exists (
      select 1 from public.devis d
      where d.id = devis_lignes.devis_id and public.peut_gerer(d.restaurant_id)
    )
  );
