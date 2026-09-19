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

  // La RLS garantit que ce restaurant appartient bien à l'utilisateur
  // connecté, et que l'abonnement associé aussi.
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) {
    return NextResponse.json(
      { error: "restaurant introuvable" },
      {
        status: 404,
      },
    );
  }

  // Une seule ligne suffit, et il peut y en avoir plusieurs : le pack en
  // écrit une par module ouvert. `maybeSingle()` exigeait au plus une
  // ligne et échouait dès qu'un restaurateur passait au pack — le bouton
  // « Gérer » répondait alors « aucun abonnement » à quelqu'un qui payait.
  //
  // Toutes les lignes d'un établissement portent le même client Stripe :
  // n'importe laquelle donne le bon portail, et le portail montre de
  // toute façon l'ensemble de ses abonnements.
  const { data: subscription } = await supabase
    .from("restaurant_subscriptions")
    .select("stripe_customer_id")
    .eq("restaurant_id", restaurantId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: "aucun abonnement" }, { status: 404 });
  }

  const site = siteUrl();

  const session = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${site}/dashboard/${restaurantId}/abonnement`,
  });

  return NextResponse.redirect(session.url);
}
