/**
 * « Ce local peut-il accueillir mon restaurant ? »
 *
 * **Ce questionnaire ne rend jamais de verdict.** C'est la contrainte qui
 * tient tout le fichier, et elle n'est pas une précaution d'avocat.
 *
 * Un outil qui répondrait « ce local convient » serait lu comme une
 * autorisation. Quelqu'un signerait dessus. Et le jour où le syndic
 * refuse le passage du conduit en parties communes, ce ne sera pas une
 * déception : ce seront trente mille euros de travaux impossibles et un
 * bail de neuf ans sur les bras. Klarr n'a vu ni le local, ni le
 * règlement de copropriété, ni le bail. Klarr ne peut donc rien conclure.
 *
 * Ce qu'il fait à la place : transformer « je ne sais pas » en **une
 * question précise adressée à quelqu'un de précis**. Le syndic pour le
 * règlement, la mairie pour l'urbanisme et le domaine public, le bailleur
 * pour la destination, un bureau d'études pour l'extraction. C'est moins
 * spectaculaire qu'un feu vert, et infiniment plus utile : un
 * restaurateur qui arrive chez le syndic en sachant quoi demander
 * n'achète pas le même local que celui qui découvre après.
 *
 * Les cinq points sont ceux qui empêchent d'ouvrir, pas ceux qui coûtent
 * du temps. On ne parle ici ni de licence, ni de HACCP, ni de SACEM : ça
 * se règle après la signature. L'extraction, la destination, la
 * copropriété, l'ERP et la terrasse se règlent avant — ou ne se règlent
 * pas.
 */

export type Reponse = "oui" | "non" | "inconnu";
export const REPONSES: Reponse[] = ["oui", "non", "inconnu"];

/**
 * Trois niveaux, et aucun ne dit « c'est bon ».
 *
 * « leve » signifie seulement que ce point-ci ne réclame plus de
 * vérification — pas que le local convient. Aucun cumul de « leve » ne
 * produit jamais un feu vert, et l'écran le répète.
 */
export type Niveau = "bloquant" | "verifier" | "leve";

export type PointId =
  | "extraction"
  | "destination"
  | "copropriete"
  | "erp"
  | "terrasse";

export type Point = {
  id: PointId;
  titre: string;
  /** Pourquoi ce point est sur la liste des cinq, et pas ailleurs. */
  enjeu: string;
  /** À qui poser la question. C'est la vraie valeur de l'outil. */
  aQuiDemander: string;
  /** L'article du journal qui développe, quand il existe. */
  article?: { slug: string; titre: string };
};

