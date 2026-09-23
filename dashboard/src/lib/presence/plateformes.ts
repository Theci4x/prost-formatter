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

export type GroupePresence = "cartes" | "avis" | "reseaux" | "annuaires";

export const LIBELLE_GROUPE: Record<GroupePresence, string> = {
  cartes: "Cartes et assistants",
  avis: "Avis et guides",
  reseaux: "Réseaux et site",
  annuaires: "Pour aller plus loin : annuaires et GPS",
};

export type Plateforme = {
  cle: string;
  nom: string;
  groupe: GroupePresence;
  /**
   * 1 = essentielle : là où les clients cherchent vraiment. 2 = pour aller
   * plus loin : annuaires et GPS, utiles surtout parce que d'autres
   * services puisent dans leurs données.
   */
  niveau: 1 | 2;
  /** Le temps qu'il faut compter, hors attente de la vérification. */
  minutes: number;
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
  /**
   * La marche à suivre, étape par étape. Écrite pour quelqu'un qui n'a
   * jamais revendiqué de fiche : c'est le cas de la plupart des
   * restaurateurs, et c'est la raison pour laquelle ils ne le font pas.
   * Les plateformes changent leurs écrans : on décrit le chemin, pas
   * l'intitulé exact de chaque bouton.
   */
  etapes?: string[];
};

/** L'étape commune : recopier la fiche plutôt que la retaper. */
const COLLER =
  "Remplis la fiche en collant les champs de « Ta fiche à copier » : mêmes nom, téléphone et horaires, au caractère près.";

/**
 * Quand la fiche existe déjà et que seule la fiche Klarr a changé : pas
 * besoin de tout reprendre, seulement de reporter la différence.
 */
export const ETAPES_MISE_A_JOUR: string[] = [
  "Ouvre ta fiche sur la plateforme et connecte-toi au compte qui la gère.",
  "Compare chaque champ avec « Ta fiche à copier » : nom, adresse, téléphone, site, horaires.",
  "Corrige ce qui a changé, enregistre, puis confirme ici que c'est à jour.",
];

const q = encodeURIComponent;

/**
 * Une recherche Google sur le nom de l'annuaire : pour ceux dont l'adresse
 * change selon le pays ou l'époque, c'est plus sûr qu'un lien direct.
 */
const avecLeNom = (annuaire: string) => (nom: string, adresse: string) =>
  `https://www.google.com/search?q=${q(`${annuaire} ${nom} ${adresse}`.trim())}`;

/**
 * La marche commune aux annuaires : chacun a son formulaire, mais le
 * chemin est toujours le même, et nommer des boutons qui changent
 * d'intitulé d'une année sur l'autre égarerait plus qu'il n'aiderait.
 */
const ANNUAIRE: string[] = [
  "Clique « Vérifier ma fiche » : beaucoup d'annuaires ont déjà créé ta fiche à partir d'autres sources.",
  "Si elle existe, cherche sur la fiche le lien destiné aux professionnels (« revendiquer », « modifier », « signaler une erreur »).",
  "Sinon, cherche sur le site l'inscription gratuite pour les professionnels. Ignore les offres payantes : elles ne sont pas nécessaires.",
];

/** Une recherche Google limitée à un site : robuste, sans paramètre maison. */
const surLeSite = (domaine: string) => (nom: string, adresse: string) =>
  `https://www.google.com/search?q=${q(`site:${domaine} ${nom} ${adresse}`.trim())}`;

