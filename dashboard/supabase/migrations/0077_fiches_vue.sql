-- La vue du fichier client, recréée.
--
-- En production, l'écran Fichier client répondait « Could not find the
-- table 'public.restaurant_contacts_fiches' in the schema cache » : la
-- table des contacts existait (les compteurs le montraient), la vue qui
-- calcule les venues non — ou l'API ne la connaissait pas encore. Cette
-- migration la recrée à l'identique de la 0063, sans rien perdre si elle
-- existait déjà, puis demande à l'API de relire le schéma.
--
-- Sans elle, trois choses restent sans historique : la liste du fichier
-- client, son export CSV et le ciblage des campagnes.

create or replace view public.restaurant_contacts_fiches
with (security_invoker = true) as
  with venues as (
    select
      r.restaurant_id,
      lower(btrim(r.client_email)) as email,
      r.date_reservation as jour,
      r.couverts
    from public.restaurant_reservations r
    where r.statut = 'confirmee'
      and r.date_reservation <= current_date
    union all
    select
      e.restaurant_id,
      lower(btrim(e.client_email)) as email,
      e.date_seance as jour,
      e.places
    from public.restaurant_experience_reservations e
    -- « attendue » compte : la séance est passée et n'a pas été annulée,
    -- donc la place a été tenue, payée d'avance ou non.
    where e.statut <> 'annulee'
      and e.date_seance <= current_date
  )
  select
    c.id,
    c.restaurant_id,
    c.email,
    c.nom,
    c.telephone,
    c.consentement,
    c.consentement_le,
    c.desabonne_le,
    c.note_interne,
    c.created_at,
    -- Le jeton reste dans la table et ne monte pas ici : l'écran n'en a
    -- pas l'usage, et une vue qu'on élargit un jour pour un export est
    -- une fuite qu'on n'a pas vue venir.
    count(v.jour)::integer as venues,
    coalesce(sum(v.couverts), 0)::integer as couverts,
    min(v.jour) as premiere_venue,
    max(v.jour) as derniere_venue
  from public.restaurant_contacts c
  left join venues v
    on v.restaurant_id = c.restaurant_id and v.email = c.email
  group by c.id;

-- L'API garde en cache la liste des tables et des vues : une vue créée à
-- la main n'y entre qu'après ce signal.
notify pgrst, 'reload schema';
