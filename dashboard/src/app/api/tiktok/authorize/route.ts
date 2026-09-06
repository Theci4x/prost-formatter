import { randomUUID, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildTikTokAuthUrl, buildCodeChallenge } from "@/lib/tiktok/oauth";

export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurant_id manquant" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json({ error: "restaurant introuvable" }, {
      status: 404,
    });
  }

  const state = `${randomUUID()}.${restaurantId}`;
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = buildCodeChallenge(codeVerifier);

  const response = NextResponse.redirect(
    buildTikTokAuthUrl(state, codeChallenge),
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  };
  response.cookies.set("tiktok_oauth_state", state, cookieOptions);
  response.cookies.set("tiktok_oauth_verifier", codeVerifier, cookieOptions);

  return response;
}