export const PLATEFORMES: Plateforme[] = [
  {
    cle: "google",
    nom: "Google Recherche et Maps",
    groupe: "cartes",
    niveau: 1,
    minutes: 15,
    pourquoi:
      "L'essentiel des recherches « restaurant près de moi » passent par là.",
    creer: "https://business.google.com/",
    verifier: (nom, adresse) =>
      `https://www.google.com/maps/search/?api=1&query=${q(`${nom} ${adresse}`.trim())}`,
    ecranKlarr: "google",
    etapes: [
      "Ouvre « Créer ou revendiquer » et connecte-toi avec un compte Google — idéalement créé avec l'adresse e-mail du restaurant, pas un compte personnel.",
      "Cherche ton restaurant : s'il existe déjà sur Maps, revendique-le ; sinon, ajoute-le.",
      "Google vérifie que tu en es le gérant. Selon les cas : courte vidéo de la devanture, appel, SMS, e-mail ou courrier. Suis la méthode qu'il te propose.",
      COLLER,
      "Reviens dans Klarr, écran « Fiche Google », et relie ton compte : ta note et tes avis remonteront tout seuls.",
    ],
  },
  {
    cle: "apple",
    nom: "Apple Plans et Siri",
    groupe: "cartes",
    niveau: 1,
    minutes: 15,
    pourquoi:
      "Ce que voit un client sur iPhone quand il demande à Siri ou ouvre Plans.",
    conseil:
      "Gratuit avec un identifiant Apple. Apple vérifie l'établissement, parfois par téléphone.",
    creer: "https://businessconnect.apple.com/",
    verifier: (nom, adresse) =>
      `https://maps.apple.com/?q=${q(`${nom} ${adresse}`.trim())}`,
    etapes: [
      "Ouvre « Créer ou revendiquer » et connecte-toi avec un identifiant Apple. Pas besoin d'iPhone : le mieux est d'en créer un avec l'adresse e-mail du restaurant.",
      "Cherche ton restaurant : s'il apparaît déjà dans Plans, revendique-le ; sinon, crée l'établissement.",
      "Apple vérifie que tu en es le gérant, souvent par un appel au numéro de la fiche ou avec un justificatif. Compte quelques jours.",
      COLLER,
      "Ajoute quelques photos et ton lien de réservation, puis reviens ici cliquer « À jour ».",
    ],
  },
  {
    cle: "bing",
    nom: "Bing et Copilot",
    groupe: "cartes",
    niveau: 1,
    minutes: 10,
    pourquoi:
      "Une partie des assistants IA cherchent sur le web via Bing : une fiche absente ici leur manque.",
    conseil:
      "Bing Places sait importer ta fiche Google : c'est le plus rapide.",
    creer: "https://www.bingplaces.com/",
    verifier: (nom, adresse) =>
      `https://www.bing.com/maps?q=${q(`${nom} ${adresse}`.trim())}`,
    etapes: [
      "Ouvre « Créer ou revendiquer » et connecte-toi avec un compte Microsoft, Google ou Facebook.",
      "Choisis l'import depuis ta fiche Google : Bing reprend nom, adresse, horaires et photos en une fois. Sans fiche Google, ajoute l'établissement à la main.",
      "Bing vérifie ensuite l'établissement ; suis la méthode proposée.",
      "Relis la fiche importée et corrige ce qui diffère de « Ta fiche à copier », puis reviens ici cliquer « À jour ».",
    ],
  },
  {
    cle: "tripadvisor",
    nom: "TripAdvisor",
    groupe: "avis",
    niveau: 1,
    minutes: 15,
    pourquoi: "Les touristes, et les avis que les assistants citent souvent.",
    creer: "https://www.tripadvisor.fr/Owners",
    verifier: (nom, adresse) =>
      `https://www.tripadvisor.fr/Search?q=${q(`${nom} ${adresse}`.trim())}`,
    ecranKlarr: "avis",
    etapes: [
      "Clique « Vérifier ma fiche » : la plupart des restaurants ont déjà une fiche, créée par des clients.",
      "Ouvre « Créer ou revendiquer », cherche ton restaurant et revendique-le avec un compte TripAdvisor.",
      "TripAdvisor vérifie que tu es le gérant ; suis la méthode proposée.",
      COLLER,
      "Dans Klarr, écran « Avis », épingle ta fiche TripAdvisor : ta note s'affichera avec les autres.",
    ],
  },
  {
    cle: "pagesjaunes",
    nom: "PagesJaunes",
    groupe: "avis",
    niveau: 1,
    minutes: 15,
    pourquoi:
      "Encore très consulté en France, et repris par de nombreux annuaires.",
    conseil:
      "Si ta fiche existe, revendique-la depuis la fiche elle-même ; l'inscription de base est gratuite.",
    verifier: surLeSite("pagesjaunes.fr"),
    etapes: [
      "Clique « Vérifier ma fiche » pour trouver ta page sur PagesJaunes.",
      "Sur ta fiche, suis le lien destiné aux professionnels pour la revendiquer, et crée ton compte pro.",
      "Sans fiche, inscris ton établissement depuis l'espace professionnel : l'inscription de base est gratuite.",
      COLLER,
      "Des offres payantes te seront proposées : elles ne sont pas nécessaires pour une fiche juste.",
    ],
  },
  {
    cle: "petitfute",
    nom: "Petit Futé",
    groupe: "avis",
    niveau: 1,
    minutes: 10,
    pourquoi: "Le guide que consultent les visiteurs qui préparent un séjour.",
    conseil:
      "Cherche ta fiche : si elle existe, un lien pour les professionnels permet de la corriger.",
    verifier: surLeSite("petitfute.com"),
    etapes: [
      "Clique « Vérifier ma fiche » pour voir si le guide parle déjà de toi.",
      "Si oui, suis le lien pour les professionnels sur la fiche et demande la correction de ce qui ne va pas.",
      "Si non, le Petit Futé est un guide : il choisit ses adresses. Tu peux lui proposer la tienne depuis son espace professionnel, sans garantie d'y figurer.",
      "Reviens ici cliquer ce que tu as trouvé.",
    ],
  },
  {
    cle: "yelp",
    nom: "Yelp",
    groupe: "avis",
    niveau: 1,
    minutes: 10,
    pourquoi:
      "Moins lu en France, mais ses données alimentent d'autres services.",
    creer: "https://business.yelp.com/",
    verifier: (nom, adresse) =>
      `https://www.yelp.fr/search?find_desc=${q(nom)}&find_loc=${q(adresse)}`,
    etapes: [
      "Ouvre « Créer ou revendiquer » et cherche ton restaurant.",
      "Revendique la fiche ou crée-la, avec un compte Yelp pour les professionnels.",
      "Yelp vérifie que tu es le gérant, en général par téléphone ou par e-mail.",
      COLLER,
      "Yelp te proposera de la publicité : tu n'es pas obligé d'en acheter pour avoir une fiche juste.",
    ],
  },
  {
    cle: "facebook",
    nom: "Facebook",
    groupe: "reseaux",
    niveau: 1,
    minutes: 10,
    pourquoi: "Horaires, photos et avis : beaucoup de clients vérifient ici.",
    creer: "https://www.facebook.com/pages/create",
    ecranKlarr: "social",
    etapes: [
      "Ouvre « Créer ou revendiquer » en étant connecté à ton compte Facebook personnel : c'est lui qui administre la page, rien de ta vie privée n'y apparaît.",
      "Choisis la catégorie « Restaurant » et donne à la page le nom exact du restaurant.",
      COLLER,
      "Dans Klarr, écran « Réseaux sociaux », connecte la page : abonnés et derniers posts remonteront tout seuls.",
    ],
  },
  {
    cle: "instagram",
    nom: "Instagram",
    groupe: "reseaux",
    niveau: 1,
    minutes: 5,
    pourquoi: "Là où l'on choisit sur photo, surtout chez les moins de 35 ans.",
    conseil:
      "Passe ton compte en professionnel, puis rattache-le à ta page Facebook.",
    ecranKlarr: "social",
    etapes: [
      "Dans l'application Instagram, ouvre les paramètres du compte et passe-le en compte professionnel, catégorie « Restaurant ».",
      "Toujours dans les paramètres, rattache ce compte à la page Facebook du restaurant.",
      "Mets l'adresse de ta vitrine ou ton lien de réservation dans la bio.",
      "Dans Klarr, écran « Réseaux sociaux », reconnecte Facebook : Instagram suivra avec la page.",
    ],
  },
  {
    cle: "vitrine",
    nom: "Ton site vitrine Klarr",
    groupe: "reseaux",
    niveau: 1,
    minutes: 20,
    pourquoi:
      "La source que toutes les autres fiches peuvent citer : carte, horaires, réservation.",
    ecranKlarr: "vitrine",
    etapes: [
      "Dans Klarr, écran « Vitrine », complète ce qui manque : photos, carte, horaires, description.",
      "Publie-la : elle obtient son adresse, que tu retrouves dans « Ta fiche à copier ».",
      "Colle cette adresse comme site web sur Google, Apple, Bing, Facebook et dans ta bio Instagram : toutes tes fiches pointeront vers la même source.",
    ],
  },
  {
    cle: "waze",
    nom: "Waze",
    groupe: "annuaires",
    niveau: 2,
    minutes: 5,
    pourquoi:
      "Le GPS de beaucoup d'automobilistes : ton restaurant doit y être à la bonne adresse.",
    etapes: [
      "Dans l'application Waze, cherche ton restaurant.",
      "S'il manque ou est mal placé, signale-le depuis l'application : Waze fait valider les lieux par sa communauté d'éditeurs.",
      COLLER,
    ],
  },
  {
    cle: "tomtom",
    nom: "TomTom",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Ses cartes équipent de nombreux GPS de voiture et services de navigation.",
    conseil:
      "TomTom ne crée pas de fiche à la demande : tu lui signales le lieu, et il l'examine avant de l'ajouter.",
    creer: "https://www.tomtom.com/mapshare/tools/",
    verifier: avecLeNom("TomTom"),
    etapes: [
      "Ouvre « Créer ou revendiquer » : c'est l'outil de signalement de TomTom.",
      "Cherche ton adresse sur la carte, puis signale le lieu manquant ou l'information fausse.",
      COLLER,
      "TomTom examine le signalement : il peut s'écouler plusieurs semaines avant qu'il apparaisse.",
    ],
  },
  {
    cle: "mappy",
    nom: "Mappy",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi: "Le site de cartes et d'itinéraires très utilisé en France.",
    verifier: surLeSite("mappy.com"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "foursquare",
    nom: "Foursquare",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Ses données de lieux sont reprises par de nombreuses applications, sans que tu le voies.",
    verifier: surLeSite("foursquare.com"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "118000",
    nom: "118 000",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Un annuaire français encore consulté pour trouver un numéro de téléphone.",
    verifier: surLeSite("118000.fr"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "leshoraires",
    nom: "Les-horaires.fr",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Bien placé sur Google quand on cherche « horaires + nom du restaurant » : un horaire faux s'y voit.",
    verifier: surLeSite("les-horaires.fr"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "horaires24",
    nom: "Horaires d'Ouverture 24",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Même rôle : les horaires affichés quand on les cherche sur Google.",
    verifier: avecLeNom("Horaires d'ouverture 24"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "infobel",
    nom: "Infobel",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Un annuaire européen dont les données sont revendues à d'autres services.",
    verifier: surLeSite("infobel.com"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "cylex",
    nom: "Cylex",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Un annuaire d'entreprises repris par plusieurs moteurs de recherche locaux.",
    verifier: avecLeNom("Cylex"),
    etapes: [...ANNUAIRE, COLLER],
  },
  {
    cle: "hotfrog",
    nom: "Hotfrog",
    groupe: "annuaires",
    niveau: 2,
    minutes: 10,
    pourquoi:
      "Un annuaire gratuit de plus, qui renforce la cohérence de ta fiche sur le web.",
    verifier: avecLeNom("Hotfrog"),
    etapes: [...ANNUAIRE, COLLER],
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
