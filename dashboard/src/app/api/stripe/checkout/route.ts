import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { siteUrl } from "@/lib/site-url";

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

  // La RLS ("restaurants_select_own") garantit qu'on ne recupere ce
  // restaurant que s'il appartient a l'utilisateur connecte.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, nom")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json({ error: "restaurant introuvable" }, {
      status: 404,
    });
  }

  const site = siteUrl();

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    // Pas de payment_method_types explicite : "Managed Payments" (activé
    // par défaut sur les comptes Stripe récents) choisit automatiquement
    // les moyens de paiement disponibles (carte, SEPA...) selon le pays et
    // la devise du client.
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: restaurantId,
    subscription_data: {
      metadata: { restaurant_id: restaurantId },
    },
    success_url: `${site}/dashboard/${restaurantId}/abonnement?checkout=success`,
    cancel_url: `${site}/dashboard/${restaurantId}/abonnement?checkout=cancel`,
  });

  return NextResponse.redirect(session.url!);
}
