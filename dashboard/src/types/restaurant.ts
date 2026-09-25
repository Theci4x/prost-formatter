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

/** Une plage continue : « 12:00 » → « 15:00 ». */
export type Plage = {
  ouverture: string; // "HH:MM"
  fermeture: string; // "HH:MM"
};

export type HoraireJour = {
  ferme: boolean;
  ouverture: string; // "HH:MM"
  fermeture: string; // "HH:MM"
  /**
   * La seconde plage, quand la maison ferme entre deux services — midi
   * puis soir, le cas le plus courant en France. Absente ou nulle quand
   * le service est continu.
   *
   * Ajoutée après coup, donc facultative : les fiches déjà saisies n'en
   * ont pas, et une fiche sans coupure ne doit pas avoir à en porter une
   * vide.
   */
  seconde?: Plage | null;
};

export type Horaires = Partial<Record<JourSemaine, HoraireJour>>;

export type Restaurant = {
  id: string;
  nom: string;
  adresse: string | null;
  telephone: string | null;
  site_web: string | null;
  yelp_url?: string | null;
  tripadvisor_url?: string | null;
  description: string | null;
  // « Allemande », « Bistrot, cuisine française »… Texte libre : la liste
  // fermée des cuisines n'existe nulle part, et forcer un restaurateur à
  // choisir entre « brasserie » et « traditionnel » produirait surtout des
  // fiches mal rangées.
  type_cuisine: string | null;
  horaires: Horaires;
  proprietaire_id: string;
  // Adresse publique de la page de réservation. NULL tant que le
  // restaurateur ne l'a pas ouverte.
  slug_reservation: string | null;
  // La carte est-elle montrée au client sur cette page ? Faux par défaut :
  // publier est un choix, pas une conséquence de la saisie.
  carte_publique: boolean;
  created_at: string;
};
