-- « Recontactez-moi le mois de mon ouverture ».
--
-- C'est le trou que toute la série d'outils d'ouverture laissait béant.
-- Quelqu'un qui n'a pas signé son bail est à six ou dix-huit mois d'avoir
-- besoin d'un carnet de réservation : on lui rend un service réel — le
-- diagnostic, le calendrier, les articles — et il ouvre avec un
-- concurrent, parce que ce concurrent l'a appelé au huitième mois et nous
-- pas. Sans cette table, les cinq autres outils font la prospection des
-- autres.
--
-- **On ne garde que ce qu'on a demandé, et on l'a demandé pour une seule
-- chose.** Pas de profilage, pas de scoring, pas d'enrichissement : une
-- adresse, une date, et de quoi dire bonjour correctement. La personne
-- écrit elle-même son adresse en cochant une case pour être rappelée :
-- c'est un consentement donné, pas déduit, et `consentement_le` permet de
-- le prouver le jour où on nous le demande.
--
-- La date d'ouverture est déclarative et bouge : c'est normal, un chantier
-- glisse. `rappele_le` empêche seulement qu'on relance deux fois la même
-- personne pour la même ouverture.

create table if not exists public.rappels_ouverture (
  id uuid primary key default gen_random_uuid(),

  -- Toujours en minuscules, comme partout ailleurs : c'est la clé de
  -- dédoublonnage, et « Jean@Exemple.fr » est la même personne que
  -- « jean@exemple.fr ».
  email text not null,
  nom text,
  etablissement text,
  ville text,

  -- Déclarative, approximative, et c'est très bien : elle sert à savoir
  -- quel mois décrocher le téléphone, pas à tenir un planning.
  date_ouverture date not null,

  -- Le consentement, avec sa date. Sans elle, on ne prouve rien.
  consentement_le timestamptz not null default now(),
  -- D'où vient la demande : le calendrier, le diagnostic, le guide.
  source text,

  -- Posé quand l'équipe a été prévenue, pour ne pas relancer deux fois.
  rappele_le timestamptz,
  -- Posé quand la personne demande à être retirée. On garde la ligne
  -- plutôt que de l'effacer : c'est ce qui empêche de la re-solliciter
  -- si elle revient remplir le formulaire.
  retire_le timestamptz,

  created_at timestamptz not null default now()
);

-- Une personne, une ouverture. Re-remplir le formulaire corrige sa date
-- au lieu d'empiler des doublons qu'on rappellerait trois fois.
create unique index if not exists rappels_ouverture_email_idx
  on public.rappels_ouverture (lower(email));

-- La tâche cherche « qui ouvre ce mois-ci et n'a pas encore été rappelé ».
create index if not exists rappels_ouverture_a_traiter_idx
  on public.rappels_ouverture (date_ouverture)
  where rappele_le is null and retire_le is null;

-- Aucune politique, et c'est délibéré : personne ne lit cette table avec
-- une clé publique. Le formulaire écrit avec la clé de service, la tâche
-- lit avec la clé de service. RLS activé sans politique ferme donc la
-- porte à tout le reste — un jeton anonyme qui tenterait un select
-- n'obtient rien, pas même une erreur instructive.
alter table public.rappels_ouverture enable row level security;
