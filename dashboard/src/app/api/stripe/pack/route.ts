import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { abonnementOuvrant, PACK } from "@/lib/abonnement/modules";
import { tarif, tauxTva } from "@/lib/stripe/tarifs";

/**
 * Passer d'un module au pack, au prorata.
 *
 * Sans ce chemin, le client qui a déjà les Réservations et veut aussi la
 * Visibilité se retrouve avec deux abonnements : 29 € + 37,50 €, soit
 * 66,50 € par mois quand le pack en vaut 59. Le fidèle payait 90 € de plus
 * par an que celui qui avait tout pris d'emblée — l'inverse exact de ce
 * qu'on veut récompenser.
 *
 * On ne crée donc pas un second abonnement : on change le tarif de celui
 * qui existe. Stripe crédite les jours non consommés de l'ancien module,
 * facture le pack au prorata, et la date de renouvellement ne bouge pas.
 * Le client garde un seul prélèvement et une seule facture.
 */
export async function GET(request: NextRequest) {
  const restaurantId = request.nextUrl.searchParams.get("restaurant_id");
  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurant_id manquant" },
      {
        status: 400,
      },
    );
  }

  const retour = (motif?: string) =>
    NextResponse.redirect(
      new URL(
        `/dashboard/${restaurantId}/abonnement${motif ? `?stripe_error=${encodeURIComponent(motif)}` : "?checkout=pack"}`,
        request.url,
      ),
    );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const prix = tarif(PACK);
  if (!prix) return retour("Le tarif du pack n'est pas configuré.");

  // La RLS ne montre que les abonnements de ses propres établissements.
  const { data: lignes } = await supabase
    .from("restaurant_subscriptions")
    .select("module, status, stripe_subscription_id")
    .eq("restaurant_id", restaurantId);

  const enCours = (lignes ?? []).filter(
    (ligne) =>
      abonnementOuvrant(ligne.status as string) && ligne.stripe_subscription_id,
  ) as { module: string; stripe_subscription_id: string }[];

  // Déjà au pack : les deux modules pendent au même abonnement. Rien à
  // faire, et surtout pas une bascule qui refacturerait un prorata nul.
  const abonnements = new Set(enCours.map((l) => l.stripe_subscription_id));
  if (enCours.length === 0) {
    return retour("Aucun abonnement à faire évoluer.");
  }
  if (enCours.length > 1 || abonnements.size > 1) {
    return retour("Tes deux modules sont déjà abonnés.");
  }

  const abonnementId = enCours[0]!.stripe_subscription_id;

  try {
    const stripe = getStripe();
    const abonnement = await stripe.subscriptions.retrieve(abonnementId);
    const ligne = abonnement.items.data[0];
    if (!ligne) return retour("Abonnement sans ligne de facturation.");

    await stripe.subscriptions.update(abonnementId, {
      items: [{ id: ligne.id, price: prix, quantity: 1 }],
      // « always_invoice » facture la différence tout de suite, comme le
      // ferait n'importe quel changement de formule : le client paie, et
      // le module s'ouvre dans la foulée. « create_prorations » aurait
      // reporté l'écart à la prochaine échéance — un mois d'accès offert
      // par inadvertance, et une facture ultérieure incompréhensible.
      proration_behavior: "always_invoice",
      // C'est cette étiquette que lit le webhook pour savoir quoi ouvrir.
      // Sans elle, l'abonnement resterait marqué « reservations » et la
      // visibilité ne s'ouvrirait jamais, alors même qu'elle est payée.
      metadata: { restaurant_id: restaurantId, module: PACK },
      // Le taux s'attache à la ligne, et la ligne vient d'être remplacée.
      default_tax_rates: tauxTva(),
    });
  } catch (erreur) {
    const detail = erreur instanceof Error ? erreur.message : String(erreur);
    console.error("[stripe/pack]", restaurantId, detail);
    return retour(detail.slice(0, 300));
  }

  return retour();
}
