-- Audits de visibilite generes automatiquement depuis le formulaire
-- /test-presence-google (inspire du concept d'audit local SEO / e-reputation
-- / GEO, algorithme de scoring propre a Klarr). Pas de lecture publique.

-- La ville est necessaire pour retrouver l'etablissement sur Google Maps
-- (recherche par nom + ville).
alter table public.prospects add column if not exists ville text;

create table if not exists public.visibility_audits (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospects (id) on delete set null,
  restaurant_name text not null,
  ville text not null,
  google_place_id text,
  local_seo_score integer,
  e_reputation_score integer,
  geo_score integer,
  global_score integer,
  summary text,
  raw_signals jsonb,
  error text,
  created_at timestamptz not null default now()
);

alter table public.visibility_audits enable row level security;

create policy "visibility_audits_insert_public"
  on public.visibility_audits for insert
  to anon, authenticated
  with check (true);
