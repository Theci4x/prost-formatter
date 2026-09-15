-- La carte servait à quoi, jusqu'ici ? À rien : on pouvait la saisir, et
-- personne ne la lisait jamais. Cette migration lui donne un emploi — être
-- montrée au client avant qu'il réserve — et répare trois défauts de la
-- table d'origine.

-- 1. L'argent en centimes, comme partout ailleurs dans Klarr. Un prix en
--    numeric(6,2) se compare et s'additionne mal, et s'affichait « 12.50 € »
--    avec un point là où le français met une virgule.
alter table public.restaurant_menu_items
  add column if not exists prix_centimes integer
  check (prix_centimes is null or prix_centimes >= 0);

-- Reprise des prix déjà saisis avant de retirer l'ancienne colonne. Le
-- « where prix_centimes is null » rend le bloc rejouable sans écraser une
-- correction faite depuis.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'restaurant_menu_items'
      and column_name = 'prix'
  ) then
    execute $r$
      update public.restaurant_menu_items
      set prix_centimes = round(prix * 100)::integer
      where prix is not null and prix_centimes is null
    $r$;
    execute 'alter table public.restaurant_menu_items drop column prix';
  end if;
end $$;

-- 2. Retirer un plat sans l'effacer. Le poisson n'est pas arrivé ce matin :
--    on le décroche de la carte, on ne retape pas sa description demain.
alter table public.restaurant_menu_items
  add column if not exists actif boolean not null default true;

alter table public.restaurant_menu_items
  add column if not exists updated_at timestamptz not null default now();

-- 3. L'ordre. « ordre » existait mais n'était jamais renseigné : la carte
--    sortait triée par catégorie alphabétique, soit « Desserts, Entrées,
--    Plats ». Une carte se lit dans l'ordre du repas, pas du dictionnaire.
--    Une seule position par plat sur tout l'établissement suffit : les
--    catégories s'affichent dans l'ordre de leur premier plat.
create index if not exists menu_items_ordre_idx
  on public.restaurant_menu_items (restaurant_id, ordre);

-- Les lignes déjà en base n'ont que des zéros : on leur donne une position
-- stable. L'ordre de saisie, pas l'ordre alphabétique — trier par catégorie
-- ici reproduirait exactement le défaut qu'on corrige, et sortirait
-- « Desserts, Entrées, Plats ». Un restaurateur tape ses entrées d'abord ;
-- les catégories entrelacées se regroupent de toute façon à l'affichage, au
-- rang de leur premier plat. Ne touche que les cartes entièrement à zéro,
-- donc ne défait jamais un ordre choisi ensuite à la main.
do $$
declare r record;
begin
  for r in
    select restaurant_id from public.restaurant_menu_items
    group by restaurant_id having max(ordre) = 0 and count(*) > 1
  loop
    with numerote as (
      select id, row_number() over (order by created_at, id) as rang
      from public.restaurant_menu_items
      where restaurant_id = r.restaurant_id
    )
    update public.restaurant_menu_items m
    set ordre = numerote.rang
    from numerote where numerote.id = m.id;
  end loop;
end $$;

-- 4. Publier, c'est un choix. Une carte saisie il y a six mois pour essayer
--    ne doit pas apparaître d'un coup sur une adresse publique parce qu'on a
--    livré la fonctionnalité. Le restaurateur décroche l'interrupteur quand
--    il est prêt.
alter table public.restaurants
  add column if not exists carte_publique boolean not null default false;


-- 5. Correctif d'une erreur de la migration 0025 : la carte y avait été
--    rangée avec les jetons d'accès Google, Facebook et TikTok, dans le lot
--    « ce que le service n'a aucune raison de voir ». C'est faux. Un jeton
--    OAuth donne la main sur un compte ; une carte, c'est ce que le chef de
--    rang récite toute la soirée — et elle est sur le point d'être publique.
--    Le service la lit donc, mais ne l'écrit toujours pas.
drop policy if exists "restaurant_menu_items_select" on public.restaurant_menu_items;
create policy "restaurant_menu_items_select" on public.restaurant_menu_items
  for select using (public.peut_voir(restaurant_id));
