-- Les campagnes e-mail.
--
-- C'est la planification qui marche : contrairement aux publications
-- Google, qui attendent un accès que Google accorde sur dossier, un
-- e-mail part le jour où on le lui demande. Rien ici ne dépend d'une
-- autorisation extérieure — seulement d'un domaine d'envoi vérifié, qui
-- se pose une fois pour tout le monde.
--
-- Deux tables, et la seconde n'est pas un luxe. Une campagne dit ce qu'on
-- voulait envoyer ; le journal dit ce qui est réellement parti, à qui, et
-- ce qui a échoué. Sans lui, un envoi coupé au milieu — la minute que
-- Vercel accorde, une panne du fournisseur — repartirait de zéro et
-- écrirait deux fois aux mêmes personnes. Écrire deux fois à un client
-- qui s'est abonné une fois est le plus sûr moyen de le perdre.

create table if not exists public.restaurant_campagnes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,

  objet text not null,
  texte text not null,
  -- Le même bouton que les publications Google : un libellé, une adresse.
  -- Un éditeur riche ferait abandonner au deuxième service.
  bouton_libelle text,
  bouton_url text,

  -- À qui. Le segment est résolu à l'envoi et non à la programmation :
  -- quelqu'un qui se désinscrit le mardi ne doit pas recevoir la
  -- campagne du mercredi, même si elle était prête avant.
  segment text not null default 'tous'
    check (segment in ('tous', 'recents', 'perdus', 'fideles')),

  statut text not null default 'brouillon'
    check (statut in ('brouillon', 'programmee', 'en_cours', 'envoyee', 'echec')),

  -- Une date et non un horodatage : sur le forfait actuel, Vercel ne
  -- passe qu'une fois par jour. Promettre une heure qu'on ne tient pas
  -- coûte plus cher que d'annoncer le jour.
  envoyer_le date,
  envoi_commence_le timestamptz,
  envoyee_le timestamptz,
  derniere_erreur text,

  -- Figé au moment de l'envoi. Le segment, lui, bouge : « venus dans les
  -- six mois » ne désigne pas les mêmes personnes en janvier et en juin,
  -- et un compte-rendu doit dire combien de gens ont reçu, pas combien
  -- en recevraient aujourd'hui.
  destinataires integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint campagne_objet_non_vide check (length(btrim(objet)) > 0),
  constraint campagne_texte_non_vide check (length(btrim(texte)) > 0),
  -- Un bouton sans adresse ne mène nulle part, une adresse sans libellé
  -- ne s'affiche pas : les deux ou aucun.
  constraint campagne_bouton_complet check (
    (bouton_libelle is null and bouton_url is null)
    or (length(btrim(coalesce(bouton_libelle, ''))) > 0 and bouton_url is not null)
  ),
  -- On ne programme pas sans dire quand.
  constraint campagne_programmee_datee check (
    statut <> 'programmee' or envoyer_le is not null
  )
);

-- La requête de la tâche de nuit, et elle seule : les campagnes dues.
create index if not exists campagnes_a_envoyer_idx
  on public.restaurant_campagnes (envoyer_le)
  where statut in ('programmee', 'en_cours');

create index if not exists campagnes_restaurant_idx
  on public.restaurant_campagnes (restaurant_id, created_at desc);

alter table public.restaurant_campagnes enable row level security;

drop policy if exists "campagnes_select" on public.restaurant_campagnes;
create policy "campagnes_select" on public.restaurant_campagnes
  for select using (public.peut_voir(restaurant_id));

drop policy if exists "campagnes_insert" on public.restaurant_campagnes;
create policy "campagnes_insert" on public.restaurant_campagnes
  for insert with check (public.peut_gerer(restaurant_id));

drop policy if exists "campagnes_update" on public.restaurant_campagnes;
create policy "campagnes_update" on public.restaurant_campagnes
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

drop policy if exists "campagnes_delete" on public.restaurant_campagnes;
create policy "campagnes_delete" on public.restaurant_campagnes
  for delete using (public.peut_gerer(restaurant_id));

-- Ce qui est réellement parti, une ligne par personne.
create table if not exists public.restaurant_campagne_envois (
  id uuid primary key default gen_random_uuid(),
  campagne_id uuid not null
    references public.restaurant_campagnes (id) on delete cascade,
  contact_id uuid not null
    references public.restaurant_contacts (id) on delete cascade,

  -- Recopiée, et non relue par jointure. Une adresse qui change ou une
  -- fiche supprimée ne doivent pas réécrire l'histoire : ce journal sert
  -- aussi à répondre « voilà ce qu'on vous a envoyé, et quand ».
  email text not null,

  statut text not null default 'a_envoyer'
    check (statut in ('a_envoyer', 'envoye', 'echec')),
  -- L'identifiant rendu par le fournisseur, de quoi retrouver un message.
  fournisseur_id text,
  erreur text,
  envoye_le timestamptz,
  created_at timestamptz not null default now()
);

-- Le garde-fou contre le double envoi. Il ne dépend d'aucune logique
-- applicative : même si la tâche repart deux fois sur la même campagne,
-- la base refuse la seconde ligne.
create unique index if not exists campagne_envois_unicite_idx
  on public.restaurant_campagne_envois (campagne_id, contact_id);

create index if not exists campagne_envois_restants_idx
  on public.restaurant_campagne_envois (campagne_id)
  where statut = 'a_envoyer';

alter table public.restaurant_campagne_envois enable row level security;

-- Le journal se lit par la campagne dont il dépend. Personne ne l'écrit
-- depuis le tableau de bord : seule la clé de service y touche, au
-- moment de l'envoi.
drop policy if exists "campagne_envois_select" on public.restaurant_campagne_envois;
create policy "campagne_envois_select" on public.restaurant_campagne_envois
  for select using (
    exists (
      select 1 from public.restaurant_campagnes c
      where c.id = campagne_id and public.peut_voir(c.restaurant_id)
    )
  );
