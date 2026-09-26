import { getStripe } from "./client";
import { siteUrl } from "@/lib/site-url";

/**
 * La caution : une carte enregistrée, jamais débitée d'office.
 *
 * Stripe appelle ça un SetupIntent. Rien n'est prélevé, rien n'est bloqué sur
 * le compte du client — sa banque lui demande simplement d'autoriser
 * l'enregistrement. C'est ce qui permet de réserver des mois à l'avance :
 * une autorisation bancaire classique, elle, tombe au bout de quelques jours.
 *
 * Tout se passe sur le compte du restaurateur. Aucune donnée de carte ne
 * transite par Klarr.
 */

export async function demanderCaution({
  compteStripe,
  token,
  nomClient,
  emailClient,
  reservationId,
}: {
  compteStripe: string;
  token: string;
  nomClient: string;
  emailClient: string | null;
  reservationId: string;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  const site = siteUrl();

  // Le client est créé explicitement plutôt que laissé à Checkout : la carte
  // doit être rattachée à quelqu'un pour être débitable plus tard, et on veut
  // savoir à qui sans avoir à le deviner.
  const client = await stripe.customers.create(
    {
      name: nomClient,
      ...(emailClient && emailClient !== "—" ? { email: emailClient } : {}),
      metadata: { reservation_id: reservationId, klarr_token: token },
    },
    { stripeAccount: compteStripe },
  );

  const session = await stripe.checkout.sessions.create(
    {
      mode: "setup",
      customer: client.id,
      currency: "eur",
      success_url: `${site}/paiement/${token}?retour=1`,
      cancel_url: `${site}/paiement/${token}?annule=1`,
      metadata: { reservation_id: reservationId, klarr_token: token },
      setup_intent_data: {
        metadata: { reservation_id: reservationId, klarr_token: token },
      },
    },
    { stripeAccount: compteStripe },
  );

  if (!session.url) throw new Error("Stripe n'a pas renvoyé d'URL");
  return { url: session.url, sessionId: session.id };
}

/** La carte a-t-elle bien été enregistrée ? Relu chez Stripe, jamais déduit. */
export async function cautionEnregistree(
  compteStripe: string,
  sessionId: string,
  token: string,
): Promise<{ enregistree: boolean; customerId: string | null; carteId: string | null }> {
  const vide = { enregistree: false, customerId: null, carteId: null };
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      {},
      { stripeAccount: compteStripe },
    );
    if (session.metadata?.klarr_token !== token) {
      console.error("[cautionEnregistree] session étrangère", sessionId);
      return vide;
    }
    if (!session.setup_intent) return vide;

    const intention = await stripe.setupIntents.retrieve(
      typeof session.setup_intent === "string"
        ? session.setup_intent
        : session.setup_intent.id,
      {},
      { stripeAccount: compteStripe },
    );
    if (intention.status !== "succeeded" || !intention.payment_method) {
      return vide;
    }

    return {
      enregistree: true,
      customerId:
        typeof session.customer === "string"
          ? session.customer
          : (session.customer?.id ?? null),
      carteId:
        typeof intention.payment_method === "string"
          ? intention.payment_method
          : intention.payment_method.id,
    };
  } catch (erreur) {
    console.error("[cautionEnregistree]", erreur);
    return vide;
  }
}

export type ResultatDebit =
  | { ok: true; paymentIntentId: string }
  | { ok: false; message: string };

/**
 * Débite la caution. Le client n'est pas devant son écran : sa banque peut
 * exiger qu'il authentifie le paiement, et le refuser en son absence. Ce
 * n'est pas un cas rare qu'on peut balayer — le restaurateur doit alors
 * reprendre contact, et le lui dire vaut mieux qu'un « échec » sans suite.
 */
export async function debiterCaution({
  compteStripe,
  customerId,
  carteId,
  centimes,
  intitule,
  reservationId,
}: {
  compteStripe: string;
  customerId: string;
  carteId: string;
  centimes: number;
  intitule: string;
  reservationId: string;
}): Promise<ResultatDebit> {
  try {
    const paiement = await getStripe().paymentIntents.create(
      {
        amount: centimes,
        currency: "eur",
        customer: customerId,
        payment_method: carteId,
        off_session: true,
        confirm: true,
        description: intitule,
        metadata: { reservation_id: reservationId },
      },
      { stripeAccount: compteStripe },
    );

    if (paiement.status === "succeeded") {
      return { ok: true, paymentIntentId: paiement.id };
    }
    return {
      ok: false,
      message:
        "La banque du client demande son accord pour ce prélèvement. Contacte-le : le débit ne peut pas se faire sans lui.",
    };
  } catch (erreur) {
    console.error("[debiterCaution]", erreur);
    const message =
      erreur && typeof erreur === "object" && "code" in erreur
        ? String((erreur as { code?: string }).code)
        : "";
    if (message === "authentication_required") {
      return {
        ok: false,
        message:
          "La banque du client demande son accord pour ce prélèvement. Contacte-le : le débit ne peut pas se faire sans lui.",
      };
    }
    if (message === "card_declined" || message === "insufficient_funds") {
      return {
        ok: false,
        message:
          "La carte a été refusée. Contacte le client : rien n'a été prélevé.",
      };
    }
    return {
      ok: false,
      message: "Le prélèvement a échoué. Rien n'a été débité.",
    };
  }
}
