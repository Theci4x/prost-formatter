import { getStripe } from "./client";
import { siteUrl } from "@/lib/site-url";

/**
 * Le paiement d'un acompte, créé SUR le compte du restaurateur.
 *
 * L'en-tête `stripeAccount` fait toute la différence : la somme apparaît dans
 * son tableau de bord, part sur son compte bancaire, et c'est lui qui
 * rembourse s'il le décide. Klarr ne prélève aucun frais d'application —
 * l'absence de `application_fee_amount` n'est pas un oubli, c'est la promesse
 * commerciale écrite dans le code.
 */
export async function creerPaiementAcompte({
  compteStripe,
  token,
  intitule,
  centimes,
  emailClient,
  reservationId,
}: {
  compteStripe: string;
  token: string;
  intitule: string;
  centimes: number;
  emailClient: string | null;
  reservationId: string;
}): Promise<{ url: string; sessionId: string }> {
  const site = siteUrl();
  const session = await getStripe().checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: centimes,
            product_data: { name: intitule },
          },
        },
      ],
      // Le client revient chez nous, pas chez Stripe : c'est là qu'on vérifie
      // le paiement et qu'on le lui confirme.
      success_url: `${site}/paiement/${token}?retour=1`,
      cancel_url: `${site}/paiement/${token}?annule=1`,
      ...(emailClient && emailClient !== "—"
        ? { customer_email: emailClient }
        : {}),
      // Recopiée sur le paiement : le restaurateur retrouve la réservation
      // depuis son tableau de bord Stripe, sans nous demander.
      metadata: { reservation_id: reservationId, klarr_token: token },
      payment_intent_data: {
        metadata: { reservation_id: reservationId, klarr_token: token },
      },
    },
    { stripeAccount: compteStripe },
  );

  if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL de paiement");
  return { url: session.url, sessionId: session.id };
}

/**
 * L'état réel d'un paiement, relu chez Stripe. Le retour du client sur notre
 * page ne prouve rien : il peut la rouvrir, la partager, ou l'atteindre sans
 * avoir payé. Seule la réponse de Stripe fait foi.
 */
export async function paiementAbouti(
  compteStripe: string,
  sessionId: string,
  token: string,
): Promise<{ paye: boolean; paymentIntentId: string | null }> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(
      sessionId,
      {},
      { stripeAccount: compteStripe },
    );

    // Le jeton est revérifié : une session appartenant à une autre
    // réservation ne doit jamais valider celle-ci.
    if (session.metadata?.klarr_token !== token) {
      console.error("[paiementAbouti] session étrangère", sessionId);
      return { paye: false, paymentIntentId: null };
    }
    if (session.payment_status !== "paid") {
      return { paye: false, paymentIntentId: null };
    }
    return {
      paye: true,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
    };
  } catch (erreur) {
    console.error("[paiementAbouti]", erreur);
    return { paye: false, paymentIntentId: null };
  }
}