export const POINTS: Point[] = [
  {
    id: "extraction",
    titre: "L'extraction",
    enjeu:
      "C'est le point qui tue le plus de projets, et le seul qu'on ne peut pas contourner avec de l'argent. Les odeurs de cuisson doivent sortir au-dessus du toit, pas en façade. S'il n'existe pas de conduit, il faut en créer un — il traverse des parties communes, donc il demande un vote en assemblée générale, qui se refuse. Le coût se compte en dizaines de milliers d'euros quand c'est possible, et il arrive que ça ne le soit pas.",
    aQuiDemander:
      "Le syndic, pour savoir si un conduit existe et s'il dessert votre lot. Un bureau d'études fluides ou un cuisiniste, pour vérifier qu'il est dimensionné pour votre cuisine. Et le règlement de copropriété, avant tout le reste.",
    article: {
      slug: "diagnostics-avant-travaux-restaurant",
      titre: "Les diagnostics à faire avant de toucher aux murs",
    },
  },
  {
    id: "destination",
    titre: "La destination",
    enjeu:
      "Deux choses différentes portent le même mot, et on les confond tout le temps. La destination du **bail** dit ce que vous avez le droit d'exercer dans les murs : « tous commerces » n'inclut pas forcément la restauration, et en changer suppose une déspécialisation, avec une procédure et l'accord du bailleur. La destination **urbanistique** du local, elle, se règle en mairie : transformer un commerce en restaurant peut demander une autorisation de changement de destination.",
    aQuiDemander:
      "Le bail lui-même, sa clause de destination, mot à mot — pas le résumé de l'agent. Le bailleur, par écrit. Et le service urbanisme de la mairie pour la partie changement de destination.",
  },
  {
    id: "copropriete",
    titre: "La copropriété",
    enjeu:
      "Un règlement de copropriété peut interdire purement et simplement une activité de restauration, et ce n'est pas rare dans les immeubles d'habitation. Même sans interdiction, c'est lui qui commande le passage du conduit, les horaires, les livraisons et le bruit. Un voisin du dessus n'a pas besoin d'une interdiction écrite pour vous coûter cher : les troubles anormaux de voisinage se plaident.",
    aQuiDemander:
      "Le syndic : le règlement de copropriété en entier, et les procès-verbaux des dernières assemblées générales. Les PV disent ce que la copropriété a déjà refusé à d'autres.",
  },
  {
    id: "erp",
    titre: "L'ERP",
    enjeu:
      "Un restaurant reçoit du public : il obéit aux règles des ERP, et sa catégorie dépend du nombre de personnes qu'il peut accueillir — public et personnel — pas du nombre de chaises que vous comptez mettre. Changer de catégorie change tout : dégagements, alarme, passage de la commission de sécurité. S'y ajoute l'accessibilité, obligatoire, avec des dérogations qui se demandent et ne s'obtiennent pas toujours.",
    aQuiDemander:
      "La mairie, service des ERP ou de l'autorisation de travaux. Un architecte ou un bureau de contrôle si vous touchez à la distribution des locaux.",
    article: {
      slug: "erp-restaurant-categorie-commission-securite",
      titre: "ERP : votre capacité ne dépend pas du nombre de chaises",
    },
  },
  {
    id: "terrasse",
    titre: "La terrasse",
    enjeu:
      "Une terrasse sur le trottoir n'appartient pas au fonds de commerce. L'autorisation d'occuper le domaine public est personnelle, précaire et révocable : elle ne se transmet pas avec le local. Le vendeur peut exploiter une terrasse depuis quinze ans sans que vous soyez sûr d'obtenir la même. Et une terrasse représente souvent la moitié des couverts d'été.",
    aQuiDemander:
      "La mairie, service de l'occupation du domaine public. Demandez ce qui est autorisé aujourd'hui, et ce qui serait autorisé à un nouvel exploitant — ce sont deux réponses différentes.",
    article: {
      slug: "terrasse-restaurant-autorisation-domaine-public",
      titre: "La terrasse ne se vend pas avec le fonds de commerce",
    },
  },
];

export type Constat = { niveau: Niveau; texte: string };

export type Question = {
  id: string;
  point: PointId;
  texte: string;
  aide?: string;
  /** Ce que chaque réponse déclenche. Aucune ne produit « c'est bon ». */
  suites: Record<Reponse, Constat>;
};

const A_VERIFIER: Constat = {
  niveau: "verifier",
  texte: "À vérifier avant de signer.",
};

