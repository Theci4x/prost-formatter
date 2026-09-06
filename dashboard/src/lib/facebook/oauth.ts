// Meta Graph API — nécessite une App Meta (developers.facebook.com) avec le
// produit "Facebook Login for Business". Ce produit route toute tentative
// de connexion via une simple redirection (`/dialog/oauth`) vers un flux de
// sélection de portefeuille business qui échoue silencieusement
// (`selected_business_id` vide) : Meta documente le SDK JavaScript
// (`FB.login({ config_id })`) comme seule méthode fiable pour ce produit.
// C'est le composant client `FacebookConnectButton` qui initie la
// connexion et récupère directement un token utilisateur (flux implicite,
// pas d'échange de code — le "code" du flux serveur suppose un redirect_uri
// que le relais interne du SDK ne respecte pas, ce qui fait échouer
// l'échange) ; ce module se charge de l'échange en token longue durée et
// des appels Graph API, côté serveur.
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
