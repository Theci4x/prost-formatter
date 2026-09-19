import "server-only";
import { PACK, type Achat } from "@/lib/abonnement/modules";

/**
 * Le tarif Stripe de chaque achat possible, et la TVA qui s'y attache.
 *
 * Partagé entre la souscription et la bascule vers le pack : deux chemins
 * qui doivent nommer les mêmes tarifs, sous peine de vendre le pack au
 * prix d'un module le jour où l'un des deux est mis à jour et pas l'autre.
 *
 * `STRIPE_PRICE_ID` couvre la visibilité et reste lu tel quel, pour ne pas
 * casser une configuration déjà en place.
 */
export function tarif(requis: Achat): string | undefined {
  if (requis === PACK) return process.env.STRIPE_PRICE_ID_PACK;
  return requis === "reservations"
    ? process.env.STRIPE_PRICE_ID_RESERVATIONS
    : (process.env.STRIPE_PRICE_ID_VISIBILITE ?? process.env.STRIPE_PRICE_ID);
}

/**
 * Le taux de TVA appliqué aux abonnements.
 *
 * Sans lui, Stripe encaisse exactement le montant du tarif : 29 € perçus
 * dont 4,83 € dus au fisc, un cinquième de la marge perdu sans s'en
 * apercevoir. Avec lui, la facture affiche « 29,00 € + 5,80 € = 34,80 € »,
 * ce que des clients professionnels attendent pour la récupérer.
 *
 * Optionnel : sans la variable, on retombe sur l'ancien comportement, et
 * les tarifs doivent alors être saisis toutes taxes comprises.
 */
export function tauxTva(): string[] | undefined {
  const taux = process.env.STRIPE_TAX_RATE_ID?.trim();
  return taux ? [taux] : undefined;
}
