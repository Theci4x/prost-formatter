-- Relevés quotidiens de la note et du nombre d'avis, plateforme par
-- plateforme. Les alertes affichées au restaurateur sont l'écart entre le
-- dernier relevé et celui d'il y a une semaine : rien n'est déduit au vol
-- au moment de l'affichage, et une baisse reste visible plusieurs jours
-- même si le restaurateur ne se connecte pas tous les matins.
create table if not exists public.restaurant_reputation_snapshots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  plateforme text not null check (plateforme in ('google', 'yelp', 'tripadvisor')),
  note numeric(2, 1),
  nombre_avis integer,
  releve_le timestamptz not null default now()
);

create index if not exists reputation_snapshots_restaurant_idx
  on public.restaurant_reputation_snapshots (restaurant_id, plateforme, releve_le desc);

alter table public.restaurant_reputation_snapshots enable row level security;

-- Lecture seule pour le propriétaire. Aucune politique d'écriture : les
-- relevés sont insérés par la tâche planifiée, qui utilise la clé de
-- service et contourne RLS. Un utilisateur ne peut donc pas fabriquer un
-- historique de notes.
create policy "reputation_snapshots_select_own"
  on public.restaurant_reputation_snapshots for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_reputation_snapshots.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
