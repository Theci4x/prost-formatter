-- Le fichier client.
--
-- Il existe déjà, en pièces détachées : chaque demande de table et chaque
-- inscription à une expérience porte un nom, une adresse et une case de
-- consentement. Ce qui manque, c'est la personne — celle qui est venue
-- quatre fois en deux ans, qu'on ne reconnaît pas parce qu'elle est
-- éparpillée sur quatre lignes de deux tables.
--
-- Deux choses sont donc stockées ici, et deux seulement : ce qui ne se
-- recalcule pas. L'identité, le consentement avec sa date, le jeton de
-- désinscription, la note du restaurateur. Le reste — combien de fois,
-- combien de couverts, la dernière venue — se déduit des réservations et
-- ne doit surtout pas être recopié : un compteur tenu à la main finit
-- toujours par mentir, et c'est la vue plus bas qui s'en charge.
--
-- Sur le consentement. La case des formulaires est décochée par défaut et
-- annonce « je peux me désinscrire à tout moment ». C'est une promesse que
-- rien ne tenait jusqu'ici, faute d'un endroit où la désinscription puisse
-- s'inscrire. D'où le jeton : le connaître suffit à se désinscrire, le
-- perdre ne donne accès à rien d'autre. Et d'où la date de consentement,
-- que le RGPD demande de pouvoir produire.

create table if not exists public.restaurant_contacts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,

  -- Toujours en minuscules et sans espaces : c'est la clé de
  -- dédoublonnage, et « Jean@Exemple.fr » et « jean@exemple.fr » sont la
  -- même personne.
  email text not null,
  nom text,
  telephone text,

  -- Ce que la personne a coché, et quand. Sans la date, on ne peut rien
  -- prouver le jour où on nous le demande.
  consentement boolean not null default false,
  consentement_le timestamptz,
  -- 'reservation' ou 'experience' : d'où vient l'accord.
  consentement_source text,
  -- Renseigné, il l'emporte sur tout le reste : une personne qui s'est
  -- désinscrite ne se réabonne pas parce qu'elle a repris une table.
  desabonne_le timestamptz,

  -- L'adresse du lien de désinscription, dans chaque envoi. Deux uuid
  -- concaténés plutôt que `gen_random_bytes` : 256 bits d'aléa sans
  -- dépendre de pgcrypto.
  jeton text not null unique
    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),

  -- Visible du seul restaurateur, jamais du client.
  note_interne text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint contact_email_normalise check (email = lower(btrim(email))),
  constraint contact_email_plausible check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint contact_source_connue check (
    consentement_source is null
    or consentement_source in ('reservation', 'experience', 'import')
  )
);

-- La même personne n'a qu'une fiche par maison. Deux établissements du
-- même groupe gardent deux fiches : ce sont deux clientèles, et un
-- consentement donné à l'un ne vaut pas pour l'autre.
create unique index if not exists contacts_maison_email_idx
  on public.restaurant_contacts (restaurant_id, email);

create index if not exists contacts_restaurant_idx
  on public.restaurant_contacts (restaurant_id);

-- Les destinataires d'une campagne : ceux qui ont dit oui et ne se sont
-- pas repris. L'index partiel évite de parcourir tout le fichier.
create index if not exists contacts_joignables_idx
  on public.restaurant_contacts (restaurant_id)
  where consentement and desabonne_le is null;

alter table public.restaurant_contacts enable row level security;

drop policy if exists "contacts_select" on public.restaurant_contacts;
create policy "contacts_select" on public.restaurant_contacts
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "contacts_insert" on public.restaurant_contacts;
create policy "contacts_insert" on public.restaurant_contacts
  for insert with check (public.peut_gerer(restaurant_id));

drop policy if exists "contacts_update" on public.restaurant_contacts;
create policy "contacts_update" on public.restaurant_contacts
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

drop policy if exists "contacts_delete" on public.restaurant_contacts;
create policy "contacts_delete" on public.restaurant_contacts
  for delete using (public.peut_gerer(restaurant_id));

-- Les demandes venues du formulaire public sont écrites avec la clé de
-- service, qui ignore ces politiques : aucune insertion publique n'est
-- ouverte, comme pour les réservations elles-mêmes.

