-- Le journal des sessions perdues.
--
-- « Je suis encore déconnecté ce matin » ne se diagnostique pas avec des
-- journaux Vercel qui ne gardent qu'une heure. Chaque fois qu'une requête
-- trouve une session refusée ou absente, une ligne ici : quand, sur quel
-- chemin, quel genre de requête, ce que Supabase a répondu, et quels
-- cookies le téléphone présentait — leurs noms seulement, jamais leur
-- contenu, jamais un jeton.
--
-- Lue et écrite par le serveur seul, avec la clé de service : aucune
-- politique d'accès, donc aucun accès depuis un navigateur.

create table if not exists public.journal_sessions (
  id bigint generated always as identity primary key,
  survenu_le timestamptz not null default now(),
  chemin text,
  genre text,
  motif text,
  code text,
  cookies text[],
  cookies_effaces boolean not null default false,
  redirige boolean not null default false,
  navigateur text
);

create index if not exists journal_sessions_date_idx
  on public.journal_sessions (survenu_le desc);

alter table public.journal_sessions enable row level security;
