-- Un plat vendu en plusieurs formats : « escargots par 6 ou par 12 »,
-- « vin au verre ou à la bouteille », « petite ou grande assiette ».
--
-- Pourquoi une colonne sur le plat plutôt que deux plats séparés. Un
-- restaurateur qui saisit « Escargots (6) » et « Escargots (12) » saisit
-- deux fois la description, envoie deux fois la photo, coche deux fois
-- les quatorze allergènes — et son document allergènes sort en double.
-- C'est le même plat : une seule ligne, plusieurs prix.
--
-- Pourquoi du JSON plutôt qu'une table. Les formats n'existent que par
-- leur plat, ne sont jamais interrogés séparément, et se comptent sur
-- les doigts d'une main. Une table imposerait un ordre à gérer, une
-- cascade à écrire et des règles d'accès à dupliquer, pour ranger ce qui
-- tient en deux champs.
--
-- NULL veut dire « un seul prix, celui de prix_centimes ». Un tableau
-- veut dire « ces formats-là, et prix_centimes ne s'affiche plus ».

alter table public.restaurant_menu_items
  add column if not exists formats jsonb;

-- Une contrainte CHECK n'accepte pas de sous-requête : la validation
-- passe donc par une fonction immuable, ce qui est la façon prévue.
create or replace function public.formats_menu_valides(formats jsonb)
returns boolean
language sql
immutable
set search_path = pg_catalog, public
as $$
  select formats is null
    or (
      jsonb_typeof(formats) = 'array'
      and jsonb_array_length(formats) between 1 and 6
      and not exists (
        select 1
        from jsonb_array_elements(formats) as f
        -- coalesce, et ce n'est pas de la prudence gratuite : sur une
        -- clé absente, jsonb_typeof rend NULL, et « NULL <> 'string' »
        -- vaut NULL, donc la ligne passait la contrainte. Un format sans
        -- libellé ou sans prix s'enregistrait.
        where jsonb_typeof(f) <> 'object'
          or coalesce(jsonb_typeof(f -> 'libelle'), 'absent') <> 'string'
          or btrim(f ->> 'libelle') = ''
          or length(f ->> 'libelle') > 40
          or coalesce(jsonb_typeof(f -> 'prix_centimes'), 'absent') <> 'number'
          or (f ->> 'prix_centimes')::numeric < 0
          or (f ->> 'prix_centimes')::numeric > 1000000
          or (f ->> 'prix_centimes')::numeric
             <> trunc((f ->> 'prix_centimes')::numeric)
      )
    );
$$;

alter table public.restaurant_menu_items
  drop constraint if exists restaurant_menu_items_formats_valides;

alter table public.restaurant_menu_items
  add constraint restaurant_menu_items_formats_valides
  check (public.formats_menu_valides(formats));

comment on column public.restaurant_menu_items.formats is
  'Formats de vente : [{"libelle":"6 pièces","prix_centimes":950}]. '
  'NULL = un seul prix, celui de prix_centimes.';
