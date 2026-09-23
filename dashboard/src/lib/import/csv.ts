/**
 * Lire l'export d'un autre outil — TheFork, Zenchef ou un tableur.
 *
 * Aucun de ces outils ne publie son format, et il change d'une version à
 * l'autre. Plutôt que de parier sur des noms de colonnes exacts, on les
 * reconnaît par leur sens (« E-mail », « Adresse mail », « Email address »
 * désignent la même chose) et le restaurateur confirme avant d'importer.
 *
 * Tout ici est pur et tourne dans le navigateur : le fichier ne quitte
 * l'ordinateur qu'une fois lu, trié et validé, sous forme de lignes
 * propres. Le serveur revérifie tout de même — on ne fait jamais
 * confiance à ce qui arrive d'un formulaire.
 */

/**
 * Le texte d'un fichier, dans le bon encodage. Excel enregistre souvent
 * ses CSV en Windows-1252 : lus comme de l'UTF-8, « Hélène » devient
 * « H�l�ne ». On tente l'UTF-8 strict, et on retombe sur l'autre.
 */
export function decoder(octets: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(octets);
  } catch {
    return new TextDecoder("windows-1252").decode(octets);
  }
}

/** Le séparateur le plus fréquent sur la première ligne : « ; » en France. */
function separateurDe(texte: string): string {
  const premiere = texte.split(/\r?\n/, 1)[0] ?? "";
  const candidats = [";", ",", "\t"];
  return candidats.reduce((meilleur, c) =>
    premiere.split(c).length > premiere.split(meilleur).length ? c : meilleur,
  );
}

/**
 * Un CSV en lignes et cellules, guillemets compris (« Dupont, Jean » reste
 * une seule cellule, et un guillemet doublé est un guillemet).
 */
export function parserCsv(brut: string): string[][] {
  const texte = brut.replace(/^\uFEFF/, "");
  const sep = separateurDe(texte);
  const lignes: string[][] = [];
  let ligne: string[] = [];
  let cellule = "";
  let entreGuillemets = false;

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (entreGuillemets) {
      if (c === '"') {
        if (texte[i + 1] === '"') {
          cellule += '"';
          i++;
        } else {
          entreGuillemets = false;
        }
      } else {
        cellule += c;
      }
    } else if (c === '"') {
      entreGuillemets = true;
    } else if (c === sep) {
      ligne.push(cellule);
      cellule = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(cellule);
      lignes.push(ligne);
      ligne = [];
      cellule = "";
    } else {
      cellule += c;
    }
  }
  if (cellule !== "" || ligne.length > 0) {
    ligne.push(cellule);
    lignes.push(ligne);
  }
  // Les lignes vides de fin de fichier ne sont pas des clients.
  return lignes
    .map((l) => l.map((c) => c.trim()))
    .filter((l) => l.some((c) => c !== ""));
}

