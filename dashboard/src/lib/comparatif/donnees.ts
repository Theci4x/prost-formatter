import {
  ESSAI_JOURS,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";

/**
 * Le comparatif, et sa règle de conduite.
 *
 * Une croix en face d'un concurrent est une affirmation publique. La
 * publicité comparative est licite en France, mais elle doit être
 * objective et vérifiable : on ne coche donc une case que pour ce qui se
 * lit sur la page tarifaire de l'éditeur ou découle de son modèle
 * affiché. Tout ce qui demanderait de tester son produit passe en prose,
 * où l'on peut nuancer.
 *
 * Et deux lignes sur cinq nous sont défavorables, volontairement.
 * Personne ne croit un comparatif dont l'auteur gagne partout, et Klarr
 * vend précisément le contraire : la donnée brute, pas le score flatteur.
 */

export const RELEVE = "septembre 2026";

export type Solution = {
  cle: "klarr" | "thefork" | "zenchef" | "guestonline";
  nom: string;
  url: string | null;
};

export const SOLUTIONS: Solution[] = [
  { cle: "klarr", nom: "Klarr", url: null },
  { cle: "thefork", nom: "TheFork", url: "https://www.thefork.fr" },
  { cle: "zenchef", nom: "Zenchef", url: "https://www.zenchef.com" },
  { cle: "guestonline", nom: "Guestonline", url: "https://www.guestonline.io" },
];

export type Ligne = {
  critere: string;
  /** Vrai quand la réponse de Klarr n'est pas la meilleure des quatre. */
  defavorable?: boolean;
  valeurs: Record<Solution["cle"], string>;
};

export const LIGNES: Ligne[] = [
  {
    critere: "Modèle",
    valeurs: {
      klarr: "Abonnement fixe",
      thefork: "Commission par couvert",
      zenchef: "Abonnement fixe",
      guestonline: "Abonnement fixe",
    },
  },
  {
    critere: "Tarif mensuel",
    valeurs: {
      klarr: `${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations})`,
      thefork: "Variable, selon les couverts",
      zenchef: "À partir de 109 €",
      guestonline: "À partir de 99 €",
    },
  },
  {
    critere: "Commission par couvert",
    valeurs: {
      klarr: "Aucune",
      thefork: "1 à 2 € par couvert",
      zenchef: "Aucune",
      guestonline: "Aucune",
    },
  },
  {
    // La ligne que personne n'écrit sur son propre comparatif, et c'est
    // pour ça qu'on l'écrit : c'est elle qui rend les autres croyables.
    critere: "Vous amène des clients qui ne vous connaissent pas",
    defavorable: true,
    valeurs: {
      klarr: "Non",
      thefork: "Oui, c'est son métier",
      zenchef: "Non",
      guestonline: "Non",
    },
  },
  {
    critere: "Suit ce que les assistants IA répondent sur vous",
    valeurs: {
      klarr: "Oui",
      thefork: "Non",
      zenchef: "Non",
      guestonline: "Non",
    },
  },
];

/** Ce que Klarr ne fait pas, dit avant qu'on le découvre. */
export const LIMITES = [
  {
    titre: "Klarr ne vous amène pas de clients",
    texte:
      "TheFork est une place de marché : des gens y cherchent un restaurant sans en avoir choisi un. Klarr ne fait rien de tel. Il sert ceux qui vous cherchent déjà, ou qui vous trouvent par Google. Un mardi de janvier dans une salle vide, une commission payée à TheFork peut être le meilleur investissement du mois.",
  },
  {
    titre: "Pas de bouton « Réserver » dans Google",
    texte:
      "Le programme « Réserver avec Google » permet de réserver sans quitter la fiche Google. Klarr n'en fait pas partie. Vous pouvez en revanche coller votre lien de réservation dans votre fiche : Google affiche alors un bouton qui renvoie vers votre page. C'est gratuit, immédiat, et ça ne dépend de personne.",
  },
  {
    titre: "Pas de plan de salle sur les autres logiciels",
    texte:
      "Klarr ne se branche sur aucun des trois autres. Si vous utilisez déjà TheFork, les deux peuvent cohabiter — TheFork pour sa place de marché, Klarr pour vos réservations directes — mais les carnets restent séparés.",
  },
];

export const TARIFS_KLARR = {
  visibilite: `${PRIX_MODULE.visibilite} (${PRIX_MODULE_TTC.visibilite}) — ${ESSAI_JOURS.visibilite} jours d'essai`,
  reservations: `${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations}) — ${ESSAI_JOURS.reservations} jours d'essai`,
  pack: `${PRIX_PACK} (${PRIX_PACK_TTC}), soit onze pour cent de moins que séparément`,
};

export const QUESTIONS_COMPARATIF = [
  {
    question: "Quel logiciel de réservation ne prend pas de commission ?",
    reponse: `Klarr, Zenchef et Guestonline facturent un abonnement sans commission par couvert. TheFork se rémunère à la commission, de un à deux euros par couvert réservé via sa place de marché. Au relevé de ${RELEVE}, Klarr est le moins cher des trois sans commission, à ${PRIX_MODULE.reservations}.`,
  },
  {
    question: "Peut-on utiliser Klarr et TheFork en même temps ?",
    reponse:
      "Oui, et c'est souvent le bon montage. TheFork vous amène des clients qui ne vous connaissent pas, avec sa commission ; Klarr encaisse sans commission ceux qui vous cherchent déjà. Les deux carnets restent séparés.",
  },
  {
    question: "Klarr remplace-t-il ma fiche Google ?",
    reponse:
      "Non, il la surveille et vous aide à la tenir. La réservation se fait sur votre page, dont vous collez le lien dans votre fiche Google.",
  },
  {
    question: "Y a-t-il des frais de mise en service chez Klarr ?",
    reponse: `Non. Aucun frais d'installation, aucun engagement, résiliation en un clic depuis le tableau de bord. L'essai dure ${ESSAI_JOURS.reservations} jours sur les réservations et ${ESSAI_JOURS.visibilite} jours sur la visibilité.`,
  },
];
