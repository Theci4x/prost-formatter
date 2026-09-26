-- Les audits de prospection.
--
-- Jusqu'ici, un audit naissait d'un seul endroit : le formulaire public,
-- où le restaurateur se teste lui-même en laissant ses coordonnées. Pour
-- aller le voir avec son audit en main, il fallait se faire passer pour
-- lui — ses coordonnées à inventer, le rapport envoyé à la mauvaise
-- adresse, et un faux prospect dans la liste.
--
-- `origine` dit d'où vient l'audit. `jeton` ouvre la page publique qu'on
-- envoie au restaurateur : long et tiré au hasard, il ne se devine pas,
-- et la page ne montre rien d'autre que ce qu'on lui aurait apporté sur
-- papier. `langue` est celle dans laquelle on le lui présente.

alter table public.visibility_audits
  add column if not exists origine text not null default 'formulaire',
  add column if not exists jeton text,
  add column if not exists langue text not null default 'fr';

alter table public.visibility_audits
  drop constraint if exists visibility_audits_origine_connue;
alter table public.visibility_audits
  add constraint visibility_audits_origine_connue
  check (origine in ('formulaire', 'prospection'));

alter table public.visibility_audits
  drop constraint if exists visibility_audits_langue_connue;
alter table public.visibility_audits
  add constraint visibility_audits_langue_connue
  check (langue in ('fr', 'en', 'zh'));

create unique index if not exists visibility_audits_jeton_idx
  on public.visibility_audits (jeton)
  where jeton is not null;

-- Le journal de suivi accueille aussi ces audits : on note qui a été vu,
-- relancé, ou est devenu client, comme pour les autres contacts.
alter table public.suivis
  drop constraint if exists suivis_cible_type_check;
alter table public.suivis
  add constraint suivis_cible_type_check
  check (cible_type in ('prospect', 'restaurant', 'audit'));
