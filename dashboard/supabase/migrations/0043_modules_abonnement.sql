-- Klarr annonce deux produits — la visibilité à 45 €, les réservations à
-- 35 € — et n'en connaissait qu'un seul : un abonnement par
-- établissement, sans savoir lequel. Pire, rien ne vérifiait qu'il
-- existait : on pouvait ajouter dix établissements et tout utiliser sans
-- jamais passer par la caisse.

-- Le module que paie cet abonnement.
alter table public.restaurant_subscriptions
  add column if not exists module text not null default 'visibilite';

alter table public.restaurant_subscriptions
  drop constraint if exists subscription_module_connu;
alter table public.restaurant_subscriptions
  add constraint subscription_module_connu
  check (module in ('visibilite', 'reservations'));

-- Un établissement peut désormais porter deux abonnements, un par
-- module. La clé primaire portait le seul identifiant d'établissement :
-- elle en aurait refusé le second.
alter table public.restaurant_subscriptions
  drop constraint if exists restaurant_subscriptions_pkey;
alter table public.restaurant_subscriptions
  add primary key (restaurant_id, module);

-- Accès accordé à la main, jusqu'à cette date incluse.
--
-- Trois usages, tous réels : les établissements de démonstration, les
-- premiers clients accompagnés au téléphone, et le jour où Stripe tombe
-- en panne un vendredi soir. Sans cette échappatoire, le verrou qu'on
-- vient d'écrire n'aurait aucun contrepoids.
alter table public.restaurants
  add column if not exists acces_offert_jusqu_au date;
