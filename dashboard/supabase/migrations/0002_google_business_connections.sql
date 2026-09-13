-- Etape "connexion Google Business Profile" : un restaurant peut lier un
-- compte Google (OAuth). On stocke uniquement les tokens necessaires pour
-- appeler l'API en son nom ; jamais expose au navigateur (lu seulement
-- depuis des Server Actions / Route Handlers).

create table if not exists public.google_business_connections (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  google_email text,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id)
);

alter table public.google_business_connections enable row level security;

-- Pas de colonne proprietaire_id ici : on verifie via une sous-requete que
-- le restaurant lie appartient bien a l'utilisateur connecte.
create policy "gbc_select_own"
  on public.google_business_connections for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = google_business_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "gbc_insert_own"
  on public.google_business_connections for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = google_business_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "gbc_update_own"
  on public.google_business_connections for update
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = google_business_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = google_business_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "gbc_delete_own"
  on public.google_business_connections for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = google_business_connections.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
