import { createHash } from "node:crypto";

// TikTok for Developers — "Login Kit". Contrairement à Google/Facebook,
// TikTok exige PKCE (code_verifier/code_challenge) même pour ce flux
// serveur classique. Scopes en lecture seule (pas de publication) :
// user.info.basic (profil), user.info.stats (abonnés), video.list.
const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

const SCOPES = ["user.info.basic", "user.info.stats", "video.list"].join(",");

function getRedirectUri() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";
  return `${siteUrl}/api/tiktok/callback`;
}

export function buildCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function buildTikTokAuthUrl(state: string, codeChallenge: string) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("redirect_uri", getRedirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export type TikTokTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
};

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
): Promise<TikTokTokens> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: getRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    throw new Error(`TikTok token exchange a échoué : ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<Pick<TikTokTokens, "access_token" | "refresh_token" | "expires_in">> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`TikTok token refresh a échoué : ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export type TikTokUserInfo = {
  openId: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  followerCount: number | null;
};

export async function getUserInfo(
  accessToken: string,
): Promise<TikTokUserInfo> {
  const url = new URL(USER_INFO_URL);
  url.searchParams.set(
    "fields",
    "open_id,username,display_name,avatar_url,follower_count",
  );

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`TikTok user/info a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    data?: {
      user?: {
        open_id: string;
        username?: string;
        display_name?: string;
        avatar_url?: string;
        follower_count?: number;
      };
    };
  };

  const user = data.data?.user;
  if (!user) {
    throw new Error("TikTok user/info : réponse inattendue");
  }

  return {
    openId: user.open_id,
    username: user.username ?? null,
    displayName: user.display_name ?? null,
    avatarUrl: user.avatar_url ?? null,
    followerCount: user.follower_count ?? null,
  };
}

export type TikTokVideo = {
  id: string;
  title: string | null;
  coverImageUrl: string | null;
  shareUrl: string;
  viewCount: number | null;
};

export async function getRecentVideos(
  accessToken: string,
): Promise<TikTokVideo[]> {
  const url = new URL(VIDEO_LIST_URL);
  url.searchParams.set(
    "fields",
    "id,title,cover_image_url,share_url,view_count",
  );

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ max_count: 5 }),
  });

  if (!res.ok) {
    throw new Error(`TikTok video/list a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    data?: {
      videos?: {
        id: string;
        title?: string;
        cover_image_url?: string;
        share_url: string;
        view_count?: number;
      }[];
    };
  };

  return (data.data?.videos ?? []).map((v) => ({
    id: v.id,
    title: v.title ?? null,
    coverImageUrl: v.cover_image_url ?? null,
    shareUrl: v.share_url,
    viewCount: v.view_count ?? null,
  }));
}
