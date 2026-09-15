import { randomBytes } from "node:crypto";
import type { Service } from "@/types/reservation";
import { debutDuService } from "@/lib/reservations/disponibilite";

/**
 * L'annulation par le client.
 *
 * Deux principes, et le second se défend.
 *
 * **Le jeton fait foi, et rien d'autre.** Pas de compte, pas de mot de
 * passe : un client qui réserve une table ne crée pas de compte, et lui en
 * demander un pour rendre sa table garantit qu'il ne la rendra pas.
 *
 * **On accepte jusqu'à la dernière minute.** La tentation est de fermer
 * l'annulation quelques heures avant, pour « protéger » le service. C'est
 * l'inverse qu'il faut faire : une annulation à 19h45 vaut infiniment
 * mieux qu'une table vide à 20h, parce qu'elle laisse une chance de la
 * revendre et qu'elle dit au chef de rang à quoi s'en tenir. Fermer le
 * lien ne fait pas venir le client — ça transforme juste une annulation
 * en no-show.
 */

/** Longueur du jeton, en octets avant encodage. */
const OCTETS = 24;

export function jetonAnnulation(): string {
  return randomBytes(OCTETS).toString("base64url");
}

export type ReservationAnnulable = {
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  date_reservation: string;
  acompte_statut?: string | null;
  caution_statut?: string | null;
};

export type VerdictAnnulation =
  | { possible: true }
  | { possible: false; motif: string; dejaFait: boolean };

/**
 * Le client peut-il encore annuler lui-même ?
 *
 * Pure, pour que chaque refus soit vérifiable sans base ni réseau — c'est
 * ici que se décide ce qu'on dit à quelqu'un qui vient rendre sa table.
 */
export function peutAnnuler(
  reservation: ReservationAnnulable,
  service: Service | null,
  maintenant: Date,
): VerdictAnnulation {
  if (reservation.statut === "annulee") {
    return {
      possible: false,
      dejaFait: true,
      motif: "Cette réservation est déjà annulée. Il n'y a rien de plus à faire.",
    };
  }
  if (reservation.statut === "refusee" || reservation.statut === "expiree") {
    return {
      possible: false,
      dejaFait: true,
      motif:
        "Cette réservation n'est plus active : elle n'a pas été retenue par l'établissement.",
    };
  }

  // L'argent déjà pris ne se rend pas par un lien. Un acompte encaissé
  // engage un remboursement, donc une décision commerciale qui appartient
  // au restaurateur — pas à un bouton.
  if (reservation.acompte_statut === "paye") {
    return {
      possible: false,
      dejaFait: false,
      motif:
        "Un acompte a été réglé pour cette réservation. Contacte directement l'établissement : lui seul peut décider du remboursement.",
    };
  }

  // Un service passé ne s'annule plus : on ne rend pas une table d'hier,
  // et laisser croire le contraire serait pire que refuser.
  const fin = service
    ? debutDuService(reservation.date_reservation, service).getTime() +
      24 * 3600 * 1000
    : new Date(`${reservation.date_reservation}T23:59:59`).getTime();
  if (maintenant.getTime() > fin) {
    return {
      possible: false,
      dejaFait: false,
      motif: "Ce service est passé : il n'y a plus rien à annuler.",
    };
  }

  return { possible: true };
}
