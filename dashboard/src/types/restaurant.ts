export const JOURS_SEMAINE = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

export type JourSemaine = (typeof JOURS_SEMAINE)[number];

export type HoraireJour = {
  ferme: boolean;
  ouverture: string; // "HH:MM"
  fermeture: string; // "HH:MM"
};

export type Horaires = Partial<Record<JourSemaine, HoraireJour>>;

export type Restaurant = {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  site_web: string | null;
  description: string | null;
  horaires: Horaires;
  proprietaire_id: string;
  created_at: string;
};
