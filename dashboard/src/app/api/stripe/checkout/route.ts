import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { siteUrl } from "@/lib/site-url";
import { MODULES, PACK, type Achat } from "@/lib/abonnement/modules";

/**
 * Le tarif Stripe de chaque achat possible. Trois produits distincts, donc
 * trois identifiants : `STRIPE_PRICE_ID` couvre la visibilité et reste lu
 * tel quel, pour ne pas casser une configuration déjà en place.
 */
function tarif(requis: Achat): string | undefined {
  if (requis === PACK) return process.env.STRIPE_PRICE_ID_PACK;
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
  if (demande !== PACK && !MODULES.includes(demande as (typeof MODULES)[number])) {
    return NextResponse.json({ error: "module inconnu" }, { status: 400 });
  }
  const requis = demande as Achat;

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

  // Stripe refuse pour des raisons qu'on ne devine pas d'ici : un tarif
  // d'un autre compte, une clé du mauvais mode, un produit archivé. Sans
  // ce filet, l'erreur remonte en page blanche et le restaurateur conclut
  // que « le bouton ne marche pas » — ce qui n'aide personne à chercher.
  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      // Pas de payment_method_types explicite : "Managed Payments" (activé
      // par défaut sur les comptes Stripe récents) choisit automatiquement
      // les moyens de paiement disponibles (carte, SEPA...) selon le pays et
      // la devise du client.
      line_items: [{ price, quantity: 1 }],
      // Les codes promotionnels se créent et se révoquent chez Stripe, pas
      // ici : un système maison demanderait sa table, son écran, ses règles
      // de cumul et ses dates de validité — tout ce que Stripe fait déjà, et
      // qui se retrouverait sur la facture sans qu'on ait rien à écrire.
      allow_promotion_codes: true,
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
  } catch (erreur) {
    const detail =
      erreur instanceof Error ? erreur.message : String(erreur);
    console.error("[stripe/checkout]", requis, detail);
    return NextResponse.redirect(
      new URL(
        `/dashboard/${restaurantId}/abonnement?stripe_error=${encodeURIComponent(
          detail.slice(0, 300),
        )}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(session.url!);
}
