/**
 * Le constat d'absence.
 *
 * Trois partis pris, tous discutables et tous assumés.
 *
 * **L'absence n'est pas un statut, c'est un fait ajouté.** La réservation
 * a bien été confirmée — c'est même tout le problème. La basculer en
 * « annulée » effacerait la table qu'elle a fait perdre, et la seule
 * chose qu'on veut mesurer disparaîtrait du compte.
 *
 * **Elle se constate, donc elle se défait.** On coche après le service,
 * de mémoire, parfois à tort — le client était là et s'est assis à une
 * autre table. Un constat qu'on ne peut pas retirer serait un piège.
 *
 * **L'historique reste dans la maison.** Compter les absences d'un client
 * chez soi relève de sa propre relation commerciale. Les partager entre
 * établissements serait un fichier de mauvais payeurs — un autre métier,
 * d'autres obligations, et une autre conversation à avoir avec la CNIL.
 */

export type ReservationAbsence = {
  date_reservation: string;
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  absence_constatee_le: string | null;
};

export type VerdictAbsence =
  | { possible: true }
  | { possible: false; motif: string };

/** « 2026-09-15 » dans le fuseau du serveur. */
function jourLocal(instant: Date): string {
  return new Date(instant.getTime() - instant.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function peutConstaterAbsence(
  reservation: ReservationAbsence,
  maintenant: Date,
): VerdictAbsence {
  // Seule une table tenue peut être manquée. Une demande jamais tranchée
  // n'a promis aucune place, et une table rendue a été rendue : compter
  // l'une ou l'autre en absence accuserait le client de ce que la maison
  // n'a pas décidé.
  if (reservation.statut !== "confirmee") {
    return {
      possible: false,
      motif: "Seule une réservation confirmée peut être constatée absente.",
    };
  }

  // On ne coche pas une absence à l'avance. Le service doit avoir eu
  // lieu, ou au moins avoir commencé : la date du jour suffit, inutile
  // d'attendre minuit pour saisir un service du soir.
  if (reservation.date_reservation > jourLocal(maintenant)) {
    return {
      possible: false,
      motif: "Ce service n'a pas encore eu lieu.",
    };
  }

  return { possible: true };
}

/**
 * La clé sous laquelle on rapproche deux réservations d'un même client.
 *
 * L'adresse e-mail, normalisée. Null quand il n'y en a pas : les
 * réservations prises au téléphone portent « — », et les compter ensemble
 * imputerait à un client les absences de tous les autres.
 */
export function clefClient(email: string | null | undefined): string | null {
  const propre = (email ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(propre) ? propre : null;
}

/**
 * Combien d'absences ce client a déjà eues dans cette maison, la
 * réservation en cours exceptée.
 */
export function absencesDuClient(
  email: string | null | undefined,
  reservationId: string,
  historique: {
    id: string;
    client_email: string | null;
    absence_constatee_le: string | null;
  }[],
): number {
  const clef = clefClient(email);
  if (!clef) return 0;
  return historique.filter(
    (ligne) =>
      ligne.id !== reservationId &&
      ligne.absence_constatee_le !== null &&
      clefClient(ligne.client_email) === clef,
  ).length;
}

/** « 2 absences », ou null quand il n'y a rien à signaler. */
export function libelleAbsences(combien: number): string | null {
  if (combien <= 0) return null;
  return combien === 1 ? "1 absence déjà" : `${combien} absences déjà`;
}
