-- Le Commis : l'assistant qui répond aux questions sur Klarr.
--
-- Cette table ne sert qu'à une chose : empêcher qu'un assistant ouvert au
-- public vide le compte qui le paie. Elle compte les questions posées et ce
-- qu'elles ont coûté, par jour et par demandeur.
--
-- Aucune conversation n'est conservée. Les questions des visiteurs ne sont
-- pas notre affaire, et une base de questions est une base à protéger.
create table if not exists public.commis_usage (
  -- « global » pour le plafond de l'établissement Klarr lui-même,
  -- « v:<empreinte> » pour un visiteur anonyme, « u:<uuid> » pour un compte.
  cle text not null,
  jour date not null default current_date,
  requetes integer not null default 0,
  -- En centimes d'euro, arrondi au plus proche. Suffisant pour un plafond
  -- quotidien : on ne facture personne avec ce chiffre.
  centimes integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (cle, jour)
);

-- Personne n'a besoin de lire cette table depuis l'application : seule la
-- clé de service y touche, via la fonction ci-dessous. RLS active sans
-- aucune politique ferme donc la porte à tous les rôles applicatifs.
alter table public.commis_usage enable row level security;

/**
 * Consomme du quota et renvoie l'état du jour.
 *
 * En une seule instruction, donc sans course : deux visiteurs qui posent
 * une question au même instant s'incrémentent correctement. Un « lire puis
 * écrire » côté application perdrait des passages sous charge, ce qui est
 * précisément le moment où le plafond compte.
 */
create or replace function public.commis_consommer(
  p_cle text,
  p_requetes integer,
  p_centimes integer
)
returns table (requetes integer, centimes integer)
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.commis_usage as u (cle, jour, requetes, centimes)
  values (p_cle, current_date, greatest(p_requetes, 0), greatest(p_centimes, 0))
  on conflict (cle, jour) do update
    set requetes = u.requetes + greatest(p_requetes, 0),
        centimes = u.centimes + greatest(p_centimes, 0),
        updated_at = now()
  returning u.requetes, u.centimes;
$$;

revoke all on function public.commis_consommer(text, integer, integer) from public;
revoke all on function public.commis_consommer(text, integer, integer) from anon;
revoke all on function public.commis_consommer(text, integer, integer) from authenticated;

-- Les compteurs d'hier n'intéressent plus personne. Une purge paresseuse
-- vaut mieux qu'une table qui grossit indéfiniment ; elle est appelée par
-- la tâche de nuit existante.
create or replace function public.commis_purger()
returns integer
language sql
security definer
set search_path = public, pg_temp
as $$
  with efface as (
    delete from public.commis_usage
    where jour < current_date - interval '7 days'
    returning 1
  )
  select coalesce(count(*), 0)::integer from efface;
$$;
