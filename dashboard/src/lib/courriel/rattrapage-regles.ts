import type { Genre } from "@/lib/courriel/reservation";
import {
  alerteAnnulationClient,
  alerteRestaurateur,
  rappelReservation,
  demandeRecue,
  reservationConfirmee,
  reservationRefusee,
  type Contexte,
  type Message,
} from "@/lib/courriel/messages";

/**
 * Le rattrapage des e-mails refusés.
 *
 * Un envoi qui échoue ne défait pas la réservation — c'est la bonne
 * décision, et c'est pour ça qu'il faut cette tâche. Sans elle, le seul
 * effet d'une panne chez le fournisseur est un client qui n'a rien reçu et
 * que personne ne rappellera : la table est prise, le carnet est juste,
 * tout a l'air normal.
 *
 * Retenter n'est pourtant pas inoffensif. Renvoyer trois jours plus tard
 * la confirmation d'une réservation entre-temps annulée ferait venir
 * quelqu'un pour rien. D'où les garde-fous ci-dessous : on ne retente que
 * ce qui est encore vrai aujourd'hui.
 */

/** Au-delà, le problème n'est pas passager : on cesse d'insister. */
export const TENTATIVES_MAX = 5;

/**
 * Passé ce délai, on abandonne même sans avoir épuisé les tentatives. Un
 * e-mail de confirmation qui arrive quatre jours après la réservation ne
 * rassure plus personne : il inquiète.
 */
export const FENETRE_JOURS = 3;

export type LigneCourriel = {
  id: string;
  reservation_id: string;
  genre: Genre;
  destinataire: string;
  envoye_le: string;
  tentatives: number | null;
};

export type ReservationRattrapee = {
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
};

export type Verdict =
  | { retenter: true }
  | { retenter: false; motif: string };

/**
 * Faut-il retenter cette ligne ?
 *
 * Fonction pure, et c'est volontaire : toute la prudence de cette tâche
 * tient ici, donc tout doit pouvoir s'en vérifier sans base ni réseau.
 */
export function aRetenter(
  ligne: LigneCourriel,
  reservation: ReservationRattrapee | null,
  maintenant: Date,
): Verdict {
  if (!reservation) return { retenter: false, motif: "réservation supprimée" };

  if ((ligne.tentatives ?? 1) >= TENTATIVES_MAX) {
    return { retenter: false, motif: "trop de tentatives" };
  }

  const age = maintenant.getTime() - new Date(ligne.envoye_le).getTime();
  if (age > FENETRE_JOURS * 24 * 3600 * 1000) {
    return { retenter: false, motif: "trop ancien" };
  }

  // Un service déjà passé ne se confirme plus. On compare des dates, pas
  // des instants : une réservation du soir même reste rattrapable toute la
  // journée, y compris à onze heures du matin.
  const aujourdhui = new Date(
    maintenant.getTime() - maintenant.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 10);
  if (reservation.date_reservation < aujourdhui) {
    return { retenter: false, motif: "service passé" };
  }

  // Le message doit encore décrire la réalité. Entre l'échec et cette
  // nuit, le restaurateur a pu refuser ce qu'on s'apprêtait à confirmer.
  const attendu: Record<Genre, ReservationRattrapee["statut"][]> = {
    recue: ["demande"],
    confirmee: ["confirmee"],
    refusee: ["refusee"],
    annulee: ["annulee"],
    // L'alerte sert au restaurateur tant qu'il y a quelque chose à voir.
    // Une réservation qu'il a lui-même refusée n'a plus rien à lui dire.
    alerte_restaurateur: ["demande", "confirmee"],
    // L'annulation, elle, reste vraie : la table est rendue, et le
    // restaurateur a tout intérêt à l'apprendre même avec du retard.
    alerte_annulation: ["annulee"],
    // Un rappel ne vaut que pour une table encore debout : celle qui a
    // été annulée entre-temps n'a plus personne à faire venir.
    rappel: ["confirmee"],
  };
  if (!attendu[ligne.genre].includes(reservation.statut)) {
    return { retenter: false, motif: `statut devenu « ${reservation.statut} »` };
  }

  return { retenter: true };
}

/** Le message à renvoyer, reconstruit depuis l'état actuel. */
export function messageDe(
  genre: Genre,
  contexte: Contexte,
  lien: string,
): Message {
  switch (genre) {
    case "recue":
      return demandeRecue(contexte);
    case "confirmee":
      return reservationConfirmee(contexte);
    case "refusee":
      return reservationRefusee(contexte, "refusee");
    case "annulee":
      return reservationRefusee(contexte, "annulee");
    case "alerte_restaurateur":
      return alerteRestaurateur(contexte, false, lien);
    case "alerte_annulation":
      return alerteAnnulationClient(contexte, lien);
    case "rappel":
      return rappelReservation(contexte);
  }
}

