// Meta Graph API — nécessite une App Meta (developers.facebook.com).
//
// Deux flux de connexion mènent ici, et l'un n'est pas un luxe :
//
// « Facebook Login for Business » (`FB.login({ config_id })`) est celui de
// la production. Meta route toute tentative de connexion par simple
// redirection (`/dialog/oauth`) vers un écran de sélection de portefeuille
// qui échoue silencieusement (`selected_business_id` vide) : le SDK
// JavaScript est la seule méthode fiable pour ce produit. Mais il réclame
// que l'App appartienne à un portefeuille business, ce qui suppose une
// société vérifiée — donc un Kbis, donc des semaines.
//
// Le flux classique (`FB.login({ scope })`) demande les mêmes
// autorisations sans portefeuille ni vérification, du moment que le compte
// est administrateur de l'App. Il sert à travailler avant que la
// vérification aboutisse ; le bouton y retombe tout seul quand aucun
// `config_id` n'est configuré.
//
// Dans les deux cas le navigateur ne rapporte qu'un token utilisateur de
// courte durée (flux implicite — pas d'échange de code, le « code » du flux
// serveur suppose un redirect_uri que le relais interne du SDK ne respecte
// pas). Le secret d'App ne pouvant pas vivre côté navigateur, l'échange en
// token longue durée et les appels Graph API se font ici, côté serveur.
const GRAPH_VERSION = "v21.0";
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

// Un token utilisateur "court" (1-2h) est échangé contre un token "long"
// (~60 jours) pour éviter de redemander la connexion trop souvent.
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<string> {
  const url = new URL(`${GRAPH_BASE_URL}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.FACEBOOK_APP_ID!);
  url.searchParams.set("client_secret", process.env.FACEBOOK_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Facebook long-lived token a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type FacebookPage = {
  id: string;
  name: string;
  accessToken: string;
};

export async function getUserPages(
  userAccessToken: string,
): Promise<FacebookPage[]> {
  // Une Page créée à l'intérieur d'un portefeuille business Meta (Business
  // Manager) n'apparaît pas via /me/accounts, qui ne reflète que les rôles
  // "classiques" (Page ajoutée hors Business Manager) — un utilisateur peut
  // avoir des Pages des deux types en même temps, donc on fusionne les deux
  // sources plutôt que de traiter la seconde comme un simple fallback.
  const [personalPages, businessPages] = await Promise.all([
    fetchAccountsPages(userAccessToken),
    fetchBusinessOwnedPages(userAccessToken),
  ]);

  const pages = new Map<string, FacebookPage>();
  for (const page of [...personalPages, ...businessPages]) {
    pages.set(page.id, page);
  }
  return [...pages.values()];
}

async function fetchAccountsPages(
  userAccessToken: string,
): Promise<FacebookPage[]> {
  const url = new URL(`${GRAPH_BASE_URL}/me/accounts`);
  url.searchParams.set("access_token", userAccessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Facebook /me/accounts a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    data?: { id: string; name: string; access_token: string }[];
  };

  return (data.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    accessToken: p.access_token,
  }));
}

async function fetchBusinessOwnedPages(
  userAccessToken: string,
): Promise<FacebookPage[]> {
  const businessesUrl = new URL(`${GRAPH_BASE_URL}/me/businesses`);
  businessesUrl.searchParams.set("access_token", userAccessToken);
  const businessesRes = await fetch(businessesUrl);
  if (!businessesRes.ok) return [];

  const businessesData = (await businessesRes.json()) as {
    data?: { id: string }[];
  };

  const pages: FacebookPage[] = [];
  for (const business of businessesData.data ?? []) {
    const ownedUrl = new URL(`${GRAPH_BASE_URL}/${business.id}/owned_pages`);
    ownedUrl.searchParams.set("access_token", userAccessToken);
    const ownedRes = await fetch(ownedUrl);
    if (!ownedRes.ok) continue;

    const ownedData = (await ownedRes.json()) as {
      data?: { id: string; name: string }[];
    };

    for (const page of ownedData.data ?? []) {
      const accessToken = await fetchPageAccessToken(page.id, userAccessToken);
      if (accessToken) pages.push({ id: page.id, name: page.name, accessToken });
    }
  }

  return pages;
}

// /owned_pages ne renvoie pas de token par Page (contrairement à
// /me/accounts) : il faut le récupérer séparément pour chaque Page.
async function fetchPageAccessToken(
  pageId: string,
  userAccessToken: string,
): Promise<string | null> {
  const url = new URL(`${GRAPH_BASE_URL}/${pageId}`);
  url.searchParams.set("fields", "access_token");
  url.searchParams.set("access_token", userAccessToken);

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export type PageDetails = {
  followersCount: number | null;
  posts: { message: string | null; createdTime: string; permalinkUrl: string }[];
  instagramBusinessAccountId: string | null;
  instagramUsername: string | null;
};

export async function getPageDetails(
  pageId: string,
  pageAccessToken: string,
): Promise<PageDetails> {
  const url = new URL(`${GRAPH_BASE_URL}/${pageId}`);
  url.searchParams.set(
    "fields",
    "followers_count,posts.limit(5){message,created_time,permalink_url},instagram_business_account{id,username}",
  );
  url.searchParams.set("access_token", pageAccessToken);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Facebook page details a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    followers_count?: number;
    posts?: {
      data?: { message?: string; created_time: string; permalink_url: string }[];
    };
    instagram_business_account?: { id: string; username: string };
  };

  return {
    followersCount: data.followers_count ?? null,
    posts: (data.posts?.data ?? []).map((p) => ({
      message: p.message ?? null,
      createdTime: p.created_time,
      permalinkUrl: p.permalink_url,
    })),
    instagramBusinessAccountId: data.instagram_business_account?.id ?? null,
    instagramUsername: data.instagram_business_account?.username ?? null,
  };
}
