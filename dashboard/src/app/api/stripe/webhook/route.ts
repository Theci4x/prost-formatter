import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";

async function upsertSubscription(subscription: Stripe.Subscription) {
  const restaurantId = subscription.metadata.restaurant_id;
  if (!restaurantId) return;

  // Les abonnements souscrits avant l'existence des modules n'en portent
  // pas : ce sont ceux de la visibilité, le seul produit d'alors.
  const paye =
    subscription.metadata.module === "reservations"
      ? "reservations"
      : "visibilite";

  const supabase = createServiceClient();
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  await supabase.from("restaurant_subscriptions").upsert(
    {
      restaurant_id: restaurantId,
      module: paye,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "restaurant_id,module" },
  );
}

/**
 * Acompte encaissé sur le compte d'un restaurateur. Le client est censé
 * revenir sur notre page, qui vérifie et enregistre — mais il peut fermer
 * l'onglet juste après avoir payé. Sans ce filet, sa réservation resterait
 * « acompte en attente » alors que l'argent est parti.
 */
async function enregistrerAcompte(session: Stripe.Checkout.Session) {
  const token = session.metadata?.klarr_token;
  if (!token || session.payment_status !== "paid") return;

  const supabase = createServiceClient();
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Le jeton désigne soit un acompte sur une réservation, soit une place
  // d'atelier. On tente les deux : le filtre sur le statut garantit qu'un
  // événement rejoué n'écrase rien, et qu'une seule des deux tables répond.
  const { error } = await supabase
    .from("restaurant_reservations")
    .update({
      acompte_statut: "paye",
      acompte_paye_le: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
      // C'est le paiement qui rend la réservation ferme : jusqu'ici la
      // salle n'était tenue que par une option, qui s'éteint d'elle-même si
      // le client ne donne pas suite.
      statut: "confirmee",
      option_expire_le: null,
    })
    .eq("paiement_token", token)
    .eq("acompte_statut", "attendu");
  if (error) console.error("[stripe webhook] acompte", error);

  const { error: erreurSeance } = await supabase
    .from("restaurant_experience_reservations")
    .update({
      statut: "confirmee",
      paye_le: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("paiement_token", token)
    .eq("statut", "attendue");
  if (erreurSeance) console.error("[stripe webhook] séance", erreurSeance);
}

/**
 * Vérifie la signature, quel que soit le point d'entrée qui a envoyé.
 *
 * Stripe sépare les événements du compte (les abonnements Klarr) de ceux
 * des comptes connectés (les acomptes encaissés par les restaurateurs), et
 * chaque point d'entrée porte son propre secret. Les deux arrivent pourtant
 * sur cette même adresse : `STRIPE_WEBHOOK_SECRET` accepte donc plusieurs
 * secrets séparés par des virgules, et on essaie chacun.
 *
 * Essayer plusieurs secrets n'affaiblit rien : un événement qu'aucun ne
 * valide est refusé, exactement comme avant.
 */
function verifier(body: string, signature: string): Stripe.Event {
  const secrets = (process.env.STRIPE_WEBHOOK_SECRET ?? "")
    .split(",")
    .map((secret) => secret.trim())
    .filter(Boolean);
  if (secrets.length === 0) throw new Error("STRIPE_WEBHOOK_SECRET manquante");

  let derniere: unknown;
  for (const secret of secrets) {
    try {
      return getStripe().webhooks.constructEvent(body, signature, secret);
    } catch (erreur) {
      derniere = erreur;
    }
  }
  throw derniere;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "signature manquante" }, {
      status: 400,
    });
  }

  let event: Stripe.Event;
  try {
    event = verifier(body, signature);
  } catch (err) {
    console.error("[stripe webhook] signature invalide", err);
    return NextResponse.json({ error: "signature invalide" }, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // `event.account` n'est renseigné que pour un compte connecté : c'est
      // ce qui distingue l'acompte d'un restaurateur de l'abonnement Klarr.
      if (event.account) {
        await enregistrerAcompte(session);
        break;
      }
      if (session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string,
        );
        await upsertSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
