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
    nouveautes: string;
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
  temoignages: {
    surtitre: string;
    liste: { id: string; citation: string; nom: string; role: string }[];
  };
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
  /**
   * Ce qui vient d'arriver dans le produit, montré sur la même maison
   * fictive que « Comment ça marche ». Chaque carte promet seulement ce
   * que l'écran tient : la présence ailleurs que sur Google se vérifie
   * avec le restaurateur, elle ne se synchronise pas ; une réponse à un
   * avis se relit et se publie à la main.
   */
  nouveautes: {
    surtitre: string;
    titre: string;
    chapo: string;
    presence: {
      titre: string;
      texte: string;
      points: string[];
      maquette: {
        surtitre: string;
        /** « {n} sur {total} à jour » */
        compte: string;
        /** Le nom d'Apple Plans change avec la langue ; les autres non. */
        apple: string;
        aJour: string;
        aCorriger: string;
        absente: string;
        alerte: string;
      };
    };
    avis: {
      titre: string;
      texte: string;
      maquette: {
        surtitre: string;
        proposee: string;
        langue: string;
        copier: string;
        publiee: string;
      };
    };
    bilan: {
      titre: string;
      texte: string;
      maquette: {
        surtitre: string;
        objet: string;
        tuiles: { valeur: string; libelle: string }[];
        aFaire: string;
      };
    };
    cadeaux: {
      titre: string;
      texte: string;
      points: string[];
      maquette: {
        surtitre: string;
        bon: string;
        valeur: string;
        code: string;
        pour: string;
        de: string;
        valable: string;
        vendu: string;
      };
    };
    voisins: {
      titre: string;
      texte: string;
      maquette: {
        surtitre: string;
        vous: string;
        note: string;
        gain: string;
        signal: string;
      };
    };
    integration: {
      titre: string;
      texte: string;
      maquette: {
        surtitre: string;
        adresse: string;
        accroche: string;
        bouton: string;
        creneau: string;
        demander: string;
      };
    };
    lendemain: {
      titre: string;
      texte: string;
      maquette: {
        surtitre: string;
        objet: string;
        merci: string;
        bouton: string;
        prive: string;
      };
    };
    import: {
      titre: string;
      texte: string;
      maquette: {
        surtitre: string;
        colonnes: string;
        /** Les champs de Klarr, dans l'ordre des colonnes du fichier. */
        champs: string[];
        clients: string;
        reservations: string;
        dejaLa: string;
      };
    };
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
    /** Le lien vers la page qui montre le module, écran par écran. */
    voirParcours: string;
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
    /** La pastille qui relie les deux moitiés : ce qu'un assistant répond. */
    iaChip: string;
    reserver: string;
    jours: string[];
    couverts: string;
    service: string;
    demander: string;
    mention: string;
  };
  /**
   * Les trois écrans montrés dans « Comment ça marche », sur une maison
   * fictive. Chaque promesse de la section est prouvée par l'écran qui la
   * tient, recodé plutôt que capturé : il se traduit, il ne vieillit pas,
   * il reste net.
   */
  vitrine: {
    exemple: string;
    ia: {
      surtitre: string;
      questionLabel: string;
      /** Avec ses guillemets : « » en français, “ ” en anglais, 「 」 en chinois. */
      question: string;
      /** « cité #{rang} » — le rang s'insère. */
      cite: string;
      nonCite: string;
      aVotrePlace: string;
      /** « sur 3 réponses » */
      surReponses: string;
    };
    seo: {
      surtitre: string;
      titre: string;
      vu: string;
      clique: string;
      vus: string;
      clics: string;
      taux: string;
      /** « requêtes en première page » */
      premierePage: string;
      /** « {n} à portée, en deuxième page » */
      aPortee: string;
    };
    alerte: {
      surtitre: string;
      aujourdhui: string;
      /**
       * La ligne orange de la carte : ce que le patron n'aurait pas vu
       * sans Klarr. Un avis moyen tombé dans la nuit, resté sans réponse —
       * le genre de chose qui arrive à une maison qui tourne, pas à une
       * maison fermée.
       */
      signal: string;
    };
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
    actualites: string;
    aide: string;
    mentions: string;
    cgu: string;
    confidentialite: string;
    suppression: string;
    /**
     * L'intitulé lu à voix haute du lien LinkedIn.
     *
     * Le texte visible dit « LinkedIn » dans les trois langues — c'est
     * le nom de la plateforme, il ne se traduit pas, et LinkedIn n'a
     * plus de version chinoise depuis qu'elle a fermé. Mais « LinkedIn »
     * seul, annoncé par un lecteur d'écran au milieu de six autres
     * liens, ne dit pas de qui c'est la page.
     */
    linkedin: string;
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
    // « Logiciel » dans le titre et dans la page : c'est le mot qu'un
    // restaurateur tape. Google l'a signalé comme « terme manquant » sur
    // une recherche de la marque — absent du titre, de la description et
    // de tout le texte visible, il ne pouvait pas le trouver.
    titre: "Klarr — logiciel de réservation et de visibilité pour restaurants",
    description:
      "Klarr, le logiciel des restaurateurs : réservations sans commission, fiche Google, avis et visibilité dans les réponses des IA, au même endroit.",
  },
  nav: {
    outils: "Outils gratuits",
    fonctionnement: "Comment ça marche",
    nouveautes: "Nouveautés",
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
    badge: "Le logiciel des restaurateurs indépendants et petits groupes",
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
  temoignages: {
    surtitre: "Ce qu'en disent nos clients",
    liste: [
      {
        id: "an",
        citation:
          "« Avec deux restaurants, je n'ai pas le temps de jongler entre dix outils. Avec Klarr, réservations, avis et fiche Google sont au même endroit — et je ne paie aucune commission. »",
        nom: "An",
        role: "Patron de Kokodak et Joayo 13",
      },
      {
        id: "xuanmin",
        citation:
          "« Chez TAN, on a aussi le karaoké : privatisations et acomptes, c'était un casse-tête. Avec Klarr, le client réserve sa salle, verse son acompte en ligne, et tout arrive directement chez nous. »",
        nom: "Xuanmin",
        role: "Fondatrice de TAN",
      },
      {
        id: "huijun",
        citation:
          "« Pendant le service, je vois toute la salle table par table et les demandes arrivent directement. Plus besoin du cahier ni de rappeler chaque client. »",
        nom: "Huijun Yan",
        role: "Gérante du Prost",
      },
    ],
  },

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
  nouveautes: {
    surtitre: "Nouveau sur Klarr",
    titre: "Ce qui vient d'arriver.",
    chapo:
      "Vos fiches au-delà de Google, des bons cadeaux vendus en ligne, plus d'avis et une réponse à chacun, vos voisins suivis de près, la réservation sur votre propre site, un bilan chaque mois — et, si vous venez d'un autre outil, vos clients repris en quelques minutes.",
    presence: {
      titre: "Des informations justes, partout où l'on vous cherche",
      texte:
        "Apple Plans, Bing, Tripadvisor, PagesJaunes, Waze, les annuaires : vingt plateformes où vos horaires peuvent être faux sans que vous le sachiez. Klarr les passe en revue avec vous, une par une.",
      points: [
        "Pour chacune, le lien, le pas-à-pas et votre fiche prête à copier",
        "Un mode guidé qui les enchaîne, sans rien oublier",
        "Vos horaires changent ? Klarr vous dit quelles fiches revoir",
      ],
      maquette: {
        surtitre: "Présence en ligne",
        compte: "{n} sur {total} à jour",
        apple: "Apple Plans",
        aJour: "À jour",
        aCorriger: "À corriger",
        absente: "Absente",
        alerte: "Vos horaires ont changé hier — 5 fiches à revoir",
      },
    },
    avis: {
      titre: "Une réponse à chaque avis, dans la langue du client",
      texte:
        "Klarr propose une réponse signée au nom de la maison, en italien pour une cliente italienne. Vous la relisez, vous la publiez, et Klarr garde la trace de ce qui a déjà sa réponse.",
      maquette: {
        surtitre: "Avis · ce matin",
        proposee: "Réponse proposée",
        langue: "En italien, comme l'avis",
        copier: "Copier",
        publiee: "J'ai publié",
      },
    },
    bilan: {
      titre: "Le bilan du mois, le 1er au matin",
      texte:
        "Couverts, no-show, note Google, nouveaux clients, et ce qui vous attend. Dans votre boîte, sans vous connecter — et un clic pour ne plus le recevoir.",
      maquette: {
        surtitre: "E-mail · 1er septembre",
        objet: "Votre bilan d'août",
        tuiles: [
          { valeur: "1 284", libelle: "couverts" },
          { valeur: "4,6 ★", libelle: "sur Google, +0,1" },
          { valeur: "212", libelle: "nouveaux clients" },
          { valeur: "3", libelle: "no-show" },
        ],
        aFaire: "À faire ce mois-ci : 2 avis sans réponse",
      },
    },
    cadeaux: {
      titre: "Des bons cadeaux vendus en ligne, payés sur votre compte",
      texte:
        "Une page à votre nom où l'on offre un repas chez vous, en quelques clics. Le paiement arrive sur votre compte Stripe, sans commission, et le bénéficiaire reçoit son bon par e-mail.",
      points: [
        "Vos montants, votre durée de validité, un mot sur la page",
        "Un code à taper en caisse, utilisable en une ou plusieurs fois",
        "Des bons offerts pour un geste ou un concours, en un clic",
      ],
      maquette: {
        surtitre: "Bon cadeau · vendu hier soir",
        bon: "Bon cadeau",
        valeur: "Valeur",
        code: "Code",
        pour: "Pour Julien",
        de: "De la part de Claire",
        valable: "Valable jusqu'au 23 septembre 2027",
        vendu: "80 € encaissés sur votre compte Stripe",
      },
    },
    voisins: {
      titre: "Vos voisins, suivis chaque semaine",
      texte:
        "Choisissez jusqu'à cinq restaurants autour de vous. Chaque lundi, Klarr relève leur note et leur nombre d'avis sur Google : vous voyez qui avance, et à quel rythme.",
      maquette: {
        surtitre: "Vos voisins · relevé lundi",
        vous: "vous",
        note: "Note",
        gain: "En 30 j",
        signal: "Le Bistrot Voltigeur a gagné 22 avis ce mois-ci",
      },
    },
    integration: {
      titre: "La réservation sur votre propre site",
      texte:
        "Vous avez déjà un site ? Une ligne de code à coller, et un bouton « Réserver » ouvre votre réservation Klarr par-dessus, sans quitter la page. WordPress, Wix, Squarespace : ça marche partout.",
      maquette: {
        surtitre: "Votre site · avec le bouton Klarr",
        adresse: "www.latabledanselme.fr",
        accroche: "Cuisine de marché, au cœur de Lyon.",
        bouton: "Réserver une table",
        creneau: "Samedi · 2 personnes · 20:30",
        demander: "Demander une table",
      },
    },
    lendemain: {
      titre: "Un avis demandé le lendemain de la visite",
      texte:
        "Chaque client reçoit un merci et une invitation à laisser un avis sur Google, avec juste dessous un lien pour vous écrire directement. Le même message pour tous : Google interdit de n'inviter que les contents.",
      maquette: {
        surtitre: "E-mail · le lendemain, 11 h",
        objet: "Merci pour votre visite",
        merci:
          "Merci d'être venus hier. Si vous avez une minute, un avis sur Google nous aide énormément.",
        bouton: "Laisser un avis sur Google",
        prive: "Quelque chose n'allait pas ? Dites-le-nous directement",
      },
    },
    import: {
      titre: "Vous venez de TheFork ou de Zenchef ?",
      texte:
        "Déposez l'export de votre ancien outil : Klarr reconnaît les colonnes, vous montre l'aperçu, et reprend vos clients et vos réservations à venir. Rien n'est dédoublé, et personne n'est réabonné sans son accord.",
      maquette: {
        surtitre: "Import · export.csv",
        colonnes: "Colonnes reconnues",
        champs: ["Nom", "E-mail", "Date", "Heure", "Couverts"],
        clients: "clients ajoutés",
        reservations: "réservations à venir",
        dejaLa: "déjà au fichier, laissés tels quels",
      },
    },
  },
  difference: {
    surtitre: "La différence",
    titre: "Ce que ça change, concrètement.",
    avec: "Avec",
    sans: "Sans",
    oui: [
      "Fiche Google, avis, réseaux sociaux et menu au même endroit",
      "Des mots-clés choisis à partir d'une analyse, pas au hasard",
      "Les avis centralisés, et une réponse proposée dans la langue du client",
      "Photos, carte et horaires à jour — et vingt plateformes vérifiées avec vous",
      "Les allergènes déclarés une fois, affichés sous chaque plat et tenus à jour tout seuls",
      "Les questions qu'on vous pose au téléphone, répondues une fois et reprises par Google et les IA",
      "Le bilan du mois dans votre boîte, le 1er au matin",
      "Des bons cadeaux vendus en ligne, payés sur votre compte",
      "Vos voisins suivis chaque semaine, sans rien chercher",
      "Vous restez autonome, sans dépendre de personne",
    ],
    non: [
      "Un outil et un mot de passe différents par plateforme",
      "Des mots-clés au doigt mouillé, quand il y en a",
      "Des avis dispersés, et des réponses qui passent à la trappe",
      "Des informations périmées sur la moitié des sites",
      "Un classeur allergènes à refaire à la main à chaque changement de carte",
      "Les mêmes questions, posées une par une au téléphone en plein service",
      "Aucune vue d'ensemble, à moins de tout rouvrir un par un",
      "Des bons cadeaux papier, suivis dans un carnet à souches",
      "Aucune idée de ce que font les restaurants d'à côté",
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
    voirParcours: "Voir comment ça marche, en vidéo",
    ensuite: [
      {
        titre: "Le carnet",
        texte:
          "Demandes, confirmations, plan de salle et écran de service pour le coup de feu.",
      },
      {
        titre: "Moins de no-show",
        texte:
          "Rappel la veille, annulation en un clic. Pour les tables qui comptent : un acompte, ou une empreinte bancaire débitée seulement si le client ne vient pas.",
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
          "Une réponse proposée à chaque avis, dans la langue du client",
          "Vos fiches sur vingt plateformes, vérifiées avec vous",
          "Vos voisins suivis chaque semaine : leur note, leurs avis",
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
          "Vos clients et vos réservations repris de TheFork ou Zenchef",
          "Des bons cadeaux vendus en ligne, sans commission",
          "Une demande d'avis envoyée le lendemain de la visite",
          "Un bouton « Réserver » à poser sur votre propre site",
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
          "Peut-on demander une empreinte bancaire contre les no-show ?",
        reponse:
          "Oui. Pour les grandes tables, les soirs de fête ou les privatisations, le client enregistre sa carte en réservant : rien n'est débité. S'il ne vient pas et n'a pas annulé à temps, le restaurateur prélève le montant prévu en un clic. Vous pouvez aussi demander un acompte, encaissé tout de suite. Dans les deux cas, l'argent va sur votre propre compte Stripe, sans commission Klarr.",
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
        question:
          "Je suis sur TheFork ou Zenchef : est-ce que je perds mes clients en passant à Klarr ?",
        reponse:
          "Non. Exportez le fichier clients et les réservations à venir depuis votre outil actuel, puis déposez-les dans Klarr : les colonnes sont reconnues automatiquement et vous vérifiez l'aperçu avant de valider. Rien n'est dédoublé. Un client importé ne reçoit de campagne que si le fichier indique qu'il a accepté les e-mails et que vous le certifiez ; les réservations importées ne déclenchent ni confirmation ni rappel, puisqu'elles ont été prises ailleurs.",
      },
      {
        question:
          "Klarr s'occupe-t-il de ma présence ailleurs que sur Google ?",
        reponse:
          "Oui, avec vous. Klarr liste les vingt plateformes qui comptent pour un restaurant — Apple Plans, Bing, Tripadvisor, PagesJaunes, Waze, Yelp et les principaux annuaires — avec pour chacune le lien, le pas-à-pas et la fiche prête à copier. Un mode guidé les passe une par une, et quand vous modifiez vos horaires ou votre adresse, Klarr signale les fiches à revoir. La modification se fait sur chaque plateforme : Klarr ne la publie pas à votre place.",
      },
      {
        question: "Klarr répond-il aux avis ?",
        reponse:
          "Klarr propose une réponse à chaque avis, rédigée dans la langue du client et signée au nom de l'établissement. Vous la relisez, la modifiez si besoin, puis la publiez sur la plateforme. Klarr garde la trace des avis déjà répondus, pour qu'aucun ne reste sans réponse. Et pour en recevoir davantage, Klarr envoie à chaque client, le lendemain de sa visite, un e-mail de remerciement qui l'invite à laisser un avis sur Google, avec un lien pour écrire directement à la maison : le même message pour tous, comme Google l'exige.",
      },
      {
        question: "Peut-on vendre des bons cadeaux avec Klarr ?",
        reponse:
          "Oui. Le restaurant dispose d'une page à son nom où l'on achète un bon cadeau en ligne : montants choisis par la maison ou montant libre, un mot pour le bénéficiaire, envoi par e-mail. Le paiement est encaissé directement sur le compte Stripe du restaurant, sans commission Klarr. Le bon porte un code que l'équipe saisit en caisse, et il s'utilise en une ou plusieurs fois jusqu'à sa date de validité.",
      },
      {
        question: "J'ai déjà un site : puis-je y mettre la réservation Klarr ?",
        reponse:
          "Oui. Klarr fournit une ligne de code à coller dans votre site : un bouton « Réserver » ouvre la réservation par-dessus la page, sans que le client la quitte, et en plein écran sur téléphone. Pour les outils qui n'acceptent pas ce bouton, comme le bloc HTML de Wix, la réservation peut s'afficher directement dans une page, ou s'ouvrir par un simple lien. Les réservations arrivent dans le même carnet, sans commission.",
      },
      {
        question: "Klarr permet-il de suivre les restaurants concurrents ?",
        reponse:
          "Oui. Le restaurateur choisit jusqu'à cinq restaurants autour de lui, proposés par Klarr ou cherchés par leur nom. Chaque semaine, Klarr relève leur note et leur nombre d'avis sur Google, et montre qui en gagne le plus sur un mois. Le bilan mensuel reprend la position de l'établissement dans son quartier.",
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
    lieu: "Bistrot · Lyon 2e",
    ficheAJour: "Fiche Google à jour",
    iaChip: "Gemini vous cite en 3e",
    commission: "de commission",
    tableConfirmee: "Table confirmée · il y a 2 min",
    reserver: "Réserver une table",
    jours: ["Ven.", "Sam.", "Dim.", "Lun."],
    couverts: "2 personnes",
    service: "Samedi soir",
    demander: "Demander une table",
    mention: "Aucun compte à créer. Aucune commission pour le restaurant.",
  },
  vitrine: {
    exemple: "Exemple",
    ia: {
      surtitre: "Visibilité IA · ce matin",
      questionLabel: "Question posée",
      question: "« Quel est le meilleur bistrot à Lyon, près de Bellecour ? »",
      cite: "cité #{rang}",
      nonCite: "non cité",
      aVotrePlace: "Cités à votre place",
      surReponses: "sur 3 réponses",
    },
    seo: {
      surtitre: "Search Console · 28 derniers jours",
      titre: "Les requêtes les plus vues",
      vu: "vu",
      clique: "cliqué",
      vus: "fois vu dans Google",
      clics: "clics vers vos pages",
      taux: "des vues ont cliqué",
      premierePage: "requêtes en première page",
      aPortee: "{n} à portée, en deuxième page",
    },
    alerte: {
      surtitre: "Votre tableau de bord · ce matin",
      aujourdhui: "Aujourd'hui",
      signal: "Un avis 2 ★ posté cette nuit — toujours sans réponse",
    },
  },
  pied: {
    outils: "Outils gratuits",
    ouvrir: "Ouvrir un restaurant",
    diagnostic: "Diagnostic d'un local",
    calendrier: "Calendrier d'ouverture",
    audit: "Audit de fiche Google",
    calculateur: "Calculateur de commissions",
    journal: "Le journal",
    actualites: "Actualités",
    aide: "Aide",
    mentions: "Mentions légales",
    cgu: "Conditions d'utilisation",
    confidentialite: "Confidentialité",
    suppression: "Suppression des données",
    linkedin: "Klarr sur LinkedIn",
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
    titre: "Klarr — booking and visibility software for restaurants",
    description:
      "Klarr, the software for restaurant owners: commission-free bookings, your Google listing, reviews and visibility in AI answers, in one place.",
  },
  nav: {
    outils: "Free tools",
    fonctionnement: "How it works",
    nouveautes: "What's new",
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
    badge: "Software for independent restaurants and small groups",
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
  temoignages: {
    surtitre: "What our clients say",
    liste: [
      {
        id: "an",
        citation:
          "“With two restaurants, I don't have time to juggle ten tools. With Klarr, bookings, reviews and my Google listing are all in one place — and I pay no commission.”",
        nom: "An",
        role: "Owner of Kokodak and Joayo 13",
      },
      {
        id: "xuanmin",
        citation:
          "“At TAN we also run karaoke: private bookings and deposits used to be a headache. With Klarr, guests book their room, pay the deposit online, and everything comes straight to us.”",
        nom: "Xuanmin",
        role: "Founder of TAN",
      },
      {
        id: "huijun",
        citation:
          "“During service I see the whole room table by table, and requests come straight in. No more notebook, no more calling every guest back.”",
        nom: "Huijun Yan",
        role: "Manager of Prost",
      },
    ],
  },

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
  nouveautes: {
    surtitre: "New in Klarr",
    titre: "Just arrived.",
    chapo:
      "Your listings beyond Google, gift cards sold online, more reviews and a reply to each one, your neighbours tracked closely, bookings on your own website, a report every month — and, if you're coming from another tool, your guests brought over in minutes.",
    presence: {
      titre: "Your restaurant, correct wherever people look",
      texte:
        "Apple Maps, Bing, Tripadvisor, PagesJaunes, Waze, the directories: twenty platforms where your opening hours can be wrong without you knowing. Klarr goes through them with you, one by one.",
      points: [
        "For each one, the link, the steps, and your details ready to copy",
        "A guided mode that takes you through them all, nothing missed",
        "Changed your hours? Klarr tells you which listings to update",
      ],
      maquette: {
        surtitre: "Online presence",
        compte: "{n} of {total} up to date",
        apple: "Apple Maps",
        aJour: "Up to date",
        aCorriger: "To fix",
        absente: "Missing",
        alerte: "Your hours changed yesterday — 5 listings to update",
      },
    },
    avis: {
      titre: "A reply to every review, in the guest's language",
      texte:
        "Klarr drafts a reply signed in your restaurant's name — in Italian for an Italian guest. You read it, you post it, and Klarr keeps track of which reviews already have their answer.",
      maquette: {
        surtitre: "Reviews · this morning",
        proposee: "Suggested reply",
        langue: "In Italian, like the review",
        copier: "Copy",
        publiee: "I've posted it",
      },
    },
    bilan: {
      titre: "The month's report, on the 1st",
      texte:
        "Covers, no-shows, Google rating, new guests, and what's coming up. In your inbox, nothing to log into — and one click to stop receiving it.",
      maquette: {
        surtitre: "Email · 1 September",
        objet: "Your August report",
        tuiles: [
          { valeur: "1,284", libelle: "covers" },
          { valeur: "4.6 ★", libelle: "on Google, +0.1" },
          { valeur: "212", libelle: "new guests" },
          { valeur: "3", libelle: "no-shows" },
        ],
        aFaire: "To do this month: 2 reviews without a reply",
      },
    },
    cadeaux: {
      titre: "Gift cards sold online, paid into your account",
      texte:
        "A page in your name where people treat someone to a meal at your place in a few clicks. Payment goes to your Stripe account with no commission, and the recipient gets their card by email.",
      points: [
        "Your amounts, your validity period, a note on the page",
        "A code to enter at the till, usable in one or several visits",
        "Complimentary cards for a gesture or a contest, in one click",
      ],
      maquette: {
        surtitre: "Gift card · sold last night",
        bon: "Gift card",
        valeur: "Value",
        code: "Code",
        pour: "For Julien",
        de: "From Claire",
        valable: "Valid until 23 September 2027",
        vendu: "€80 paid into your Stripe account",
      },
    },
    voisins: {
      titre: "Your neighbours, tracked every week",
      texte:
        "Pick up to five restaurants around you. Every Monday, Klarr records their Google rating and review count: you see who is moving ahead, and how fast.",
      maquette: {
        surtitre: "Your neighbours · Monday check",
        vous: "you",
        note: "Rating",
        gain: "30 days",
        signal: "Le Bistrot Voltigeur gained 22 reviews this month",
      },
    },
    integration: {
      titre: "Bookings on your own website",
      texte:
        "Already have a website? Paste one line of code, and a “Book” button opens your Klarr booking on top of it, without leaving the page. WordPress, Wix, Squarespace: it works everywhere.",
      maquette: {
        surtitre: "Your website · with the Klarr button",
        adresse: "www.latabledanselme.fr",
        accroche: "Market cooking, in the heart of Lyon.",
        bouton: "Book a table",
        creneau: "Saturday · 2 people · 20:30",
        demander: "Request a table",
      },
    },
    lendemain: {
      titre: "A review requested the day after the visit",
      texte:
        "Every guest gets a thank-you and an invitation to leave a Google review, with a link just below to write to you directly. The same message for everyone: Google forbids inviting only happy guests.",
      maquette: {
        surtitre: "Email · next day, 11 am",
        objet: "Thank you for your visit",
        merci:
          "Thank you for coming yesterday. If you have a minute, a Google review helps us enormously.",
        bouton: "Leave a review on Google",
        prive: "Something wasn't right? Tell us directly",
      },
    },
    import: {
      titre: "Coming from TheFork or Zenchef?",
      texte:
        "Drop in the export from your old tool: Klarr recognises the columns, shows you a preview, and brings over your guests and upcoming bookings. Nothing is duplicated, and nobody is resubscribed without their consent.",
      maquette: {
        surtitre: "Import · export.csv",
        colonnes: "Columns recognised",
        champs: ["Name", "Email", "Date", "Time", "Covers"],
        clients: "guests added",
        reservations: "upcoming bookings",
        dejaLa: "already on file, left as they were",
      },
    },
  },
  difference: {
    surtitre: "The difference",
    titre: "What it changes, in practice.",
    avec: "With",
    sans: "Without",
    oui: [
      "Google listing, reviews, social accounts and menu in one place",
      "Keywords chosen from an analysis, not at random",
      "Reviews in a single inbox, with a reply drafted in the guest's language",
      "Photos, menu and hours up to date — and twenty platforms checked with you",
      "Allergens declared once, shown under every dish and kept current on their own",
      "The questions you get by phone, answered once and picked up by Google and AI assistants",
      "The month's report in your inbox, on the morning of the 1st",
      "Gift cards sold online, paid into your account",
      "Your neighbours tracked every week, with no digging",
      "You stay independent, with nobody to depend on",
    ],
    non: [
      "A different tool and password for every platform",
      "Keywords picked by guesswork, when there are any",
      "Reviews scattered around, and replies that slip through",
      "Out-of-date information on half the sites you're listed on",
      "An allergen binder to redo by hand every time the menu changes",
      "The same questions, asked one at a time by phone in the middle of service",
      "No overview, unless you reopen everything one by one",
      "Paper gift vouchers, tracked in a stub book",
      "No idea what the restaurants next door are doing",
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
    voirParcours: "See how it works, on video",
    ensuite: [
      {
        titre: "The book",
        texte:
          "Requests, confirmations, floor plan and a service screen for the rush.",
      },
      {
        titre: "Fewer no-shows",
        texte:
          "A reminder the day before, one-click cancellation. For the tables that matter: a deposit, or a card hold charged only if the guest doesn't show.",
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
          "A suggested reply to every review, in the guest's language",
          "Your listings on twenty platforms, checked with you",
          "Your neighbours tracked weekly: their rating, their reviews",
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
          "Your guests and bookings brought over from TheFork or Zenchef",
          "Gift cards sold online, with no commission",
          "A review request sent the day after the visit",
          "A “Book” button to add to your own website",
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
        question: "Can I ask for a card hold against no-shows?",
        reponse:
          "Yes. For large tables, special evenings or private hire, guests save their card when booking: nothing is charged. If they don't come and haven't cancelled in time, the restaurant charges the agreed amount in one click. You can also ask for a deposit, collected straight away. Either way, the money goes to your own Stripe account, with no Klarr commission.",
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
        question:
          "I'm on TheFork or Zenchef: do I lose my guests if I switch to Klarr?",
        reponse:
          "No. Export your guest list and upcoming bookings from your current tool, then drop them into Klarr: the columns are recognised automatically and you check the preview before confirming. Nothing is duplicated. An imported guest only receives campaigns if the file says they agreed to emails and you confirm it; imported bookings trigger no confirmation or reminder, since they were taken elsewhere.",
      },
      {
        question: "Does Klarr handle my presence beyond Google?",
        reponse:
          "Yes, together with you. Klarr lists the twenty platforms that matter for a restaurant — Apple Maps, Bing, Tripadvisor, PagesJaunes, Waze, Yelp and the main directories — each with its link, step-by-step instructions and your details ready to copy. A guided mode takes you through them one by one, and when you change your hours or address, Klarr flags the listings to update. The change is made on each platform: Klarr does not publish it for you.",
      },
      {
        question: "Does Klarr reply to reviews?",
        reponse:
          "Klarr suggests a reply to every review, written in the guest's language and signed in your restaurant's name. You read it, edit it if needed, then post it on the platform. Klarr keeps track of which reviews already have a reply, so none is left unanswered. And to get more of them, Klarr emails every guest the day after their visit with a thank-you and an invitation to leave a Google review, plus a link to write to the restaurant directly: the same message for everyone, as Google requires.",
      },
      {
        question: "Can you sell gift cards with Klarr?",
        reponse:
          "Yes. The restaurant gets a page in its name where people buy a gift card online: amounts set by the restaurant or a custom amount, a note for the recipient, delivery by email. Payment goes straight to the restaurant's Stripe account, with no Klarr commission. The card carries a code the team enters at the till, and it can be used in one or several visits until it expires.",
      },
      {
        question: "I already have a website: can I add Klarr bookings to it?",
        reponse:
          "Yes. Klarr gives you one line of code to paste into your site: a “Book” button opens the booking on top of the page, without the guest leaving it, and full screen on a phone. For tools that don't accept the button, such as Wix's HTML block, the booking can be shown directly inside a page, or opened through a simple link. Bookings land in the same book, with no commission.",
      },
      {
        question: "Can Klarr track competing restaurants?",
        reponse:
          "Yes. The restaurant picks up to five restaurants nearby, suggested by Klarr or searched by name. Every week, Klarr records their Google rating and review count, and shows who gains the most over a month. The monthly report includes where the restaurant stands in its neighbourhood.",
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
    lieu: "Bistro · Lyon 2nd",
    ficheAJour: "Google listing up to date",
    iaChip: "Gemini lists you 3rd",
    commission: "commission",
    tableConfirmee: "Table confirmed · 2 min ago",
    reserver: "Book a table",
    jours: ["Fri", "Sat", "Sun", "Mon"],
    couverts: "2 people",
    service: "Saturday evening",
    demander: "Request a table",
    mention: "No account to create. No commission for the restaurant.",
  },
  vitrine: {
    exemple: "Example",
    ia: {
      surtitre: "AI visibility · this morning",
      questionLabel: "Question asked",
      question: "“What's the best bistro in Lyon, near Bellecour?”",
      cite: "cited #{rang}",
      nonCite: "not cited",
      aVotrePlace: "Cited instead of you",
      surReponses: "of 3 answers",
    },
    seo: {
      surtitre: "Search Console · last 28 days",
      titre: "Most-seen queries",
      vu: "seen",
      clique: "clicked",
      vus: "times seen on Google",
      clics: "clicks to your pages",
      taux: "of views clicked",
      premierePage: "queries on page one",
      aPortee: "{n} within reach, on page two",
    },
    alerte: {
      surtitre: "Your dashboard · this morning",
      aujourdhui: "Today",
      signal: "A 2★ review came in overnight — still unanswered",
    },
  },
  pied: {
    outils: "Free tools",
    ouvrir: "Opening a restaurant",
    diagnostic: "Check a site",
    calendrier: "Opening timeline",
    audit: "Google listing audit",
    calculateur: "Commission calculator",
    journal: "Journal (in French)",
    actualites: "News (in French)",
    aide: "Help",
    mentions: "Legal notice",
    cgu: "Terms of use",
    confidentialite: "Privacy",
    suppression: "Data deletion",
    linkedin: "Klarr on LinkedIn",
    copyright: "© 2026 Klarr — published by EDIREF.",
  },
};

const zh: ClesAccueilPublic = {
  meta: {
    titre: "Klarr — 餐厅订位与曝光管理软件",
    description:
      "Klarr 餐厅管理软件：零佣金订位、Google 商家资料、顾客评价和 AI 回答中的曝光度，全部集中在一处。",
  },
  nav: {
    outils: "免费工具",
    fonctionnement: "运作方式",
    nouveautes: "新功能",
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
    badge: "专为独立餐厅和小型餐饮集团打造的软件",
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
  temoignages: {
    surtitre: "客户怎么说",
    liste: [
      {
        id: "an",
        citation:
          "“我有两家餐厅，没时间在十个工具之间来回切换。用 Klarr，订位、评价和 Google 商家资料都在一个地方，而且不用付任何佣金。”",
        nom: "An",
        role: "Kokodak 和 Joayo 13 老板",
      },
      {
        id: "xuanmin",
        citation:
          "“TAN 还有卡拉 OK，包场和订金以前特别麻烦。用 Klarr，客人直接订包间、在线付订金，所有信息都直接到我们这里。”",
        nom: "Xuanmin",
        role: "TAN 创始人",
      },
      {
        id: "huijun",
        citation:
          "“营业时，整个餐厅一桌一桌看得清清楚楚，订位申请直接进来。不用再记本子，也不用一个个回电话。”",
        nom: "Huijun Yan",
        role: "Prost 店长",
      },
    ],
  },

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
  nouveautes: {
    surtitre: "Klarr 新功能",
    titre: "刚刚上线。",
    chapo:
      "Google 之外的商家资料、在线销售的礼品卡、更多评价且每条都有回复、紧盯周边同行、在自己网站上订位、每月一份总结——如果您从别的工具转过来，几分钟就能把顾客迁过来。",
    presence: {
      titre: "顾客在哪儿找您，信息就在哪儿准确",
      texte:
        "Apple 地图、Bing、Tripadvisor、PagesJaunes、Waze 以及各类目录：二十个平台，您的营业时间可能早已出错而您并不知道。Klarr 陪您逐个核对。",
      points: [
        "每个平台都附链接、操作步骤，以及可直接复制的商家信息",
        "引导模式带您逐个完成，一个不漏",
        "营业时间改了？Klarr 告诉您哪些平台需要更新",
      ],
      maquette: {
        surtitre: "线上存在",
        compte: "{total} 个中 {n} 个已更新",
        apple: "Apple 地图",
        aJour: "已更新",
        aCorriger: "待修正",
        absente: "未收录",
        alerte: "您的营业时间昨天有变——5 个平台需要更新",
      },
    },
    avis: {
      titre: "每条评价都有回复，用顾客的语言",
      texte:
        "Klarr 以餐厅的名义拟好回复——意大利顾客就用意大利语。您读一遍、发布，Klarr 会记下哪些评价已经回复。",
      maquette: {
        surtitre: "评价 · 今天早上",
        proposee: "建议回复",
        langue: "与评价同为意大利语",
        copier: "复制",
        publiee: "我已发布",
      },
    },
    bilan: {
      titre: "每月 1 日早上，送上月度总结",
      texte:
        "接待人数、爽约、Google 评分、新顾客，以及接下来要做的事。直接发到您的邮箱，无需登录——不想收也只需点一下。",
      maquette: {
        surtitre: "邮件 · 9 月 1 日",
        objet: "您的 8 月总结",
        tuiles: [
          { valeur: "1,284", libelle: "位客人" },
          { valeur: "4.6 ★", libelle: "Google 评分，+0.1" },
          { valeur: "212", libelle: "位新顾客" },
          { valeur: "3", libelle: "次爽约" },
        ],
        aFaire: "本月待办：2 条评价尚未回复",
      },
    },
    cadeaux: {
      titre: "在线销售礼品卡，款项直接进入您的账户",
      texte:
        "一个以您名义的页面，顾客点几下就能请人来您店里吃饭。款项进入您的 Stripe 账户，没有佣金，收礼人通过邮件收到礼品卡。",
      points: [
        "金额、有效期、页面上的一句话，都由您决定",
        "结账时输入兑换码，可一次或分多次使用",
        "一键赠送礼品卡，用于答谢或抽奖活动",
      ],
      maquette: {
        surtitre: "礼品卡 · 昨晚售出",
        bon: "礼品卡",
        valeur: "面值",
        code: "兑换码",
        pour: "送给 Julien",
        de: "来自 Claire",
        valable: "有效期至 2027 年 9 月 23 日",
        vendu: "€80 已进入您的 Stripe 账户",
      },
    },
    voisins: {
      titre: "周边同行，每周跟踪",
      texte:
        "选择您周边最多五家餐厅。每周一，Klarr 记录它们在 Google 上的评分和评价数：谁在进步、进步多快，一目了然。",
      maquette: {
        surtitre: "周边同行 · 周一更新",
        vous: "您",
        note: "评分",
        gain: "30 天",
        signal: "Le Bistrot Voltigeur 本月新增 22 条评价",
      },
    },
    integration: {
      titre: "在您自己的网站上订位",
      texte:
        "已经有网站？粘贴一行代码，「订位」按钮就会在页面上直接打开 Klarr 订位，无需离开网站。WordPress、Wix、Squarespace 都适用。",
      maquette: {
        surtitre: "您的网站 · 加上 Klarr 按钮",
        adresse: "www.latabledanselme.fr",
        accroche: "市场时令料理，就在里昂市中心。",
        bouton: "预订餐位",
        creneau: "周六 · 2 人 · 20:30",
        demander: "申请订位",
      },
    },
    lendemain: {
      titre: "用餐次日，邀请顾客留下评价",
      texte:
        "每位顾客都会收到一封感谢邮件，邀请其在 Google 上留下评价，下方附有直接联系您的链接。所有人收到同样的邮件：Google 禁止只邀请满意的顾客。",
      maquette: {
        surtitre: "邮件 · 次日 11 点",
        objet: "感谢您的光临",
        merci:
          "感谢您昨天光临。如果您有一分钟，在 Google 上留下评价会对我们帮助很大。",
        bouton: "在 Google 上留下评价",
        prive: "有哪里做得不够好？直接告诉我们",
      },
    },
    import: {
      titre: "您在用 TheFork 或 Zenchef？",
      texte:
        "上传旧工具导出的文件：Klarr 自动识别各列，先给您预览，再导入顾客和即将到来的预订。不会重复，未经顾客同意也不会重新订阅。",
      maquette: {
        surtitre: "导入 · export.csv",
        colonnes: "已识别的列",
        champs: ["姓名", "邮箱", "日期", "时间", "人数"],
        clients: "位顾客已添加",
        reservations: "条即将到来的预订",
        dejaLa: "已在名单中，保持不变",
      },
    },
  },
  difference: {
    surtitre: "差别",
    titre: "具体带来什么改变。",
    avec: "使用",
    sans: "不使用",
    oui: [
      "Google 商家资料、评价、社交账号和菜单集中在一处",
      "关键词来自分析，而不是凭感觉",
      "评价统一汇总，并按顾客的语言拟好回复",
      "照片、菜单和营业时间保持最新——二十个平台与您一起核对",
      "过敏原只需申报一次，自动显示在每道菜下方，并始终保持最新",
      "客人常问的问题，回答一次，之后由 Google 和 AI 直接引用",
      "每月 1 日早上，月度总结直接发到邮箱",
      "在线销售礼品卡，款项直接进入您的账户",
      "每周自动跟踪周边同行，无需自己查",
      "您保持自主，不依赖任何人",
    ],
    non: [
      "每个平台一个工具、一个密码",
      "关键词全凭猜测，甚至根本没有",
      "评价分散各处，回复常常漏掉",
      "一半的网站上挂着过期信息",
      "换一次菜单，过敏原清单就得手工重做一遍",
      "同样的问题，在出餐高峰一通一通打电话来问",
      "没有全局概览，除非把每个工具逐一打开",
      "纸质礼品券，靠存根本手工记账",
      "对隔壁餐厅的动向一无所知",
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
    voirParcours: "观看视频，了解如何运作",
    ensuite: [
      {
        titre: "预订簿",
        texte: "申请、确认、桌位图，以及应对高峰的出餐屏幕。",
      },
      {
        titre: "更少放鸽子",
        texte:
          "前一天提醒，一键取消。重要的桌位可以收订金，或做信用卡担保——客人没来才扣款。",
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
          "每条评价都有建议回复，用顾客的语言",
          "二十个平台上的商家资料，与您一起核对",
          "每周跟踪周边同行：评分与评价数",
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
          "从 TheFork 或 Zenchef 迁入顾客和预订",
          "在线销售礼品卡，零佣金",
          "用餐次日自动发送评价邀请",
          "可放在您自己网站上的「订位」按钮",
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
        question: "可以用信用卡担保来防止客人爽约吗？",
        reponse:
          "可以。大桌、节日晚上或包场时，客人订位时登记信用卡，但不会扣款。如果客人没来、也没有按时取消，餐厅一键扣除约定金额。您也可以收订金，订位时直接付款。两种方式的款项都进入您自己的 Stripe 账户，Klarr 不抽成。",
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
        question: "我在用 TheFork 或 Zenchef：换成 Klarr 会丢掉顾客吗？",
        reponse:
          "不会。从现有工具导出顾客名单和即将到来的预订，再上传到 Klarr：各列会被自动识别，确认前您可以先查看预览。数据不会重复。导入的顾客只有在文件显示其同意接收邮件、且经您确认后，才会收到营销邮件；导入的预订不会触发确认或提醒邮件，因为它们是在别处接下的。",
      },
      {
        question: "Klarr 会管理 Google 以外的线上信息吗？",
        reponse:
          "会，与您一起。Klarr 列出对餐厅重要的二十个平台——Apple 地图、Bing、Tripadvisor、PagesJaunes、Waze、Yelp 以及主要目录——每个平台都附链接、操作步骤和可直接复制的商家信息。引导模式带您逐个完成；当您修改营业时间或地址时，Klarr 会提示哪些平台需要更新。修改需在各平台上完成，Klarr 不会代您发布。",
      },
      {
        question: "Klarr 会回复评价吗？",
        reponse:
          "Klarr 为每条评价拟好回复，使用顾客的语言，并以餐厅的名义署名。您读一遍、按需修改，再发布到对应平台。Klarr 会记录哪些评价已回复，确保没有一条被遗漏。为了获得更多评价，Klarr 会在顾客用餐次日发送感谢邮件，邀请其在 Google 上留下评价，并附上直接联系餐厅的链接：按 Google 的要求，所有人收到同样的邮件。",
      },
      {
        question: "可以用 Klarr 销售礼品卡吗？",
        reponse:
          "可以。餐厅拥有一个以自己名义的页面，顾客可在线购买礼品卡：金额由餐厅设定，也可自定义，可给收礼人留言，并通过邮件发送。款项直接进入餐厅的 Stripe 账户，Klarr 不收取佣金。礼品卡带有兑换码，结账时由店员输入，在有效期内可一次或分多次使用。",
      },
      {
        question: "我已经有网站了：可以把 Klarr 订位放上去吗？",
        reponse:
          "可以。Klarr 提供一行代码，粘贴到您的网站即可：「订位」按钮会在页面上直接打开订位，顾客无需离开网站，手机上则全屏显示。对于不支持该按钮的工具（例如 Wix 的 HTML 模块），订位可以直接显示在页面中，或通过一个简单链接打开。订位都进入同一个订位簿，零佣金。",
      },
      {
        question: "Klarr 能跟踪竞争对手吗？",
        reponse:
          "可以。餐厅可以选择周边最多五家餐厅，由 Klarr 推荐或按名称搜索。Klarr 每周记录它们在 Google 上的评分和评价数，并显示一个月内谁新增的评价最多。月度总结也会列出餐厅在所在街区的排名。",
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
    lieu: "小酒馆 · 里昂二区",
    ficheAJour: "Google 资料已更新",
    iaChip: "Gemini 把您排在第 3 位",
    commission: "抽成",
    tableConfirmee: "桌位已确认 · 2 分钟前",
    reserver: "订一张桌",
    jours: ["周五", "周六", "周日", "周一"],
    couverts: "2 人",
    service: "周六晚",
    demander: "提交订位申请",
    mention: "无需注册账号。餐厅无需支付抽成。",
  },
  vitrine: {
    exemple: "示例",
    ia: {
      surtitre: "AI 曝光度 · 今晨",
      questionLabel: "提出的问题",
      question: "「里昂白莱果广场附近最好的小酒馆是哪家？」",
      cite: "被提及，第 {rang} 位",
      nonCite: "未被提及",
      aVotrePlace: "取代您被提及的餐厅",
      surReponses: "共 3 条回答",
    },
    seo: {
      surtitre: "Search Console · 最近 28 天",
      titre: "曝光最多的搜索词",
      vu: "曝光",
      clique: "点击",
      vus: "次在 Google 上被看到",
      clics: "次点击进入您的页面",
      taux: "的曝光带来了点击",
      premierePage: "个搜索词位于首页",
      aPortee: "{n} 个在第二页，触手可及",
    },
    alerte: {
      surtitre: "您的仪表盘 · 今晨",
      aujourdhui: "今天",
      signal: "昨晚新增一条 2★ 评价——尚未回复",
    },
  },
  pied: {
    outils: "免费工具",
    ouvrir: "开一家餐厅",
    diagnostic: "选址诊断",
    calendrier: "开业时间表",
    audit: "Google 商家资料检测",
    calculateur: "抽成计算器",
    journal: "专栏（法语）",
    actualites: "行业新闻（法语）",
    aide: "帮助",
    mentions: "法律声明",
    cgu: "使用条款",
    confidentialite: "隐私政策",
    suppression: "数据删除",
    linkedin: "Klarr 的 LinkedIn 主页",
    copyright: "© 2026 Klarr —— 由 EDIREF 运营。",
  },
};

export const ACCUEIL_PUBLIC: Record<Langue, ClesAccueilPublic> = { fr, en, zh };
