-- URLs publiques choisies par le restaurateur et relevés mensuels de présence.
alter table public.restaurants
  add column if not exists presence_urls jsonb not null default '{}'::jsonb,
  add column if not exists presence_auditee_le timestamptz;

create table if not exists public.restaurant_presence_audits (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  plateforme text not null,
  url text not null,
  statut text not null check (statut in ('coherente', 'incoherence', 'inaccessible', 'donnees_insuffisantes')),
  donnees jsonb not null default '{}'::jsonb,
  ecarts jsonb not null default '[]'::jsonb,
  note numeric(2,1),
  nombre_avis integer,
  audite_le timestamptz not null default now(),
  unique (restaurant_id, plateforme, audite_le)
);

create index if not exists presence_audits_restaurant_idx
  on public.restaurant_presence_audits (restaurant_id, plateforme, audite_le desc);

alter table public.restaurant_presence_audits enable row level security;

drop policy if exists "presence_audits_select_own" on public.restaurant_presence_audits;
create policy "presence_audits_select_own"
  on public.restaurant_presence_audits for select
  using (exists (
    select 1 from public.restaurants r
    where r.id = restaurant_presence_audits.restaurant_id
      and public.peut_voir(r.id)
  ));

notify pgrst, 'reload schema';
