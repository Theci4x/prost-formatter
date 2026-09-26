import {
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";

/**
 * Les prix des modules, écrits à la manière de chaque langue.
 *
 * `modules.ts` les donne en français (« 29 € HT / mois »). Les pages
 * publiques en anglais et en chinois les déduisent d'ici plutôt que de les
 * recopier : un prix écrit à la main dans trois langues finit faux dans
 * deux le jour où il change.
 */
function nombre(prixFrancais: string): number {
  return Number.parseFloat(prixFrancais.replace(",", "."));
}

function euros(prixFrancais: string, etiquette: string): string {
  const valeur = nombre(prixFrancais);
  return new Intl.NumberFormat(etiquette, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(valeur) ? 0 : 2,
  }).format(valeur);
}

function prixPour(etiquette: string) {
  return {
    reservations: euros(PRIX_MODULE.reservations, etiquette),
    reservationsTTC: euros(PRIX_MODULE_TTC.reservations, etiquette),
    visibilite: euros(PRIX_MODULE.visibilite, etiquette),
    visibiliteTTC: euros(PRIX_MODULE_TTC.visibilite, etiquette),
    pack: euros(PRIX_PACK, etiquette),
    packTTC: euros(PRIX_PACK_TTC, etiquette),
  };
}

/** « €29 », « €37.50 »… */
export const PRIX_EN = prixPour("en-GB");
/** « €29.00 » selon la locale chinoise, « €37.50 »… */
export const PRIX_ZH = prixPour("zh-CN");