/** « Adresse e-mail » → « adresse e mail » : pour comparer des en-têtes. */
function simplifier(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type Champ =
  | "email"
  | "prenom"
  | "nom"
  | "telephone"
  | "date"
  | "heure"
  | "couverts"
  | "note"
  | "optin"
  | "statut";

export const LIBELLE_CHAMP: Record<Champ, string> = {
  email: "E-mail",
  prenom: "Prénom",
  nom: "Nom",
  telephone: "Téléphone",
  date: "Date",
  heure: "Heure",
  couverts: "Couverts",
  note: "Commentaire",
  optin: "Accepte les actualités (opt-in)",
  statut: "Statut",
};

/**
 * Ce qu'un en-tête veut dire. L'ordre compte : « nom » se vérifie après
 * « prénom », sinon « Prénom » serait pris pour le nom de famille.
 */
const SYNONYMES: [Champ, RegExp][] = [
  ["email", /\b(e ?mail|mail|courriel|adresse (e )?mail|email address)\b/],
  ["prenom", /\b(prenom|first ?name|given name)\b/],
  ["telephone", /\b(tel|telephone|phone|mobile|portable|numero|gsm)\b/],
  [
    "couverts",
    /\b(couverts?|pax|personnes?|nb pers|nombre de personnes|guests?|covers?|party size|people)\b/,
  ],
  ["heure", /^(?!.*\bdate\b).*\b(heure|time|horaire|arrivee|arrival)\b/],
  ["date", /\b(date|jour|day)\b/],
  [
    "optin",
    /\b(opt ?in|newsletter|marketing|consentement|abonne|subscribed|accepte)\b/,
  ],
  ["statut", /\b(statut|status|etat|state)\b/],
  [
    "note",
    /\b(commentaires?|comments?|notes?|remarques?|demande|special|request|message|allergies?)\b/,
  ],
  ["nom", /\b(nom|last ?name|surname|name|client|guest|customer)\b/],
];

/**
 * La correspondance proposée : pour chaque champ Klarr, l'index de la
 * colonne qui semble le porter, ou -1. Une colonne ne sert qu'une fois.
 */
export function detecterColonnes(entetes: string[]): Record<Champ, number> {
  const resultat = Object.fromEntries(
    SYNONYMES.map(([champ]) => [champ, -1]),
  ) as Record<Champ, number>;
  const prises = new Set<number>();
  for (const [champ, motif] of SYNONYMES) {
    const index = entetes.findIndex(
      (entete, i) => !prises.has(i) && motif.test(simplifier(entete)),
    );
    if (index >= 0) {
      resultat[champ] = index;
      prises.add(index);
    }
  }
  return resultat;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValide(valeur: string): string | null {
  const email = valeur.trim().toLowerCase();
  return EMAIL.test(email) ? email : null;
}

/**
 * Une date lisible → « AAAA-MM-JJ ». Accepte « 12/10/2026 », « 12-10-26 »,
 * « 2026-10-12 », « 12.10.2026 », avec ou sans heure derrière. Le jour
 * vient avant le mois : les exports d'outils français sont écrits ainsi.
 */
export function lireDate(valeur: string): string | null {
  const v = valeur.trim();
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return composer(+m[1], +m[2], +m[3]);
  m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) {
    const annee = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return composer(annee, +m[2], +m[1]);
  }
  return null;
}

function composer(annee: number, mois: number, jour: number): string | null {
  const date = new Date(Date.UTC(annee, mois - 1, jour));
  if (
    date.getUTCFullYear() !== annee ||
    date.getUTCMonth() !== mois - 1 ||
    date.getUTCDate() !== jour
  ) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

/**
 * Une heure lisible → « HH:MM ». « 20:30 », « 20h30 », « 20h », « 8:30 PM »,
 * ou l'heure collée à la date dans la même cellule.
 */
export function lireHeure(valeur: string): string | null {
  const m = valeur
    .trim()
    .toLowerCase()
    .match(/(\d{1,2})\s*[:h]\s*(\d{2})?\s*(am|pm)?\s*$/);
  if (!m) return null;
  let heures = +m[1];
  const minutes = m[2] ? +m[2] : 0;
  if (m[3] === "pm" && heures < 12) heures += 12;
  if (m[3] === "am" && heures === 12) heures = 0;
  if (heures > 23 || minutes > 59) return null;
  return `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function lireEntier(valeur: string): number | null {
  const m = valeur.match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return n > 0 && n <= 500 ? n : null;
}

/** « Oui », « yes », « 1 », « x », « true », « abonné » : un accord. */
export function lireOui(valeur: string): boolean {
  return /^(oui|yes|y|o|1|x|true|vrai|abonne|subscribed|opt ?in)$/.test(
    simplifier(valeur),
  );
}

/** Annulée, refusée ou non venue : rien à importer comme table à venir. */
export function statutEcarte(valeur: string): boolean {
  return /(annul|cancel|refus|declin|no ?show|absent|expir)/.test(
    simplifier(valeur),
  );
}

export type Colonnes = Record<Champ, number>;

const cellule = (ligne: string[], index: number) =>
  index >= 0 ? (ligne[index] ?? "").trim() : "";

function nomComplet(ligne: string[], colonnes: Colonnes): string {
  return [cellule(ligne, colonnes.prenom), cellule(ligne, colonnes.nom)]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export type ContactImporte = {
  email: string;
  nom: string | null;
  telephone: string | null;
  optin: boolean;
};

export type ReservationImportee = {
  date: string;
  heure: string;
  couverts: number;
  nom: string;
  email: string | null;
  telephone: string | null;
  note: string | null;
};

export type Tri<T> = {
  valides: T[];
  /** Ligne par ligne, pourquoi elle ne passe pas : on montre les premières. */
  ecartees: { ligne: number; raison: string }[];
};

export function trierContacts(
  lignes: string[][],
  colonnes: Colonnes,
): Tri<ContactImporte> {
  const valides: ContactImporte[] = [];
  const ecartees: Tri<ContactImporte>["ecartees"] = [];
  const vus = new Set<string>();
  lignes.forEach((ligne, i) => {
    const email = emailValide(cellule(ligne, colonnes.email));
    if (!email) {
      ecartees.push({ ligne: i + 2, raison: "pas d'e-mail valide" });
      return;
    }
    if (vus.has(email)) {
      ecartees.push({
        ligne: i + 2,
        raison: "e-mail en double dans le fichier",
      });
      return;
    }
    vus.add(email);
    valides.push({
      email,
      nom: nomComplet(ligne, colonnes) || null,
      telephone: cellule(ligne, colonnes.telephone) || null,
      optin: colonnes.optin >= 0 && lireOui(cellule(ligne, colonnes.optin)),
    });
  });
  return { valides, ecartees };
}

export function trierReservations(
  lignes: string[][],
  colonnes: Colonnes,
  aujourdhui: string,
): Tri<ReservationImportee> {
  const valides: ReservationImportee[] = [];
  const ecartees: Tri<ReservationImportee>["ecartees"] = [];
  lignes.forEach((ligne, i) => {
    const numero = i + 2;
    const brutDate = cellule(ligne, colonnes.date);
    const date = lireDate(brutDate);
    // L'heure peut vivre dans sa colonne, ou collée à la date.
    const heure =
      lireHeure(cellule(ligne, colonnes.heure)) ??
      (brutDate.length > 10 ? lireHeure(brutDate) : null);
    const couverts = lireEntier(cellule(ligne, colonnes.couverts));
    const nom = nomComplet(ligne, colonnes);

    if (colonnes.statut >= 0 && statutEcarte(cellule(ligne, colonnes.statut))) {
      ecartees.push({ ligne: numero, raison: "annulée ou non venue" });
    } else if (!date) {
      ecartees.push({ ligne: numero, raison: "date illisible" });
    } else if (date < aujourdhui) {
      ecartees.push({ ligne: numero, raison: "date passée" });
    } else if (!heure) {
      ecartees.push({ ligne: numero, raison: "heure illisible" });
    } else if (!couverts) {
      ecartees.push({ ligne: numero, raison: "nombre de couverts manquant" });
    } else if (!nom) {
      ecartees.push({ ligne: numero, raison: "nom manquant" });
    } else {
      valides.push({
        date,
        heure,
        couverts,
        nom,
        email: emailValide(cellule(ligne, colonnes.email)),
        telephone: cellule(ligne, colonnes.telephone) || null,
        note: cellule(ligne, colonnes.note) || null,
      });
    }
  });
  return { valides, ecartees };
}