export const QUESTIONS: Question[] = [
  {
    id: "conduit",
    point: "extraction",
    texte:
      "Le local dispose-t-il déjà d'un conduit d'extraction qui monte au-dessus du toit ?",
    aide: "Une hotte qui rejette en façade ou dans la cour n'est pas un conduit d'extraction.",
    suites: {
      oui: {
        niveau: "verifier",
        texte:
          "Un conduit existe : c'est la bonne nouvelle. Reste à faire confirmer qu'il dessert bien votre lot, qu'il est dimensionné pour votre cuisine et qu'il est en état — un conduit ancien peut être hors service ou revendiqué par un autre lot.",
      },
      non: {
        niveau: "bloquant",
        texte:
          "Sans conduit, il faut en créer un, et il traversera des parties communes. Cela suppose un vote en assemblée générale qui peut être refusé, et un coût qui se compte en dizaines de milliers d'euros. C'est le point à régler avant de discuter du prix, pas après.",
      },
      inconnu: {
        niveau: "bloquant",
        texte:
          "Ne signez pas sans le savoir. C'est la question la plus chère de la liste, et la seule dont la réponse peut rendre le projet impossible plutôt que coûteux.",
      },
    },
  },
  {
    id: "restaurant-avant",
    point: "extraction",
    texte: "Un restaurant était-il déjà exploité dans ce local ?",
    aide: "Un prédécesseur rend l'extraction plausible — il ne la garantit pas.",
    suites: {
      oui: {
        niveau: "verifier",
        texte:
          "Un restaurant précédent est un bon signe, jamais une preuve. Demandez depuis quand il a fermé : une installation à l'arrêt depuis des années peut ne plus être conforme, et une activité tolérée par le passé ne crée pas de droit.",
      },
      non: {
        niveau: "verifier",
        texte:
          "Aucun prédécesseur en restauration : extraction, destination et copropriété sont à vérifier une par une, sans rien présumer.",
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "bail-restauration",
    point: "destination",
    texte:
      "Le bail autorise-t-il explicitement l'activité de restauration, en toutes lettres ?",
    aide: "« Tous commerces » n'est pas « restauration ». Lisez la clause, pas le résumé.",
    suites: {
      oui: {
        niveau: "leve",
        texte:
          "La clause vous couvre. Gardez-en une copie et vérifiez qu'elle vise bien la restauration sur place si c'est votre projet, et pas seulement la vente à emporter.",
      },
      non: {
        niveau: "bloquant",
        texte:
          "Exercer une activité que le bail ne prévoit pas suppose une déspécialisation : une procédure, des délais, et l'accord ou l'arbitrage du bailleur. Faites-la trancher avant de signer, jamais après.",
      },
      inconnu: {
        niveau: "bloquant",
        texte:
          "La clause de destination se lit en deux minutes et engage neuf ans. Demandez le projet de bail et faites-la relire.",
      },
    },
  },
  {
    id: "changement-destination",
    point: "destination",
    texte:
      "Le local est-il déjà un commerce de restauration au regard de l'urbanisme ?",
    aide: "Un ancien bureau, une boutique ou un logement ne le sont pas.",
    suites: {
      oui: { niveau: "leve", texte: "Rien à demander de ce côté-là." },
      non: {
        niveau: "verifier",
        texte:
          "Un changement de destination peut être exigé, avec une autorisation d'urbanisme à obtenir avant travaux. Le délai n'est pas le même partout — c'est une question à poser à votre mairie, pas à un tableau générique.",
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "reglement-copro",
    point: "copropriete",
    texte:
      "Avez-vous lu le règlement de copropriété, et autorise-t-il une activité de restauration ?",
    suites: {
      oui: {
        niveau: "leve",
        texte:
          "Vous l'avez lu, c'est déjà plus que la plupart. Vérifiez au passage ce qu'il dit des horaires, des livraisons et des nuisances : ces clauses-là se réveillent à la première plainte.",
      },
      non: {
        niveau: "bloquant",
        texte:
          "Une clause d'habitation bourgeoise stricte interdit toute activité commerciale, et elle s'impose au bail. Ce document se demande au syndic et se lit avant de signer.",
      },
      inconnu: {
        niveau: "bloquant",
        texte:
          "Le règlement de copropriété prime sur ce que le bailleur vous dit. Réclamez-le, ainsi que les PV des dernières assemblées générales.",
      },
    },
  },
  {
    id: "logements-dessus",
    point: "copropriete",
    texte: "Y a-t-il des logements habités au-dessus du local ?",
    suites: {
      oui: {
        niveau: "verifier",
        texte:
          "Des voisins au-dessus, c'est le bruit de la hotte, les livraisons du matin et les départs de terrasse le soir. Rien de rédhibitoire, mais un sujet à traiter dès le chantier — l'isolation se décide avant, jamais après la première plainte.",
      },
      non: { niveau: "leve", texte: "Un sujet de moins." },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "capacite",
    point: "erp",
    texte:
      "Visez-vous plus de 200 personnes au total, ou du public en étage ou en sous-sol ?",
    aide: "Le total compte le public et le personnel.",
    suites: {
      oui: {
        niveau: "verifier",
        texte:
          "Vous sortez probablement de la cinquième catégorie, celle des petits établissements. Les exigences changent — dégagements, sécurité incendie, passage en commission. À chiffrer avant de signer, parce que ça se traduit en travaux.",
      },
      non: {
        niveau: "verifier",
        texte:
          "Vous restez sans doute dans la catégorie la plus simple, ce qui ne veut pas dire sans obligations : l'autorisation de travaux et l'accessibilité restent dues.",
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "accessibilite",
    point: "erp",
    texte: "L'entrée est-elle accessible de plain-pied depuis la rue ?",
    aide: "Une marche compte. C'est souvent elle qui déclenche la demande de dérogation.",
    suites: {
      oui: {
        niveau: "leve",
        texte:
          "Le plus gros de l'accessibilité est acquis. Restent les sanitaires et la circulation intérieure.",
      },
      non: {
        niveau: "verifier",
        texte:
          "Il faudra un aménagement, ou une dérogation motivée. Une dérogation se demande et s'obtient parfois — elle ne se présume jamais, et le refus arrive après la signature.",
      },
      inconnu: A_VERIFIER,
    },
  },
  {
    id: "terrasse-annoncee",
    point: "terrasse",
    texte: "Une terrasse vous est-elle annoncée avec le local ?",
    suites: {
      oui: {
        niveau: "bloquant",
        texte:
          "L'autorisation d'occuper le domaine public est personnelle et révocable : elle ne se transmet pas avec le fonds. Si votre calcul de chiffre d'affaires compte sur la terrasse, allez demander en mairie ce qui serait accordé à un nouvel exploitant — avant de signer, et par écrit.",
      },
      non: {
        niveau: "leve",
        texte:
          "Pas de terrasse annoncée, donc pas de recette à sécuriser de ce côté.",
      },
      inconnu: A_VERIFIER,
    },
  },
];

export type Bilan = {
  point: Point;
  niveau: Niveau;
  constats: Constat[];
};

const RANG: Record<Niveau, number> = { leve: 0, verifier: 1, bloquant: 2 };

/** Ce que le client a répondu, lu depuis l'adresse. */
export function lireReponses(
  query: Record<string, string | string[] | undefined>,
): Map<string, Reponse> {
  const reponses = new Map<string, Reponse>();
  for (const question of QUESTIONS) {
    const brut = query[question.id];
    const valeur = Array.isArray(brut) ? brut[0] : brut;
    if (valeur === "oui" || valeur === "non" || valeur === "inconnu") {
      reponses.set(question.id, valeur);
    }
  }
  return reponses;
}

/**
 * Le bilan, point par point.
 *
 * Une question laissée sans réponse est traitée comme « je ne sais pas ».
 * Sauter une question ne fait donc jamais disparaître le sujet : c'est
 * exactement l'inverse de ce qu'on veut d'un outil de cette nature.
 */
export function etablirBilan(reponses: Map<string, Reponse>): Bilan[] {
  return POINTS.map((point) => {
    const constats = QUESTIONS.filter((q) => q.point === point.id).map(
      (question) => question.suites[reponses.get(question.id) ?? "inconnu"],
    );
    const niveau = constats.reduce<Niveau>(
      (pire, constat) =>
        RANG[constat.niveau] > RANG[pire] ? constat.niveau : pire,
      "leve",
    );
    return { point, niveau, constats };
  });
}

export function compter(bilans: Bilan[]): Record<Niveau, number> {
  return {
    bloquant: bilans.filter((b) => b.niveau === "bloquant").length,
    verifier: bilans.filter((b) => b.niveau === "verifier").length,
    leve: bilans.filter((b) => b.niveau === "leve").length,
  };
}
