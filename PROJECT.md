# Prost — Dashboard restaurants

Ce repo contient deux projets indépendants :

- `app.py`, `requirements.txt`, `Procfile` — l'app Flask existante en
  production (rappels WhatsApp, intégrations Fidyo/Joy/VAPI). Non affectée
  par ce qui suit.
- `dashboard/` — nouvelle app Next.js + Supabase : le dashboard de gestion
  des restaurants, développé par étapes.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + Postgres) — projet "Klarr" : `qjyykthkxaqiomhlzaeq.supabase.co`

## Étapes

### Étape 1 — Auth + structure du dashboard (terminée)

- [x] Projet Next.js (TypeScript, Tailwind, App Router)
- [x] Connexion Supabase (client + config d'environnement)
- [x] Auth email/password (inscription, connexion, déconnexion)
- [x] Page `/dashboard` protégée (redirection `/login` si non connecté)
- [x] Schéma initial de la table `restaurants` (id, nom, adresse,
      proprietaire_id)

Voir `dashboard/README.md` pour l'installation et la configuration.

### Étape 2 — Gestion des restaurants (terminée)

- [x] Liste des restaurants de l'utilisateur sur `/dashboard`
- [x] Création (`/dashboard/new`)
- [x] Édition (`/dashboard/[id]/edit`)
- [x] Suppression (avec confirmation)

### Étape 3 — Connexion Google Business Profile (en cours)

- [x] OAuth Google (connexion/déconnexion par restaurant, protection CSRF)
- [x] Migration `google_business_connections`
- [ ] Choix de la fiche Business Profile précise (une fois l'accès API
      Google validé)
- [ ] Lecture/réponse aux avis
- [ ] Création et programmation de posts (avec photos)
- [ ] Statistiques (vues, recherches, appels) via la Business Profile
      Performance API — réutilise la connexion OAuth déjà en place

**Bloquant externe** : le scope `business.manage` nécessite une
vérification Google (écran de consentement OAuth) avant un usage public —
démarche à faire côté Google Cloud Console, peut prendre plusieurs
semaines. Développement possible en attendant via un compte de test.

### Étape 4 — SEO (en cours)

- [x] Gestion des mots-clés ciblés par restaurant (ajout/suppression)
- [x] Analyse à la demande par Claude (suggestions de mots-clés,
      pertinence) — `dashboard/src/app/dashboard/[id]/seo/`
- [ ] Suivi de positionnement / analyse concurrentielle (nécessite un
      fournisseur tiers payant, l'API Google ne fournit pas ces données)

### Étape 5 — Acquisition (terminée pour la V1)

- [x] Landing page de présentation Klarr (design) — voir le lien Artifact
      partagé en conversation
- [x] Page publique `/test-presence-google` : formulaire de capture de
      leads ("test gratuit de présence Google"), FR/EN/中文, avec FAQ
- [x] Table `prospects` (Supabase) pour les leads capturés
- [x] Audit de visibilité automatique (inspiré d'un rapport malou.io
      partagé en conversation, algorithme de scoring propre à Klarr) :
      score Fiche Google / E-réputation / Visibilité IA + synthèse
      Claude, calculé via l'API Google Places (New) — pas de blocage
      côté vérification Google, juste une clé API + facturation à
      activer
- [x] Table `visibility_audits` (Supabase)

### Étape 6 — à venir

- Paiement (Stripe : carte bancaire + prélèvement SEPA, abonnement) —
  en attente de la création de la société
- Enrichissement du schéma `restaurants` (horaires, menu, etc.)
- Coder la landing page (design) en dur dans l'app, avec lien vers
  `/test-presence-google`
