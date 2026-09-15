-- Une option non tranchée cesse de bloquer le créneau dès son échéance : le
-- moteur de disponibilité l'ignore déjà. Mais la demande restait affichée
-- « en attente » dans le tableau de bord, sans que le restaurateur sache
-- qu'elle ne réservait plus rien. D'où un statut propre.
alter table public.restaurant_reservations
  drop constraint if exists restaurant_reservations_statut_check;

alter table public.restaurant_reservations
  add constraint restaurant_reservations_statut_check
  check (statut in ('demande', 'confirmee', 'refusee', 'annulee', 'expiree'));

create index if not exists reservations_options_a_expirer_idx
  on public.restaurant_reservations (option_expire_le)
  where statut = 'demande';
