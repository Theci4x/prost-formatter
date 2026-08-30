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

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — redirige vers
`/login`, puis `/dashboard` une fois connecté.

## Structure

- `middleware.ts` + `src/lib/supabase/middleware.ts` — rafraîchit la session
  Supabase et protège `/dashboard` sur chaque requête.
- `src/lib/supabase/client.ts` — client Supabase pour les Client Components.
- `src/lib/supabase/server.ts` — client Supabase pour les Server
  Components / Server Actions.
- `src/app/login/` — page + Server Actions (`login`, `signup`, `signOut`).
- `src/app/auth/callback/` — échange le code de confirmation email contre
  une session.
- `src/app/dashboard/` — layout protégé (vérification serveur en plus du
  middleware) + page vide, à enrichir dans les prochaines étapes.
- `supabase/migrations/0001_init.sql` — schéma initial de `restaurants`.
