import Stripe from "stripe";

let stripeClient: Stripe | undefined;

// Initialisation paresseuse : évite d'échouer au build (ou sur toute autre
// route) tant que STRIPE_SECRET_KEY n'est pas configurée.
export function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}
