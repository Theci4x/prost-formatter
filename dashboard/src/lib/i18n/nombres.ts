import type { Langue } from "@/lib/i18n/langue";

/**
 * Les nombres, dans la langue du lecteur.
 *
 * Mille cinq cents s'écrit « 1 500 » en français et « 1,500 » en
 * anglais : le séparateur de l'un est le décimal de l'autre, et se
 * tromper ne rend pas la phrase bancale, ça la rend fausse. « 1,500 € »
 * lu par un Français, c'est un euro cinquante.
 *
 * Le chinois groupe comme l'anglais ; on lui donne quand même sa locale
 * plutôt que de supposer, parce que ce genre de supposition finit
 * toujours par être démentie par un cas particulier.
 *
 * Les montants de devis n'entrent pas ici : un devis est un document
 * français, opposable, et il s'écrit en français quoi qu'affiche
 * l'interface. Voir `lib/devis/calcul.ts`.
 */

const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

export function nombreLisible(
  valeur: number,
  langue: Langue,
  options?: Intl.NumberFormatOptions,
): string {
  return valeur.toLocaleString(LOCALE[langue] ?? LOCALE.fr, options);
}

/**
 * Un montant tiré de centimes, sans le symbole — c'est le dictionnaire
 * qui le place, parce qu'il ne se met pas au même endroit selon la
 * langue.
 *
 * Les centimes ne s'affichent que s'il y en a : « 500 » et non
 * « 500,00 », mais « 12,50 » reste entier.
 */
export function montantLisible(centimes: number, langue: Langue): string {
  return nombreLisible(centimes / 100, langue, {
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Une somme en euros, symbole compris.
 *
 * Contrairement à `montantLisible`, c'est `Intl` qui place le symbole :
 * le français l'écrit après (« 12,00 € »), l'anglais et le chinois avant
 * (« €12.00 »). Poser le « € » à la main donnait des prix qui se lisent
 * comme une traduction ratée.
 *
 * `formatEuros` reste pour les devis, qui sont des pièces françaises et
 * n'ont donc rien à traduire.
 */
export function sommeEuros(centimes: number, langue: Langue): string {
  return new Intl.NumberFormat(LOCALE[langue] ?? LOCALE.fr, {
    style: "currency",
    currency: "EUR",
  }).format(centimes / 100);
}
