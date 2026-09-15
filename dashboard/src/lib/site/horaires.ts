import {
  JOURS_SEMAINE,
  type Horaires,
  type JourSemaine,
  type Plage,
} from "@/types/restaurant";

/**
 * Les horaires d'ouverture, tels qu'on les lit sur une devanture.
 *
 * Sept lignes dont cinq identiques, c'est un tableau de gare. « Lundi –
 * vendredi : 12h – 22h » est ce qu'un client cherche, et ce qu'il retient.
 * On regroupe donc les jours consécutifs qui se ressemblent.
 *
 * À ne pas confondre avec les services, qui disent quand Klarr prend des
 * réservations. Un restaurant ouvert de 9 h à 22 h peut ne servir qu'entre
 * midi et deux : ce sont deux informations différentes, et le client a
 * besoin des deux.
 */

export type PlageHoraire = {
  /** Le premier et le dernier jour de la plage, pour l'intitulé. */
  debut: JourSemaine;
  fin: JourSemaine;
  /** Null quand l'établissement est fermé sur toute la plage. */
  ouverture: string | null;
  fermeture: string | null;
  /**
   * La seconde plage du jour, quand il y a coupure. « 12h – 15h et 19h –
   * 23h » est la norme française : l'écrire « 12h – 23h » ferait venir
   * quelqu'un à 17h devant une porte close.
   */
  seconde: Plage | null;
};

/** « 09:00 » devient « 9h », « 19:30 » devient « 19h30 ». */
export function heureLisible(heure: string): string {
  const [h, m] = heure.split(":");
  const heures = Number(h);
  if (!Number.isInteger(heures)) return heure;
  return m && m !== "00" ? `${heures}h${m}` : `${heures}h`;
}

/**
 * Ce qui distingue deux journées : fermée, ou ouverte aux mêmes heures —
 * coupure comprise. Un mardi en continu et un mercredi en coupure ne se
 * regroupent pas, même si le premier service est identique.
 */
function memeJournee(a: PlageHoraire, b: PlageHoraire): boolean {
  return (
    a.ouverture === b.ouverture &&
    a.fermeture === b.fermeture &&
    (a.seconde?.ouverture ?? null) === (b.seconde?.ouverture ?? null) &&
    (a.seconde?.fermeture ?? null) === (b.seconde?.fermeture ?? null)
  );
}

export function plagesHoraires(horaires: Horaires): PlageHoraire[] {
  const journees: PlageHoraire[] = JOURS_SEMAINE.map((jour) => {
    const jourHoraire = horaires?.[jour];
    // Un jour absent de la fiche est un jour dont on ne sait rien : on le
    // traite comme fermé plutôt que d'inventer des heures d'ouverture.
    const ferme = !jourHoraire || jourHoraire.ferme;
    return {
      debut: jour,
      fin: jour,
      ouverture: ferme ? null : jourHoraire.ouverture,
      fermeture: ferme ? null : jourHoraire.fermeture,
      seconde: ferme ? null : (jourHoraire.seconde ?? null),
    };
  });

  const plages: PlageHoraire[] = [];
  for (const journee of journees) {
    const derniere = plages[plages.length - 1];
    // Seuls des jours qui se suivent se regroupent : « lundi et jeudi »
    // écrit « lundi – jeudi » ferait venir les gens un mardi.
    if (derniere && memeJournee(derniere, journee)) {
      derniere.fin = journee.debut;
    } else {
      plages.push({ ...journee });
    }
  }
  return plages;
}

const MAJUSCULE = (mot: string) => mot.charAt(0).toUpperCase() + mot.slice(1);

/** L'intitulé d'une plage : « Lundi », ou « Lundi – vendredi ». */
export function intitulePlage(plage: PlageHoraire): string {
  return plage.debut === plage.fin
    ? MAJUSCULE(plage.debut)
    : `${MAJUSCULE(plage.debut)} – ${plage.fin}`;
}

/** Les heures d'une plage, ou la mention de fermeture. */
export function heuresPlage(plage: PlageHoraire, ferme = "Fermé"): string {
  if (!plage.ouverture || !plage.fermeture) return ferme;
  const continu = `${heureLisible(plage.ouverture)} – ${heureLisible(plage.fermeture)}`;
  if (!plage.seconde) return continu;
  // « et » plutôt qu'une virgule : une virgule entre deux plages horaires
  // se lit comme une énumération de jours quand on survole la page.
  return `${continu} et ${heureLisible(plage.seconde.ouverture)} – ${heureLisible(plage.seconde.fermeture)}`;
}

/** Vrai si la fiche annonce au moins un jour d'ouverture. */
export function horairesRenseignes(horaires: Horaires): boolean {
  return plagesHoraires(horaires).some((plage) => plage.ouverture !== null);
}
