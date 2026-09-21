import type { Langue } from "@/lib/i18n/langues";
import {
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";

/**
 * Ce qu'une commission au couvert coûte sur l'année, et ce qu'on y gagne
 * — ou pas — en passant à l'abonnement.
 *
 * **Ce calculateur doit pouvoir conclure contre nous.** C'est la seule
 * chose qui le rende utile. Un outil vendu par l'éditeur de l'abonnement
 * et qui répond « prenez l'abonnement » quels que soient les chiffres ne
 * convainc personne et se retourne contre nous : le restaurateur qui
 * refait le calcul chez lui découvre qu'on l'a mené, et il ne revient
 * pas. L'article « Réservations sans commission » le dit déjà en toutes
 * lettres ; ce fichier applique la même règle en code.
 *
 * D'où la variable qui compte, et qu'aucun comparateur d'éditeur ne pose
 * jamais : **la part des couverts qui seraient venus sans la
 * plateforme**. Une commission payée sur un habitué finance une
 * visibilité déjà acquise. Une commission payée sur un inconnu est un
 * coût d'acquisition, et il est peut-être justifié. Sans cette question,
 * le calcul est un argumentaire ; avec elle, c'est une décision.
 *
 * Les prix viennent de `modules.ts`, jamais recopiés : le jour où
 * l'abonnement bouge, ce calcul bouge avec lui.
 */

function nombre(prixFrancais: string): number {
  return Number.parseFloat(prixFrancais.replace(",", "."));
}

export const ABONNEMENT = {
  reservationsHT: nombre(PRIX_MODULE.reservations),
  reservationsTTC: nombre(PRIX_MODULE_TTC.reservations),
  packHT: nombre(PRIX_PACK),
  packTTC: nombre(PRIX_PACK_TTC),
};

/**
 * Les bornes de la fourchette constatée, relevées sur les pages
 * publiques des éditeurs et citées dans le journal. Elles servent de
 * valeur par défaut, pas de vérité : les tarifs se négocient et changent,
 * et le champ reste modifiable.
 */
export const COMMISSION_DEFAUT = 2;
export const COMMISSION_MIN = 0.5;
export const COMMISSION_MAX = 10;

export type Saisie = {
  /** Couverts réservés via la plateforme, par mois. */
  couvertsPlateforme: number;
  /** Ce que la plateforme prend par couvert, en euros. */
  commissionParCouvert: number;
  /** Part de ces couverts qui seraient venus sans elle, de 0 à 100. */
  partDejaAcquise: number;
};

export type Resultat = {
  commissionMois: number;
  commissionAn: number;
  /** La part de la commission payée sur des clients déjà à vous. */
  gaspillageAn: number;
  /** La part qui achète une vraie découverte. */
  acquisitionAn: number;
  abonnementAn: number;
  /** Positif : l'abonnement coûte moins cher. Négatif : l'inverse. */
  ecartAn: number;
  /**
   * Le nombre de couverts mensuels à partir duquel l'abonnement devient
   * moins cher que la commission. En dessous, la plateforme est le bon
   * calcul, et on le dit.
   */
  seuilCouverts: number;
};

export const SAISIE_DEFAUT: Saisie = {
  couvertsPlateforme: 150,
  commissionParCouvert: COMMISSION_DEFAUT,
  partDejaAcquise: 50,
};

function borner(valeur: number, min: number, max: number): number {
  return Math.min(Math.max(valeur, min), max);
}

/** Un champ de formulaire, ramené à un nombre utilisable. */
export function lireNombre(
  brut: string | string[] | undefined,
  defaut: number,
  min: number,
  max: number,
): number {
  const texte = Array.isArray(brut) ? brut[0] : brut;
  if (!texte) return defaut;
  const valeur = Number.parseFloat(texte.replace(",", "."));
  if (!Number.isFinite(valeur)) return defaut;
  return borner(valeur, min, max);
}

export function lireSaisie(query: {
  couverts?: string | string[];
  commission?: string | string[];
  acquis?: string | string[];
}): Saisie {
  return {
    couvertsPlateforme: Math.round(
      lireNombre(query.couverts, SAISIE_DEFAUT.couvertsPlateforme, 0, 100000),
    ),
    commissionParCouvert: lireNombre(
      query.commission,
      SAISIE_DEFAUT.commissionParCouvert,
      COMMISSION_MIN,
      COMMISSION_MAX,
    ),
    partDejaAcquise: Math.round(
      lireNombre(query.acquis, SAISIE_DEFAUT.partDejaAcquise, 0, 100),
    ),
  };
}

export function calculer(saisie: Saisie): Resultat {
  const commissionMois =
    saisie.couvertsPlateforme * saisie.commissionParCouvert;
  const commissionAn = commissionMois * 12;
  const gaspillageAn = commissionAn * (saisie.partDejaAcquise / 100);
  const abonnementAn = ABONNEMENT.reservationsHT * 12;

  // Le seuil se lit en couverts parce que c'est la grandeur que le
  // restaurateur connaît de tête. Une commission nulle n'a pas de seuil :
  // rien ne devient jamais moins cher que gratuit.
  const seuilCouverts =
    saisie.commissionParCouvert > 0
      ? Math.ceil(ABONNEMENT.reservationsHT / saisie.commissionParCouvert)
      : Number.POSITIVE_INFINITY;

  return {
    commissionMois,
    commissionAn,
    gaspillageAn,
    acquisitionAn: commissionAn - gaspillageAn,
    abonnementAn,
    ecartAn: commissionAn - abonnementAn,
    seuilCouverts,
  };
}

export type Verdict = "abonnement" | "commission" | "limite";

/**
 * La conclusion, et elle n'est pas toujours la nôtre.
 *
 * « limite » existe parce que l'écart peut être réel mais trop faible
 * pour justifier de changer d'outil : annoncer « vous économisez 40 € par
 * an » comme une victoire ferait sourire, et à juste titre. On préfère le
 * dire.
 */
export function verdict(resultat: Resultat): Verdict {
  if (resultat.ecartAn <= 0) return "commission";
  if (resultat.ecartAn < resultat.abonnementAn / 2) return "limite";
  return "abonnement";
}

/**
 * Les montants dans la langue du lecteur — mais toujours en euros.
 *
 * On traduit la mise en forme, jamais la monnaie : « 1 800 € », « €1,800 »
 * et « €1,800 » désignent la même somme, et c'est bien celle que le
 * restaurateur paiera. Convertir en livres ou en yuans donnerait un
 * chiffre faux le lendemain et une facture qui ne correspond à rien.
 */
const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

export function euros(valeur: number, langue: Langue = "fr"): string {
  return new Intl.NumberFormat(LOCALE[langue] ?? "fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(valeur);
}
