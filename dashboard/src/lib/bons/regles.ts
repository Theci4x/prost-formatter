import type { Langue } from "@/lib/i18n/langues";

/**
 * Les règles d'un bon cadeau, sans base ni réseau.
 */

/** Les bornes d'un montant libre, en centimes. */
export const MONTANT_MIN = 2000;
export const MONTANT_MAX = 50000;

/** Les montants proposés si la maison n'a rien choisi. */
export const MONTANTS_PAR_DEFAUT = [5000, 8000, 10000];

export const VALIDITES = [6, 12, 24] as const;

/**
 * Pas de 0, O, 1, I ni L : un code se lit à voix haute au comptoir et se
 * recopie à la main. Trente et un signes sur huit places, c'est près de
 * mille milliards de codes — assez pour qu'on ne tombe pas sur un bon en
 * essayant au hasard.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function genererCode(aleatoire: Uint8Array): string {
  if (aleatoire.length < 8) throw new Error("8 octets au moins");
  const signes = Array.from(aleatoire.slice(0, 8), (octet) =>
    ALPHABET.charAt(octet % ALPHABET.length),
  ).join("");
  return `${signes.slice(0, 4)}-${signes.slice(4)}`;
}

/** Ce qu'on tape en caisse, remis dans la forme du code. */
export function normaliserCode(saisie: string): string {
  const brut = saisie.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return brut.length === 8 ? `${brut.slice(0, 4)}-${brut.slice(4)}` : brut;
}

/** « 50, 80, 100 » → [5000, 8000, 10000], triés, sans doublon ni hors-borne. */
export function lireMontants(saisie: string): number[] {
  const valeurs = saisie
    .split(/[,;\s]+/)
    .map((morceau) => Number.parseFloat(morceau.replace(",", ".")))
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.round(v * 100))
    .filter((c) => c >= MONTANT_MIN && c <= MONTANT_MAX);
  return [...new Set(valeurs)].sort((a, b) => a - b).slice(0, 6);
}

/** Un montant libre, saisi en euros, ou null s'il sort des bornes. */
export function lireMontantLibre(saisie: string): number | null {
  const v = Number.parseFloat(saisie.replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(v)) return null;
  const centimes = Math.round(v * 100);
  return centimes >= MONTANT_MIN && centimes <= MONTANT_MAX ? centimes : null;
}

const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

/** « 80 € », « €80 », « €80 » — sans « ,00 » quand le compte est rond. */
export function prixBon(centimes: number, langue: Langue = "fr"): string {
  return new Intl.NumberFormat(LOCALE[langue] ?? LOCALE.fr, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(centimes / 100);
}

/** L'échéance : aujourd'hui (à Paris) plus la validité, au format ISO. */
export function echeance(maintenant: Date, mois: number): string {
  const jour = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(maintenant);
  const [a, m, j] = jour.split("-").map(Number);
  const cible = new Date(Date.UTC(a, m - 1 + mois, 1));
  // Le 31 août plus six mois tombe le 28 février, pas le 3 mars.
  const dernier = new Date(
    Date.UTC(cible.getUTCFullYear(), cible.getUTCMonth() + 1, 0),
  ).getUTCDate();
  cible.setUTCDate(Math.min(j, dernier));
  return cible.toISOString().slice(0, 10);
}

export type EtatBon = "attente" | "valide" | "epuise" | "expire" | "annule";

export function etatDuBon(
  bon: {
    statut: string;
    solde_centimes: number;
    expire_le: string | null;
  },
  aujourdhui: string,
): EtatBon {
  if (bon.statut === "annule") return "annule";
  if (bon.statut === "attente") return "attente";
  if (bon.solde_centimes <= 0) return "epuise";
  if (bon.expire_le && bon.expire_le < aujourdhui) return "expire";
  return "valide";
}
