import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, getGoogleUserEmail } from "@/lib/google/oauth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieState = request.cookies.get("google_oauth_state")?.value;

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.delete("google_oauth_state");
    return response;
  };

  if (!code || !state || !cookieState || state !== cookieState) {
    return clearStateCookie(
      NextResponse.redirect(new URL("/dashboard?google_error=1", request.url)),
    );
  }

  const restaurantId = state.split(".")[1];
  if (!restaurantId) {
    return clearStateCookie(
      NextResponse.redirect(new URL("/dashboard?google_error=1", request.url)),
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
    const tokens = await exchangeCodeForTokens(code);
    const email = await getGoogleUserEmail(tokens.access_token);

    if (!tokens.refresh_token) {
      throw new Error("Aucun refresh_token renvoyé par Google");
    }

    const tokenExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000,
    ).toISOString();

    // La RLS ("gbc_insert_own"/"gbc_update_own") garantit que cette
    // connexion ne peut etre creee/mise a jour que pour un restaurant
    // appartenant a l'utilisateur connecte.
    const { error } = await supabase
      .from("google_business_connections")
      .upsert(
        {
          restaurant_id: restaurantId,
          google_email: email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: tokenExpiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "restaurant_id" },
      );

    if (error) throw error;

    return clearStateCookie(
      NextResponse.redirect(
        new URL(`/dashboard/${restaurantId}/google?connected=1`, request.url),
      ),
    );
  } catch (err) {
    console.error("[google/callback]", err);
    return clearStateCookie(
      NextResponse.redirect(
        new URL(`/dashboard/${restaurantId}/google?error=1`, request.url),
      ),
    );
  }
}
