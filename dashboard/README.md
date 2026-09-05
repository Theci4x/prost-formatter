# Prost — Dashboard

Dashboard de gestion des restaurants. Next.js (App Router) + Supabase.

## Configuration

1. Copier `.env.local.example` en `.env.local`.
2. Renseigner `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase > Project Settings >
   API > Project API keys > `anon` `public`). `NEXT_PUBLIC_SUPABASE_URL` est
   déjà pré-rempli.
3. Appliquer le schéma SQL : dans le SQL editor de Supabase, exécuter le
   contenu de `supabase/migrations/0001_init.sql` (crée la table
   `restaurants` avec Row Level Security).
4. Dans Supabase > Authentication > URL Configuration, ajouter
   `http://localhost:3000/auth/callback` (et l'équivalent en prod) aux
   Redirect URLs.
5. Pour la connexion Google Business Profile : créer un projet Google
   Cloud, activer les "Business Profile APIs", configurer l'écran de
   consentement OAuth et créer un ID client OAuth ("Application Web") avec
   comme URI de redirection `http://localhost:3000/api/google/callback`.
   Renseigner `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans
   `.env.local`. Le scope `business.manage` nécessite une vérification
   Google avant un usage public (peut prendre plusieurs semaines) ; en
   attendant, ajouter son propre compte comme "utilisateur de test" dans
   l'écran de consentement suffit pour développer/tester.
6. Appliquer `supabase/migrations/0002_google_business_connections.sql`
   dans le SQL editor Supabase.
7. Pour l'analyse SEO par Claude : créer une clé sur
   [console.anthropic.com](https://console.anthropic.com) (API Keys) et la
   renseigner dans `ANTHROPIC_API_KEY`.
8. Appliquer `supabase/migrations/0003_restaurant_keywords.sql` dans le SQL
   editor Supabase.
9. Appliquer `supabase/migrations/0004_prospects.sql` dans le SQL editor
   Supabase (table des leads du formulaire `/test-presence-google`).

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — redirige vers
`/login`, puis `/dashboard` une fois connecté.

## Structure

- `src/proxy.ts` + `src/lib/supabase/proxy.ts` — rafraîchit la session
  Supabase et protège `/dashboard` sur chaque requête (convention "Proxy"
  de Next.js 16, anciennement "Middleware").
- `src/lib/supabase/client.ts` — client Supabase pour les Client Components.
- `src/lib/supabase/server.ts` — client Supabase pour les Server
  Components / Server Actions.
- `src/app/login/` — page + Server Actions (`login`, `signup`, `signOut`).
- `src/app/auth/callback/` — échange le code de confirmation email contre
  une session.
- `src/app/dashboard/` — layout protégé (vérification serveur en plus du
  proxy) + liste/création/édition/suppression de restaurants.
- `src/app/dashboard/[id]/google/` — statut de connexion Google Business
  Profile pour un restaurant (connecter/déconnecter).
- `src/app/api/google/authorize` et `.../callback` — flow OAuth Google
  (état signé par cookie pour la protection CSRF).
- `src/lib/google/oauth.ts` — échange de code, refresh, infos utilisateur.
- `src/app/dashboard/[id]/seo/` — gestion des mots-clés SEO d'un restaurant
  + analyse à la demande par Claude (`@anthropic-ai/sdk`, modèle
  `claude-opus-5`).
- `supabase/migrations/0001_init.sql` — schéma initial de `restaurants`.
- `supabase/migrations/0002_google_business_connections.sql` — table de
  connexion Google par restaurant.
- `supabase/migrations/0003_restaurant_keywords.sql` — table des mots-clés
  SEO ciblés par restaurant.
- `src/app/test-presence-google/` — page publique (pas de login requis)
  de capture de leads ("test gratuit de présence Google"), FR/EN/中文,
  avec FAQ. Les soumissions sont enregistrées dans `public.prospects`
  (consultable via Supabase Studio, pas d'API de lecture publique).
- `supabase/migrations/0004_prospects.sql` — table des leads capturés.
