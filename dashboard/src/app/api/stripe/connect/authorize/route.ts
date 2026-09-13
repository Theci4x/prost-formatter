import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { construireEtat, urlDeConnexion } from "@/lib/stripe/connect";

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

  // La lecture passe par la session : RLS ne renvoie le restaurant que s'il
  // appartient à l'utilisateur. Un identifiant emprunté ne donne rien.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json(
      { error: "restaurant introuvable" },
      { status: 404 },
    );
  }

  const etat = construireEtat(restaurantId, randomUUID());
  const redirectUri = new URL(
    "/api/stripe/connect/callback",
    process.env.NEXT_PUBLIC_SITE_URL ?? request.url,
  ).toString();

  let destination: string;
  try {
    destination = urlDeConnexion(etat, redirectUri);
  } catch (erreur) {
    console.error("[stripe/connect/authorize]", erreur);
    return NextResponse.redirect(
      new URL(
        `/dashboard/${restaurantId}/connexions?stripe_error=configuration`,
        request.url,
      ),
    );
  }

  const response = NextResponse.redirect(destination);
  response.cookies.set("stripe_connect_state", etat, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
