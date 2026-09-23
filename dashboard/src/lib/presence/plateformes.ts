/**
 * Les plateformes où un restaurant français doit avoir une fiche juste.
 *
 * Pas quarante : les agrégateurs en affichent des dizaines, dont la
 * moitié sont des annuaires que personne ne consulte pour choisir où
 * dîner. Celles-ci sont celles où un client — ou un assistant qui répond
 * à sa place — va réellement chercher.
 *
 * Les liens « vérifier » sont des recherches publiques, qui marchent sans
 * compte ni clé. Les liens « créer » ne sont donnés que pour les portails
 * officiels dont l'adresse est stable ; pour les autres, le conseil dit où
 * chercher le bouton de revendication.
 */

export type GroupePresence = "cartes" | "avis" | "reseaux";

export const LIBELLE_GROUPE: Record<GroupePresence, string> = {
  cartes: "Cartes et assistants",
  avis: "Avis et guides",
  reseaux: "Réseaux et site",
};

export type Plateforme = {
  cle: string;
  nom: string;
  groupe: GroupePresence;
  /** Pourquoi elle compte, en une phrase. */
  pourquoi: string;
  /** Comment s'y prendre, quand ce n'est pas évident. */
  conseil?: string;
  /** Le portail officiel pour créer ou revendiquer la fiche. */
  creer?: string;
  /** Une recherche publique où la fiche doit apparaître. */
  verifier?: (nom: string, adresse: string) => string;
  /** L'écran Klarr qui relie la plateforme, quand il existe. */
  ecranKlarr?: string;
};

const q = encodeURIComponent;

/** Une recherche Google limitée à un site : robuste, sans paramètre maison. */
const surLeSite = (domaine: string) => (nom: string, adresse: string) =>
  `https://www.google.com/search?q=${q(`site:${domaine} ${nom} ${adresse}`.trim())}`;

export const PLATEFORMES: Plateforme[] = [
  {
    cle: "google",
    nom: "Google Recherche et Maps",
    groupe: "cartes",
    pourquoi:
      "L'essentiel des recherches « restaurant près de moi » passent par là.",
    creer: "https://business.google.com/",
    verifier: (nom, adresse) =>
      `https://www.google.com/maps/search/?api=1&query=${q(`${nom} ${adresse}`.trim())}`,
    ecranKlarr: "google",
  },
  {
    cle: "apple",
    nom: "Apple Plans et Siri",
    groupe: "cartes",
    pourquoi:
      "Ce que voit un client sur iPhone quand il demande à Siri ou ouvre Plans.",
    conseil:
      "Gratuit avec un identifiant Apple. Apple vérifie l'établissement, parfois par téléphone.",
    creer: "https://businessconnect.apple.com/",
    verifier: (nom, adresse) =>
      `https://maps.apple.com/?q=${q(`${nom} ${adresse}`.trim())}`,
  },
  {
    cle: "bing",
    nom: "Bing et Copilot",
    groupe: "cartes",
    pourquoi:
      "Une partie des assistants IA cherchent sur le web via Bing : une fiche absente ici leur manque.",
    conseil:
      "Bing Places sait importer ta fiche Google : c'est le plus rapide.",
    creer: "https://www.bingplaces.com/",
    verifier: (nom, adresse) =>
      `https://www.bing.com/maps?q=${q(`${nom} ${adresse}`.trim())}`,
  },
  {
    cle: "tripadvisor",
    nom: "TripAdvisor",
    groupe: "avis",
    pourquoi: "Les touristes, et les avis que les assistants citent souvent.",
    creer: "https://www.tripadvisor.fr/Owners",
    verifier: (nom, adresse) =>
      `https://www.tripadvisor.fr/Search?q=${q(`${nom} ${adresse}`.trim())}`,
    ecranKlarr: "avis",
  },
  {
    cle: "pagesjaunes",
    nom: "PagesJaunes",
    groupe: "avis",
    pourquoi:
      "Encore très consulté en France, et repris par de nombreux annuaires.",
    conseil:
      "Si ta fiche existe, revendique-la depuis la fiche elle-même ; l'inscription de base est gratuite.",
    verifier: surLeSite("pagesjaunes.fr"),
  },
  {
    cle: "petitfute",
    nom: "Petit Futé",
    groupe: "avis",
    pourquoi: "Le guide que consultent les visiteurs qui préparent un séjour.",
    conseil:
      "Cherche ta fiche : si elle existe, un lien pour les professionnels permet de la corriger.",
    verifier: surLeSite("petitfute.com"),
  },
  {
    cle: "yelp",
    nom: "Yelp",
    groupe: "avis",
    pourquoi:
      "Moins lu en France, mais ses données alimentent d'autres services.",
    creer: "https://business.yelp.com/",
    verifier: (nom, adresse) =>
      `https://www.yelp.fr/search?find_desc=${q(nom)}&find_loc=${q(adresse)}`,
  },
  {
    cle: "facebook",
    nom: "Facebook",
    groupe: "reseaux",
    pourquoi: "Horaires, photos et avis : beaucoup de clients vérifient ici.",
    creer: "https://www.facebook.com/pages/create",
    ecranKlarr: "social",
  },
  {
    cle: "instagram",
    nom: "Instagram",
    groupe: "reseaux",
    pourquoi: "Là où l'on choisit sur photo, surtout chez les moins de 35 ans.",
    conseil:
      "Passe ton compte en professionnel, puis rattache-le à ta page Facebook.",
    ecranKlarr: "social",
  },
  {
    cle: "vitrine",
    nom: "Ton site vitrine Klarr",
    groupe: "reseaux",
    pourquoi:
      "La source que toutes les autres fiches peuvent citer : carte, horaires, réservation.",
    ecranKlarr: "vitrine",
  },
];

export const STATUTS = ["a_jour", "a_corriger", "absente"] as const;
export type StatutPresence = (typeof STATUTS)[number];

export const LIBELLE_STATUT: Record<StatutPresence, string> = {
  a_jour: "À jour",
  a_corriger: "À corriger",
  absente: "Pas de fiche",
};

export function estStatut(valeur: unknown): valeur is StatutPresence {
  return STATUTS.includes(valeur as StatutPresence);
}

export function estPlateforme(cle: string): boolean {
  return PLATEFORMES.some((plateforme) => plateforme.cle === cle);
}
