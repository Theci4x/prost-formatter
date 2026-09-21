import type { Langue } from "@/lib/i18n/langue";
import {
  ESSAI_JOURS,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";

/**
 * La page d'accueil, dans les trois langues.
 *
 * Elle diffère de tous les autres dictionnaires sur un point : elle est
 * indexée. D'où deux règles qui ne valent que pour ce fichier.
 *
 * La langue affichée vient du témoin seul, jamais de « Accept-Language »
 * (voir `langueIndexable`) : un robot doit toujours tomber sur la même
 * version, sans quoi la fiche de résultat cesse de correspondre à la
 * page.
 *
 * Et le balisage FAQ suit le texte visible — les questions vivent donc
 * ici, dans les trois langues, et `balisageAccueil` les lit. Un balisage
 * qui annonce une réponse que la page n'affiche pas est une raison
 * documentée de perdre l'affichage enrichi.
 */

export type Question = { question: string; reponse: string };

export type ClesAccueilPublic = {
  meta: { titre: string; description: string };
  nav: {
    outils: string;
    fonctionnement: string;
    test: string;
    tarifs: string;
    journal: string;
    connexion: string;
    /** Le bouton qui ouvre la navigation sur un téléphone. */
    menu: string;
    essayerCourt: string;
    essayer: string;
    langue: string;
  };
  hero: {
    badge: string;
    titreDebut: string;
    titreAccent: string;
    /** Le point final, hors de l'italique — et « 。 » en chinois. */
    titreFin: string;
    chapo: string;
    ctaTest: string;
    ctaEssai: string;
    garanties: string[];
  };
  clients: { confiance: string };
  probleme: {
    surtitre: string;
    titre: string;
    p1: string;
    p2: string;
    chute: string;
  };
  benefices: {
    surtitre: string;
    titre: string;
    cartes: { titre: string; texte: string }[];
  };
  difference: {
    surtitre: string;
    titre: string;
    avec: string;
    sans: string;
    oui: string[];
    non: string[];
    comparatif: string;
  };
  reservations: {
    surtitre: string;
    titreDebut: string;
    titreAccent: string;
    chapo: string;
    points: { titre: string; texte: string }[];
    zeroLegende: string;
    zeroLien: string;
    zeroTexte: string;
    zeroExemple: string;
    ensuite: { titre: string; texte: string }[];
  };
  tarifs: {
    surtitre: string;
    titre: string;
    chapo: string;
    parMois: string;
    offres: {
      nom: string;
      resume: string;
      prix: string;
      ttcEtEssai: string;
      lignes: string[];
    }[];
    commission: string;
    /**
     * Les deux modules ensemble.
     *
     * Ce n'est pas une troisième offre — rien ne s'y ouvre qui ne soit
     * déjà dans l'une des deux — mais c'est la plus avantageuse, et elle
     * tenait jusqu'ici dans une ligne grise sous les cartes. D'où un
     * bandeau : le poids d'une offre, sans la carte qui ferait croire à
     * un produit de plus.
     */
    pack: {
      etiquette: string;
      resume: string;
      prix: string;
      ttc: string;
      /** L'écart avec les deux pris séparément, au mois et à l'année. */
      economie: string;
    };
  };
  faq: { titre: string; questions: Question[] };
  fondateur: {
    surtitre: string;
    titre: string;
    p1: string;
    p2: string;
    citation: string;
    legende: string;
  };
  editeur: {
    surtitre: string;
    titre: string;
    p1: string;
    p2: string;
    lien: string;
    faits: { valeur: string; libelle: string }[];
    mention: string;
  };
  test: { surtitre: string; titre: string; texte: string; bouton: string };
  bientot: { surtitre: string; titre: string; texte: string; puces: string[] };
  cta: { titre: string; texte: string; bouton: string };
  journal: {
    surtitre: string;
    titre: string;
    chapo: string;
    tous: string;
    lecture: string;
    /** Vide en français ; ailleurs, dit la langue des articles. */
    enFrancais: string;
  };
  produit: {
    lieu: string;
    ficheAJour: string;
    commission: string;
    tableConfirmee: string;
    reserver: string;
    jours: string[];
    couverts: string;
    service: string;
    demander: string;
    mention: string;
  };
  pied: {
    /** L'intitulé de la rangée d'outils, au-dessus des mentions. */
    outils: string;
    ouvrir: string;
    diagnostic: string;
    calendrier: string;
    audit: string;
    calculateur: string;
    journal: string;
    aide: string;
    mentions: string;
    cgu: string;
    confidentialite: string;
    suppression: string;
    copyright: string;
  };
};

/**
 * Les montants, écrits une fois et formatés par langue.
 *
 * Les recopier à la main dans trois dictionnaires, c'est accepter qu'ils
 * restent faux le jour où un tarif bouge : personne ne relit trois
 * langues en changeant un prix. On repart donc des constantes de
 * `modules.ts` — la seule chose qui change d'une langue à l'autre est la
 * façon d'écrire un nombre et de dire « hors taxes ».
 */
function nombre(prixFrancais: string): number {
  return Number.parseFloat(prixFrancais.replace(",", "."));
}

const ETIQUETTE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

function euros(valeur: number, langue: Langue): string {
  return new Intl.NumberFormat(ETIQUETTE[langue], {
    style: "currency",
    currency: "EUR",
    // « 29,00 € » là où la grille tarifaire affiche « 29 € » ferait deux
    // prix différents pour le même abonnement.
    minimumFractionDigits: Number.isInteger(valeur) ? 0 : 2,
  }).format(valeur);
}

const HT = {
  visibilite: nombre(PRIX_MODULE.visibilite),
  reservations: nombre(PRIX_MODULE.reservations),
  pack: nombre(PRIX_PACK),
};
const TTC = {
  visibilite: nombre(PRIX_MODULE_TTC.visibilite),
  reservations: nombre(PRIX_MODULE_TTC.reservations),
  pack: nombre(PRIX_PACK_TTC),
};

/**
 * Ce que le pack fait gagner, dérivé des tarifs et non recopié.
 *
 * « Onze pour cent » ne dit rien à personne ; « 90 € sur l'année », si.
 * Et le jour où l'un des trois prix bouge, cette phrase bouge avec lui —
 * un montant écrit à la main dans trois langues finit faux dans deux.
 */
const ECONOMIE = {
  mois: HT.visibilite + HT.reservations - HT.pack,
  an: (HT.visibilite + HT.reservations - HT.pack) * 12,
};

/** La date du relevé des tarifs concurrents, dans chaque langue. */
const RELEVE: Record<Langue, string> = {
  fr: "septembre 2026",
  en: "September 2026",
  zh: "2026 年 9 月",
};

const fr: ClesAccueilPublic = {
  meta: {
    titre: "Klarr — la clarté pour votre restaurant",
    description:
      "Votre fiche Google, vos avis, votre visibilité dans les réponses des IA et vos réservations, au même endroit. Sans commission par couvert.",
  },
  nav: {
    outils: "Outils gratuits",
    fonctionnement: "Comment ça marche",
    test: "Tester ma présence Google",
    tarifs: "Tarifs",
    journal: "Le journal",
    connexion: "Connexion",
    menu: "Menu",
    essayerCourt: "Essayer",
    essayer: "Essayer gratuitement",
    langue: "Langue",
  },
  hero: {
    badge: "Pensé pour les restaurateurs indépendants et petits groupes",
    titreDebut: "Vos réservations sans commission.",
    titreAccent: "Votre visibilité sans y penser",
    titreFin: ".",
    chapo:
      "Le carnet, la vitrine, les avis et la fiche Google au même endroit. Les acomptes vont sur votre compte, pas le nôtre. Et chaque chiffre vient avec la donnée brute derrière, que vous pouvez vérifier vous-même.",
    ctaTest: "Tester ma présence Google — gratuit",
    ctaEssai: "Essayer Klarr gratuitement",
    garanties: [
      "Sans carte bancaire",
      "Sans engagement",
      "Résiliable en un clic",
    ],
  },
  clients: { confiance: "Ils nous font déjà confiance" },
  probleme: {
    surtitre: "Le problème",
    titre:
      "Vous avez déjà vu un tableau de bord vous annoncer « 1er sur Google » pendant que vos clients, eux, vous trouvent en page 2 ?",
    p1: "Un score flatteur ne remplit pas votre restaurant. Une donnée que vous pouvez vérifier, si.",
    p2: "La plupart des outils marketing vivent de votre satisfaction, pas de vos résultats. Plus vous êtes content, plus vous restez abonné. Alors le chiffre qu'on vous montre a tendance à… vous arranger.",
    chute:
      "Klarr ne vend pas de la satisfaction. Klarr montre ce qui est là, même quand ça ne fait pas plaisir.",
  },
  benefices: {
    surtitre: "Comment ça marche",
    titre: "La donnée brute, l'historique, et ce qui cloche.",
    cartes: [
      {
        titre: "La donnée brute",
        texte:
          "Votre fiche Google telle qu'elle est, vos avis tels qu'ils sont écrits, et la réponse exacte que donne une IA quand un client demande où manger. Vous pouvez reposer la même question de votre côté et retomber sur la même chose.",
      },
      {
        titre: "L'historique, pas le pipeau",
        texte:
          "Chaque analyse est horodatée et conservée. Même quand c'est mauvais. Surtout quand c'est mauvais — vous voyez si vous montez ou si vous descendez.",
      },
      {
        titre: "Ce qui cloche, pas la tape dans le dos",
        texte:
          "On ne vous félicite pas. On vous montre les questions où vous n'apparaissez pas, et ce qui manque sur votre fiche. Utile plutôt qu'agréable.",
      },
    ],
  },
  difference: {
    surtitre: "La différence",
    titre: "Ce que ça change, concrètement.",
    avec: "Avec",
    sans: "Sans",
    oui: [
      "Fiche Google, avis, réseaux sociaux et menu au même endroit",
      "Des mots-clés choisis à partir d'une analyse, pas au hasard",
      "Les avis Google, Yelp et Tripadvisor centralisés",
      "Photos et carte mises à jour en quelques clics",
      "Les allergènes déclarés une fois, affichés sous chaque plat et tenus à jour tout seuls",
      "Les questions qu'on vous pose au téléphone, répondues une fois et reprises par Google et les IA",
      "Vous restez autonome, sans dépendre de personne",
    ],
    non: [
      "Un outil et un mot de passe différents par plateforme",
      "Des mots-clés au doigt mouillé, quand il y en a",
      "Des avis dispersés, et des réponses qui passent à la trappe",
      "Des informations périmées sur la moitié des sites",
      "Un classeur allergènes à refaire à la main à chaque changement de carte",
      "Les mêmes questions, posées une par une au téléphone en plein service",
      "Une agence à payer, ou des heures perdues chaque semaine",
    ],
    comparatif: "Voir le comparatif avec TheFork, Zenchef et Guestonline",
  },
  reservations: {
    surtitre: "Réservations",
    titreDebut: "Vos réservations vous appartiennent.",
    titreAccent: "Klarr ne touche rien dessus.",
    chapo:
      "Les plateformes prennent une commission sur chaque couvert qu'elles vous envoient — y compris sur les clients qui seraient venus de toute façon. Klarr ne prend rien. Les acomptes vont sur votre compte Stripe, pas sur le nôtre.",
    points: [
      {
        titre: "Votre page de réservation, à votre nom",
        texte:
          "Une adresse à vous, à partager sur votre fiche Google, votre Instagram ou votre page Facebook. Vos clients réservent en deux clics, sans créer de compte.",
      },
      {
        titre: "Une table, ou toute une salle",
        texte:
          "Le même outil prend une table pour deux et la privatisation de votre cave pour un anniversaire de trente. Vous fixez le minimum de couverts à partir duquel vous privatisez.",
      },
      {
        titre: "Jamais deux groupes dans la même salle",
        texte:
          "Chaque espace a sa capacité et chaque service sa jauge. Une demande non tranchée pose une option qui expire, pour qu'un curieux ne gèle pas votre vendredi soir.",
      },
      {
        titre: "Votre fichier client, et il est à vous",
        texte:
          "Qui est venu, combien de fois, quand pour la dernière fois — reconstitué tout seul à partir du carnet. Et un message à leur écrire quand vous avez quelque chose à dire, parti le jour que vous choisissez. À ceux qui ont accepté de le recevoir, évidemment.",
      },
    ],
    zeroLegende: "de commission sur vos réservations",
    zeroTexte: `Ni sur les couverts, ni sur les privatisations. Le module Réservations coûte ${euros(HT.reservations, "fr")} HT par mois — ${euros(TTC.reservations, "fr")} TTC — et rien d'autre.`,
    zeroExemple:
      "Sur 400 couverts par mois, une plateforme à 2 € le couvert prend 800 €.",
    zeroLien: "Calculer ce que la vôtre vous coûte",
    ensuite: [
      {
        titre: "Le carnet",
        texte:
          "Demandes, confirmations, plan de salle et écran de service pour le coup de feu.",
      },
      {
        titre: "Moins de no-show",
        texte:
          "Rappel la veille, annulation en un clic, acompte quand la table le mérite.",
      },
      {
        titre: "Les privatisations",
        texte:
          "Minimum de couverts, minimum de consommation, conditions annoncées avant de réserver.",
      },
      {
        titre: "Rien à relancer",
        texte:
          "Le lien de paiement part seul, se relance avant l'échéance, et ce qui rate se rejoue.",
      },
      {
        titre: "Le devis",
        texte:
          "Lignes, TVA par taux, vos mentions légales. Le client l'accepte en ligne, vous êtes prévenu.",
      },
      {
        titre: "Les campagnes",
        texte:
          "Un message écrit à l'avance, parti le jour dit. Désinscription en un clic dans chaque envoi.",
      },
      {
        titre: "Les allergènes",
        texte:
          "Cochés une fois par plat. Affichés sous chacun, réunis dans un document qui se fabrique seul, et filtrables par le client.",
      },
    ],
  },
  tarifs: {
    surtitre: "Tarifs",
    titre: "Deux offres, affichées. Pas de devis à demander.",
    chapo:
      "Par établissement, sans engagement, résiliable en un clic depuis votre tableau de bord. Prenez l'une, l'autre, ou les deux.",
    parMois: "HT / mois",
    offres: [
      {
        nom: "Klarr",
        resume: "Votre visibilité, en clair.",
        prix: euros(HT.visibilite, "fr"),
        ttcEtEssai: `soit ${euros(TTC.visibilite, "fr")} TTC · ${ESSAI_JOURS.visibilite} jours d'essai`,
        lignes: [
          "Votre fiche Google, vos avis, vos réseaux au même endroit",
          "Les mots-clés sur lesquels vous sortez vraiment",
          "Ce que répondent ChatGPT, Gemini et les autres quand on cherche où manger",
          "Une alerte quand un avis tombe ou que la note bouge",
        ],
      },
      {
        nom: "Réservations",
        resume: "Votre page de réservation, sans intermédiaire.",
        prix: euros(HT.reservations, "fr"),
        ttcEtEssai: `soit ${euros(TTC.reservations, "fr")} TTC · ${ESSAI_JOURS.reservations} jours d'essai`,
        lignes: [
          "Une adresse à votre nom, à partager où vous voulez",
          "Réservations individuelles et privatisation d'espaces",
          "Jauges par service : jamais deux groupes dans la même salle",
          "Photos de vos espaces, vues avant de réserver",
          "Votre fichier client, et des e-mails à lui envoyer",
        ],
      },
    ],
    commission: "0 % de commission par couvert",
    pack: {
      etiquette: "Les deux ensemble",
      resume: "La visibilité et les réservations, d'un seul abonnement.",
      prix: euros(HT.pack, "fr"),
      ttc: `soit ${euros(TTC.pack, "fr")} TTC`,
      economie: `Vous économisez ${euros(ECONOMIE.mois, "fr")} HT par mois — ${euros(ECONOMIE.an, "fr")} sur l'année.`,
    },
  },
  faq: {
    titre: "Questions fréquentes",
    questions: [
      {
        question: "Qu'est-ce que Klarr ?",
        reponse:
          "Klarr est une plateforme de gestion pour les restaurateurs indépendants et les petits groupes. Elle réunit la fiche Google, les avis clients, les réservations et la visibilité dans les réponses des IA, sans prendre de commission sur les couverts.",
      },
      {
        question: "Combien coûte Klarr ?",
        reponse: `Deux offres sans engagement : « Votre visibilité » à ${PRIX_MODULE.visibilite} (${PRIX_MODULE_TTC.visibilite}, ${ESSAI_JOURS.visibilite} jours d'essai) et « Réservations » à ${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations}, ${ESSAI_JOURS.reservations} jours d'essai). Les deux ensemble coûtent ${PRIX_PACK} (${PRIX_PACK_TTC}), soit onze pour cent de moins que séparément. Aucune commission par couvert, quelle que soit la formule.`,
      },
      {
        question: "Klarr prend-il une commission sur les réservations ?",
        reponse: `Non. Klarr ne prélève aucune commission sur les couverts ni sur les privatisations. Les acomptes sont versés directement sur le compte Stripe du restaurateur. Le module Réservations est facturé ${PRIX_MODULE.reservations}, et rien d'autre.`,
      },
      {
        question:
          "Quelle est la différence entre Klarr et TheFork ou Zenchef ?",
        reponse: `Ces plateformes se rémunèrent à la commission par couvert ou par un abonnement nettement plus élevé — au relevé de leurs tarifs publics en ${RELEVE.fr}, de un à deux euros par couvert pour TheFork, à partir de cent neuf euros par mois pour Zenchef. Klarr coûte ${PRIX_MODULE.reservations}, sans commission, quel que soit le canal ou le volume de couverts, et les acomptes vont directement au restaurateur.`,
      },
      {
        question:
          "Comment Klarr améliore-t-il la visibilité Google d'un restaurant ?",
        reponse:
          "Klarr réunit la fiche Google Business Profile, les avis et les réseaux sociaux dans un seul tableau de bord. Il montre les mots-clés sur lesquels l'établissement sort vraiment, suit ce que répondent les assistants IA quand un client cherche où manger, et alerte dès qu'un avis tombe ou que la note bouge.",
      },
      {
        question: "Sur quels assistants Klarr suit-il la visibilité IA ?",
        reponse:
          "Klarr interroge ChatGPT, Gemini, Claude, Le Chat de Mistral et Perplexity, selon ceux qui sont activés. Il affiche la réponse exacte que l'assistant a donnée, avec sa date, plutôt qu'un score sans source — y compris quand le restaurant n'y figure pas.",
      },
      {
        question: "Klarr convient-il à un restaurant indépendant à Paris ?",
        reponse:
          "Oui. Klarr est conçu pour les restaurateurs indépendants et les petits groupes. La plateforme est éditée par EDIREF, société parisienne de création de sites et de référencement installée dans le 8e arrondissement depuis 2008.",
      },
      {
        question: "Peut-on gérer les privatisations avec Klarr ?",
        reponse:
          "Oui. Le module Réservations gère la table et la privatisation d'espaces. Le restaurateur fixe un minimum de couverts ou de consommation, pose des jauges par service pour qu'un curieux ne gèle pas une salle entière, et les conditions s'affichent avant la réservation. Le devis se rédige ensuite depuis le carnet — lignes, TVA par taux, mentions légales de l'établissement — et le client l'accepte en ligne.",
      },
      {
        question: "Comment Klarr réduit-il les appels pendant le service ?",
        reponse:
          "Les questions qu'un client pose avant de réserver — la terrasse, l'accès en fauteuil roulant, les chiens, les plats végétariens — se répondent une fois dans Klarr, en choisissant une phrase toute faite. Elles s'affichent ensuite sur la page de réservation de l'établissement, et leur balisage FAQPage permet à Google et aux assistants IA de les reprendre.",
      },
      {
        question: "Peut-on écrire à ses clients avec Klarr ?",
        reponse:
          "Oui. Klarr reconstitue le fichier client à partir du carnet — qui est venu, combien de fois, quand pour la dernière fois — et permet d'écrire aux personnes qui ont accepté de recevoir des e-mails au moment de réserver. Les messages se programment à l'avance, se destinent à un groupe choisi (les habitués, ceux qu'on n'a pas revus depuis six mois) et portent tous un lien de désinscription. Klarr n'envoie rien à quelqu'un qui n'a pas coché la case.",
      },
      {
        question: "Klarr est-il sans engagement ?",
        reponse:
          "Oui. Les deux offres sont sans engagement et se résilient en un clic depuis le tableau de bord, sans écrire à personne.",
      },
      {
        question: "Quelles données Klarr montre-t-il vraiment ?",
        reponse:
          "La donnée brute : la fiche Google telle qu'elle est, les avis tels qu'ils sont écrits, et la réponse exacte d'un assistant IA quand un client cherche un restaurant. Chaque analyse est datée et conservée, y compris quand le résultat est mauvais.",
      },
    ],
  },
  fondateur: {
    surtitre: "Qui est derrière Klarr",
    titre:
      "Un restaurateur, pas une startup qui a découvert le métier dans un pitch deck.",
    p1: "Klarr est fait par un restaurateur avec vingt ans de métier. On sait ce que c'est de vérifier soi-même sa fiche Google entre deux services, de se faire vendre un score qui ne colle pas à la réalité, et de perdre du temps sur des outils pensés pour impressionner des investisseurs plutôt que des restaurateurs.",
    p2: "Sans engagement, résiliable en un clic. Vous partez quand vous voulez, sans avoir à écrire à personne.",
    citation:
      "« On nous annonçait 1ers sur “restaurant allemand”. En navigation privée, on était 4e. J'ai vérifié avec d'autres restaurateurs — même souci partout. »",
    legende: "Ce qui a donné l'idée de Klarr.",
  },
  editeur: {
    surtitre: "L'autre moitié de Klarr",
    titre: "Une agence de référencement qui fait ça depuis dix-huit ans.",
    p1: "Klarr est édité par EDIREF, société parisienne spécialisée depuis 2008 dans le développement de sites internet, leur optimisation et leur référencement. Là où beaucoup découvrent le SEO en même temps que leurs clients, Thomas Bavoil et son équipe le pratiquent depuis avant que Google Business Profile ne s'appelle ainsi.",
    p2: "C'est ce qui fait la différence entre un outil qui affiche des chiffres et un outil qui sait lesquels comptent : le métier d'un restaurateur d'un côté, dix-huit ans de référencement de l'autre.",
    lien: "Découvrir EDIREF →",
    faits: [
      { valeur: "2008", libelle: "Début d'activité" },
      { valeur: "Paris 8e", libelle: "Siège social" },
      { valeur: "SEO & web", libelle: "Métier d'origine" },
    ],
    mention:
      "EDIREF, SARL au capital de 1 000 € — RCS Paris 503 428 369. Vérifiable au registre du commerce.",
  },
  test: {
    surtitre: "Gratuit, sans engagement",
    titre: "Pas encore client ? Testez votre présence sur Google.",
    texte:
      "En 2 minutes, on analyse la fiche Google de votre restaurant et on vous envoie un score de visibilité détaillé, gratuitement.",
    bouton: "Faire mon test gratuit",
  },
  bientot: {
    surtitre: "Bientôt sur Klarr",
    titre: "Et la suite est déjà en préparation.",
    texte:
      "Les statistiques du carnet, celles de votre fiche Google et les publications programmées sont arrivées depuis. Voilà ce qui manque encore — et on le dit aussi franchement.",
    puces: ["Liste d'attente sur les créneaux complets"],
  },
  cta: {
    titre: "Votre fiche Google, sans filtre marketing.",
    texte: "Pas de carte bancaire. Pas d'engagement. Pas de discours.",
    bouton: "Vérifier ma visibilité — gratuit, 2 minutes",
  },
  journal: {
    surtitre: "Le journal",
    titre: "Ce qu'on aurait aimé lire avant d'ouvrir.",
    chapo:
      "Des articles gratuits sur les démarches, les diagnostics et les autorisations — écrits à partir de ce qu'on a découvert trop tard, sources à l'appui.",
    tous: "Tous les articles →",
    lecture: "min de lecture",
    enFrancais: "",
  },
  produit: {
    lieu: "Restaurant · Paris 3e",
    ficheAJour: "Fiche Google à jour",
    commission: "de commission",
    tableConfirmee: "Table confirmée · il y a 2 min",
    reserver: "Réserver une table",
    jours: ["Ven.", "Sam.", "Dim.", "Lun."],
    couverts: "2 personnes",
    service: "Samedi soir",
    demander: "Demander une table",
    mention: "Aucun compte à créer. Aucune commission pour le restaurant.",
  },
  pied: {
    outils: "Outils gratuits",
    ouvrir: "Ouvrir un restaurant",
    diagnostic: "Diagnostic d'un local",
    calendrier: "Calendrier d'ouverture",
    audit: "Audit de fiche Google",
    calculateur: "Calculateur de commissions",
    journal: "Le journal",
    aide: "Aide",
    mentions: "Mentions légales",
    cgu: "Conditions d'utilisation",
    confidentialite: "Confidentialité",
    suppression: "Suppression des données",
    copyright: "© 2026 Klarr — édité par EDIREF.",
  },
};

// « HT » et « TTC » n'ont pas d'équivalent court en anglais ni en
// chinois ; on écrit donc la taxe en toutes lettres plutôt que d'inventer
// un sigle que personne ne lit.
const ht = (valeur: number, langue: Langue) =>
  langue === "en"
    ? `${euros(valeur, "en")} excl. VAT`
    : `${euros(valeur, "zh")}（不含税）`;
const ttc = (valeur: number, langue: Langue) =>
  langue === "en"
    ? `${euros(valeur, "en")} incl. VAT`
    : `${euros(valeur, "zh")}（含税）`;

const en: ClesAccueilPublic = {
  meta: {
    titre: "Klarr — clarity for your restaurant",
    description:
      "Your Google listing, your reviews, your visibility in AI answers and your bookings, all in one place. No commission per cover.",
  },
  nav: {
    outils: "Free tools",
    fonctionnement: "How it works",
    test: "Test my Google presence",
    tarifs: "Pricing",
    journal: "Journal",
    connexion: "Sign in",
    menu: "Menu",
    essayerCourt: "Try it",
    essayer: "Try it free",
    langue: "Language",
  },
  hero: {
    badge: "Built for independent restaurants and small groups",
    titreDebut: "Bookings with no commission.",
    titreAccent: "Visibility without thinking about it",
    titreFin: ".",
    chapo:
      "The book, the website, the reviews and the Google listing in one place. Deposits land in your account, not ours. And every figure comes with the raw data behind it, which you can check yourself.",
    ctaTest: "Test my Google presence — free",
    ctaEssai: "Try Klarr free",
    garanties: ["No card required", "No contract", "Cancel in one click"],
  },
  clients: { confiance: "Already working with" },
  probleme: {
    surtitre: "The problem",
    titre:
      "Ever seen a dashboard tell you you're “number one on Google” while your customers find you on page two?",
    p1: "A flattering score doesn't fill your dining room. Data you can verify does.",
    p2: "Most marketing tools live off how satisfied you are, not off your results. The happier you are, the longer you stay subscribed. So the number they show you tends to… suit you.",
    chute:
      "Klarr doesn't sell satisfaction. Klarr shows what's there, even when it isn't pleasant.",
  },
  benefices: {
    surtitre: "How it works",
    titre: "The raw data, the history, and what's wrong.",
    cartes: [
      {
        titre: "The raw data",
        texte:
          "Your Google listing as it stands, your reviews as they were written, and the exact answer an AI gives when a customer asks where to eat. You can ask the same question yourself and land on the same thing.",
      },
      {
        titre: "The history, not the sales pitch",
        texte:
          "Every analysis is timestamped and kept. Including the bad ones. Especially the bad ones — you can see whether you're climbing or slipping.",
      },
      {
        titre: "What's wrong, not a pat on the back",
        texte:
          "We don't congratulate you. We show you the questions you don't appear in, and what's missing from your listing. Useful rather than pleasant.",
      },
    ],
  },
  difference: {
    surtitre: "The difference",
    titre: "What it changes, in practice.",
    avec: "With",
    sans: "Without",
    oui: [
      "Google listing, reviews, social accounts and menu in one place",
      "Keywords chosen from an analysis, not at random",
      "Google, Yelp and Tripadvisor reviews in a single inbox",
      "Photos and menu updated in a few clicks",
      "Allergens declared once, shown under every dish and kept current on their own",
      "The questions you get by phone, answered once and picked up by Google and AI assistants",
      "You stay independent, with nobody to depend on",
    ],
    non: [
      "A different tool and password for every platform",
      "Keywords picked by guesswork, when there are any",
      "Reviews scattered around, and replies that slip through",
      "Out-of-date information on half the sites you're listed on",
      "An allergen binder to redo by hand every time the menu changes",
      "The same questions, asked one at a time by phone in the middle of service",
      "An agency to pay, or hours lost every week",
    ],
    comparatif: "See the comparison with TheFork, Zenchef and Guestonline",
  },
  reservations: {
    surtitre: "Bookings",
    titreDebut: "Your bookings belong to you.",
    titreAccent: "Klarr takes nothing from them.",
    chapo:
      "Platforms take a commission on every cover they send you — including the customers who would have come anyway. Klarr takes nothing. Deposits go to your Stripe account, not ours.",
    points: [
      {
        titre: "Your booking page, under your own name",
        texte:
          "An address of your own, to share on your Google listing, your Instagram or your Facebook page. Your customers book in two clicks, without creating an account.",
      },
      {
        titre: "One table, or a whole room",
        texte:
          "The same tool takes a table for two and the private hire of your cellar for a thirtieth birthday. You set the minimum party size at which a space goes private.",
      },
      {
        titre: "Never two parties in the same room",
        texte:
          "Every space has its capacity and every service its limit. An undecided request holds an option that expires, so a browser can't freeze your Friday night.",
      },
      {
        titre: "Your customer list, and it is yours",
        texte:
          "Who came, how often, when they last did — put together on its own from the book. And a message to send them when you have something to say, going out on the day you choose. To those who agreed to receive it, of course.",
      },
    ],
    zeroLegende: "commission on your bookings",
    zeroTexte: `Not on covers, not on private hire. The Bookings module costs ${ht(HT.reservations, "en")} per month — ${ttc(TTC.reservations, "en")} — and nothing else.`,
    zeroExemple:
      "On 400 covers a month, a platform charging €2 per cover takes €800.",
    zeroLien: "Work out what yours costs you",
    ensuite: [
      {
        titre: "The book",
        texte:
          "Requests, confirmations, floor plan and a service screen for the rush.",
      },
      {
        titre: "Fewer no-shows",
        texte:
          "A reminder the day before, one-click cancellation, a deposit when the table warrants it.",
      },
      {
        titre: "Private hire",
        texte:
          "Minimum party size, minimum spend, terms shown before anyone books.",
      },
      {
        titre: "Nothing to chase",
        texte:
          "The payment link goes out on its own, follows up before the deadline, and retries what fails.",
      },
      {
        titre: "The quote",
        texte:
          "Line items, VAT per rate, your own legal notices. The client accepts it online and you are told.",
      },
      {
        titre: "Campaigns",
        texte:
          "A message written ahead, sent on the day. One-click unsubscribe in every send.",
      },
      {
        titre: "Allergens",
        texte:
          "Ticked once per dish. Shown under each one, gathered into a document that builds itself, and filterable by the guest.",
      },
    ],
  },
  tarifs: {
    surtitre: "Pricing",
    titre: "Two plans, on the page. No quote to request.",
    chapo:
      "Per restaurant, no contract, cancel in one click from your dashboard. Take one, the other, or both.",
    parMois: "excl. VAT / month",
    offres: [
      {
        nom: "Klarr",
        resume: "Your visibility, in plain sight.",
        prix: euros(HT.visibilite, "en"),
        ttcEtEssai: `that is ${ttc(TTC.visibilite, "en")} · ${ESSAI_JOURS.visibilite}-day trial`,
        lignes: [
          "Your Google listing, your reviews, your social accounts in one place",
          "The keywords you actually come up on",
          "What ChatGPT, Gemini and the rest answer when someone asks where to eat",
          "An alert when a review lands or your rating moves",
        ],
      },
      {
        nom: "Bookings",
        resume: "Your booking page, with no middleman.",
        prix: euros(HT.reservations, "en"),
        ttcEtEssai: `that is ${ttc(TTC.reservations, "en")} · ${ESSAI_JOURS.reservations}-day trial`,
        lignes: [
          "An address under your own name, to share wherever you like",
          "Individual bookings and private hire of your spaces",
          "Limits per service: never two parties in the same room",
          "Photos of your spaces, seen before booking",
          "Your customer list, and emails to send it",
        ],
      },
    ],
    commission: "0% commission per cover",
    pack: {
      etiquette: "Both together",
      resume: "Visibility and bookings, on a single subscription.",
      prix: euros(HT.pack, "en"),
      ttc: `that is ${ttc(TTC.pack, "en")}`,
      economie: `You save ${ht(ECONOMIE.mois, "en")} a month — ${euros(ECONOMIE.an, "en")} over a year.`,
    },
  },
  faq: {
    titre: "Frequently asked questions",
    questions: [
      {
        question: "What is Klarr?",
        reponse:
          "Klarr is a management platform for independent restaurants and small groups. It brings together the Google listing, customer reviews, bookings and visibility in AI answers, without taking any commission on covers.",
      },
      {
        question: "How much does Klarr cost?",
        reponse: `Two plans, no contract: “Your visibility” at ${ht(HT.visibilite, "en")} per month (${ttc(TTC.visibilite, "en")}, a ${ESSAI_JOURS.visibilite}-day trial) and “Bookings” at ${ht(HT.reservations, "en")} per month (${ttc(TTC.reservations, "en")}, a ${ESSAI_JOURS.reservations}-day trial). Both together cost ${ht(HT.pack, "en")} per month (${ttc(TTC.pack, "en")}), eleven per cent less than separately. No commission per cover, on any plan.`,
      },
      {
        question: "Does Klarr take a commission on bookings?",
        reponse: `No. Klarr takes no commission on covers or on private hire. Deposits are paid directly into the restaurant's own Stripe account. The Bookings module is billed at ${ht(HT.reservations, "en")} per month, and nothing else.`,
      },
      {
        question:
          "What is the difference between Klarr and TheFork or Zenchef?",
        reponse: `Those platforms earn either a commission per cover or a markedly higher subscription — from their public pricing as read in ${RELEVE.en}, one to two euros per cover for TheFork, and from one hundred and nine euros a month for Zenchef. Klarr costs ${ht(HT.reservations, "en")} per month, with no commission, whatever the channel or the number of covers, and deposits go straight to the restaurant.`,
      },
      {
        question: "How does Klarr improve a restaurant's Google visibility?",
        reponse:
          "Klarr brings the Google Business Profile listing, the reviews and the social accounts into a single dashboard. It shows the keywords the restaurant genuinely comes up on, tracks what AI assistants answer when a customer looks for somewhere to eat, and raises an alert as soon as a review lands or the rating moves.",
      },
      {
        question: "Which assistants does Klarr track AI visibility on?",
        reponse:
          "Klarr queries ChatGPT, Gemini, Claude, Mistral's Le Chat and Perplexity, depending on which are switched on. It shows the exact answer the assistant gave, with its date, rather than a score with no source — including when the restaurant isn't in it.",
      },
      {
        question: "Is Klarr suitable for an independent restaurant in Paris?",
        reponse:
          "Yes. Klarr is built for independent restaurants and small groups. The platform is published by EDIREF, a Paris web design and SEO company based in the 8th arrondissement since 2008.",
      },
      {
        question: "Can private hire be managed with Klarr?",
        reponse:
          "Yes. The Bookings module handles both tables and the private hire of spaces. The restaurant sets a minimum party size or minimum spend, puts limits on each service so a browser can't freeze a whole room, and the terms are shown before anyone books. The quote is then written from the booking book — line items, VAT per rate, the restaurant's own legal notices — and the client accepts it online.",
      },
      {
        question: "How does Klarr cut down on calls during service?",
        reponse:
          "The questions a guest asks before booking — the terrace, wheelchair access, dogs, vegetarian dishes — are answered once in Klarr, by picking a ready-made sentence. They then appear on the restaurant's booking page, and their FAQPage markup lets Google and AI assistants pick them up.",
      },
      {
        question: "Can you email your customers with Klarr?",
        reponse:
          "Yes. Klarr builds the customer list from the booking book — who came, how often, when they last did — and lets you write to the people who agreed to receive emails when they booked. Messages can be scheduled ahead, aimed at a chosen group (regulars, customers not seen for six months) and all carry an unsubscribe link. Klarr sends nothing to anyone who did not tick the box.",
      },
      {
        question: "Is Klarr contract-free?",
        reponse:
          "Yes. Both plans are contract-free and can be cancelled in one click from the dashboard, without writing to anyone.",
      },
      {
        question: "What data does Klarr actually show?",
        reponse:
          "The raw data: the Google listing as it stands, the reviews as they were written, and the exact answer an AI assistant gives when a customer looks for a restaurant. Every analysis is dated and kept, including when the result is bad.",
      },
    ],
  },
  fondateur: {
    surtitre: "Who is behind Klarr",
    titre:
      "A restaurateur, not a startup that discovered the trade in a pitch deck.",
    p1: "Klarr is built by a restaurateur with twenty years in the trade. We know what it is to check your own Google listing between two services, to be sold a score that doesn't match reality, and to lose time on tools designed to impress investors rather than restaurateurs.",
    p2: "No contract, cancel in one click. You leave whenever you like, without having to write to anyone.",
    citation:
      "“We were told we ranked first for ‘German restaurant’. In a private window, we were fourth. I checked with other restaurateurs — the same problem everywhere.”",
    legende: "Which is where the idea for Klarr came from.",
  },
  editeur: {
    surtitre: "The other half of Klarr",
    titre: "An SEO agency that has been doing this for eighteen years.",
    p1: "Klarr is published by EDIREF, a Paris company specialising since 2008 in building websites and in their optimisation and search ranking. Where many discover SEO at the same time as their clients, Thomas Bavoil and his team have practised it since before Google Business Profile was called that.",
    p2: "That is the difference between a tool that displays figures and a tool that knows which ones matter: a restaurateur's trade on one side, eighteen years of SEO on the other.",
    lien: "Visit EDIREF →",
    faits: [
      { valeur: "2008", libelle: "Trading since" },
      { valeur: "Paris 8e", libelle: "Registered office" },
      { valeur: "SEO & web", libelle: "Original trade" },
    ],
    mention:
      "EDIREF, SARL with share capital of €1,000 — Paris trade register 503 428 369. Verifiable on the public register.",
  },
  test: {
    surtitre: "Free, no strings",
    titre: "Not a customer yet? Test your presence on Google.",
    texte:
      "In 2 minutes we analyse your restaurant's Google listing and send you a detailed visibility score, free of charge.",
    bouton: "Run my free test",
  },
  bientot: {
    surtitre: "Coming to Klarr",
    titre: "And what comes next is already under way.",
    texte:
      "Booking statistics, Google listing statistics and scheduled posts have landed since. Here is what is still missing — and we say so just as plainly.",
    puces: ["A waiting list for fully booked slots"],
  },
  cta: {
    titre: "Your Google listing, with no marketing filter.",
    texte: "No card. No contract. No sales pitch.",
    bouton: "Check my visibility — free, 2 minutes",
  },
  journal: {
    surtitre: "Journal",
    titre: "What we wish we had read before opening.",
    chapo:
      "Free articles on the paperwork, the inspections and the permits — written from what we found out too late, with the sources.",
    tous: "All articles →",
    lecture: "min read",
    enFrancais: "Written in French.",
  },
  produit: {
    lieu: "Restaurant · Paris 3e",
    ficheAJour: "Google listing up to date",
    commission: "commission",
    tableConfirmee: "Table confirmed · 2 min ago",
    reserver: "Book a table",
    jours: ["Fri", "Sat", "Sun", "Mon"],
    couverts: "2 people",
    service: "Saturday evening",
    demander: "Request a table",
    mention: "No account to create. No commission for the restaurant.",
  },
  pied: {
    outils: "Free tools",
    ouvrir: "Opening a restaurant",
    diagnostic: "Check a site",
    calendrier: "Opening timeline",
    audit: "Google listing audit",
    calculateur: "Commission calculator",
    journal: "Journal (in French)",
    aide: "Help",
    mentions: "Legal notice",
    cgu: "Terms of use",
    confidentialite: "Privacy",
    suppression: "Data deletion",
    copyright: "© 2026 Klarr — published by EDIREF.",
  },
};

const zh: ClesAccueilPublic = {
  meta: {
    titre: "Klarr — 让餐厅一目了然",
    description:
      "Google 商家资料、顾客评价、AI 回答中的曝光度和订位，全部集中在一处。不按每位客人抽成。",
  },
  nav: {
    outils: "免费工具",
    fonctionnement: "运作方式",
    test: "检测我的 Google 曝光",
    tarifs: "价格",
    journal: "专栏",
    connexion: "登录",
    menu: "菜单",
    essayerCourt: "试用",
    essayer: "免费试用",
    langue: "语言",
  },
  hero: {
    badge: "为独立餐厅和小型餐饮集团而设",
    titreDebut: "订位不抽成。",
    titreAccent: "曝光度无需操心",
    titreFin: "。",
    chapo:
      "预订簿、官网、顾客评价和 Google 商家资料集中在一处。订金直接进入您的账户，不经我们之手。每一个数字背后都有原始数据，您可以自己核实。",
    ctaTest: "免费检测我的 Google 曝光",
    ctaEssai: "免费试用 Klarr",
    garanties: ["无需信用卡", "无需签约", "一键取消"],
  },
  clients: { confiance: "他们已经在用" },
  probleme: {
    surtitre: "问题所在",
    titre:
      "您是否见过后台显示「Google 排名第一」，而顾客却要翻到第二页才找得到您？",
    p1: "好看的分数填不满餐厅，能核实的数据可以。",
    p2: "多数营销工具靠的是您的满意度，而不是您的业绩。您越满意，续订越久。于是他们给您看的数字，往往会……让您顺心。",
    chute: "Klarr 不卖满意度。Klarr 呈现事实，哪怕事实并不好看。",
  },
  benefices: {
    surtitre: "运作方式",
    titre: "原始数据、历史记录，以及问题所在。",
    cartes: [
      {
        titre: "原始数据",
        texte:
          "您的 Google 商家资料原样呈现，顾客评价一字不改，以及顾客询问「去哪儿吃」时 AI 给出的原话。同样的问题您也可以自己去问一遍，结果是一样的。",
      },
      {
        titre: "历史记录，不是说辞",
        texte:
          "每一次分析都带时间戳并长期保存。结果不好的也保存，尤其是结果不好的——这样您才看得出自己是在上升还是在下滑。",
      },
      {
        titre: "指出问题，而不是恭维",
        texte:
          "我们不夸您。我们告诉您在哪些问题里没有出现，以及您的商家资料还缺什么。有用，胜过好听。",
      },
    ],
  },
  difference: {
    surtitre: "差别",
    titre: "具体带来什么改变。",
    avec: "使用",
    sans: "不使用",
    oui: [
      "Google 商家资料、评价、社交账号和菜单集中在一处",
      "关键词来自分析，而不是凭感觉",
      "Google、Yelp、Tripadvisor 的评价统一汇总",
      "照片和菜单几次点击即可更新",
      "过敏原只需申报一次，自动显示在每道菜下方，并始终保持最新",
      "客人常问的问题，回答一次，之后由 Google 和 AI 直接引用",
      "您保持自主，不依赖任何人",
    ],
    non: [
      "每个平台一个工具、一个密码",
      "关键词全凭猜测，甚至根本没有",
      "评价分散各处，回复常常漏掉",
      "一半的网站上挂着过期信息",
      "换一次菜单，过敏原清单就得手工重做一遍",
      "同样的问题，在出餐高峰一通一通打电话来问",
      "要么花钱请代运营，要么每周搭进大量时间",
    ],
    comparatif: "查看与 TheFork、Zenchef、Guestonline 的对比",
  },
  reservations: {
    surtitre: "订位",
    titreDebut: "订位属于您自己。",
    titreAccent: "Klarr 分文不取。",
    chapo:
      "平台按他们带来的每一位客人抽成——包括那些本来就会来的客人。Klarr 什么都不收。订金进入您自己的 Stripe 账户，不是我们的。",
    points: [
      {
        titre: "以您自己名义的订位页面",
        texte:
          "一个属于您的网址，可以放在 Google 商家资料、Instagram 或 Facebook 主页上。顾客两次点击即可订位，无需注册账号。",
      },
      {
        titre: "一张桌，或者整个空间",
        texte:
          "同一个工具既能接两人的小桌，也能接三十人生日的整间酒窖包场。包场起订人数由您自己设定。",
      },
      {
        titre: "同一空间不会撞团",
        texte:
          "每个空间有各自的容纳人数，每个餐市有各自的上限。尚未确认的申请会占一个会过期的名额，以免有人随口一问就冻结您的周五晚上。",
      },
      {
        titre: "顾客档案，属于您自己",
        texte:
          "谁来过、来过几次、最近一次是什么时候——全部由预订簿自动整理。有话要说时写一封邮件，选好日子自动发出。当然，只发给同意接收的人。",
      },
    ],
    zeroLegende: "订位抽成",
    zeroTexte: `无论是散客还是包场，都不抽成。订位模块每月 ${ht(HT.reservations, "zh")}——即 ${ttc(TTC.reservations, "zh")}——没有其他费用。`,
    zeroExemple: "每月 400 位客人，按每位 2 欧元抽成的平台要收走 800 欧元。",
    zeroLien: "算一算您自己的抽成成本",
    ensuite: [
      {
        titre: "预订簿",
        texte: "申请、确认、桌位图，以及应对高峰的出餐屏幕。",
      },
      {
        titre: "更少放鸽子",
        texte: "前一天提醒，一键取消，值得收订金的桌位就收订金。",
      },
      {
        titre: "包场",
        texte: "最低人数、最低消费，条件在订位前就写明。",
      },
      {
        titre: "无需催款",
        texte: "付款链接自动发出，到期前自动提醒，失败的会自动重试。",
      },
      {
        titre: "报价单",
        texte:
          "分项列明、按税率计算增值税，并带上您的法律声明。客人在线确认，您立即收到通知。",
      },
      {
        titre: "邮件推送",
        texte: "提前写好，到日子自动发出。每一封都带一键退订。",
      },
      {
        titre: "过敏原",
        texte: "每道菜勾选一次。显示在菜名下方，清单自动生成，客人可自行筛选。",
      },
    ],
  },
  tarifs: {
    surtitre: "价格",
    titre: "两个套餐，明码标价。无需索取报价。",
    chapo:
      "按门店计费，无需签约，在后台一键取消。可以只选其一，也可以两个都要。",
    parMois: "／月（不含税）",
    offres: [
      {
        nom: "Klarr",
        resume: "让您的曝光度一目了然。",
        prix: euros(HT.visibilite, "zh"),
        ttcEtEssai: `即 ${ttc(TTC.visibilite, "zh")} · ${ESSAI_JOURS.visibilite} 天试用`,
        lignes: [
          "Google 商家资料、顾客评价、社交账号集中在一处",
          "您真正能排上的关键词",
          "顾客问「去哪儿吃」时，ChatGPT、Gemini 等给出的回答",
          "有新评价或评分变动时立即提醒",
        ],
      },
      {
        nom: "订位",
        resume: "您自己的订位页面，没有中间商。",
        prix: euros(HT.reservations, "zh"),
        ttcEtEssai: `即 ${ttc(TTC.reservations, "zh")} · ${ESSAI_JOURS.reservations} 天试用`,
        lignes: [
          "以您名义的网址，想放哪儿就放哪儿",
          "散客订位与空间包场",
          "按餐市设上限：同一空间不会撞团",
          "空间照片，订位前就能看到",
          "顾客档案，以及发给他们的邮件",
        ],
      },
    ],
    commission: "每位客人 0% 抽成",
    pack: {
      etiquette: "两个一起",
      resume: "曝光与订位，合成一份订阅。",
      prix: euros(HT.pack, "zh"),
      ttc: `即 ${ttc(TTC.pack, "zh")}`,
      economie: `每月省下 ${ht(ECONOMIE.mois, "zh")}——一年省 ${euros(ECONOMIE.an, "zh")}。`,
    },
  },
  faq: {
    titre: "常见问题",
    questions: [
      {
        question: "Klarr 是什么？",
        reponse:
          "Klarr 是面向独立餐厅和小型餐饮集团的管理平台，把 Google 商家资料、顾客评价、订位以及在 AI 回答中的曝光度集中在一起，且不按每位客人抽成。",
      },
      {
        question: "Klarr 多少钱？",
        reponse: `两个套餐，均无需签约：「您的曝光度」每月 ${euros(HT.visibilite, "zh")} 不含税、${euros(TTC.visibilite, "zh")} 含税，${ESSAI_JOURS.visibilite} 天试用；「订位」每月 ${euros(HT.reservations, "zh")} 不含税、${euros(TTC.reservations, "zh")} 含税，${ESSAI_JOURS.reservations} 天试用。两个一起每月 ${euros(HT.pack, "zh")} 不含税、${euros(TTC.pack, "zh")} 含税，比分开购买便宜百分之十一。无论哪个套餐，都不按每位客人抽成。`,
      },
      {
        question: "Klarr 会对订位抽成吗？",
        reponse: `不会。Klarr 对散客和包场都不抽成。订金直接进入餐厅自己的 Stripe 账户。订位模块每月 ${ht(HT.reservations, "zh")}，没有其他费用。`,
      },
      {
        question: "Klarr 与 TheFork、Zenchef 有什么区别？",
        reponse: `这些平台要么按每位客人抽成，要么收取高得多的订阅费——按 ${RELEVE.zh} 查阅到的公开价格，TheFork 每位客人一到两欧元，Zenchef 每月一百零九欧元起。Klarr 每月 ${ht(HT.reservations, "zh")}，不抽成，无论客人从哪个渠道来、来多少，订金都直接进入餐厅账户。`,
      },
      {
        question: "Klarr 如何提升餐厅的 Google 曝光度？",
        reponse:
          "Klarr 把 Google 商家资料、顾客评价和社交账号汇总在同一个后台，显示餐厅真正能排上的关键词，跟踪顾客寻找餐厅时 AI 助手给出的回答，并在有新评价或评分变动时立即提醒。",
      },
      {
        question: "Klarr 跟踪哪些 AI 助手的曝光度？",
        reponse:
          "Klarr 会查询 ChatGPT、Gemini、Claude、Mistral 的 Le Chat 和 Perplexity，具体取决于已启用哪些。它显示助手给出的原话和日期，而不是一个没有出处的分数——包括餐厅根本没被提到的情况。",
      },
      {
        question: "Klarr 适合巴黎的独立餐厅吗？",
        reponse:
          "适合。Klarr 就是为独立餐厅和小型餐饮集团而设的。平台由 EDIREF 运营，这是一家自 2008 年起位于巴黎八区的网站建设与搜索优化公司。",
      },
      {
        question: "可以用 Klarr 管理包场吗？",
        reponse:
          "可以。订位模块同时处理散客订位和空间包场。餐厅设定最低人数或最低消费，为每个餐市设上限，避免有人随口一问就冻结整个空间，相关条件在订位前就会显示。随后可以直接在预订簿里开报价单——分项列明、按税率计算增值税、带上餐厅的法律声明——客人在线确认即可。",
      },
      {
        question: "Klarr 如何减少营业高峰时的来电？",
        reponse:
          "客人在订位前常问的问题——有没有露台、是否方便轮椅进出、能不能带狗、有没有素菜——在 Klarr 里回答一次即可，直接选用现成的句子。这些回答会显示在餐厅的订位页面上，并带有 FAQPage 结构化标记，让 Google 和 AI 助手可以直接引用。",
      },
      {
        question: "可以用 Klarr 给顾客发邮件吗？",
        reponse:
          "可以。Klarr 从预订簿整理出顾客档案——谁来过、来过几次、最近一次是什么时候——并且可以写信给那些在订位时同意接收邮件的人。邮件可以提前安排发送日期，也可以只发给选定的人群（熟客，或者超过六个月没再来的顾客），每一封都带退订链接。没有勾选同意的人，Klarr 一封也不会发。",
      },
      {
        question: "Klarr 需要签约吗？",
        reponse:
          "不需要。两个套餐都无需签约，在后台一键即可取消，不用写信给任何人。",
      },
      {
        question: "Klarr 到底展示哪些数据？",
        reponse:
          "原始数据：Google 商家资料的原样、顾客评价的原文，以及顾客寻找餐厅时 AI 助手给出的原话。每一次分析都带日期并长期保存，结果不好的也一样保存。",
      },
    ],
  },
  fondateur: {
    surtitre: "Klarr 背后的人",
    titre: "一个餐饮从业者，而不是在路演稿里才认识这一行的初创公司。",
    p1: "Klarr 由一位做了二十年餐饮的人打造。我们知道在两个餐市之间自己去查 Google 商家资料是什么滋味，知道被卖了一个与现实对不上的分数是什么滋味，也知道把时间耗在为打动投资人而非餐饮人设计的工具上是什么滋味。",
    p2: "无需签约，一键取消。您想走就走，不用写信给任何人。",
    citation:
      "「他们说我们在『德国餐厅』这个词上排第一。用无痕窗口一查，我们是第四。我问了其他餐厅老板——到处都是同样的问题。」",
    legende: "Klarr 的想法就是这么来的。",
  },
  editeur: {
    surtitre: "Klarr 的另一半",
    titre: "一家做了十八年搜索优化的公司。",
    p1: "Klarr 由 EDIREF 运营，这是一家自 2008 年起专注于网站开发、优化与搜索排名的巴黎公司。很多人是和客户同时开始接触 SEO 的，而 Thomas Bavoil 和他的团队，早在 Google 商家资料还不叫这个名字的时候就在做了。",
    p2: "这就是「只会显示数字的工具」和「知道哪些数字要紧的工具」之间的差别：一边是餐饮的行当，一边是十八年的搜索优化。",
    lien: "了解 EDIREF →",
    faits: [
      { valeur: "2008", libelle: "开业年份" },
      { valeur: "巴黎八区", libelle: "注册地址" },
      { valeur: "SEO 与建站", libelle: "本行" },
    ],
    mention:
      "EDIREF，注册资本 1 000 欧元的有限责任公司——巴黎商业登记号 503 428 369，可在商业登记处查证。",
  },
  test: {
    surtitre: "免费，无附加条件",
    titre: "还不是客户？先检测一下您在 Google 上的曝光。",
    texte:
      "2 分钟内，我们分析您餐厅的 Google 商家资料，并免费发给您一份详细的曝光度评分。",
    bouton: "开始免费检测",
  },
  bientot: {
    surtitre: "即将上线",
    titre: "后续功能已经在做了。",
    texte:
      "订位统计、Google 商家资料统计和定时发布都已上线。以下是目前还缺的部分——我们同样照实说。",
    puces: ["订满时段的候补名单"],
  },
  cta: {
    titre: "您的 Google 商家资料，没有营销滤镜。",
    texte: "不用信用卡。不用签约。不讲空话。",
    bouton: "检查我的曝光度——免费，2 分钟",
  },
  journal: {
    surtitre: "专栏",
    titre: "开店之前，我们希望有人早点告诉我们的事。",
    chapo:
      "关于手续、检查和许可的免费文章——写的都是我们自己发现得太晚的事，并附上出处。",
    tous: "全部文章 →",
    lecture: "分钟阅读",
    enFrancais: "文章为法语。",
  },
  produit: {
    lieu: "餐厅 · 巴黎三区",
    ficheAJour: "Google 资料已更新",
    commission: "抽成",
    tableConfirmee: "桌位已确认 · 2 分钟前",
    reserver: "订一张桌",
    jours: ["周五", "周六", "周日", "周一"],
    couverts: "2 人",
    service: "周六晚",
    demander: "提交订位申请",
    mention: "无需注册账号。餐厅无需支付抽成。",
  },
  pied: {
    outils: "免费工具",
    ouvrir: "开一家餐厅",
    diagnostic: "选址诊断",
    calendrier: "开业时间表",
    audit: "Google 商家资料检测",
    calculateur: "抽成计算器",
    journal: "专栏（法语）",
    aide: "帮助",
    mentions: "法律声明",
    cgu: "使用条款",
    confidentialite: "隐私政策",
    suppression: "数据删除",
    copyright: "© 2026 Klarr —— 由 EDIREF 运营。",
  },
};

export const ACCUEIL_PUBLIC: Record<Langue, ClesAccueilPublic> = { fr, en, zh };
