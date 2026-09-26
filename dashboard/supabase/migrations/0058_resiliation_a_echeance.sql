-- Une résiliation demandée n'est pas encore une résiliation.
--
-- Quand un restaurateur résilie depuis le portail Stripe, l'abonnement ne
-- passe pas à « canceled » : il reste actif jusqu'au terme du mois payé,
-- avec un drapeau qui dit qu'il ne se renouvellera pas. C'est le bon
-- comportement — le mois est dû, le service est rendu.
--
-- Mais nous ne gardions que le statut. L'écran d'abonnement annonçait donc
-- « Actif — prochain renouvellement le 18 octobre » à quelqu'un dont le
-- service s'arrête le 18 octobre. Exactement le contraire, et découvert
-- le jour où la page de réservation s'éteint.
alter table public.restaurant_subscriptions
  add column if not exists cancel_at_period_end boolean not null default false;

comment on column public.restaurant_subscriptions.cancel_at_period_end is
  'Résiliation demandée : le service court jusqu''à current_period_end, puis s''arrête.';
