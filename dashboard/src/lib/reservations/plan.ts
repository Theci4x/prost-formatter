import {
  PAS,
  PLAN_HAUTEUR,
  PLAN_LARGEUR,
  type Repere,
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

/**
 * Une salle se dessine-t-elle ?
 *
 * Non si elle ne sert qu'à la privatisation. Quand un groupe prend la cave
 * en entier, personne ne « place » qui que ce soit : la salle part d'un
 * bloc. Y dessiner des tables numérotées donnerait un écran qui ne servira
 * jamais, et laisserait croire qu'on peut y asseoir deux groupes.
 */
export function salleADessiner(espace: Espace): boolean {
  return espace.accepte_table;
}

/** Les salles pour lesquelles un plan a un sens, dans l'ordre d'affichage. */
export function sallesADessiner(espaces: Espace[]): Espace[] {
  return espaces.filter(salleADessiner);
}

/** Les tables d'une salle, dans l'ordre de lecture du plan. */
export function tablesDeLEspace(
  tables: TableSalle[],
  espaceId: string,
): TableSalle[] {
  return tables
    .filter((table) => table.espace_id === espaceId)
    .sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
}

/** Une position tient-elle dans le plan ? */
export function dansLePlan(
  x: number,
  y: number,
  largeur = 0,
  hauteur = 0,
): boolean {
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    y >= 0 &&
    x + largeur <= PLAN_LARGEUR &&
    y + hauteur <= PLAN_HAUTEUR
  );
}

/** Ramène une position dans le plan, plutôt que de refuser le déplacement. */
export function contraindre(
  x: number,
  y: number,
  largeur: number,
  hauteur: number,
): { x: number; y: number } {
  return {
    x: Math.min(Math.max(Math.round(x), 0), Math.max(PLAN_LARGEUR - largeur, 0)),
    y: Math.min(Math.max(Math.round(y), 0), Math.max(PLAN_HAUTEUR - hauteur, 0)),
  };
}

/** Aimantation au pas du plan : assez fin pour être libre, assez gros pour aligner. */
export function aimanter(valeur: number): number {
  return Math.round(valeur / PAS) * PAS;
}

/** Les quatre rotations utiles. Une salle ne se dessine pas au degré près. */
export function rotationSuivante(rotation: number, sens: 1 | -1): number {
  return (((rotation + sens * 90) % 360) + 360) % 360;
}

export type Boite = { x: number; y: number; largeur: number; hauteur: number };

/**
 * L'encombrement réel d'un élément tourné. Une banquette de 220 × 50 posée à
 * 90° occupe 50 × 220 : sans ce calcul, elle se placerait hors du plan ou
 * masquerait sa voisine sans qu'on comprenne pourquoi.
 */
export function encombrement(element: Boite & { rotation: number }): Boite {
  const quart = ((element.rotation % 180) + 180) % 180 === 90;
  const largeur = quart ? element.hauteur : element.largeur;
  const hauteur = quart ? element.largeur : element.hauteur;
  // La rotation se fait autour du centre : le coin haut gauche bouge.
  const cx = element.x + element.largeur / 2;
  const cy = element.y + element.hauteur / 2;
  return { x: cx - largeur / 2, y: cy - hauteur / 2, largeur, hauteur };
}

/** Deux éléments se chevauchent-ils ? Un avertissement, jamais un refus. */
export function seChevauchent(
  a: Boite & { rotation: number },
  b: Boite & { rotation: number },
): boolean {
  const ea = encombrement(a);
  const eb = encombrement(b);
  return (
    ea.x < eb.x + eb.largeur &&
    eb.x < ea.x + ea.largeur &&
    ea.y < eb.y + eb.hauteur &&
    eb.y < ea.y + ea.hauteur
  );
}

/** Les tables qui en recouvrent une autre : à signaler au restaurateur. */
export function tablesQuiSeChevauchent(tables: TableSalle[]): Set<string> {
  const fautives = new Set<string>();
  for (let i = 0; i < tables.length; i += 1) {
    for (let j = i + 1; j < tables.length; j += 1) {
      if (seChevauchent(tables[i], tables[j])) {
        fautives.add(tables[i].id);
        fautives.add(tables[j].id);
      }
    }
  }
  return fautives;
}

/**
 * Où poser le prochain élément sans rien demander : la première place libre
 * en balayant le plan, pour qu'un ajout ne tombe jamais sur une table
 * existante.
 */
export function prochainePlaceLibre(
  occupants: (Boite & { rotation: number })[],
  largeur: number,
  hauteur: number,
): { x: number; y: number } {
  for (let y = 20; y + hauteur <= PLAN_HAUTEUR; y += 20) {
    for (let x = 20; x + largeur <= PLAN_LARGEUR; x += 20) {
      const candidat = { x, y, largeur, hauteur, rotation: 0 };
      if (!occupants.some((autre) => seChevauchent(candidat, autre))) {
        return { x, y };
      }
    }
  }
  // Plan saturé : on pose en haut à gauche plutôt que de refuser l'ajout.
  return { x: 20, y: 20 };
}

/** Le cadre utile, repères compris : de quoi recadrer l'affichage. */
export function cadreDuPlan(
  tables: TableSalle[],
  reperes: Repere[] = [],
): Boite {
  const boites = [...tables, ...reperes].map(encombrement);
  if (boites.length === 0) {
    return { x: 0, y: 0, largeur: PLAN_LARGEUR, hauteur: PLAN_HAUTEUR };
  }
  const x = Math.min(...boites.map((b) => b.x));
  const y = Math.min(...boites.map((b) => b.y));
  const droite = Math.max(...boites.map((b) => b.x + b.largeur));
  const bas = Math.max(...boites.map((b) => b.y + b.hauteur));
  // Une marge, sinon les tables du bord touchent le cadre.
  const marge = 20;
  return {
    x: Math.max(x - marge, 0),
    y: Math.max(y - marge, 0),
    largeur: droite - x + marge * 2,
    hauteur: bas - y + marge * 2,
  };
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
