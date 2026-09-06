-- Un compte Google connecte peut avoir acces a plusieurs fiches
-- etablissement (Business Profile) ; on stocke laquelle correspond a ce
-- restaurant une fois que le restaurateur l'a choisie.

alter table public.google_business_connections
  add column if not exists location_name text,
  add column if not exists location_title text;
