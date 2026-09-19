import "server-only";
import { getStripe } from "@/lib/stripe/client";

/**
 * La facture qui attend son règlement, s'il y en a une.
 *
 * En Europe, un prélèvement hors session est souvent refusé tant que le
 * porteur de la carte n'a pas confirmé auprès de sa banque. Stripe laisse
 * alors la facture ouverte et envoie un courriel — que le restaurateur
 * rate, ou prend pour du démarchage. De notre côté l'abonnement reste
 * « actif » et l'écran n'annonce rien : le module tourne, puis se ferme
 * quelques jours plus tard sans que personne ait compris pourquoi.
 *
 * On va donc chercher l'information là où elle est, et on la met sous ses
 * yeux à l'endroit où il peut agir.
 */
export type FactureEnAttente = {
  montant: string;
  /** La page hébergée par Stripe où la régler en un clic. */
  url: string;
  /** Vrai quand la banque réclame une authentification, pas un paiement. */
  authentification: boolean;
};

export async function factureEnAttente(
  clientStripe: string,
): Promise<FactureEnAttente | null> {
  try {
    const factures = await getStripe().invoices.list({
      customer: clientStripe,
      status: "open",
      limit: 1,
    });

    const facture = factures.data[0];
    if (!facture?.hosted_invoice_url) return null;

    return {
      montant: new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: (facture.currency ?? "eur").toUpperCase(),
      }).format((facture.amount_due ?? 0) / 100),
      url: facture.hosted_invoice_url,
      // Stripe range là le motif du dernier refus. « authentification
      // requise » n'est pas un incident de paiement : la carte est bonne,
      // il manque seulement un geste du client — et le lui dire ainsi
      // évite qu'il appelle sa banque pour rien.
      authentification:
        facture.last_finalization_error?.code === "authentication_required",
    };
  } catch (erreur) {
    // Une panne côté Stripe ne doit pas emporter la page d'abonnement :
    // sans ce filet, un incident chez eux rendrait l'écran inaccessible
    // au moment précis où le restaurateur veut payer.
    console.error("[stripe/factures]", clientStripe, erreur);
    return null;
  }
}
