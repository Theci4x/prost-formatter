-- Un groupe de quarante qui ne vient pas, c'est un service perdu. L'acompte
-- est ce qui transforme une réservation en engagement — et c'est la première
-- chose que réclame un restaurateur qui privatise.
--
-- Le montant se configure par espace : privatiser la cave et privatiser la
-- grande salle n'engagent pas la même somme.
alter table public.restaurant_espaces
  -- En centimes, comme Stripe : un prix en nombre à virgule finit toujours
  -- par produire un centime de trop ou de moins.
  add column if not exists acompte_centimes integer,
  add column if not exists acompte_mode text not null default 'forfait';

alter table public.restaurant_espaces
  drop constraint if exists espace_acompte_mode_check;
alter table public.restaurant_espaces
  add constraint espace_acompte_mode_check
  check (acompte_mode in ('forfait', 'par_couvert'));

alter table public.restaurant_espaces
  drop constraint if exists espace_acompte_positif;
alter table public.restaurant_espaces
  add constraint espace_acompte_positif
  check (acompte_centimes is null or acompte_centimes > 0);


-- Côté réservation, le montant est figé au moment où le restaurateur accepte.
-- Si le tarif de l'espace change ensuite, la somme déjà demandée au client ne
-- doit pas bouger sous ses pieds.
alter table public.restaurant_reservations
  add column if not exists acompte_centimes integer,
  add column if not exists acompte_statut text not null default 'non_requis',
  add column if not exists acompte_paye_le timestamptz,
  -- Jeton du lien de paiement. Il est public : il tient lieu d'autorisation,
  -- d'où un tirage aléatoire et une contrainte d'unicité.
  add column if not exists paiement_token text,
  add column if not exists stripe_payment_intent_id text,
  -- La session de paiement en cours. La retenir permet de relire son état
  -- directement chez Stripe plutôt que de balayer l'historique du compte,
  -- où la bonne session finirait par sortir de la fenêtre consultée.
  add column if not exists stripe_session_id text;

alter table public.restaurant_reservations
  drop constraint if exists reservation_acompte_statut_check;
alter table public.restaurant_reservations
  add constraint reservation_acompte_statut_check
  check (acompte_statut in ('non_requis', 'attendu', 'paye', 'rembourse'));

create unique index if not exists reservations_paiement_token_idx
  on public.restaurant_reservations (paiement_token)
  where paiement_token is not null;
