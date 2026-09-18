-- Ce que le client cherchait en posant sa question.
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
