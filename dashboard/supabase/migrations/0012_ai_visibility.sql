-- Suivi de la visibilité dans les réponses des IA : le restaurateur enregistre
-- des questions telles qu'un client les poserait ("meilleur coréen dans le
-- 13e"), et chaque analyse garde son résultat pour suivre l'évolution.
create table if not exists public.ai_visibility_questions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  question text not null,
  created_at timestamptz not null default now(),
  unique (restaurant_id, question)
);

create table if not exists public.ai_visibility_checks (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.ai_visibility_questions (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  modele text not null,
  est_cite boolean not null,
  rang integer,
  concurrents jsonb not null default '[]'::jsonb,
  reponse text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_visibility_checks_question_created_idx
  on public.ai_visibility_checks (question_id, created_at desc);

alter table public.ai_visibility_questions enable row level security;
alter table public.ai_visibility_checks enable row level security;

create policy "ai_visibility_questions_select_own" on public.ai_visibility_questions
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "ai_visibility_questions_insert_own" on public.ai_visibility_questions
  for insert with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "ai_visibility_questions_delete_own" on public.ai_visibility_questions
  for delete using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "ai_visibility_checks_select_own" on public.ai_visibility_checks
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );

create policy "ai_visibility_checks_insert_own" on public.ai_visibility_checks
  for insert with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.proprietaire_id = auth.uid()
    )
  );
