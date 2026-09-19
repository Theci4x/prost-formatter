-- Les questions qu'on pose avant de réserver, et les réponses.
--
-- Ce n'est pas un ornement de page. « Avez-vous une terrasse ? », « êtes-
-- vous accessible en fauteuil ? », « acceptez-vous les chiens ? », « avez-
-- vous des plats végétariens ? » — ce sont les formes exactes dans
-- lesquelles un client interroge aujourd'hui un assistant, et le balisage
-- FAQPage est le format que ces assistants reprennent le plus volontiers,
-- presque mot pour mot.
--
-- Un restaurant qui n'a pas répondu ne se voit pas écarté de la réponse :
-- il n'en est jamais candidat, ce qui revient au même et ne se constate
-- nulle part. Répondre une fois suffit à devenir la source.
--
-- Accessoirement, ces réponses désengorgent le téléphone en plein service,
-- ce qui est la raison pour laquelle un restaurateur acceptera de les
-- écrire.

create table if not exists public.restaurant_faq (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  question text not null,
  reponse text not null,
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  -- Une question vide ne se répond pas, une réponse vide ne se balise pas :
  -- Google rejette une FAQPage incomplète, et la page entière avec.
  constraint faq_question_non_vide check (length(btrim(question)) > 0),
  constraint faq_reponse_non_vide check (length(btrim(reponse)) > 0)
);

create index if not exists restaurant_faq_restaurant_idx
  on public.restaurant_faq (restaurant_id, ordre, created_at);

alter table public.restaurant_faq enable row level security;

-- Lecture ouverte : ces réponses sont publiques par destination, c'est tout
-- leur intérêt. La vitrine les sert à des visiteurs qui ne sont connectés
-- à rien, et le balisage à des robots qui le sont encore moins.
drop policy if exists "faq_select_public" on public.restaurant_faq;
create policy "faq_select_public" on public.restaurant_faq
  for select using (true);

-- Écriture réservée à qui gère l'établissement — gérant compris, comme
-- pour la carte et les photos : répondre à « avez-vous une terrasse » ne
-- demande pas d'être propriétaire des murs.
drop policy if exists "faq_insert" on public.restaurant_faq;
create policy "faq_insert" on public.restaurant_faq
  for insert with check (public.peut_gerer(restaurant_id));

drop policy if exists "faq_update" on public.restaurant_faq;
create policy "faq_update" on public.restaurant_faq
  for update using (public.peut_gerer(restaurant_id))
  with check (public.peut_gerer(restaurant_id));

drop policy if exists "faq_delete" on public.restaurant_faq;
create policy "faq_delete" on public.restaurant_faq
  for delete using (public.peut_gerer(restaurant_id));
