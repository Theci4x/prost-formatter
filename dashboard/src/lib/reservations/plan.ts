import {
  GRILLE_COLONNES,
  GRILLE_LIGNES,
  type TableSalle,
} from "@/types/plan";
import type { Espace } from "@/types/reservation";
import { occupeLaJauge } from "@/lib/reservations/disponibilite";

/**
 * Le plan de salle PLACE, il ne vend pas.
 *
 * La disponibilité reste comptée en couverts (voir `disponibilite.ts`) :
 * Klarr n'a jamais refusé une réservation faute de table libre, et ne le
 * fera pas ici. Ce fichier répond à une autre question, celle que le chef
 * de rang se pose le soir même : qui est assis où, et qu'est-ce que ce
 * placement a de bancal.
 */

export type ReservationPlacable = {
  id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  option_expire_le: string | null;
  table_id: string | null;
  client_nom: string;
};

/** Les tables d'une salle, dans l'ordre de lecture du plan. */
export function tablesDeLEspace(
  tables: TableSalle[],
  espaceId: string,
): TableSalle[] {
  return tables
    .filter((table) => table.espace_id === espaceId)
    .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
}

export function dansLaGrille(x: number, y: number): boolean {
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    y >= 0 &&
    x < GRILLE_COLONNES &&
    y < GRILLE_LIGNES
  );
}

/**
 * La case est-elle libre dans cette salle ? `sauf` permet de déplacer une
 * table sans qu'elle se heurte à elle-même.
 */
export function caseLibre(
  tables: TableSalle[],
  espaceId: string,
  x: number,
  y: number,
  sauf?: string,
): boolean {
  return !tables.some(
    (table) =>
      table.espace_id === espaceId &&
      table.id !== sauf &&
      table.x === x &&
      table.y === y,
  );
}

/**
 * Où poser la prochaine table sans rien demander. On remplit ligne par
 * ligne : un restaurateur qui clique cinq fois « ajouter » obtient cinq
 * tables alignées, qu'il déplace ensuite.
 */
export function prochaineCaseLibre(
  tables: TableSalle[],
  espaceId: string,
): { x: number; y: number } | null {
  for (let y = 0; y < GRILLE_LIGNES; y += 1) {
    for (let x = 0; x < GRILLE_COLONNES; x += 1) {
      if (caseLibre(tables, espaceId, x, y)) return { x, y };
    }
  }
  return null;
}

/** Un nom de table déjà pris dans la salle, à la casse près. */
export function nomDejaPris(
  tables: TableSalle[],
  espaceId: string,
  nom: string,
  sauf?: string,
): boolean {
  const cible = nom.trim().toLowerCase();
  return tables.some(
    (table) =>
      table.espace_id === espaceId &&
      table.id !== sauf &&
      table.nom.trim().toLowerCase() === cible,
  );
}

/**
 * Les réservations qui pèsent réellement sur le service visé : confirmées,
 * ou en option non expirée. Une demande refusée n'occupe pas une table.
 */
export function reservationsDuService(
  reservations: ReservationPlacable[],
  {
    date,
    serviceId,
    maintenant,
  }: { date: string; serviceId: string | null; maintenant: Date },
): ReservationPlacable[] {
  return reservations.filter(
    (reservation) =>
      reservation.date_reservation === date &&
      reservation.service_id === serviceId &&
      occupeLaJauge(reservation, maintenant),
  );
}

export type OccupationTable = {
  table: TableSalle;
  occupants: ReservationPlacable[];
  couverts: number;
  /** Deux groupes sur la même table au même service : à corriger. */
  doublon: boolean;
  /** Plus de convives que de places : à savoir, pas forcément à corriger. */
  surcharge: boolean;
};

/**
 * L'état de chaque table pour un service donné. Les tables sont renvoyées
 * toutes, même vides : le plan doit se dessiner en entier.
 */
export function occupationDuPlan({
  tables,
  espaceId,
  reservations,
}: {
  tables: TableSalle[];
  espaceId: string;
  reservations: ReservationPlacable[];
}): OccupationTable[] {
  return tablesDeLEspace(tables, espaceId).map((table) => {
    const occupants = reservations.filter(
      (reservation) => reservation.table_id === table.id,
    );
    const couverts = occupants.reduce((total, r) => total + r.couverts, 0);
    return {
      table,
      occupants,
      couverts,
      doublon: occupants.length > 1,
      surcharge: couverts > table.places,
    };
  });
}