-- Le rapprochement se fait sur l'adresse mise en forme. Sans ces index,
-- la vue ci-dessous relit toutes les réservations de la base à chaque
-- ouverture du fichier.
create index if not exists reservations_email_normalise_idx
  on public.restaurant_reservations (restaurant_id, lower(btrim(client_email)));

create index if not exists experience_reservations_email_normalise_idx
  on public.restaurant_experience_reservations (restaurant_id, lower(btrim(client_email)));

-- L'historique d'un contact, calculé et jamais stocké.
--
-- Seules les tables honorées comptent. Une demande refusée ou annulée dit
-- que quelqu'un a essayé de venir, pas qu'il est venu, et la compter
-- ferait d'un client qui s'est décommandé trois fois un habitué.
-- La fiche porte l'identité avec elle. Une vue qui ne rendrait que les
-- compteurs obligerait l'écran à deux requêtes et lui interdirait de
-- trier par dernière venue ou de chercher un nom — c'est-à-dire les deux
-- seules choses qu'on fait d'un fichier client.
create or replace view public.restaurant_contacts_fiches
with (security_invoker = true) as
  with venues as (
    select
      r.restaurant_id,
      lower(btrim(r.client_email)) as email,
      r.date_reservation as jour,
      r.couverts
    from public.restaurant_reservations r
    where r.statut = 'confirmee'
      and r.date_reservation <= current_date
    union all
    select
      e.restaurant_id,
      lower(btrim(e.client_email)) as email,
      e.date_seance as jour,
      e.places
    from public.restaurant_experience_reservations e
    -- « attendue » compte : la séance est passée et n'a pas été annulée,
    -- donc la place a été tenue, payée d'avance ou non.
    where e.statut <> 'annulee'
      and e.date_seance <= current_date
  )
  select
    c.id,
    c.restaurant_id,
    c.email,
    c.nom,
    c.telephone,
    c.consentement,
    c.consentement_le,
    c.desabonne_le,
    c.note_interne,
    c.created_at,
    -- Le jeton reste dans la table et ne monte pas ici : l'écran n'en a
    -- pas l'usage, et une vue qu'on élargit un jour pour un export est
    -- une fuite qu'on n'a pas vue venir.
    count(v.jour)::integer as venues,
    coalesce(sum(v.couverts), 0)::integer as couverts,
    min(v.jour) as premiere_venue,
    max(v.jour) as derniere_venue
  from public.restaurant_contacts c
  left join venues v
    on v.restaurant_id = c.restaurant_id and v.email = c.email
  group by c.id;

-- La reprise de l'existant.
--
-- Des années de réservations sont déjà en base ; ouvrir un fichier client
-- vide alors que la matière est là serait absurde. On garde le nom et le
-- téléphone les plus récents — une personne déménage, se marie, change de
-- numéro —, et le consentement dès qu'il a été donné une fois.
insert into public.restaurant_contacts (
  restaurant_id, email, nom, telephone,
  consentement, consentement_le, consentement_source
)
select
  s.restaurant_id,
  s.email,
  (array_agg(s.nom order by s.vu desc))[1],
  (array_agg(s.telephone order by s.vu desc) filter (where s.telephone is not null))[1],
  bool_or(s.accepte),
  min(s.vu) filter (where s.accepte),
  min(s.source) filter (where s.accepte)
from (
  select
    r.restaurant_id,
    lower(btrim(r.client_email)) as email,
    r.client_nom as nom,
    nullif(btrim(coalesce(r.client_telephone, '')), '') as telephone,
    r.accepte_communications as accepte,
    r.created_at as vu,
    'reservation' as source
  from public.restaurant_reservations r
  union all
  select
    e.restaurant_id,
    lower(btrim(e.client_email)),
    e.client_nom,
    nullif(btrim(coalesce(e.client_telephone, '')), ''),
    e.accepte_communications,
    e.created_at,
    'experience'
  from public.restaurant_experience_reservations e
) as s
-- Les réservations téléphoniques portent parfois « — » en guise
-- d'adresse : elles ne font pas un contact joignable.
where s.email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
group by s.restaurant_id, s.email
on conflict (restaurant_id, email) do nothing;
