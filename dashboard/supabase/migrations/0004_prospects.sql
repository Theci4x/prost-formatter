-- Leads captures depuis le formulaire "test de presence Google" de la
-- landing page. Pas de lecture publique : consultable via Supabase Studio
-- (acces admin, contourne la RLS) ou plus tard depuis un espace interne.

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text not null,
  entreprise text not null,
  created_at timestamptz not null default now()
);

alter table public.prospects enable row level security;

-- N'importe quel visiteur (connecte ou non) peut soumettre le formulaire,
-- mais personne ne peut lire la liste via l'API publique (pas de policy
-- select).
create policy "prospects_insert_public"
  on public.prospects for insert
  to anon, authenticated
  with check (true);
