import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/tiktok/oauth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("tiktok_oauth_state")?.value;
  const codeVerifier = request.cookies.get("tiktok_oauth_verifier")?.value;

  const clearStateCookies = (response: NextResponse) => {
    response.cookies.delete("tiktok_oauth_state");
    response.cookies.delete("tiktok_oauth_verifier");
    return response;
  };

  if (!code || !state || !cookieState || state !== cookieState || !codeVerifier) {
    return clearStateCookies(
      NextResponse.redirect(new URL("/dashboard?tiktok_error=1", request.url)),
    );
  }

  const restaurantId = state.split(".")[1];
  if (!restaurantId) {
    return clearStateCookies(
      NextResponse.redirect(new URL("/dashboard?tiktok_error=1", request.url)),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return clearStateCookies(NextResponse.redirect(new URL("/login", request.url)));
  }

  try {
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    const info = await getUserInfo(tokens.access_token);

    const tokenExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    const { error } = await supabase.from("tiktok_connections").upsert(
      {
        restaurant_id: restaurantId,
        tiktok_open_id: info.openId,
        tiktok_username: info.username,
        display_name: info.displayName,
        avatar_url: info.avatarUrl,
        follower_count: info.followerCount,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: tokenExpiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id" },
    );

    if (error) throw error;

    return clearStateCookies(
      NextResponse.redirect(
        new URL(`/dashboard/${restaurantId}/tiktok?connected=1`, request.url),
      ),
    );
  } catch (err) {
    console.error("[tiktok/callback]", err);
    return clearStateCookies(
      NextResponse.redirect(
        new URL(`/dashboard/${restaurantId}/tiktok?error=1`, request.url),
      ),
    );
  }
}
