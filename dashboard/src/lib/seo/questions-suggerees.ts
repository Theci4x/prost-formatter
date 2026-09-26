/**
 * Ce qu'on demande le plus, et que le téléphone encaisse en plein service.
 *
 * **Des réponses toutes faites, pas seulement des questions.** Suggérer la
 * question laissait la réponse à rédiger, et c'est là que la saisie
 * s'arrête : un restaurateur entre deux services ne compose pas huit
 * paragraphes. Il reconnaît en revanche sa maison dans une phrase qu'on
 * lui propose, et un doigt suffit. La phrase reste modifiable ensuite —
 * elle est un point de départ, pas un gabarit imposé.
 *
 * Hors du fichier d'actions : un module « use server » ne peut exporter
 * que des fonctions asynchrones, et une simple liste y fait échouer la
 * compilation de la page entière.
 */

/** Ce que la fiche dit déjà, et qui décide des questions à poser. */
export type Fiche = {
  /** Au moins un service commence avant quinze heures. */
  serviceMidi: boolean;
};

export type Suggestion = {
  question: string;
  /** Les réponses proposées, la plus courante en premier. */
  reponses: string[];
  /** Vrai quand poser la question n'aurait pas de sens pour cette maison. */
  horsSujet?: (fiche: Fiche) => boolean;
};

/**
 * On ne demande pas ce que la fiche sait déjà.
 *
 * « Peut-on privatiser une salle ? » a quitté cette liste : les espaces
 * portent leur minimum de privatisation, donc la réponse se lit dans la
 * fiche — oui avec les conditions, ou non s'il n'y en a aucun. Faire
 * retaper à la main une information déjà saisie est le plus sûr moyen
 * qu'on cesse de remplir.
 */
export const SUGGESTIONS: Suggestion[] = [
  {
    question: "Avez-vous une terrasse ?",
    reponses: [
      "Oui, nous avons une terrasse.",
      "Oui, une terrasse chauffée, ouverte toute l'année.",
      "Non, nous n'avons pas de terrasse.",
    ],
  },
  {
    question: "Êtes-vous accessible en fauteuil roulant ?",
    reponses: [
      "Oui, la salle et les toilettes sont accessibles.",
      "La salle est accessible de plain-pied, les toilettes ne le sont pas.",
      "Non, l'accès se fait par quelques marches.",
    ],
  },
  {
    question: "Acceptez-vous les chiens ?",
    reponses: [
      "Oui, les chiens sont les bienvenus.",
      "Oui, en terrasse uniquement.",
      "Non, nous n'acceptons pas les animaux.",
    ],
  },
  {
    question: "Avez-vous des plats végétariens ?",
    reponses: [
      "Oui, plusieurs plats végétariens figurent à la carte.",
      "Oui, au moins un plat végétarien à chaque service.",
      "Non, mais prévenez-nous en réservant et nous nous adaptons.",
    ],
  },
  {
    question: "Y a-t-il un parking à proximité ?",
    reponses: [
      "Oui, un parking public à moins de cinq minutes à pied.",
      "Oui, nous avons notre propre parking.",
      "Non, le stationnement se fait dans la rue.",
    ],
  },
  {
    question: "Peut-on venir sans réserver ?",
    reponses: [
      "Oui, nous gardons toujours quelques tables pour les passages.",
      "Le midi oui, le soir nous conseillons vivement de réserver.",
      "Non, nous fonctionnons uniquement sur réservation.",
    ],
  },
  {
    question: "Proposez-vous un menu du midi ?",
    // Une maison qui n'ouvre que le soir n'a pas à répondre là-dessus.
    horsSujet: (fiche) => !fiche.serviceMidi,
    reponses: [
      "Oui, une formule du midi en semaine.",
      "Oui, un menu du midi tous les jours.",
      "Non, la carte est la même midi et soir.",
    ],
  },
];

/** Deux libellés désignent la même question à la casse et aux espaces près. */
function memeQuestion(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Les questions qui concernent cette maison, déjà répondues comprises. */
export function questionsPertinentes(fiche: Fiche): Suggestion[] {
  return SUGGESTIONS.filter((s) => !s.horsSujet?.(fiche));
}

/** Celles qu'il reste à répondre : ni hors sujet, ni déjà dans la fiche. */
export function questionsARepondre(
  fiche: Fiche,
  dejaPosees: string[],
): Suggestion[] {
  return questionsPertinentes(fiche).filter(
    (s) => !dejaPosees.some((posee) => memeQuestion(posee, s.question)),
  );
}

/**
 * Où en est la fiche, pour le dire en une phrase au restaurateur.
 *
 * `repondues` peut dépasser `attendues` : rien n'empêche d'ajouter ses
 * propres questions, et c'est tant mieux. On borne donc l'affichage
 * plutôt que d'annoncer « 9 sur 7 ».
 */
export function completude(
  fiche: Fiche,
  dejaPosees: string[],
): { repondues: number; attendues: number; complet: boolean } {
  const attendues = questionsPertinentes(fiche).length;
  const restantes = questionsARepondre(fiche, dejaPosees).length;
  return {
    repondues: Math.min(attendues - restantes, attendues),
    attendues,
    complet: restantes === 0,
  };
}
