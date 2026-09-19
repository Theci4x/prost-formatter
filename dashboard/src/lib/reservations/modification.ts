import type { Service } from "@/types/reservation";
import { debutDuService } from "@/lib/reservations/disponibilite";

/**
 * La modification par le client.
 *
 * Sans elle, un client qui veut décaler d'une demi-heure ou venir à six au
 * lieu de quatre n'a qu'un seul geste à sa disposition : annuler, puis
 * refaire une réservation. C'est ce que font les outils qui ne proposent
 * que l'annulation, et c'est une plaie des deux côtés — le restaurateur
 * voit une table rendue puis reprise, perd l'historique et la note
 * interne, et pendant les quelques minutes de battement quelqu'un d'autre
 * peut prendre le créneau.
 *
 * On garde donc la même réservation, et on la modifie.
 *
 * Deux limites, et elles tiennent au même principe : ce qui a été
 * contractualisé ne se change pas d'un lien. Un acompte encaissé ou un
 * devis accepté fixent un prix pour un nombre de convives donné ; les
 * changer d'un clic ferait mentir un document signé. Là, le client doit
 * parler au restaurateur — et c'est normal, il y a un chiffre à revoir.
 */

export type ReservationModifiable = {
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  date_reservation: string;
  type: "table" | "privatisation";
  acompte_statut?: string | null;
  caution_statut?: string | null;
};

export type VerdictModification =
  | { possible: true }
  | { possible: false; motif: string };

export function peutModifier(
  reservation: ReservationModifiable,
  service: Service | null,
  /** Vrai quand un devis accepté porte sur cette réservation. */
  devisAccepte: boolean,
  maintenant: Date,
): VerdictModification {
  if (reservation.statut === "annulee") {
    return {
      possible: false,
      motif: "Cette réservation est annulée : il n'y a plus rien à modifier.",
    };
  }
  if (reservation.statut === "refusee" || reservation.statut === "expiree") {
    return {
      possible: false,
      motif:
        "Cette réservation n'est plus active : elle n'a pas été retenue par l'établissement.",
    };
  }

  if (devisAccepte) {
    return {
      possible: false,
      motif:
        "Un devis a été accepté pour cet événement : le prix a été arrêté pour ce nombre de convives. Contacte l'établissement, il établira une nouvelle proposition.",
    };
  }

  if (reservation.acompte_statut === "paye") {
    return {
      possible: false,
      motif:
        "Un acompte a été réglé pour cette réservation. Contacte directement l'établissement : lui seul peut revoir ce qui a été convenu.",
    };
  }

  // Une empreinte de carte a été prise sur un engagement précis : la
  // salle, la date, le nombre de couverts. On ne la déplace pas sans que
  // le restaurateur le sache.
  if (
    reservation.caution_statut === "enregistree" ||
    reservation.caution_statut === "debitee"
  ) {
    return {
      possible: false,
      motif:
        "Une empreinte de carte a été enregistrée pour cette réservation. Contacte l'établissement pour la modifier.",
    };
  }

  // Un service passé ne se modifie pas davantage qu'il ne s'annule.
  const fin = service
    ? debutDuService(reservation.date_reservation, service).getTime() +
      24 * 3600 * 1000
    : new Date(`${reservation.date_reservation}T23:59:59`).getTime();
  if (maintenant.getTime() > fin) {
    return {
      possible: false,
      motif: "Ce service est passé : il n'y a plus rien à modifier.",
    };
  }

  return { possible: true };
}
