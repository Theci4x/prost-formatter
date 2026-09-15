-- La caution n'est pas un acompte : rien n'est prélevé. Le client enregistre
-- sa carte, le restaurateur ne la débite qu'en cas de défection — et libère
-- la garantie quand le groupe est venu.
--
-- Carte enregistrée plutôt qu'autorisation bancaire : une autorisation tombe
-- au bout de quelques jours, or une privatisation se réserve des mois à
-- l'avance. L'empreinte enregistrée, elle, reste utilisable.
alter table public.restaurant_espaces
  add column if not exists caution_centimes integer;

alter table public.restaurant_espaces
  drop constraint if exists espace_caution_positive;
alter table public.restaurant_espaces
  add constraint espace_caution_positive
  check (caution_centimes is null or caution_centimes > 0);

-- Acompte et caution répondent au même besoin ; en réclamer deux au même
-- client serait une maladresse commerciale, pas une sécurité de plus.
alter table public.restaurant_espaces
  drop constraint if exists espace_garantie_exclusive;
alter table public.restaurant_espaces
  add constraint espace_garantie_exclusive
  check (acompte_centimes is null or caution_centimes is null);


alter table public.restaurant_reservations
  -- Plafond que le restaurateur pourra débiter, figé à l'acceptation.
  add column if not exists caution_centimes integer,
  add column if not exists caution_statut text not null default 'non_requise',
  add column if not exists caution_enregistree_le timestamptz,
  -- Ce qui a réellement été prélevé, qui peut être inférieur au plafond :
  -- un restaurateur ne débite pas toujours la totalité.
  add column if not exists caution_debitee_centimes integer,
  -- Le client et sa carte, chez le restaurateur. Aucune donnée de carte ne
  -- transite par Klarr ni n'est stockée ici : seulement des identifiants
  -- Stripe, inutilisables hors de son compte.
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_payment_method_id text,
  add column if not exists stripe_setup_session_id text;

alter table public.restaurant_reservations
  drop constraint if exists reservation_caution_statut_check;
alter table public.restaurant_reservations
  add constraint reservation_caution_statut_check
  check (
    caution_statut in (
      'non_requise', 'attendue', 'enregistree', 'debitee', 'liberee'
    )
  );
