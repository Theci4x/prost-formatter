-- Mots-cles SEO cibles par un restaurant. Simple liste geree par le
-- restaurateur, analysee a la demande via Claude (pas de suivi de
-- positionnement ici : necessiterait un fournisseur tiers).

create table if not exists public.restaurant_keywords (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, keyword)
);

alter table public.restaurant_keywords enable row level security;

create policy "keywords_select_own"
  on public.restaurant_keywords for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_keywords.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "keywords_insert_own"
  on public.restaurant_keywords for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_keywords.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "keywords_delete_own"
  on public.restaurant_keywords for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_keywords.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
