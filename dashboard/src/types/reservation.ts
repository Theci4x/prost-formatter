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
  // Acompte réclamé pour une privatisation de cet espace, en centimes.
  // NULL quand l'espace n'en demande pas.
  acompte_centimes: number | null;
  acompte_mode: "forfait" | "par_couvert";
  // Plafond débitable en cas de défection. Exclusif de l'acompte : on ne
  // réclame pas les deux au même client.
  caution_centimes: number | null;
  caution_mode: "forfait" | "par_couvert";
  // À partir de combien de convives la garantie se déclenche. NULL quand
  // elle s'applique dès le premier.
  garantie_seuil_couverts: number | null;
  /**
   * Minimum de consommation pour privatiser, en centimes. NULL quand il
   * n'y en a pas. Ce n'est pas une garantie : rien n'est encaissé ni
   * bloqué, c'est un engagement annoncé qui s'honore à table.
   */
  minimum_consommation_centimes: number | null;
  /** Vrai quand le montant s'entend hors taxes. */
  minimum_consommation_ht: boolean;
};

export type Service = {
  id: string;
  restaurant_id: string;
  nom: string;
  // Convention ISO : 1 = lundi … 7 = dimanche.
  jours: number[];
  heure_debut: string;
  heure_fin: string;
  /**
   * Combien de temps une table reste occupée, en minutes. C'est ce qui
   * permet de vendre plusieurs fois la même place dans un service : sans
   * elle, une salle de 92 couverts n'en vend que 92 pour la soirée.
   */
  duree_minutes: number;
  delai_heures: number;
  ordre: number;
};

/**
 * Une période pendant laquelle on ne prend rien. `espace_id` à null ferme
 * l'établissement entier ; renseigné, il ne ferme que cet espace.
 */
export type Fermeture = {
  id: string;
  restaurant_id: string;
  espace_id: string | null;
  date_debut: string;
  date_fin: string;
  motif: string | null;
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
  // Montant saisi en euros, tel que tapé — la conversion en centimes se fait
  // à l'enregistrement.
  acompte: string;
  acompteMode: "forfait" | "par_couvert";
  caution: string;
  cautionMode: "forfait" | "par_couvert";
  // À partir de combien de convives la garantie s'applique. Vide = dès le
  // premier.
  seuil: string;
  /** Minimum de consommation en euros, tel que tapé. Vide = aucun. */
  minimumConsommation: string;
  minimumConsommationHt: boolean;
  // Ce que l'espace réclame : rien, un acompte, ou une carte en garantie.
  garantie: "aucune" | "acompte" | "caution";
};

export const ESPACE_VIDE: EspaceValeurs = {
  nom: "",
  capacite: "",
  description: "",
  accepteTable: true,
  privatisable: true,
  minimum: "12",
  acompte: "",
  acompteMode: "forfait",
  caution: "",
  cautionMode: "forfait",
  seuil: "",
  minimumConsommation: "",
  minimumConsommationHt: true,
  garantie: "aucune",
};

export type ServiceValeurs = {
  nom: string;
  heureDebut: string;
  heureFin: string;
  duree: string;
  delai: string;
  jours: number[];
};

export const SERVICE_VIDE: ServiceValeurs = {
  nom: "",
  heureDebut: "19:00",
  heureFin: "23:00",
  duree: "120",
  delai: "72",
  jours: [],
};

export type SaisieValeurs = {
  nom: string;
  /**
   * Obligatoire, comme sur le formulaire public. Une réservation sans
   * adresse ne reçoit ni confirmation, ni rappel de la veille, ni lien
   * pour rendre sa table : elle est muette, et personne ne s'en aperçoit
   * avant le jour dit.
   */
  email: string;
  telephone: string;
  /** L'heure d'arrivée retenue, « 19:30 ». */
  heure: string;
  date: string;
  couverts: string;
  serviceId: string;
  // Vide quand la réservation est ordinaire : c'est Klarr qui place.
  espaceId: string;
  type: "table" | "privatisation";
  note: string;
  forcer: boolean;
};

export const SAISIE_VIDE: SaisieValeurs = {
  nom: "",
  email: "",
  telephone: "",
  heure: "",
  date: "",
  couverts: "2",
  serviceId: "",
  espaceId: "",
  type: "table",
  note: "",
  forcer: false,
};

export type FermetureValeurs = {
  dateDebut: string;
  dateFin: string;
  espaceId: string;
  motif: string;
};

export const FERMETURE_VIDE: FermetureValeurs = {
  dateDebut: "",
  dateFin: "",
  espaceId: "",
  motif: "",
};
