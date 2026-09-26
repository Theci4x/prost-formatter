-- Suivi de la visibilité dans les réponses des IA, et ce que cherchait le
-- client en posant sa question.
--
-- Cette migration est volontairement complète plutôt qu'incrémentale : les
-- tables de la 0012 n'existaient pas en production — la 0025, qui a refait
-- toutes les policies, saute les tables absentes sans rien dire, et l'écran
-- affichait « aucune question » au lieu d'une erreur. On recrée donc ici ce
-- qui manque, avec les conventions d'aujourd'hui (peut_gerer), avant
-- d'ajouter la colonne qui motivait la migration.

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
  -- Une même question est posée à plusieurs assistants (Claude, ChatGPT,
  -- Gemini, Perplexity) : on garde lequel a répondu pour pouvoir comparer.
  fournisseur text not null default 'claude',
  modele text not null,
  est_cite boolean not null,
  rang integer,
  concurrents jsonb not null default '[]'::jsonb,
  reponse text not null,
  created_at timestamptz not null default now()
);

-- Au cas où la table existerait sans la colonne (base où seule la 0012
-- serait passée).
alter table public.ai_visibility_checks
  add column if not exists fournisseur text not null default 'claude';

create index if not exists ai_visibility_checks_question_created_idx
  on public.ai_visibility_checks (question_id, created_at desc);


-- Ce que cherchait le client en posant sa question.
--
-- Jusqu'ici, toutes les questions se valaient : on comptait « cité tant de
-- fois sur tant de réponses », et ce chiffre ne disait rien d'utile. Être
-- cité dans « quels sont les bars les plus populaires à Paris » flatte ;
-- être cité dans « où réserver une table pour un dîner événementiel »
-- remplit une salle. Ce ne sont pas les mêmes efforts, et ce ne sont
-- surtout pas les mêmes enjeux.
--
-- Trois intentions, nommées du point de vue du restaurateur plutôt qu'en
-- jargon de référencement : on me découvre, on me compare, on me réserve.
alter table public.ai_visibility_questions
  add column if not exists intention text not null default 'decouverte';

alter table public.ai_visibility_questions
  drop constraint if exists ai_visibility_question_intention_check;

alter table public.ai_visibility_questions
  add constraint ai_visibility_question_intention_check
  check (intention in ('decouverte', 'comparaison', 'reservation'));

comment on column public.ai_visibility_questions.intention is
  'Ce que cherche le client : decouverte (il explore), comparaison (il choisit), reservation (il réserve).';


-- Les policies, comme pour les autres tables de pilotage : réservées à qui
-- gère l'établissement. Rejouables — on retire les anciennes d'abord, y
-- compris celles de la 0012 si elles traînent.
alter table public.ai_visibility_questions enable row level security;
alter table public.ai_visibility_checks enable row level security;

do $$
declare
  cible text;
  politique text;
begin
  foreach cible in array array[
    'ai_visibility_questions', 'ai_visibility_checks'
  ] loop
    for politique in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = cible
    loop
      execute format('drop policy if exists %I on public.%I', politique, cible);
    end loop;

    execute format($f$
      create policy %1$I on public.%2$I for select
        using (public.peut_gerer(restaurant_id));
      create policy %3$I on public.%2$I for insert
        with check (public.peut_gerer(restaurant_id));
      create policy %4$I on public.%2$I for update
        using (public.peut_gerer(restaurant_id))
        with check (public.peut_gerer(restaurant_id));
      create policy %5$I on public.%2$I for delete
        using (public.peut_gerer(restaurant_id));
    $f$, cible || '_select', cible, cible || '_insert',
         cible || '_update', cible || '_delete');
  end loop;
end $$;
