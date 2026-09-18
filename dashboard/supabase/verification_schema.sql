-- Ce que le code attend, et ce que la base a vraiment.
--
-- À lancer dans l'éditeur SQL de Supabase. Ne renvoie que ce qui manque :
-- aucune ligne = la base est à jour. Ne modifie rien.
with attendu_tables (nom) as (values
    ('ai_visibility_checks'), ('ai_visibility_questions'), ('commis_usage'),
    ('devis'), ('devis_lignes'), ('devis_prestations'),
    ('google_business_connections'), ('limites_usage'), ('notifications_internes'),
    ('prospects'), ('push_abonnements'), ('reservation_courriels'),
    ('restaurant_espaces'), ('restaurant_experience_reservations'), ('restaurant_experiences'),
    ('restaurant_faq'), ('restaurant_fermetures'), ('restaurant_keywords'),
    ('restaurant_membres'), ('restaurant_menu_items'), ('restaurant_photos'),
    ('restaurant_posts'), ('restaurant_reperes'), ('restaurant_reputation_snapshots'),
    ('restaurant_reservations'), ('restaurant_retours'), ('restaurant_services'),
    ('restaurant_stripe_connexions'), ('restaurant_subscriptions'), ('restaurant_tables'),
    ('restaurants'), ('social_connections'), ('suivis'),
    ('tiktok_connections'), ('visibility_audits')
),
attendu_fonctions (nom) as (values
    ('peut_voir'), ('peut_gerer'), ('commis_consommer'),
    ('limite_consommer')
),
attendu_colonnes (nom_table, nom_colonne) as (values
    ('ai_visibility_checks','fournisseur'), ('ai_visibility_questions','intention'),
    ('devis','mentions'), ('devis_lignes','tva_taux'),
    ('google_business_connections','account_name'), ('google_business_connections','location_name'),
    ('google_business_connections','location_title'), ('prospects','ville'),
    ('reservation_courriels','derniere_tentative'), ('reservation_courriels','tentatives'),
    ('restaurant_espaces','acompte_centimes'), ('restaurant_espaces','acompte_mode'),
    ('restaurant_espaces','caution_centimes'), ('restaurant_espaces','caution_mode'),
    ('restaurant_espaces','garantie_seuil_couverts'), ('restaurant_espaces','minimum_consommation_centimes'),
    ('restaurant_espaces','minimum_consommation_ht'), ('restaurant_menu_items','actif'),
    ('restaurant_menu_items','photo_storage_path'), ('restaurant_menu_items','photo_url'),
    ('restaurant_menu_items','prix_centimes'), ('restaurant_menu_items','traductions'),
    ('restaurant_menu_items','updated_at'), ('restaurant_photos','espace_id'),
    ('restaurant_photos','legende'), ('restaurant_reservations','absence_constatee_le'),
    ('restaurant_reservations','absence_constatee_par'), ('restaurant_reservations','accepte_communications'),
    ('restaurant_reservations','acompte_centimes'), ('restaurant_reservations','acompte_hors_ligne'),
    ('restaurant_reservations','acompte_paye_le'), ('restaurant_reservations','acompte_statut'),
    ('restaurant_reservations','annulation_token'), ('restaurant_reservations','annulee_par'),
    ('restaurant_reservations','caution_centimes'), ('restaurant_reservations','caution_debitee_centimes'),
    ('restaurant_reservations','caution_enregistree_le'), ('restaurant_reservations','caution_statut'),
    ('restaurant_reservations','derniere_relance_le'), ('restaurant_reservations','heure_arrivee'),
    ('restaurant_reservations','minimum_consommation_centimes'), ('restaurant_reservations','minimum_consommation_ht'),
    ('restaurant_reservations','origine'), ('restaurant_reservations','paiement_token'),
    ('restaurant_reservations','stripe_customer_id'), ('restaurant_reservations','stripe_payment_intent_id'),
    ('restaurant_reservations','stripe_payment_method_id'), ('restaurant_reservations','stripe_session_id'),
    ('restaurant_reservations','stripe_setup_session_id'), ('restaurant_reservations','table_id'),
    ('restaurant_services','duree_minutes'), ('restaurant_subscriptions','cancel_at_period_end'),
    ('restaurant_subscriptions','module'), ('restaurant_tables','hauteur'),
    ('restaurant_tables','largeur'), ('restaurant_tables','rotation'),
    ('restaurants','acces_offert_jusqu_au'), ('restaurants','carte_publique'),
    ('restaurants','confirmation_auto'), ('restaurants','confirmation_auto_delai_heures'),
    ('restaurants','description'), ('restaurants','devis_mentions'),
    ('restaurants','email_contact'), ('restaurants','google_place_id'),
    ('restaurants','horaires'), ('restaurants','logo_storage_path'),
    ('restaurants','logo_url'), ('restaurants','mentions_legales'),
    ('restaurants','photo_couverture_id'), ('restaurants','reputation_relevee_le'),
    ('restaurants','search_console_site'), ('restaurants','site_publie'),
    ('restaurants','site_web'), ('restaurants','slug_reservation'),
    ('restaurants','telephone'), ('restaurants','tripadvisor_location_id'),
    ('restaurants','type_cuisine')
)
select 'TABLE MANQUANTE' as quoi, nom as objet, null::text as detail
from attendu_tables
where to_regclass('public.' || nom) is null

union all

select 'FONCTION MANQUANTE', nom, null
from attendu_fonctions f
where not exists (
  select 1 from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = f.nom
)

union all

select 'COLONNE MANQUANTE', nom_table, nom_colonne
from attendu_colonnes c
-- On ignore les colonnes des tables déjà signalées absentes : la table
-- manquante est la seule chose à corriger, ses colonnes suivront.
where to_regclass('public.' || nom_table) is not null
  and not exists (
    select 1 from information_schema.columns ic
    where ic.table_schema = 'public'
      and ic.table_name = c.nom_table
      and ic.column_name = c.nom_colonne
  )

order by 1, 2, 3;
