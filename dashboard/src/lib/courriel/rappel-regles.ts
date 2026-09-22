/**
 * Qui reçoit le rappel de la veille, et qui n'en reçoit pas.
 *
 * Pur, sans base ni réseau : le pire défaut possible ici serait
 * d'envoyer un rappel pour une table qui n'existe plus, ou d'en envoyer
 * deux. Chaque refus doit donc pouvoir se relire et se vérifier seul.
 */

export type ReservationRappelable = {
  id: string;
  restaurant_id: string;
  service_id: string | null;
  date_reservation: string;
  heure_arrivee: string | null;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  client_nom: string | null;
  client_email: string | null;
  annulation_token: string | null;
  /** Colonne récente (0074) : nulle sur les réservations d'avant. */
  langue?: string | null;
};

/** « 2026-09-15 » dans le fuseau du serveur, pas en UTC. */
export function jourLocal(instant: Date): string {
  return new Date(instant.getTime() - instant.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

/** Le jour dont on rappelle les tables : demain. */
export function jourDuRappel(maintenant: Date): string {
  return jourLocal(new Date(maintenant.getTime() + 24 * 3600 * 1000));
}

export type VerdictRappel =
  | { rappeler: true }
  | { rappeler: false; motif: string };

export function aRappeler(
  reservation: ReservationRappelable,
  jour: string,
): VerdictRappel {
  if (reservation.date_reservation !== jour) {
    return { rappeler: false, motif: "ce n'est pas demain" };
  }

  // Seules les tables acquises. Une demande encore en attente n'a pas à
  // être « rappelée » : elle a à être tranchée, et lui envoyer un rappel
  // ferait croire au client qu'il a une table.
  if (reservation.statut !== "confirmee") {
    return { rappeler: false, motif: `statut « ${reservation.statut} »` };
  }

  // L'adresse est désormais exigée partout, saisie téléphonique comprise.
  // Restent les réservations enregistrées avant cette règle, qui portent
  // « — » faute d'adresse : leur fabriquer une trace d'envoi en échec ne
  // renseignerait personne.
  const email = (reservation.client_email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { rappeler: false, motif: "pas d'adresse e-mail" };
  }

  return { rappeler: true };
}
