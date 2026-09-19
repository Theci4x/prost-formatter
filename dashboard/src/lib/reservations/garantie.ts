import type { Espace } from "@/types/reservation";
import { montantAcompte } from "@/lib/reservations/acompte";
import { montantCaution } from "@/lib/reservations/caution";

/**
 * Rien n'est ferme tant que l'argent n'est pas posé.
 *
 * Jusqu'ici, accepter une demande la confirmait sur-le-champ : la salle
 * était bloquée pour un groupe qui n'avait rien versé, et le restaurateur
 * refusait les autres. Le client, lui, ne risquait rien à ne pas donner
 * suite — c'est exactement ce que Privateaser a réglé en premier.
 *
 * Désormais, une privatisation qui demande un acompte ou une empreinte de
 * carte reste une option jusqu'au paiement. La salle est tenue le temps du
 * délai, puis rendue d'elle-même si rien ne vient.
 *
 * Les tables ordinaires ne sont pas concernées : ni acompte ni caution ne
 * s'y appliquent, et réclamer une carte pour deux couverts ferait fuir tout
 * le monde.
 */

/**
 * Le temps laissé au client pour poser sa garantie. Deux jours : assez pour
 * qu'un groupe se concerte et qu'une carte d'entreprise soit trouvée, assez
 * peu pour qu'un samedi soir ne reste pas bloqué une semaine.
 */
export const DELAI_PAIEMENT_HEURES = 48;

export type Garantie = {
  acompteCentimes: number;
  cautionCentimes: number;
  /** Vrai si l'établissement attend quelque chose avant de s'engager. */
  exigee: boolean;
};

export function garantieRequise(
  espace: Pick<
    Espace,
    | "acompte_centimes"
    | "acompte_mode"
    | "caution_centimes"
    | "caution_mode"
    | "garantie_seuil_couverts"
  >,
  type: "table" | "privatisation",
  couverts: number,
): Garantie {
  // En dessous du seuil, on ne demande rien. Réclamer une empreinte de carte
  // à six personnes qui privatisent la petite salle un mardi soir coûte plus
  // de réservations que ça n'en sécurise.
  const seuil = espace.garantie_seuil_couverts;
  if (seuil && couverts < seuil) {
    return { acompteCentimes: 0, cautionCentimes: 0, exigee: false };
  }

  const acompteCentimes = montantAcompte(espace, type, couverts);
  // L'acompte l'emporte : réclamer les deux au même client reviendrait à lui
  // demander de payer deux fois pour la même soirée.
  const cautionCentimes =
    acompteCentimes > 0 ? 0 : montantCaution(espace, type, couverts);
  return {
    acompteCentimes,
    cautionCentimes,
    exigee: acompteCentimes > 0 || cautionCentimes > 0,
  };
}

/** L'instant où l'option prise en acceptant s'éteint faute de paiement. */
export function echeancePaiement(maintenant: Date): Date {
  return new Date(maintenant.getTime() + DELAI_PAIEMENT_HEURES * 3600 * 1000);
}

type Etat = {
  statut: string;
  acompte_statut?: string | null;
  caution_statut?: string | null;
};

/**
 * Le restaurateur a dit oui, il ne reste que l'argent.
 *
 * Se déduit des colonnes existantes plutôt que d'un nouveau statut : le
 * statut d'une réservation est lu à quarante-six endroits, et en ajouter un
 * sixième ferait disparaître ces réservations de l'écran de salle ou des
 * statistiques sans que personne ne s'en aperçoive.
 */
export function attendLaGarantie(reservation: Etat): boolean {
  if (reservation.statut !== "demande") return false;
  return (
    reservation.acompte_statut === "attendu" ||
    reservation.caution_statut === "attendue"
  );
}

/** Une demande que le restaurateur n'a pas encore tranchée. */
export function aTrancher(reservation: Etat): boolean {
  if (reservation.statut === "expiree") return true;
  return reservation.statut === "demande" && !attendLaGarantie(reservation);
}
