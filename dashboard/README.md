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
   `https://localhost:3000/auth/callback` (et l'équivalent en prod) aux
   Redirect URLs.
5. Pour la connexion Google Business Profile : créer un projet Google
   Cloud, activer les "Business Profile APIs", configurer l'écran de
   consentement OAuth et créer un ID client OAuth ("Application Web") avec
   comme URI de redirection `https://localhost:3000/api/google/callback`.
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
10. Pour l'audit automatique de présence en ligne : sur Google Cloud
    Console, activer l'API **"Places API (New)"** et configurer la
    facturation (obligatoire, pas d'offre gratuite illimitée — mais pas de
    délai de vérification comme pour l'API Business Profile). Créer une
    clé API simple ("Identifiants" → "Créer des identifiants" → "Clé API"),
    la restreindre à "Places API (New)", et la renseigner dans
    `GOOGLE_PLACES_API_KEY`.
11. Appliquer `supabase/migrations/0005_visibility_audits.sql` dans le SQL
    editor Supabase.
12. Pour les avis Yelp/Tripadvisor (page `/dashboard/[id]/avis`) : créer
    une clé sur [yelp.com/developers](https://www.yelp.com/developers)
    (`YELP_API_KEY`) et sur
    [tripadvisor.com/developers](https://www.tripadvisor.com/developers)
    (`TRIPADVISOR_API_KEY`) — auto-inscription, pas de partenariat
    commercial à négocier, contrairement à la plupart des connecteurs
    livraison/réservation (Uber Eats, Deliveroo, TheFork...) qui
    nécessitent une société établie et un dossier partenaire.
13. Pour Facebook/Instagram : va sur
    [developers.facebook.com](https://developers.facebook.com), crée une
    App (type "Business"), ajoute le produit **"Facebook Login for
    Business"**, et déclare comme "Redirect URI" (dans Facebook Login for
    Business → Paramètres) :
    `https://localhost:3000/api/facebook/callback`. Renseigne
    `FACEBOOK_APP_ID` et `FACEBOOK_APP_SECRET` (Paramètres de l'App), et
    recopie le même App ID dans `NEXT_PUBLIC_FACEBOOK_APP_ID` (le SDK
    JavaScript Facebook tourne côté navigateur).
    Ce produit exige en plus une **Configuration** (Facebook Login for
    Business → Configurations → Créer une configuration) : choisis le
    token "Utilisateur" (pas "Utilisateur système") et ajoute les
    permissions `pages_show_list`, `pages_read_engagement`,
    `instagram_basic`, **`business_management`**. Renseigne l'ID obtenu
    dans `FACEBOOK_LOGIN_CONFIG_ID` **et**
    `NEXT_PUBLIC_FACEBOOK_LOGIN_CONFIG_ID`. Il faut aussi que l'App (et au
    moins une Page Facebook) soit rattachée à un **portefeuille business**
    Meta (business.facebook.com/settings → Comptes → Applications /
    Pages). **Important** : une Page créée à l'intérieur d'un portefeuille
    business n'apparaît pas via `/me/accounts` (accès Page "classique") —
    `getUserPages` se rabat automatiquement sur `/me/businesses` puis
    `/{business_id}/owned_pages`, d'où le besoin de la permission
    `business_management`. Par ailleurs, "Facebook Login for Business"
    ne fonctionne pas avec une simple redirection vers
    `/dialog/oauth?...&scope=...` (Facebook annule la connexion,
    `selected_business_id` vide, quel que soit le paramétrage du
    portefeuille business) — Meta impose le SDK JavaScript
    (`FB.login({ config_id })`, flux implicite qui renvoie directement un
    token), ce que fait le composant `FacebookConnectButton`. Le SDK
    JavaScript refuse en plus de
    s'exécuter sur une page `http://` (sauf exceptions internes à Meta qui
    ne couvrent pas toujours `localhost`) : `npm run dev` lance donc le
    serveur en HTTPS local (voir section Développement plus bas).
    Tant que l'App est en mode développement, seuls les comptes ajoutés
    comme "testeurs" (Rôles de l'app → Testeurs) peuvent se connecter — il
    faut soumettre l'App à la revue Meta ("App Review") pour que
    n'importe quel restaurateur puisse s'y connecter, ce qui peut prendre
    de quelques jours à quelques semaines et nécessite parfois une
    vérification d'entreprise.
14. Appliquer `supabase/migrations/0006_social_connections.sql` dans le
    SQL editor Supabase.

## Développement

```bash
npm install
npm run dev
```

`npm run dev` lance le serveur en HTTPS local (`--experimental-https`,
requis par le SDK JavaScript Facebook) : Next.js génère un certificat
auto-signé (via `mkcert`) au premier lancement. Ouvrir
[https://localhost:3000](https://localhost:3000) — le navigateur peut
afficher un avertissement de sécurité ("Non sécurisé" / certificat non
reconnu) la première fois, il suffit de cliquer sur "Avancé" puis
"Continuer vers localhost" (c'est un certificat auto-signé local, normal
en développement). L'app redirige ensuite vers `/login`, puis `/dashboard`
une fois connecté.

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
- `src/lib/audit/scoring.ts` — algorithme de scoring maison (Fiche Google /
  E-réputation / Visibilité IA), fonctions pures testables sans réseau.
- `src/lib/audit/website.ts` — vérifie l'accessibilité du site du
  restaurant et la présence de données structurées (JSON-LD) / liens
  réseaux sociaux.
- `src/lib/google/places.ts` — appels à l'API Google Places (New) : clé
  API simple, sans OAuth ni vérification à attendre.
- Le formulaire `/test-presence-google` déclenche automatiquement cet
  audit (recherche du restaurant sur Google Maps, analyse du site,
  synthèse rédigée par Claude) et l'enregistre dans
  `visibility_audits`. Se dégrade proprement (retombe sur le simple
  message de remerciement) si `GOOGLE_PLACES_API_KEY` n'est pas encore
  configurée ou si l'établissement n'est pas trouvé.
- `supabase/migrations/0005_visibility_audits.sql` — table des audits
  générés.
- `src/lib/reviews/yelp.ts`, `src/lib/reviews/tripadvisor.ts` — APIs
  publiques self-service (lecture seule des avis, 2-3 avis par appel
  selon les quotas de chaque plateforme).
- `src/lib/reviews/aggregate.ts` — combine les deux, se dégrade
  proprement (établissement introuvable, clé absente) sans jamais
  casser la page.
- `src/app/dashboard/[id]/avis/` — affichage des avis Yelp/Tripadvisor
  d'un restaurant (lecture seule, pas de gestion/réponse).
- `src/lib/facebook/oauth.ts` — OAuth Meta Graph API (échange de code,
  token longue durée, pages gérées, détails d'une page + compte
  Instagram lié).
- `src/app/api/facebook/authorize` et `.../callback` — même schéma que
  Google (état signé par cookie pour la protection CSRF).
- `src/app/dashboard/[id]/social/` — connexion Facebook/Instagram par
  restaurant : statut, abonnés, derniers posts, déconnexion. Utilisable
  immédiatement avec des comptes "testeurs" sur l'App Meta ; nécessite
  l'App Review Meta pour un usage public.
- `supabase/migrations/0006_social_connections.sql` — table de
  connexion Facebook/Instagram par restaurant.
