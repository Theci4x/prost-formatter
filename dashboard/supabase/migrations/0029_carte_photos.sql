-- Une photo par plat. Un client choisit avec les yeux : le tartare
-- photographié se commande, le tartare décrit se lit.
--
-- Une seule photo par plat, donc deux colonnes plutôt qu'une table à part.
-- Une galerie par plat n'apporterait rien — sur une carte, on regarde
-- l'assiette, on ne la fait pas défiler.
alter table public.restaurant_menu_items
  add column if not exists photo_url text,
  -- Le chemin dans le stockage, conservé pour pouvoir effacer le fichier
  -- quand la photo est remplacée ou le plat supprimé. Sans lui, chaque
  -- changement laisserait un fichier orphelin payé au mois.
  add column if not exists photo_storage_path text;


-- La carte en anglais. Un jsonb plutôt que deux colonnes « nom_en » et
-- « description_en » : le jour où l'espagnol ou l'allemand s'ajoute, il n'y
-- a pas de migration à écrire, et la page publique lit la même structure.
--
-- Forme attendue, pour chaque langue :
--   {"en": {"nom": "...", "description": "...", "categorie": "...",
--           "source": {"nom": "...", "description": "...", "categorie": "..."}}}
--
-- « source » conserve le texte français qui a été traduit. Sans lui, un plat
-- corrigé en français garderait sa vieille traduction anglaise sans que rien
-- ne le signale — un prix ou un allergène changé d'un côté et pas de
-- l'autre, c'est pire que pas de traduction du tout.
alter table public.restaurant_menu_items
  add column if not exists traductions jsonb not null default '{}'::jsonb;
