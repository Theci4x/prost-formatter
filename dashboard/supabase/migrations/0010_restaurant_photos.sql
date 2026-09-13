-- Galerie photo par restaurant (facade, plats, ambiance) via Supabase
-- Storage. Bucket public : les URLs sont donc directement affichables
-- (pas besoin de policy select sur storage.objects, l'app ne fait que
-- stocker l'URL publique dans sa propre table).

insert into storage.buckets (id, name, public)
values ('restaurant-photos', 'restaurant-photos', true)
on conflict (id) do nothing;

-- Chemin de stockage attendu : "{restaurant_id}/{fichier}". On
-- n'autorise l'upload/suppression que si ce restaurant appartient a
-- l'utilisateur connecte.
create policy "storage_restaurant_photos_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-photos'
    and exists (
      select 1 from public.restaurants r
      where r.id::text = (storage.foldername(name))[1]
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "storage_restaurant_photos_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'restaurant-photos'
    and exists (
      select 1 from public.restaurants r
      where r.id::text = (storage.foldername(name))[1]
        and r.proprietaire_id = auth.uid()
    )
  );

create table if not exists public.restaurant_photos (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  storage_path text not null,
  url text not null,
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.restaurant_photos enable row level security;

create policy "restaurant_photos_select_own"
  on public.restaurant_photos for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_photos.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_photos_insert_own"
  on public.restaurant_photos for insert
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_photos.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );

create policy "restaurant_photos_delete_own"
  on public.restaurant_photos for delete
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_photos.restaurant_id
        and r.proprietaire_id = auth.uid()
    )
  );
