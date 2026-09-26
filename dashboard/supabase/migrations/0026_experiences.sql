-- Un cours de cocktail tous les jours à 18h, un atelier pâtes le samedi
-- midi : ce n'est pas une réservation de table, c'est une séance à places
-- limitées, à un prix affiché, qui revient selon un rythme.
--
-- Le restaurateur règle tout : le nom, le prix, le nombre de places, les
-- jours, l'heure, la période, et s'il encaisse d'avance ou sur place.
create table if not exists public.restaurant_experiences (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  nom text not null,
  description text,
  -- En centimes, comme partout où il y a de l'argent.
  prix_centimes integer not null check (prix_centimes > 0),
  -- Places par séance, indépendantes de la jauge des salles : douze places
  -- au bar à cocktails ne sont pas douze couverts au dîner.
  places integer not null check (places > 0),
  duree_minutes integer check (duree_minutes is null or duree_minutes > 0),
  -- Convention ISO : 1 = lundi … 7 = dimanche, comme les services.
  jours integer[] not null,
  heure time not null,
  -- Bornes facultatives : un atelier de Noël ne tourne pas toute l'année,
  -- un cours permanent n'a pas de fin.
  date_debut date,
  date_fin date,
  -- Délai de prévenance, en heures, comme pour les services.
  delai_heures integer not null default 0 check (delai_heures >= 0),
  -- Encaisser d'avance ou sur place : c'est au restaurateur de décider. Un
  -- atelier gratuit d'initiation ne se prépaie pas.
  prepaiement boolean not null default true,
  actif boolean not null default true,
  -- Pour information, pour que le restaurateur sache où ça se passe. La
  -- séance ne consomme PAS la jauge de cette salle : voir la note plus bas.
  espace_id uuid references public.restaurant_espaces (id) on delete set null,
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- coalesce indispensable : array_length d'un tableau vide vaut NULL, et
  -- une contrainte qui vaut NULL est considérée satisfaite. Sans lui, une
  -- expérience sans aucun jour serait acceptée et ne produirait jamais la
  -- moindre séance, sans que rien ne le signale.
  constraint experience_jours_non_vide
    check (coalesce(array_length(jours, 1), 0) >= 1),
  constraint experience_periode_coherente
    check (date_debut is null or date_fin is null or date_fin >= date_debut)
);

create index if not exists experiences_restaurant_idx
  on public.restaurant_experiences (restaurant_id, actif);


-- Une place réservée sur une séance. Table séparée des réservations de
-- table : une séance compte des places, pas des couverts, et les mêler
-- fausserait les deux jauges.
--
-- Limite assumée de cette première version : une séance n'occupe pas la
-- salle au sens du moteur de disponibilité. Si le cours de cocktail et une
-- privatisation tombent au même moment dans la même pièce, rien ne le
-- signale — c'est au restaurateur de ne pas le faire.
create table if not exists public.restaurant_experience_reservations (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.restaurant_experiences (id) on delete cascade,
  -- Recopié pour que les règles d'accès et les requêtes du tableau de bord
  -- n'aient pas à repasser par l'expérience.
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  date_seance date not null,
  places integer not null check (places > 0),
  -- Figé à la réservation : si le prix change ensuite, ce qui a été annoncé
  -- au client ne bouge pas.
  montant_centimes integer not null check (montant_centimes >= 0),

  client_nom text not null,
  client_email text not null,
  client_telephone text,
  message text,
  accepte_communications boolean not null default false,

  statut text not null default 'attendue',
  -- Même mécanique que l'acompte : un jeton public tient lieu
  -- d'autorisation sur la page de paiement.
  paiement_token text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  paye_le timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.restaurant_experience_reservations
  drop constraint if exists experience_reservation_statut_check;
alter table public.restaurant_experience_reservations
  add constraint experience_reservation_statut_check
  check (statut in ('attendue', 'confirmee', 'annulee'));

create index if not exists experience_reservations_seance_idx
  on public.restaurant_experience_reservations (experience_id, date_seance);
create index if not exists experience_reservations_restaurant_idx
  on public.restaurant_experience_reservations (restaurant_id, date_seance);
create unique index if not exists experience_reservations_token_idx
  on public.restaurant_experience_reservations (paiement_token)
  where paiement_token is not null;


-- Mêmes règles que le reste : le service lit, le gérant configure. Une
-- séance fait partie du service, il doit savoir qui vient.
alter table public.restaurant_experiences enable row level security;
alter table public.restaurant_experience_reservations enable row level security;

do $$
declare cible text;
begin
  foreach cible in array array[
    'restaurant_experiences', 'restaurant_experience_reservations'
  ] loop
    execute format('drop policy if exists %I on public.%I', cible || '_select', cible);
    execute format('drop policy if exists %I on public.%I', cible || '_insert', cible);
    execute format('drop policy if exists %I on public.%I', cible || '_update', cible);
    execute format('drop policy if exists %I on public.%I', cible || '_delete', cible);
    execute format($f$
      create policy %1$I on public.%2$I for select
        using (public.peut_voir(restaurant_id));
      create policy %3$I on public.%2$I for insert
        with check (public.peut_gerer(restaurant_id));
      create policy %4$I on public.%2$I for update
        using (public.peut_gerer(restaurant_id))
        with check (public.peut_gerer(restaurant_id));
      create policy %5$I on public.%2$I for delete
        using (public.peut_gerer(restaurant_id));
    $f$, cible || '_select', cible, cible || '_insert',
         cible || '_update', cible || '_delete');
  end loop;
end $$;

-- Le service doit pouvoir annuler une place au téléphone : on lui rouvre
-- l'écriture sur les réservations de séance, comme sur celles de table.
drop policy if exists "restaurant_experience_reservations_update" on public.restaurant_experience_reservations;
create policy "restaurant_experience_reservations_update"
  on public.restaurant_experience_reservations for update
  using (public.peut_voir(restaurant_id))
  with check (public.peut_voir(restaurant_id));

drop policy if exists "restaurant_experience_reservations_insert" on public.restaurant_experience_reservations;
create policy "restaurant_experience_reservations_insert"
  on public.restaurant_experience_reservations for insert
  with check (public.peut_voir(restaurant_id));
