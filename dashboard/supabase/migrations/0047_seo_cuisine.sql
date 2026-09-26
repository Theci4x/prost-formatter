-- Deux questions que pose un client, et auxquelles la fiche ne savait pas
-- répondre : « quelle cuisine ? » et « est-ce qu'on peut réserver ? ».
--
-- Elles ne sont pas décoratives. « Restaurant italien près de République
-- qui prend les réservations » est la forme même de ce qu'on demande
-- aujourd'hui à un assistant, et un établissement qui ne déclare ni sa
-- cuisine ni sa réservabilité ne peut pas être la réponse — il n'est pas
-- écarté, il n'est simplement jamais candidat.
--
-- La réservabilité se déduit déjà : une page de réservation ouverte, donc
-- un slug. Restait la cuisine.
alter table public.restaurants
  add column if not exists type_cuisine text;
