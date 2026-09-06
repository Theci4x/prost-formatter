-- Etape 1 : schema minimal pour la table "restaurants".
-- Sera enrichi dans les prochaines etapes (horaires, menu, etc.).

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  adresse text,
  proprietaire_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.restaurants enable row level security;

-- Un utilisateur ne voit et ne gere que les restaurants dont il est proprietaire.
create policy "restaurants_select_own"
  on public.restaurants for select
  using (auth.uid() = proprietaire_id);

create policy "restaurants_insert_own"
  on public.restaurants for insert
  with check (auth.uid() = proprietaire_id);

create policy "restaurants_update_own"
  on public.restaurants for update
  using (auth.uid() = proprietaire_id)
  with check (auth.uid() = proprietaire_id);

create policy "restaurants_delete_own"
  on public.restaurants for delete
  using (auth.uid() = proprietaire_id);
