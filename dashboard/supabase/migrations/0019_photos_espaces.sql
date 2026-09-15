-- Une photo peut être rattachée à un espace réservable : le client qui
-- hésite entre la salle du bas et la cave voûtée doit les voir, pas les
-- imaginer. Une photo sans espace reste ce qu'elle était, une photo
-- générale de l'établissement.
alter table public.restaurant_photos
  add column if not exists espace_id uuid
  -- « set null » plutôt que « cascade » : supprimer un espace ne doit pas
  -- faire disparaître silencieusement des fichiers du stockage. La photo
  -- retourne dans la galerie générale, où le restaurateur peut la supprimer
  -- pour de bon — fichier compris.
  references public.restaurant_espaces (id) on delete set null;

create index if not exists restaurant_photos_espace_idx
  on public.restaurant_photos (espace_id);
