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
    return NextResponse.json({ error: "restaurant introuvable" }, {
      status: 404,
    });
  }

  const { data: subscription } = await supabase
    .from("restaurant_subscriptions")
    .select("stripe_customer_id")
    .eq("restaurant_id", restaurantId)
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
