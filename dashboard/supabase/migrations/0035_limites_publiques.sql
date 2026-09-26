-- Les compteurs des formulaires publics.
--
-- Deux formulaires de Klarr sont ouverts à tous, sans compte : la demande de
-- réservation et le test de présence. Aucun des deux n'était limité.
--
-- Une demande de réservation pose une option de 48 heures, qui bloque des
-- couverts dans le moteur de disponibilité. Un script de dix lignes remplit
-- donc tous les services de tous les établissements, affiche « complet » sur
-- leurs pages publiques et refuse les vraies réservations pendant deux
-- jours — sans que rien ne sonne nulle part.
--
-- Le test de présence, lui, déclenche deux appels facturés à Google Places
-- par soumission. Dix mille soumissions automatisées font sept cents euros
-- qu'on ne découvre que sur la facture.
--
-- Même principe que le compteur du Commis : une ligne par clé et par jour,
-- incrémentée de façon atomique. Table séparée plutôt que partagée, pour
-- qu'une purge des compteurs du Commis n'emporte pas ceux-ci.
create table if not exists public.limites_usage (
  -- « resa:<empreinte> », « resa:<empreinte>:<restaurant> », « audit:<empreinte> »,
  -- ou « audit:global » pour le plafond de l'établissement Klarr lui-même.
  cle text not null,
  jour date not null default current_date,
  requetes integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (cle, jour)
);

-- Aucune politique de lecture ni d'écriture : ces compteurs ne se touchent
-- que par la fonction ci-dessous, qui s'exécute avec les droits du
-- propriétaire. Personne ne lit les empreintes, personne ne remet un
-- compteur à zéro.
alter table public.limites_usage enable row level security;

create or replace function public.limite_consommer(
  p_cle text,
  p_requetes integer
)
returns integer
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.limites_usage as u (cle, jour, requetes)
  values (p_cle, current_date, greatest(p_requetes, 0))
  on conflict (cle, jour) do update
    set requetes = u.requetes + greatest(p_requetes, 0),
        updated_at = now()
  returning u.requetes;
$$;

-- La fonction n'est appelable que par la clé de service, qui est la seule à
-- s'en servir. Ouverte à « anon », elle permettrait de gonfler le compteur
-- d'autrui jusqu'à le bloquer.
revoke all on function public.limite_consommer(text, integer) from public;
revoke all on function public.limite_consommer(text, integer) from anon;
revoke all on function public.limite_consommer(text, integer) from authenticated;

-- Les compteurs de la veille ne servent plus à rien : ils ne disent que
-- l'adresse d'un visiteur d'hier. À appeler par une tâche planifiée, ou à la
-- main de temps en temps.
create or replace function public.limites_purger()
returns integer
language sql
security definer
set search_path = public, pg_temp
as $$
  with efface as (
    delete from public.limites_usage where jour < current_date - 7
    returning 1
  )
  select count(*)::integer from efface;
$$;
