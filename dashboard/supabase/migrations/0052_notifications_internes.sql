-- La trace de ce que Klarr s'est déjà dit à soi-même.
--
-- Les alertes internes (un prospect arrive, un essai se termine) partent
-- depuis une tâche planifiée qui balaie la même liste tous les matins.
-- Sans mémoire, un essai à trois jours de la fin serait annoncé chaque
-- jour jusqu'à son terme, et la seule alerte qui compte se noierait dans
-- les précédentes.
--
-- La clé porte l'événement entier — « essai:<restaurant>:<jour de fin> » —
-- de sorte qu'un accès prolongé à la main redevienne, lui, notifiable :
-- ce n'est plus la même échéance, donc plus la même clé.
create table if not exists public.notifications_internes (
  cle text primary key,
  created_at timestamptz not null default now()
);

-- Aucune politique : cette table ne se touche qu'avec la clé de service,
-- depuis la tâche planifiée. Rien ici n'appartient à un restaurateur.
alter table public.notifications_internes enable row level security;
