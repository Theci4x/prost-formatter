import type { Creneau, Disponibilite } from "@/lib/reservations/disponibilite";
import type { Espace } from "@/types/reservation";

/**
 * Ce qu'on propose au client, et dans quel ordre.
 *
 * Un client qui veut une table ne doit pas avoir à choisir une salle : il
 * n'a aucun moyen de savoir laquelle lui convient, et lui poser la question
 * revient à lui demander de faire le travail du chef de rang. C'est Klarr
 * qui place, exactement comme pour une réservation prise au téléphone.
 *
 * La privatisation, elle, est un autre métier : là, la salle EST le sujet,
 * et le client la choisit.
 */

/**
 * La salle retenue pour une réservation ordinaire : la première, dans
 * l'ordre défini par le restaurateur, qui peut recevoir ce groupe.
 *
 * Une règle explicable plutôt qu'astucieuse. Le restaurateur range ses
 * salles comme il veut les remplir ; Klarr suit cet ordre. Un algorithme
 * qui « optimiserait » le remplissage produirait des placements que
 * personne ne saurait expliquer au téléphone.
 */
export function salleAutomatique(creneau: Creneau): Disponibilite | null {
  return creneau.espaces.find((dispo) => dispo.peutRecevoirTable) ?? null;
}

/** Les salles que ce groupe peut privatiser, dans l'ordre du restaurateur. */
export function sallesPrivatisables(creneau: Creneau): Disponibilite[] {
  return creneau.espaces.filter((dispo) => dispo.peutEtrePrivatise);
}

/**
 * La plus grande tablée que ce service peut asseoir, pour n'importe quel
 * nombre de convives.
 *
 * Le MAXIMUM d'une salle, jamais la somme : un groupe tient dans une seule
 * pièce. Additionner douze couverts ici et vingt là promettrait une tablée
 * de trente-deux que personne ne pourrait asseoir.
 *
 * Ne comptent que les salles qui prennent des tables et qui sont ouvertes :
 * une salle fermée ou déjà privatisée garde des couverts au compteur, mais
 * pas un que le client puisse prendre.
 */
export function placesMaximum(creneau: Creneau): number {
  return creneau.espaces.reduce(
    (max, dispo) =>
      dispo.espace.accepte_table && !dispo.ferme && !dispo.privatise
        ? Math.max(max, dispo.restants)
        : max,
    0,
  );
}

/**
 * Le motif à montrer quand aucune table ordinaire n'est proposable, ou null
 * quand il n'y a rien à dire.
 *
 * Un chiffre plutôt qu'un « complet » sec : « ce service ne peut plus
 * accueillir que 12 convives » permet au client de revenir à douze, là où
 * « complet » le fait partir. Et un motif qui se tient seul — ceux du moteur
 * commencent par « cet espace », ce qui ne veut plus rien dire maintenant
 * que le client ne choisit plus de salle.
 */
export function raisonDuRefus(creneau: Creneau): string | null {
  // Aucune salle examinée : le service lui-même est fermé, ou trop proche.
  // C'est le motif du créneau qui explique, pas une histoire de jauge.
  if (creneau.espaces.length === 0) {
    return creneau.raison ?? "Ce service ne prend pas de réservation.";
  }

  // Un lieu qui ne se loue qu'en entier n'a jamais eu de table à perdre :
  // lui répondre « complet » serait faux. Si une privatisation est
  // possible, la section d'en dessous se suffit à elle-même.
  if (!creneau.espaces.some((dispo) => dispo.espace.accepte_table)) {
    if (sallesPrivatisables(creneau).length > 0) return null;
    const minimums = creneau.espaces
      .map((dispo) => dispo.espace.privatisation_minimum)
      .filter((minimum): minimum is number => minimum !== null);
    return minimums.length > 0
      ? `Ce service se réserve en privatisation, à partir de ${Math.min(...minimums)} convives.`
      : "Ce service ne prend pas de réservation en ligne.";
  }

  const max = placesMaximum(creneau);
  if (max > 0) {
    return `Ce service ne peut plus accueillir que ${max} convive${max > 1 ? "s" : ""}.`;
  }

  // Plus une place nulle part. Si tout est fermé, le motif du restaurateur
  // vaut mieux qu'un « complet » qui laisserait espérer une annulation.
  const ferme = creneau.espaces.find((dispo) => dispo.ferme && dispo.raison);
  if (ferme?.raison && creneau.espaces.every((dispo) => dispo.ferme)) {
    return ferme.raison;
  }

  // « Complet » à côté d'une privatisation encore ouverte se contredirait :
  // ce sont les tables qui manquent, pas la place.
  return sallesPrivatisables(creneau).length > 0
    ? "Plus de table libre sur ce service."
    : "Complet pour ce service.";
}

export type Proposition = {
  creneau: Creneau;
  /** La salle où Klarr placerait ce groupe, s'il y en a une. */
  table: Disponibilite | null;
  privatisations: Disponibilite[];
  placesMax: number;
  /**
   * Pourquoi aucune table ordinaire n'est proposée. Null quand il y en a
   * une, ou quand il n'y a rien à dire de plus que la page ne montre déjà.
   */
  raison: string | null;
};

/** Ce qu'il y a à afficher pour chaque service de la journée. */
export function propositions(creneaux: Creneau[]): Proposition[] {
  // Un service fermé n'a aucun espace : les filtres ne retiennent rien et
  // le motif remonte celui du créneau. Pas besoin de cas particulier.
  return creneaux.map((creneau) => {
    const table = salleAutomatique(creneau);
    return {
      creneau,
      table,
      privatisations: sallesPrivatisables(creneau),
      placesMax: placesMaximum(creneau),
      raison: table ? null : raisonDuRefus(creneau),
    };
  });
}

export type OffrePrivatisation = { minimum: number; espaces: Espace[] };

/**
 * Ce que l'établissement privatise, indépendamment de la date et du nombre
 * de convives cherchés.
 *
 * Un couple qui réserve pour deux ne verra jamais la privatisation : elle
 * n'est proposable qu'à partir d'un certain nombre. Il repart donc sans
 * savoir que la salle du bas se loue — et rappellera six mois plus tard,
 * pour l'anniversaire de sa mère, un concurrent qui, lui, l'affiche.
 * Cette fonction sert à le lui dire, sans rien lui demander.
 */
export function offrePrivatisation(espaces: Espace[]): OffrePrivatisation | null {
  const privatisables = espaces.filter(
    (espace) => espace.privatisation_minimum !== null,
  );
  if (privatisables.length === 0) return null;
  return {
    // Le plus petit minimum de toutes les salles : c'est le seuil à partir
    // duquel quelque chose devient possible, pas la moyenne de rien.
    minimum: Math.min(
      ...privatisables.map((espace) => espace.privatisation_minimum as number),
    ),
    espaces: privatisables,
  };
}
