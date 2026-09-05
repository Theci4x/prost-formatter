import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getUserPages,
  getPageDetails,
} from "@/lib/facebook/oauth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("facebook_oauth_state")?.value;

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.delete("facebook_oauth_state");
    return response;
  };

  if (!code || !state || !cookieState || state !== cookieState) {
    return clearStateCookie(
      NextResponse.redirect(new URL("/dashboard?facebook_error=1", request.url)),
    );
  }

  const restaurantId = state.split(".")[1];
  if (!restaurantId) {
    return clearStateCookie(
      NextResponse.redirect(new URL("/dashboard?facebook_error=1", request.url)),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return clearStateCookie(NextResponse.redirect(new URL("/login", request.url)));
  }

  try {
    const shortLivedToken = await exchangeCodeForToken(code);
    const userToken = await exchangeForLongLivedToken(shortLivedToken);

    const pages = await getUserPages(userToken);
    const page = pages[0];
    if (!page) {
      throw new Error("Aucune page Facebook trouvée pour cet utilisateur");
    }

    const details = await getPageDetails(page.id, page.accessToken);

    const { error } = await supabase.from("social_connections").upsert(
      {
        restaurant_id: restaurantId,
        facebook_page_id: page.id,
        facebook_page_name: page.name,
        facebook_page_access_token: page.accessToken,
        instagram_business_account_id: details.instagramBusinessAccountId,
        instagram_username: details.instagramUsername,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id" },
    );

    if (error) throw error;

    return clearStateCookie(
      NextResponse.redirect(
        new URL(`/dashboard/${restaurantId}/social?connected=1`, request.url),
      ),
    );
  } catch (err) {
    console.error("[facebook/callback]", err);
    return clearStateCookie(
      NextResponse.redirect(
        new URL(`/dashboard/${restaurantId}/social?error=1`, request.url),
      ),
    );
  }
}
