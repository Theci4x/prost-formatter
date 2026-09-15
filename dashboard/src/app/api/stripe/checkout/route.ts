import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { siteUrl } from "@/lib/site-url";
import { MODULES, type Module } from "@/lib/abonnement/modules";

/**
 * Le tarif Stripe de chaque module. Deux produits distincts, donc deux
 * identifiants : `STRIPE_PRICE_ID` couvre la visibilité et reste lu tel
 * quel, pour ne pas casser une configuration déjà en place.
 */
function tarif(requis: Module): string | undefined {
  return requis === "reservations"
    ? process.env.STRIPE_PRICE_ID_RESERVATIONS
    : (process.env.STRIPE_PRICE_ID_VISIBILITE ?? process.env.STRIPE_PRICE_ID);
}

export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurant_id manquant" },
      { status: 400 },
    );
  }

  const demande = request.nextUrl.searchParams.get("module") ?? "visibilite";
  if (!MODULES.includes(demande as Module)) {
    return NextResponse.json({ error: "module inconnu" }, { status: 400 });
  }
  const requis = demande as Module;

  const price = tarif(requis);
  if (!price) {
    console.error(`[stripe/checkout] tarif manquant pour « ${requis} »`);
    return NextResponse.redirect(
      new URL(
        `/dashboard/${restaurantId}/abonnement?stripe_error=configuration`,
        request.url,
      ),
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
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: restaurantId,
    subscription_data: {
      // Le module voyage avec l'abonnement : c'est par cette étiquette
      // que le webhook saura lequel des deux vient d'être payé.
      metadata: { restaurant_id: restaurantId, module: requis },
    },
    success_url: `${site}/dashboard/${restaurantId}/abonnement?checkout=success&module=${requis}`,
    cancel_url: `${site}/dashboard/${restaurantId}/abonnement?checkout=cancel`,
  });

  return NextResponse.redirect(session.url!);
}
