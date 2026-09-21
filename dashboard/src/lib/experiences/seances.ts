import type { Experience, PlaceReservee } from "@/types/experience";
import type { Fermeture } from "@/types/reservation";
import { fermetureApplicable } from "@/lib/reservations/disponibilite";

import type { Langue } from "@/lib/i18n/langues";
import { RESERVER } from "@/lib/i18n/reserver";

export type Seance = {
  date: string;
  placesRestantes: number;
  // Motif du refus, à montrer tel quel au client plutôt qu'une case grisée.
  raison: string | null;
};

function jourIso(date: string): number {
  const jour = new Date(`${date}T12:00:00`).getDay();
  return jour === 0 ? 7 : jour;
}

/** L'instant où commence une séance, dans le fuseau du serveur. */
export function debutSeance(date: string, experience: Experience): Date {
  return new Date(`${date}T${experience.heure}`);
}

/**
 * La séance a-t-elle lieu ce jour-là ? Le rythme hebdomadaire et les bornes
 * de période décident ; une expérience arrêtée ne tourne plus du tout.
 */
export function seanceCeJour(date: string, experience: Experience): boolean {
  if (!experience.actif) return false;
  if (experience.date_debut && date < experience.date_debut) return false;
  if (experience.date_fin && date > experience.date_fin) return false;
  return experience.jours.includes(jourIso(date));
}

/**
 * Les places encore vendables. Une réservation annulée libère sa place ;
 * une réservation en attente de paiement la retient — sinon deux clients
 * paieraient la même.
 */
export function placesRestantes(
  experience: Experience,
  date: string,
  reservations: PlaceReservee[],
): number {
  const prises = reservations
    .filter(
      (reservation) =>
        reservation.experience_id === experience.id &&
        reservation.date_seance === date &&
        reservation.statut !== "annulee",
    )
    .reduce((total, reservation) => total + reservation.places, 0);
  return Math.max(0, experience.places - prises);
}

/**
 * L'état d'une séance pour un client qui veut y venir. Le motif du refus est
 * renvoyé plutôt que la séance masquée : « complet » et « trop tard » ne se
 * corrigent pas de la même façon, et un client qui ne comprend pas part.
 */
export function etatSeance({
  experience,
  date,
  places,
  reservations,
  fermetures,
  maintenant,
  langue = "fr",
}: {
  experience: Experience;
  date: string;
  places: number;
  reservations: PlaceReservee[];
  fermetures: Fermeture[];
  maintenant: Date;
  /**
   * Le motif est montré tel quel au client : il doit donc être écrit dans
   * sa langue. Le tableau de bord, lui, ne passe rien et reste en
   * français.
   */
  langue?: Langue;
}): Seance | null {
  const r = RESERVER[langue] ?? RESERVER.fr;
  if (!seanceCeJour(date, experience)) return null;

  const restantes = placesRestantes(experience, date, reservations);
  const base = { date, placesRestantes: restantes };

  // Une fermeture de l'établissement ferme aussi ses ateliers : un jour de
  // congés, personne n'est là pour animer le cours.
  const fermeture = fermetureApplicable(date, null, fermetures);
  if (fermeture) {
    return {
      ...base,
      raison: fermeture.motif ? r.fermePour(fermeture.motif) : r.fermeCeJour,
    };
  }

  const limite = new Date(
    debutSeance(date, experience).getTime() -
      experience.delai_heures * 60 * 60 * 1000,
  );
  if (maintenant >= limite) {
    return {
      ...base,
      raison:
        experience.delai_heures > 0
          ? r.inscriptionsFerment(experience.delai_heures)
          : r.seanceCommencee,
    };
  }

  if (restantes === 0) return { ...base, raison: r.complet };
  if (places > restantes) {
    return {
      ...base,
      raison: r.neResteQue(restantes),
    };
  }

  return { ...base, raison: null };
}

/**
 * Les prochaines séances d'une expérience, sur une fenêtre de jours. On
 * garde aussi celles qui sont complètes ou fermées : voir « complet » vaut
 * mieux que ne rien voir, et le client revient.
 */
export function prochainesSeances({
  experience,
  depuis,
  jours,
  places,
  reservations,
  fermetures,
  maintenant,
  langue = "fr",
}: {
  experience: Experience;
  depuis: string;
  jours: number;
  places: number;
  reservations: PlaceReservee[];
  fermetures: Fermeture[];
  maintenant: Date;
  langue?: Langue;
}): Seance[] {
  const seances: Seance[] = [];
  const curseur = new Date(`${depuis}T12:00:00`);

  for (let index = 0; index < jours; index++) {
    const date = curseur.toISOString().slice(0, 10);
    const etat = etatSeance({
      experience,
      date,
      places,
      reservations,
      fermetures,
      maintenant,
      langue,
    });
    if (etat) seances.push(etat);
    curseur.setDate(curseur.getDate() + 1);
  }

  return seances;
}

/** Ce que doit le client, figé au moment où il réserve. */
export function montantSeance(experience: Experience, places: number): number {
  if (places <= 0) return 0;
  return experience.prix_centimes * places;
}
