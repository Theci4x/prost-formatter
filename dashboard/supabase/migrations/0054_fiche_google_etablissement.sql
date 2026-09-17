-- L'identifiant de la fiche Google d'un établissement.
--
-- La page d'avis du totem le lisait déjà — sur une colonne qui n'existait
-- pas. PostgREST refuse la requête entière, la page ne trouve aucun
-- établissement, et /avis/<slug> répondait 404 pour tout le monde.
--
-- Ailleurs dans Klarr, la fiche est retrouvée par recherche (nom +
-- adresse) à chaque fois, et c'est très bien pour un écran de tableau de
-- bord : il tourne une fois par jour, sous les yeux de quelqu'un. Le
-- totem, lui, est scanné par des clients, à table, en série : une
-- recherche facturée par scan se paie vite. L'identifiant se résout donc
-- une fois, puis se garde.
alter table public.restaurants
  add column if not exists google_place_id text;
