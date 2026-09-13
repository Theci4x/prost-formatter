import type { Espace } from "@/types/reservation";
import { formatEuros } from "./acompte";

export type StatutCaution =
  | "non_requise"
  | "attendue"
  | "enregistree"
  | "debitee"
  | "liberee";

/**
 * Le plafond que le restaurateur pourra débiter en cas de défection. Comme
 * l'acompte, il ne s'applique qu'à une privatisation : demander une carte en
 * garantie pour une table de deux ferait fuir sans rien protéger.
 */
export function montantCaution(
  espace: Pick<Espace, "caution_centimes">,
  type: "table" | "privatisation",
): number {
  if (type !== "privatisation") return 0;
  const plafond = espace.caution_centimes;
  return plafond && plafond > 0 ? plafond : 0;
}

/**
 * Ce que le restaurateur peut réellement prélever. Débiter au-delà du montant
 * annoncé au client serait un prélèvement non consenti : le plafond est donc
 * appliqué ici, pas seulement affiché dans le formulaire.
 */
export function montantDebitable(
  demande: number,
  plafond: number,
): { centimes: number; erreur: string | null } {
  if (!Number.isInteger(demande) || demande <= 0) {
    return { centimes: 0, erreur: "Indique un montant à débiter." };
  }
  if (demande > plafond) {
    return {
      centimes: 0,
      erreur: `Tu ne peux pas débiter plus que la caution annoncée au client (${formatEuros(plafond)}).`,
    };
  }
  return { centimes: demande, erreur: null };
}

/** Ce que lit le restaurateur à côté de la réservation. */
export function libelleCaution(
  statut: StatutCaution,
  plafond: number | null,
  debite: number | null,
): string | null {
  if (statut === "non_requise" || !plafond) return null;
  const somme = formatEuros(plafond);
  switch (statut) {
    case "attendue":
      return `Caution de ${somme} — carte pas encore enregistrée`;
    case "enregistree":
      return `Carte enregistrée, jusqu'à ${somme} débitables`;
    case "debitee":
      return `${formatEuros(debite ?? 0)} débités sur la caution`;
    case "liberee":
      return `Caution de ${somme} libérée, rien n'a été prélevé`;
  }
}

/**
 * Ce qu'on promet au client avant qu'il donne sa carte. La phrase est écrite
 * ici plutôt que dans la page : c'est un engagement, et il doit dire la même
 * chose partout où il apparaît.
 */
export function engagementClient(
  nomRestaurant: string,
  plafond: number,
): string {
  return `${nomRestaurant} n'encaisse rien aujourd'hui. Votre carte est enregistrée en garantie : elle ne sera débitée, jusqu'à ${formatEuros(plafond)}, qu'en cas d'annulation tardive ou si vous ne venez pas.`;
}
