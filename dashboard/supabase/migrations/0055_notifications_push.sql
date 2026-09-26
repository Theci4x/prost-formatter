-- Les téléphones à prévenir.
--
-- Une demande de réservation arrive à 19 h 40, en plein coup de feu.
-- L'e-mail existe déjà, mais un restaurateur ne lit pas ses e-mails entre
-- deux services : la table reste en attente jusqu'à la fermeture, et le
-- client, lui, a déjà réservé ailleurs. Une notification sur l'écran de
-- veille est le seul canal qui arrive à l'heure.
--
-- Une ligne par appareil, pas par personne : le patron a un téléphone et
-- un ordinateur, son gérant en a un autre, et chacun doit sonner. C'est
-- l'« endpoint » fourni par le navigateur qui identifie l'appareil — il
-- est unique, et c'est lui qui sert de clé.
create table if not exists public.push_abonnements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  -- Qui a autorisé : un abonnement se retire quand le compte perd ses
  -- droits sur la maison, sans quoi un ancien serveur continuerait d'être
  -- prévenu des réservations.
  utilisateur_id uuid not null references auth.users (id) on delete cascade,
  -- L'adresse que le navigateur nous donne pour joindre cet appareil.
  endpoint text not null unique,
  -- Les deux clés du chiffrement : sans elles, le message ne peut pas
  -- être déchiffré par l'appareil. Elles ne servent qu'à ça.
  p256dh text not null,
  auth text not null,
  -- « iPhone de Michael », deviné du navigateur : pour qu'on sache lequel
  -- on retire quand on en retire un.
  appareil text,
  created_at timestamptz not null default now(),
  derniere_erreur text
);

create index if not exists push_abonnements_restaurant_idx
  on public.push_abonnements (restaurant_id);

alter table public.push_abonnements enable row level security;

-- On voit et on retire les siens, sur une maison qu'on peut voir. L'envoi,
-- lui, passe par la clé de service : prévenir quelqu'un ne se fait jamais
-- au nom du client qui vient de réserver.
create policy "push_abonnements_select"
  on public.push_abonnements for select
  using (public.peut_voir(restaurant_id) and utilisateur_id = auth.uid());

create policy "push_abonnements_insert"
  on public.push_abonnements for insert
  with check (public.peut_voir(restaurant_id) and utilisateur_id = auth.uid());

create policy "push_abonnements_delete"
  on public.push_abonnements for delete
  using (public.peut_voir(restaurant_id) and utilisateur_id = auth.uid());
