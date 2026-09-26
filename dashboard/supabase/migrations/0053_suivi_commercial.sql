-- Ce qu'on a fait de chaque contact.
--
-- L'espace d'administration disait qui s'était inscrit, jamais ce qu'on
-- en avait fait. Au troisième restaurateur, on ne sait déjà plus lequel
-- a été rappelé, ni ce qu'il a répondu — et on rappelle deux fois le même
-- en laissant l'autre s'éteindre.
--
-- Un journal, pas un état : « il a dit qu'il rappelait après le service »
-- vaut plus que « à relancer », et l'état se lit de toute façon dans la
-- dernière ligne. Rien ne se modifie ni ne s'efface : une note fausse se
-- corrige par une note suivante, comme un cahier.
create table if not exists public.suivis (
  id uuid primary key default gen_random_uuid(),
  -- « prospect » (formulaire de test de présence) ou « restaurant »
  -- (compte créé). Deux listes distinctes dans /admin, un seul journal.
  cible_type text not null check (cible_type in ('prospect', 'restaurant')),
  cible_id uuid not null,
  statut text not null check (
    statut in ('a_rappeler', 'rappele', 'sans_reponse', 'gagne', 'perdu')
  ),
  note text,
  -- L'adresse de celui qui a écrit la ligne : le jour où vous êtes deux,
  -- « rappelé » sans savoir par qui ne sert à rien.
  auteur text not null,
  created_at timestamptz not null default now()
);

create index if not exists suivis_cible_idx
  on public.suivis (cible_type, cible_id, created_at desc);

-- Aucune politique : ce journal ne se lit et ne s'écrit qu'avec la clé de
-- service, depuis /admin, derrière la liste blanche d'adresses. Il ne
-- regarde aucun restaurateur — il parle de lui.
alter table public.suivis enable row level security;