/** Ce qui n'est pas encore placé : la liste de travail du chef de rang. */
export function reservationsNonPlacees(
  reservations: ReservationPlacable[],
): ReservationPlacable[] {
  // Falsy plutôt que « === null » : une colonne absente de la réponse
  // vaudrait undefined, et le compteur « à placer » retomberait à zéro sans
  // que rien ne le signale.
  return reservations.filter(
    (reservation) =>
      !reservation.table_id && reservation.type !== "privatisation",
  );
}

export type Verdict = { ok: boolean; raison: string | null };

/**
 * Peut-on asseoir ce groupe à cette table ?
 *
 * Deux refus seulement, et ils sont tous les deux des erreurs de fait :
 * la table n'est pas dans la salle réservée, ou elle est déjà prise sur ce
 * service. Le reste — six convives sur une table de quatre — est un
 * avertissement : on rapproche les tables tous les jours, ce n'est pas à
 * Klarr de l'interdire.
 */
export function placementPossible({
  table,
  reservation,
  occupees,
}: {
  table: TableSalle;
  reservation: ReservationPlacable;
  occupees: ReservationPlacable[];
}): Verdict {
  if (table.espace_id !== reservation.espace_id) {
    return {
      ok: false,
      raison: "Cette table n'est pas dans la salle réservée.",
    };
  }

  const occupant = occupees.find(
    (autre) => autre.table_id === table.id && autre.id !== reservation.id,
  );
  if (occupant) {
    return {
      ok: false,
      raison: `La ${table.nom} est déjà prise par ${occupant.client_nom} sur ce service.`,
    };
  }

  return { ok: true, raison: null };
}

/** Le bémol à afficher une fois le groupe assis, ou rien. */
export function avertissementPlacement(
  table: TableSalle,
  couverts: number,
): string | null {
  if (couverts <= table.places) return null;
  return `${couverts} convives sur une table de ${table.places} : il faudra rapprocher.`;
}

/**
 * Les tables proposées pour une réservation, les impossibles écartées. Un
 * menu déroulant qui liste des tables refusées d'avance fait perdre du
 * temps en plein service.
 */
export function tablesProposees({
  tables,
  reservation,
  occupees,
}: {
  tables: TableSalle[];
  reservation: ReservationPlacable;
  occupees: ReservationPlacable[];
}): TableSalle[] {
  return tablesDeLEspace(tables, reservation.espace_id).filter(
    (table) => placementPossible({ table, reservation, occupees }).ok,
  );
}

export type EcartCapacite = {
  placesPlan: number;
  capacite: number;
  ecart: number;
};

/**
 * Le plan et la capacité déclarée ne se contredisent pas forcément : on
 * peut ne dessiner qu'une partie de la salle, ou compter des places au bar
 * qui ne sont sur aucune table. Le chiffre est donc affiché, jamais imposé.
 */
export function ecartCapacite(
  espace: Espace,
  tables: TableSalle[],
): EcartCapacite {
  const placesPlan = tablesDeLEspace(tables, espace.id).reduce(
    (total, table) => total + table.places,
    0,
  );
  return {
    placesPlan,
    capacite: espace.capacite,
    ecart: placesPlan - espace.capacite,
  };
}

export type Cadre = { x0: number; y0: number; colonnes: number; lignes: number };

/**
 * Le rectangle utile du plan : de quoi dessiner une salle sans afficher les
 * quatre-vingt-seize cases de la grille quand le restaurateur n'en a garni
 * que six. L'écran de service s'en sert ; l'éditeur garde la grille entière,
 * puisqu'il faut de la place libre pour déplacer une table.
 */
export function cadrePlan(tables: TableSalle[]): Cadre {
  if (tables.length === 0) return { x0: 0, y0: 0, colonnes: 1, lignes: 1 };
  const xs = tables.map((table) => table.x);
  const ys = tables.map((table) => table.y);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  return {
    x0,
    y0,
    colonnes: Math.max(...xs) - x0 + 1,
    lignes: Math.max(...ys) - y0 + 1,
  };
}
