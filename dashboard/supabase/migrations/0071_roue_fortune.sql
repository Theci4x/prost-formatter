-- La roue de la fortune du totem.
--
-- Le client scanne le totem, on lui ouvre la fiche Google, et au retour il
-- tourne une roue qui lui offre quelque chose. Trois tables : ce que le
-- restaurateur règle, les lots, et les parties jouées.
--
-- Ce que cette migration ne fait pas, volontairement :
--
-- — **Elle ne trie pas sur la note.** Demander l'étoile avant de décider
--   où envoyer le client est interdit par les plateformes d'avis et se
--   détecte. La migration 0051 l'avait déjà écarté pour le totem ; la roue
--   ne le réintroduit pas par la bande. Le lot tombe quelle que soit la
--   note, et d'ailleurs on ne la connaît pas.
--
-- — **Elle ne prétend pas vérifier l'avis.** Google n'expose aucun moyen
--   de savoir qu'une personne donnée a écrit quelque chose. Aucun outil du
--   marché ne le peut. `avis_ouvert_le` dit donc ce qu'on sait vraiment :
--   le lien a été ouvert. Nommer cette colonne « avis_laisse » serait se
--   mentir dans sa propre base.
--
-- Sur le tirage. Les poids sont des entiers et le tirage se fait côté
-- serveur : une roue dont le résultat se décide dans le navigateur se
-- truque avec la console, et c'est le restaurateur qui paie les lots.
-- L'animation de la roue s'aligne sur le résultat reçu, jamais l'inverse.

create table if not exists public.restaurant_roue (
  restaurant_id uuid primary key
    references public.restaurants (id) on delete cascade,

  active boolean not null default false,

  titre text not null default 'Tentez votre chance',
  sous_titre text,

  -- Le lot part par courriel et se présente à la visite suivante.
  validite_jours integer not null default 30,

  -- Une même adresse ne rejoue pas avant ce délai. Zéro = sans limite,
  -- ce qui n'a de sens que pour une soirée particulière.
  delai_rejeu_jours integer not null default 90,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint roue_validite_bornee check (validite_jours between 1 and 365),
  constraint roue_rejeu_borne check (delai_rejeu_jours between 0 and 365),
  constraint roue_titre_non_vide check (length(btrim(titre)) > 0)
);

-- Les cases de la roue. Une case perdante est une case comme une autre,
-- avec `gagnant` à faux : sans elle, « tout le monde gagne » serait la
-- seule roue possible, et certains restaurateurs veulent le frisson.
create table if not exists public.restaurant_roue_lots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,

  libelle text not null,
  -- Ce que le serveur doit savoir en salle : « un café, pas un dessert ».
  precision_interne text,

  gagnant boolean not null default true,

  -- Poids relatif, pas un pourcentage : ajouter une case ne force pas à
  -- recalculer toutes les autres pour retomber sur cent.
  poids integer not null default 1,

  -- Plafond de lots à distribuer. NULL = sans plafond.
  stock integer,

  ordre integer not null default 0,
  created_at timestamptz not null default now(),

  constraint lot_libelle_non_vide check (length(btrim(libelle)) > 0),
  constraint lot_libelle_borne check (length(libelle) <= 80),
  constraint lot_poids_borne check (poids between 0 and 1000),
  constraint lot_stock_positif check (stock is null or stock >= 0)
);

create index if not exists roue_lots_restaurant_idx
  on public.restaurant_roue_lots (restaurant_id, ordre, created_at);

-- Une partie jouée. Elle garde le libellé du lot en plus de sa clé : le
-- restaurateur qui renomme « Café offert » en « Boisson chaude » ne doit
-- pas réécrire ce qu'on a promis à quelqu'un la semaine dernière.
create table if not exists public.restaurant_roue_parties (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  lot_id uuid references public.restaurant_roue_lots (id) on delete set null,

  email text not null,
  -- La fiche du fichier client, quand elle a pu être rapprochée.
  contact_id uuid references public.restaurant_contacts (id) on delete set null,

  gagnant boolean not null,
  lot_libelle text not null,

  -- Ce que le client montre en salle. Court, lisible à voix haute, sans
  -- les caractères qui se confondent à l'oral ou à l'œil (I, O, 0, 1).
  code text not null,

  expire_le date not null,
  utilise_le timestamptz,

  -- Le lien vers la fiche Google a été ouvert. On ne sait rien de plus :
  -- personne ne peut vérifier qu'un avis a réellement été écrit.
  avis_ouvert_le timestamptz,

  created_at timestamptz not null default now(),

  constraint partie_email_normalise check (email = lower(btrim(email))),
  constraint partie_code_forme check (code ~ '^[A-HJ-NP-Z2-9]{6}$')
);

-- Le code se saisit à la main en salle : il doit être unique chez ce
-- restaurateur, pas dans le monde entier.
create unique index if not exists roue_parties_code_idx
  on public.restaurant_roue_parties (restaurant_id, code);

create index if not exists roue_parties_restaurant_idx
  on public.restaurant_roue_parties (restaurant_id, created_at desc);

-- Pour la règle du rejeu, interrogée à chaque partie.
create index if not exists roue_parties_email_idx
  on public.restaurant_roue_parties (restaurant_id, email, created_at desc);

-- Pour le décompte du stock d'un lot.
create index if not exists roue_parties_lot_idx
  on public.restaurant_roue_parties (lot_id)
  where lot_id is not null;

alter table public.restaurant_roue enable row level security;
alter table public.restaurant_roue_lots enable row level security;
alter table public.restaurant_roue_parties enable row level security;

-- Le réglage et les lots appartiennent au restaurateur.
drop policy if exists "roue_select" on public.restaurant_roue;
create policy "roue_select" on public.restaurant_roue
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "roue_ecriture" on public.restaurant_roue;
create policy "roue_ecriture" on public.restaurant_roue
  for all using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

drop policy if exists "roue_lots_select" on public.restaurant_roue_lots;
create policy "roue_lots_select" on public.restaurant_roue_lots
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "roue_lots_ecriture" on public.restaurant_roue_lots;
create policy "roue_lots_ecriture" on public.restaurant_roue_lots
  for all using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

-- Les parties se lisent depuis le tableau de bord, et s'écrivent par la
-- clé de service depuis la page publique — comme les retours de la 0051.
-- Ouvrir l'insertion à « anon » reviendrait à laisser distribuer les lots
-- depuis la console du navigateur.
drop policy if exists "roue_parties_select" on public.restaurant_roue_parties;
create policy "roue_parties_select" on public.restaurant_roue_parties
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "roue_parties_update" on public.restaurant_roue_parties;
create policy "roue_parties_update" on public.restaurant_roue_parties
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));
