-- Une même question est posée à plusieurs assistants (Claude, ChatGPT,
-- Gemini, Perplexity) : on garde lequel a répondu pour pouvoir comparer.
alter table public.ai_visibility_checks
  add column if not exists fournisseur text not null default 'claude';
