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

**Bloquant externe** : le scope `business.manage` nécessite une
vérification Google (écran de consentement OAuth) avant un usage public —
démarche à faire côté Google Cloud Console, peut prendre plusieurs
semaines. Développement possible en attendant via un compte de test.

### Étape 4 — à venir

- Paiement (Stripe : carte bancaire + prélèvement SEPA, abonnement)
- Ranking / mots-clés / analyse concurrentielle (nécessite un fournisseur
  tiers, l'API Google ne fournit pas ces données)
- Enrichissement du schéma `restaurants` (horaires, menu, etc.)
