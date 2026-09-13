import type { Espace } from "@/types/reservation";

export type ModeAcompte = "forfait" | "par_couvert";
export type StatutAcompte = "non_requis" | "attendu" | "paye" | "rembourse";

/**
 * Ce que doit le client pour cette réservation, en centimes.
 *
 * Zéro plutôt que null quand rien n'est dû : le reste du code n'a alors qu'un
 * seul cas à traiter, « le montant est-il supérieur à zéro ». Un acompte ne
 * se demande que sur une privatisation — une table de deux ne bloque pas une
 * salle, lui réclamer une garantie ferait fuir sans rien protéger.
 */
export function montantAcompte(
  espace: Pick<Espace, "acompte_centimes" | "acompte_mode">,
  type: "table" | "privatisation",
  couverts: number,
): number {
  if (type !== "privatisation") return 0;
  const base = espace.acompte_centimes;
  if (!base || base <= 0) return 0;
  if (espace.acompte_mode === "par_couvert") {
    if (couverts <= 0) return 0;
    return base * couverts;
  }
  return base;
}

/** « 1 250,00 € ». Le format français, pas celui de Stripe. */
export function formatEuros(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centimes / 100);
}

/**
 * Ce que le restaurateur lit à côté d'une réservation. Un acompte attendu
 * n'est pas un acompte perçu : la nuance décide s'il garde la salle bloquée.
 */
export function libelleAcompte(
  statut: StatutAcompte,
  centimes: number | null,
): string | null {
  if (statut === "non_requis" || !centimes) return null;
  const somme = formatEuros(centimes);
  if (statut === "paye") return `Acompte de ${somme} encaissé`;
  if (statut === "rembourse") return `Acompte de ${somme} remboursé`;
  return `Acompte de ${somme} en attente`;
}

/**
 * Ce qu'on annonce au client sur la page de paiement. Le montant se dit une
 * fois, en toutes lettres du prix : personne ne doit découvrir la somme à
 * l'écran suivant.
 */
export function resumePourClient(
  espace: { nom: string },
  couverts: number,
  centimes: number,
): string {
  return `Acompte pour la privatisation de ${espace.nom} — ${couverts} couverts : ${formatEuros(centimes)}`;
}

/** Longueur du jeton de paiement, en octets avant encodage. */
export const OCTETS_JETON = 32;
