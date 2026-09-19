-- Le restaurateur acceptait une privatisation, Klarr fabriquait un lien de
-- paiement — et le laissait dans le tableau de bord. À charge pour lui de
-- le recopier dans un e-mail écrit à la main. Le client, lui, attendait
-- sans rien savoir, et l'option expirait au bout de quelques jours.
--
-- Le lien part désormais tout seul à l'acceptation. Reste à pouvoir
-- relancer celui qui n'a pas donné suite.

-- Quand le client a été relancé pour la dernière fois. Sert à deux
-- choses : le dire au restaurateur — « relancé il y a deux heures » évite
-- la troisième relance en dix minutes — et empêcher la tâche de nuit de
-- doubler une relance qu'il vient de faire lui-même.
alter table public.restaurant_reservations
  add column if not exists derniere_relance_le timestamptz;
