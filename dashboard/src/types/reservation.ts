export type Espace = {
  id: string;
  restaurant_id: string;
  nom: string;
  description: string | null;
  capacite: number;
  // NULL quand l'espace ne se privatise pas.
  privatisation_minimum: number | null;
  accepte_table: boolean;
  ordre: number;
};

export type Service = {
  id: string;
  restaurant_id: string;
  nom: string;
  // Convention ISO : 1 = lundi … 7 = dimanche.
  jours: number[];
  heure_debut: string;
  heure_fin: string;
  delai_heures: number;
  ordre: number;
};

export const JOURS_ISO = [
  { valeur: 1, court: "L", long: "lundi" },
  { valeur: 2, court: "M", long: "mardi" },
  { valeur: 3, court: "M", long: "mercredi" },
  { valeur: 4, court: "J", long: "jeudi" },
  { valeur: 5, court: "V", long: "vendredi" },
  { valeur: 6, court: "S", long: "samedi" },
  { valeur: 7, court: "D", long: "dimanche" },
] as const;

// "19:00:00" venant de PostgreSQL → "19h00", et "19:30:00" → "19h30".
export function formatHeure(heure: string): string {
  const [h, m] = heure.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

// Un service peut finir après minuit (17h30 – 2h). Il reste rattaché au jour
// où il commence, mais l'affichage doit le dire, sans quoi « 17h30 – 2h » se
// lit comme une erreur de saisie.
export function finLeLendemain(debut: string, fin: string): boolean {
  return fin < debut;
}

export function formatCreneau(debut: string, fin: string): string {
  const plage = `${formatHeure(debut)} – ${formatHeure(fin)}`;
  return finLeLendemain(debut, fin) ? `${plage} le lendemain` : plage;
}

export function formatJours(jours: number[]): string {
  if (jours.length === 7) return "tous les jours";
  return JOURS_ISO.filter((jour) => jours.includes(jour.valeur))
    .map((jour) => jour.long)
    .join(", ");
}

// React remet de lui-même un formulaire à zéro après une action serveur.
// Pour qu'une erreur de saisie n'efface pas ce que le restaurateur vient de
// taper, les actions renvoient les valeurs soumises et le formulaire les
// réaffiche ; en cas de succès elles renvoient ces valeurs par défaut, et le
// formulaire repart vide.

export type EspaceValeurs = {
  nom: string;
  capacite: string;
  description: string;
  accepteTable: boolean;
  privatisable: boolean;
  minimum: string;
};

export const ESPACE_VIDE: EspaceValeurs = {
  nom: "",
  capacite: "",
  description: "",
  accepteTable: true,
  privatisable: true,
  minimum: "12",
};

export type ServiceValeurs = {
  nom: string;
  heureDebut: string;
  heureFin: string;
  delai: string;
  jours: number[];
};

export const SERVICE_VIDE: ServiceValeurs = {
  nom: "",
  heureDebut: "19:00",
  heureFin: "23:00",
  delai: "72",
  jours: [],
};

export type SaisieValeurs = {
  nom: string;
  telephone: string;
  date: string;
  couverts: string;
  serviceId: string;
  espaceId: string;
  type: string;
  note: string;
  forcer: boolean;
};

export const SAISIE_VIDE: SaisieValeurs = {
  nom: "",
  telephone: "",
  date: "",
  couverts: "2",
  serviceId: "",
  espaceId: "",
  type: "table",
  note: "",
  forcer: false,
};
