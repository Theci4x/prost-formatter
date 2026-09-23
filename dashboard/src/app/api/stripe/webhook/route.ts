import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/service";
import { prevenirFactureEnAttente } from "@/lib/push/abonnement";
import {
  annoncerAbonnement,
  annoncerFinAbonnement,
  annoncerImpaye,
  annoncerResiliation,
} from "@/lib/notifications/abonnes";
import { cautionEnregistree } from "@/lib/stripe/caution";
import { validerBon } from "@/lib/bons/serveur";
import {
  prevenirAcompteRegle,
  prevenirCautionDeposee,
} from "@/lib/push/argent";
import { MODULES, PACK, type Module } from "@/lib/abonnement/modules";

async function upsertSubscription(subscription: Stripe.Subscription) {
  const restaurantId = subscription.metadata.restaurant_id;
  // Sans cette étiquette, on ne sait pas à qui appartient l'abonnement.
  // Le silence d'hier coûtait une heure de recherche : on le dit.
  if (!restaurantId) {
    console.error(
      "[stripe webhook] abonnement sans restaurant_id",
      subscription.id,
    );
    return;
  }

  // Ce qui a été acheté. Les abonnements souscrits avant l'existence des
  // modules ne portent pas d'étiquette : ce sont ceux de la visibilité, le
  // seul produit d'alors.
  //
  // Le pack, lui, n'est pas un module : c'est un abonnement qui en ouvre
  // deux. Il donne donc deux lignes portant le même `sub_…` — l'unicité
  // est posée sur (restaurant, module), pas sur l'abonnement, et le calcul
  // d'accès n'a rien à savoir de la façon dont on a payé. Une résiliation
  // les refermera toutes les deux d'un coup, par le même chemin.
  const etiquette = subscription.metadata.module;
  const payes: Module[] =
    etiquette === PACK
      ? [...MODULES]
      : [etiquette === "reservations" ? "reservations" : "visibilite"];

  const supabase = createServiceClient();
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  const commun = {
    restaurant_id: restaurantId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    // Une résiliation demandée laisse le statut à « active » jusqu'au
    // terme : sans ce drapeau, l'écran annonce un renouvellement là où le
    // service s'arrête.
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("restaurant_subscriptions").upsert(
    payes.map((module) => ({ ...commun, module })),
    { onConflict: "restaurant_id,module" },
  );
  if (error) console.error("[stripe webhook] abonnement", error);
}

/**
 * L'empreinte de carte, déposée sur le compte du restaurateur.
 *
 * Même filet que pour l'acompte, et il manquait : une caution ne
 * s'enregistrait que si le client revenait sur notre page. Fermer
 * l'onglet juste après avoir saisi sa carte laissait la réservation en
 * « caution attendue » alors que Stripe tenait l'empreinte — et la salle
 * se libérait toute seule à l'expiration de l'option.
 */
async function enregistrerCaution(session: Stripe.Checkout.Session) {
  const token = session.metadata?.klarr_token;
  if (!token) return;

  const supabase = createServiceClient();
  const { data: ligne } = await supabase
    .from("restaurant_reservations")
    .select("id, restaurant_id, client_nom, caution_centimes, caution_statut")
    .eq("paiement_token", token)
    .maybeSingle();

  const resa = ligne as {
    id: string;
    restaurant_id: string;
    client_nom: string | null;
    caution_centimes: number | null;
    caution_statut: string;
  } | null;
  if (!resa || resa.caution_statut !== "attendue") return;

  // Le compte connecté se retrouve par la réservation plutôt que par
  // l'enveloppe de l'événement : c'est une donnée à nous, elle ne changera
  // pas au gré des versions d'API.
  const { data: connexion } = await supabase
    .from("restaurant_stripe_connexions")
    .select("stripe_account_id")
    .eq("restaurant_id", resa.restaurant_id)
    .maybeSingle();
  const compte = (connexion as { stripe_account_id: string } | null)
    ?.stripe_account_id;
  if (!compte) return;

  // L'empreinte est relue chez Stripe, jamais déduite de l'événement.
  const resultat = await cautionEnregistree(compte, session.id, token);
  if (!resultat.enregistree) return;

  const { data: posee, error } = await supabase
    .from("restaurant_reservations")
    .update({
      caution_statut: "enregistree",
      caution_enregistree_le: new Date().toISOString(),
      stripe_customer_id: resultat.customerId,
      stripe_payment_method_id: resultat.carteId,
      statut: "confirmee",
      option_expire_le: null,
    })
    .eq("id", resa.id)
    .eq("caution_statut", "attendue")
    .select("id")
    .maybeSingle();
  if (error) console.error("[stripe webhook] caution", error);
  if (!posee) return;

  await prevenirCautionDeposee(supabase, resa);
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
  const { data: reglee, error } = await supabase
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
    .eq("acompte_statut", "attendu")
    // Ce qui revient dit si la ligne a bougé : un événement rejoué ne
    // renverra rien, et ne préviendra donc pas une seconde fois.
    .select("id, restaurant_id, client_nom, acompte_centimes")
    .maybeSingle();
  if (error) console.error("[stripe webhook] acompte", error);

  if (reglee) {
    const resa = reglee as {
      id: string;
      restaurant_id: string;
      client_nom: string | null;
      acompte_centimes: number | null;
    };
    await prevenirAcompteRegle(supabase, resa);
  }

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

  // Ou un bon cadeau. Même garde : il ne passe « valide » qu'une fois, et
  // c'est ce passage-là qui envoie le bon et prévient la maison.
  await validerBon(supabase, token, paymentIntentId);
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

/**
 * Retrouve l'établissement derrière une facture.
 *
 * Les factures de Stripe ne portent pas nos étiquettes : elles pendent au
 * client, pas à l'abonnement. On remonte donc par le client, que toutes
 * les lignes d'un établissement partagent.
 */
async function facturePrevenue(
  facture: Stripe.Invoice,
  authentification: boolean,
): Promise<void> {
  const client = facture.customer;
  if (typeof client !== "string") return;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_subscriptions")
    .select("restaurant_id")
    .eq("stripe_customer_id", client)
    .limit(1)
    .maybeSingle();

  const restaurantId = (data as { restaurant_id: string } | null)
    ?.restaurant_id;
  if (!restaurantId) {
    console.error("[stripe webhook] facture sans établissement", facture.id);
    return;
  }

  await prevenirFactureEnAttente(
    supabase,
    restaurantId,
    facture.amount_due ?? 0,
    authentification,
  );
  await annoncerImpaye(
    supabase,
    restaurantId,
    facture.amount_due ?? 0,
    authentification,
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "signature manquante" },
      {
        status: 400,
      },
    );
  }

  let event: Stripe.Event;
  try {
    event = verifier(body, signature);
  } catch (err) {
    console.error("[stripe webhook] signature invalide", err);
    return NextResponse.json(
      { error: "signature invalide" },
      {
        status: 400,
      },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // C'est la séance elle-même qui dit ce qu'elle est, et non
      // l'enveloppe qui la porte.
      //
      // On se fiait à `event.account`, renseigné pour un compte connecté.
      // Accounts v2 a changé l'acheminement de ces événements, et un
      // abonnement Klarr pouvait se retrouver traité comme un acompte : la
      // fonction n'y trouvait pas de jeton et s'arrêtait sans rien écrire
      // ni rien dire. Un paiement réussi, une base vide, aucune erreur.
      //
      // Un acompte porte son jeton dans la métadonnée ; un abonnement
      // porte un `subscription`. Ces deux marques-là sont posées par notre
      // propre code : elles ne bougeront pas sous nos pieds.
      if (session.metadata?.klarr_token) {
        // Deux formes de garantie, deux modes de séance : un acompte se
        // paie, une caution ne fait qu'empreindre la carte.
        if (session.mode === "setup") {
          await enregistrerCaution(session);
        } else {
          await enregistrerAcompte(session);
        }
      } else if (session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string,
        );
        await upsertSubscription(subscription);

        // On annonce depuis la séance de paiement, et non depuis la mise
        // à jour d'abonnement : celle-ci se déclenche à chaque
        // renouvellement et à chaque changement de carte. Ici, on ne
        // passe qu'une fois.
        const nouveau = subscription.metadata.restaurant_id;
        if (nouveau) {
          await annoncerAbonnement(
            createServiceClient(),
            nouveau,
            subscription.metadata.module,
          );
        }
      } else {
        console.error(
          "[stripe webhook] séance sans jeton ni abonnement",
          session.id,
        );
      }
      break;
    }
    // Un prélèvement qui n'aboutit pas ne se voit nulle part : l'abonnement
    // reste « actif » pendant les relances. On prévient donc tout de suite,
    // pendant qu'il est encore temps d'agir.
    case "invoice.payment_action_required":
    case "invoice.payment_failed": {
      await facturePrevenue(
        event.data.object as Stripe.Invoice,
        event.type === "invoice.payment_action_required",
      );
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);

      const concerne = subscription.metadata.restaurant_id;
      if (concerne) {
        const supabase = createServiceClient();
        if (event.type === "customer.subscription.deleted") {
          await annoncerFinAbonnement(supabase, concerne);
        } else if (
          subscription.cancel_at_period_end &&
          // « previous_attributes » ne porte que ce qui vient de changer :
          // sans ce garde-fou, chaque mise à jour ultérieure d'un
          // abonnement déjà résilié rejouerait l'alerte.
          "cancel_at_period_end" in (event.data.previous_attributes ?? {})
        ) {
          const fin = subscription.items.data[0]?.current_period_end;
          await annoncerResiliation(
            supabase,
            concerne,
            fin ? new Date(fin * 1000).toISOString() : null,
          );
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
