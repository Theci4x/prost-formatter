export type Experience = {
  id: string;
  restaurant_id: string;
  nom: string;
  description: string | null;
  prix_centimes: number;
  places: number;
  duree_minutes: number | null;
  // Convention ISO : 1 = lundi … 7 = dimanche.
  jours: number[];
  heure: string;
  date_debut: string | null;
  date_fin: string | null;
  delai_heures: number;
  prepaiement: boolean;
  actif: boolean;
  espace_id: string | null;
  ordre: number;
};

export type PlaceReservee = {
  id: string;
  experience_id: string;
  date_seance: string;
  places: number;
  statut: "attendue" | "confirmee" | "annulee";
};

export type ExperienceValeurs = {
  nom: string;
  description: string;
  prix: string;
  places: string;
  duree: string;
  jours: number[];
  heure: string;
  dateDebut: string;
  dateFin: string;
  delai: string;
  prepaiement: boolean;
};

export const EXPERIENCE_VIDE: ExperienceValeurs = {
  nom: "",
  description: "",
  prix: "",
  places: "12",
  duree: "",
  jours: [],
  heure: "18:00",
  dateDebut: "",
  dateFin: "",
  delai: "24",
  prepaiement: true,
};
