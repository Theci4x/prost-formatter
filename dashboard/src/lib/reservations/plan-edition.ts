import {
  MODELES,
  PLAN_HAUTEUR,
  PLAN_LARGEUR,
  type FormeTable,
  type Repere,
  type TableSalle,
  type TypeRepere,
} from "@/types/plan";

/**
 * L'édition du plan : ce que l'éditeur envoie, et ce qu'on accepte d'écrire.
 *
 * L'éditeur tient un brouillon complet en mémoire — c'est ce qui rend
 * l'annulation immédiate et gratuite — puis envoie le plan entier d'un coup.
 * Ce fichier décide alors ce qui est créé, modifié, supprimé, et ce qui est
 * refusé. Toute la logique est ici, sans base ni réseau, pour être vérifiable.
 */

export type TableBrouillon = {
  id: string;
  nom: string;
  places: number;
  forme: FormeTable;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  rotation: number;
};

export type RepereBrouillon = {
  id: string;
  type: TypeRepere;
  libelle: string | null;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
  rotation: number;
};

export type Brouillon = {
  tables: TableBrouillon[];
  reperes: RepereBrouillon[];
};

const FORMES = new Set<string>(MODELES.map((modele) => modele.forme));
const TYPES = new Set<string>([
  "mur",
  "bar",
  "entree",
  "cuisine",
  "toilettes",
  "poteau",
]);

function entierPositif(valeur: unknown): boolean {
  return typeof valeur === "number" && Number.isInteger(valeur) && valeur > 0;
}

function entierPositifOuNul(valeur: unknown): boolean {
  return typeof valeur === "number" && Number.isInteger(valeur) && valeur >= 0;
}

/**
 * Ce qui interdit d'enregistrer. Les messages sont ceux que lira le
 * restaurateur : ils nomment la table, pas le champ.
 */
export function valider(brouillon: Brouillon): string[] {
  const erreurs: string[] = [];
  const vus = new Set<string>();

  for (const table of brouillon.tables) {
    const nom = table.nom?.trim() ?? "";
    if (!nom) {
      erreurs.push("Une table n'a pas de numéro.");
      continue;
    }
    const cle = nom.toLowerCase();
    if (vus.has(cle)) {
      erreurs.push(
        `Deux tables portent le numéro « ${nom} » : impossible de dire « mets-les au ${nom} ».`,
      );
    }
    vus.add(cle);

    if (!entierPositif(table.places)) {
      erreurs.push(`La table ${nom} doit avoir au moins une place.`);
    }
    if (!FORMES.has(table.forme)) {
      erreurs.push(`La table ${nom} a une forme inconnue.`);
    }
    if (!entierPositif(table.largeur) || !entierPositif(table.hauteur)) {
      erreurs.push(`La table ${nom} a une taille invalide.`);
    }
    if (!entierPositifOuNul(table.x) || !entierPositifOuNul(table.y)) {
      erreurs.push(`La table ${nom} est posée hors du plan.`);
    } else if (
      table.x + table.largeur > PLAN_LARGEUR ||
      table.y + table.hauteur > PLAN_HAUTEUR
    ) {
      erreurs.push(`La table ${nom} dépasse du plan.`);
    }
    if (
      !entierPositifOuNul(table.rotation) ||
      (table.rotation as number) >= 360
    ) {
      erreurs.push(`La table ${nom} a une rotation invalide.`);
    }
  }

  for (const repere of brouillon.reperes) {
    if (!TYPES.has(repere.type)) erreurs.push("Un repère a un type inconnu.");
    if (!entierPositif(repere.largeur) || !entierPositif(repere.hauteur)) {
      erreurs.push("Un repère a une taille invalide.");
    }
    if (!entierPositifOuNul(repere.x) || !entierPositifOuNul(repere.y)) {
      erreurs.push("Un repère est posé hors du plan.");
    }
  }

  return erreurs;
}

export type Diff<T> = {
  aCreer: T[];
  aMettreAJour: T[];
  aSupprimer: string[];
};

/**
 * Ce qu'il y a à écrire. On ne renvoie dans « aMettreAJour » que ce qui a
 * réellement changé : déplacer une table d'un plan de quarante couverts ne
 * doit pas produire quarante écritures.
 */
export function diffTables(
  actuelles: TableSalle[],
  souhaitees: TableBrouillon[],
): Diff<TableBrouillon> {
  const parId = new Map(actuelles.map((table) => [table.id, table]));
  const gardees = new Set(souhaitees.map((table) => table.id));

  const aCreer: TableBrouillon[] = [];
  const aMettreAJour: TableBrouillon[] = [];

  for (const voulue of souhaitees) {
    const avant = parId.get(voulue.id);
    if (!avant) {
      aCreer.push(voulue);
      continue;
    }
    const identique =
      avant.nom === voulue.nom &&
      avant.places === voulue.places &&
      avant.forme === voulue.forme &&
      avant.x === voulue.x &&
      avant.y === voulue.y &&
      avant.largeur === voulue.largeur &&
      avant.hauteur === voulue.hauteur &&
      avant.rotation === voulue.rotation;
    if (!identique) aMettreAJour.push(voulue);
  }

  return {
    aCreer,
    aMettreAJour,
    aSupprimer: actuelles
      .filter((table) => !gardees.has(table.id))
      .map((table) => table.id),
  };
}

export function diffReperes(
  actuels: Repere[],
  souhaites: RepereBrouillon[],
): Diff<RepereBrouillon> {
  const parId = new Map(actuels.map((repere) => [repere.id, repere]));
  const gardes = new Set(souhaites.map((repere) => repere.id));

  const aCreer: RepereBrouillon[] = [];
  const aMettreAJour: RepereBrouillon[] = [];

  for (const voulu of souhaites) {
    const avant = parId.get(voulu.id);
    if (!avant) {
      aCreer.push(voulu);
      continue;
    }
    const identique =
      avant.type === voulu.type &&
      (avant.libelle ?? null) === (voulu.libelle ?? null) &&
      avant.x === voulu.x &&
      avant.y === voulu.y &&
      avant.largeur === voulu.largeur &&
      avant.hauteur === voulu.hauteur &&
      avant.rotation === voulu.rotation;
    if (!identique) aMettreAJour.push(voulu);
  }

  return {
    aCreer,
    aMettreAJour,
    aSupprimer: actuels
      .filter((repere) => !gardes.has(repere.id))
      .map((repere) => repere.id),
  };
}

/** Le brouillon tel qu'il sort de la base, pour ouvrir l'éditeur. */
export function brouillonDe(
  tables: TableSalle[],
  reperes: Repere[],
): Brouillon {
  return {
    tables: tables.map((table) => ({
      id: table.id,
      nom: table.nom,
      places: table.places,
      forme: table.forme,
      x: table.x,
      y: table.y,
      largeur: table.largeur,
      hauteur: table.hauteur,
      rotation: table.rotation,
    })),
    reperes: reperes.map((repere) => ({
      id: repere.id,
      type: repere.type,
      libelle: repere.libelle,
      x: repere.x,
      y: repere.y,
      largeur: repere.largeur,
      hauteur: repere.hauteur,
      rotation: repere.rotation,
    })),
  };
}

/** Le prochain numéro libre : « 1 », « 2 »… sans retomber sur un existant. */
export function prochainNumero(tables: { nom: string }[]): string {
  const pris = new Set(tables.map((table) => table.nom.trim().toLowerCase()));
  for (let n = 1; n <= 999; n += 1) {
    if (!pris.has(String(n))) return String(n);
  }
  return "";
}
