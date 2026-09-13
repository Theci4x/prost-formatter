import Stripe from "stripe";

let stripeClient: Stripe | undefined;

// Initialisation paresseuse : évite d'échouer au build (ou sur toute autre
// route) tant que STRIPE_SECRET_KEY n'est pas configurée.
export function getStripe() {
  if (!stripeClient) {
    // Adresse de l'API surchargeable pour les tests de bout en bout, qui
    // font tourner un faux Stripe en local. Absente en production, où le SDK
    // vise api.stripe.com — on ne teste pas des paiements réels.
    const base = process.env.KLARR_STRIPE_API_BASE;
    stripeClient = new Stripe(
      process.env.STRIPE_SECRET_KEY!,
      base
        ? {
            host: new URL(base).hostname,
            port: Number(new URL(base).port),
            protocol: new URL(base).protocol.replace(":", "") as "http",
          }
        : undefined,
    );
  }
  return stripeClient;
}
