-- Le rapport du mois, envoyé au restaurateur le 1er.
--
-- `rapport_mensuel` : le restaurateur peut ne plus le recevoir. Vrai par
-- défaut — c'est un bilan de son propre établissement, pas de la
-- prospection —, et il se coupe d'un clic depuis le lien en pied.
--
-- `restaurant_rapports` : un rapport par établissement et par mois, pas
-- deux. La tâche tourne les trois premiers jours du mois pour rattraper
-- une panne d'envoi ; sans ce journal, elle enverrait trois fois le même.

alter table public.restaurants
  add column if not exists rapport_mensuel boolean not null default true;

create table if not exists public.restaurant_rapports (
  restaurant_id uuid not null
    references public.restaurants (id) on delete cascade,
  -- « 2026-09 » : le mois raconté, pas celui de l'envoi.
  mois text not null,
  envoye_le timestamptz not null default now(),
  destinataire text,

  primary key (restaurant_id, mois),
  constraint rapport_mois_format check (mois ~ '^[0-9]{4}-[0-9]{2}$')
);

alter table public.restaurant_rapports enable row level security;

-- Lecture pour le restaurateur ; l'écriture passe par la clé de service,
-- depuis la tâche planifiée.
drop policy if exists "rapports_select" on public.restaurant_rapports;
create policy "rapports_select" on public.restaurant_rapports
  for select using (public.peut_voir(restaurant_id));
