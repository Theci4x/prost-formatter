import {
  ESSAI_JOURS,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";
import type { Langue } from "@/lib/i18n/langues";

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
 *
 * **Traduit, mais pas retouché.** Les trois versions disent les mêmes
 * chiffres et les mêmes réserves. C'est la seule façon de traduire une
 * publicité comparative sans se retrouver avec deux affirmations
 * différentes sur le même concurrent — et c'est la version qui dit le
 * moins qui aurait tort.
 */

export type Solution = {
  cle: "klarr" | "thefork" | "zenchef" | "guestonline";
  nom: string;
  url: string | null;
};

/** Les noms et les adresses ne se traduisent pas. */
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

export type ClesComparatif = {
  titre: string;
  resume: string;
  fil: string;
  /** Le mois du relevé, dans la langue du lecteur. */
  releve: string;
  relevePublic(releve: string): string;
  critereEntete: string;
  aveuTableau(defavorables: number, total: number): string;
  aveuCourt(defavorables: number, total: number): string;
  lignes: Ligne[];
  ceQueKlarrNeFaitPas: string;
  limites: { titre: string; texte: string }[];
  lesTarifs: string;
  tarifReservations: string;
  tarifVisibilite: string;
  tarifLesDeux: string;
  tarifs: { visibilite: string; reservations: string; pack: string };
  questionsFrequentes: string;
  questions: { question: string; reponse: string }[];
  avantDeChoisir: string;
  testerMaPresence: string;
};

const fr: ClesComparatif = {
  titre:
    "Klarr, TheFork, Zenchef, Guestonline : quel logiciel de réservation pour votre restaurant ?",
  resume:
    "Les quatre solutions de réservation pour restaurants indépendants en France, comparées sur leur modèle économique, leur tarif et ce qu'elles font vraiment — y compris ce que Klarr ne fait pas.",
  fil: "Comparatif",
  releve: "septembre 2026",
  relevePublic: (releve) =>
    `Tarifs et caractéristiques des autres éditeurs relevés sur leurs pages publiques en ${releve}. Ils changent : si vous constatez une erreur, dites-le-nous et nous la corrigerons.`,
  critereEntete: "Critère",
  aveuTableau: (defavorables, total) =>
    `${defavorables} ligne${defavorables > 1 ? "s" : ""} sur ${total} ne nous ${
      defavorables > 1 ? "sont" : "est"
    } pas favorable${defavorables > 1 ? "s" : ""}, et la section suivante dit ce que Klarr ne fait pas. Un comparatif dont l'auteur gagne partout ne se lit pas.`,
  aveuCourt: (defavorables, total) =>
    `${defavorables} ligne${defavorables > 1 ? "s" : ""} sur ${total} ne nous ${
      defavorables > 1 ? "sont" : "est"
    } pas favorable${defavorables > 1 ? "s" : ""}. Un comparatif dont l'auteur gagne partout ne se lit pas.`,
  lignes: [
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
  ],
  ceQueKlarrNeFaitPas: "Ce que Klarr ne fait pas",
  limites: [
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
  ],
  lesTarifs: "Les tarifs de Klarr",
  tarifReservations: "Réservations",
  tarifVisibilite: "Votre visibilité",
  tarifLesDeux: "Les deux",
  tarifs: {
    visibilite: `${PRIX_MODULE.visibilite} (${PRIX_MODULE_TTC.visibilite}) — ${ESSAI_JOURS.visibilite} jours d'essai`,
    reservations: `${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations}) — ${ESSAI_JOURS.reservations} jours d'essai`,
    pack: `${PRIX_PACK} (${PRIX_PACK_TTC}), soit onze pour cent de moins que séparément`,
  },
  questionsFrequentes: "Questions fréquentes",
  questions: [
    {
      question: "Quel logiciel de réservation ne prend pas de commission ?",
      reponse: `Klarr, Zenchef et Guestonline facturent un abonnement sans commission par couvert. TheFork se rémunère à la commission, de un à deux euros par couvert réservé via sa place de marché. Au relevé de septembre 2026, Klarr est le moins cher des trois sans commission, à ${PRIX_MODULE.reservations}.`,
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
  ],
  avantDeChoisir:
    "Avant de choisir, regardez où vous en êtes : ce que votre fiche Google montre vraiment, ce que disent vos avis, et ce qu'une IA répond quand un client cherche où manger près de chez vous. C'est gratuit et sans carte bancaire.",
  testerMaPresence: "Tester ma présence en ligne",
};

const en: ClesComparatif = {
  titre:
    "Klarr, TheFork, Zenchef, Guestonline: which booking software for your restaurant?",
  resume:
    "The four booking solutions for independent restaurants in France, compared on their business model, their price and what they actually do — including what Klarr does not.",
  fil: "Comparison",
  releve: "September 2026",
  relevePublic: (releve) =>
    `Other vendors' prices and features were taken from their public pages in ${releve}. They change: if you spot a mistake, tell us and we will correct it.`,
  critereEntete: "Criterion",
  aveuTableau: (defavorables, total) =>
    `${defavorables} of ${total} rows ${defavorables > 1 ? "do" : "does"} not favour us, and the next section says what Klarr does not do. Nobody reads a comparison whose author wins everywhere.`,
  aveuCourt: (defavorables, total) =>
    `${defavorables} of ${total} rows ${defavorables > 1 ? "do" : "does"} not favour us. Nobody reads a comparison whose author wins everywhere.`,
  lignes: [
    {
      critere: "Business model",
      valeurs: {
        klarr: "Flat subscription",
        thefork: "Commission per cover",
        zenchef: "Flat subscription",
        guestonline: "Flat subscription",
      },
    },
    {
      critere: "Monthly price",
      valeurs: {
        klarr: `${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations})`,
        thefork: "Varies with covers",
        zenchef: "From €109",
        guestonline: "From €99",
      },
    },
    {
      critere: "Commission per cover",
      valeurs: {
        klarr: "None",
        thefork: "€1 to €2 per cover",
        zenchef: "None",
        guestonline: "None",
      },
    },
    {
      critere: "Brings you diners who do not know you",
      defavorable: true,
      valeurs: {
        klarr: "No",
        thefork: "Yes, that is its trade",
        zenchef: "No",
        guestonline: "No",
      },
    },
    {
      critere: "Tracks what AI assistants answer about you",
      valeurs: {
        klarr: "Yes",
        thefork: "No",
        zenchef: "No",
        guestonline: "No",
      },
    },
  ],
  ceQueKlarrNeFaitPas: "What Klarr does not do",
  limites: [
    {
      titre: "Klarr does not bring you diners",
      texte:
        "TheFork is a marketplace: people go there looking for a restaurant without having picked one. Klarr does nothing of the sort. It serves those who are already looking for you, or who find you through Google. On an empty Tuesday in January, a commission paid to TheFork can be the best investment of the month.",
    },
    {
      titre: "No “Reserve” button inside Google",
      texte:
        "The “Reserve with Google” programme lets people book without leaving the Google listing. Klarr is not part of it. You can, however, paste your booking link into your listing: Google then shows a button that leads to your page. It is free, immediate, and depends on nobody.",
    },
    {
      titre: "No table plan on the other systems",
      texte:
        "Klarr does not connect to any of the other three. If you already use TheFork, the two can live side by side — TheFork for its marketplace, Klarr for your direct bookings — but the two books stay separate.",
    },
  ],
  lesTarifs: "Klarr's prices",
  tarifReservations: "Bookings",
  tarifVisibilite: "Your visibility",
  tarifLesDeux: "Both",
  tarifs: {
    visibilite: `${PRIX_MODULE.visibilite} (${PRIX_MODULE_TTC.visibilite}) — ${ESSAI_JOURS.visibilite}-day trial`,
    reservations: `${PRIX_MODULE.reservations} (${PRIX_MODULE_TTC.reservations}) — ${ESSAI_JOURS.reservations}-day trial`,
    pack: `${PRIX_PACK} (${PRIX_PACK_TTC}), eleven per cent less than separately`,
  },
  questionsFrequentes: "Frequently asked questions",
  questions: [
    {
      question: "Which booking software takes no commission?",
      reponse: `Klarr, Zenchef and Guestonline charge a subscription with no commission per cover. TheFork earns on commission, one to two euros per cover booked through its marketplace. As recorded in September 2026, Klarr is the cheapest of the three without commission, at ${PRIX_MODULE.reservations}.`,
    },
    {
      question: "Can you use Klarr and TheFork at the same time?",
      reponse:
        "Yes, and it is often the right setup. TheFork brings you diners who do not know you, with its commission; Klarr takes, with no commission, those who are already looking for you. The two books stay separate.",
    },
    {
      question: "Does Klarr replace my Google listing?",
      reponse:
        "No, it watches it and helps you keep it up. Booking happens on your own page, whose link you paste into your Google listing.",
    },
    {
      question: "Are there set-up fees with Klarr?",
      reponse: `No. No installation fee, no commitment, one click to cancel from the dashboard. The trial runs ${ESSAI_JOURS.reservations} days on bookings and ${ESSAI_JOURS.visibilite} days on visibility.`,
    },
  ],
  avantDeChoisir:
    "Before you choose, look at where you stand: what your Google listing actually shows, what your reviews say, and what an AI answers when someone looks for somewhere to eat near you. It is free and takes no card.",
  testerMaPresence: "Test my online presence",
};

const zh: ClesComparatif = {
  titre:
    "Klarr、TheFork、Zenchef、Guestonline：您的餐厅该用哪套订座系统？",
  resume:
    "法国面向独立餐厅的四套订座方案，从商业模式、价格到实际功能逐项对比——包括 Klarr 做不到的事。",
  fil: "对比",
  releve: "2026 年 9 月",
  relevePublic: (releve) =>
    `其他厂商的价格与功能取自他们在${releve}的公开页面。这些会变：如果您发现错误，请告诉我们，我们会更正。`,
  critereEntete: "对比项",
  aveuTableau: (defavorables, total) =>
    `${total} 项里有 ${defavorables} 项对我们不利，下一节还写了 Klarr 做不到的事。一份作者处处胜出的对比，没人会看。`,
  aveuCourt: (defavorables, total) =>
    `${total} 项里有 ${defavorables} 项对我们不利。一份作者处处胜出的对比，没人会看。`,
  lignes: [
    {
      critere: "商业模式",
      valeurs: {
        klarr: "固定订阅费",
        thefork: "按人头抽成",
        zenchef: "固定订阅费",
        guestonline: "固定订阅费",
      },
    },
    {
      critere: "月费",
      valeurs: {
        klarr: `${PRIX_MODULE.reservations}（${PRIX_MODULE_TTC.reservations}）`,
        thefork: "按客人数量浮动",
        zenchef: "109 欧元起",
        guestonline: "99 欧元起",
      },
    },
    {
      critere: "按人头抽成",
      valeurs: {
        klarr: "无",
        thefork: "每位 1 至 2 欧元",
        zenchef: "无",
        guestonline: "无",
      },
    },
    {
      critere: "为您带来不认识您的客人",
      defavorable: true,
      valeurs: {
        klarr: "不能",
        thefork: "能，这是它的本业",
        zenchef: "不能",
        guestonline: "不能",
      },
    },
    {
      critere: "追踪 AI 助手怎么谈论您",
      valeurs: {
        klarr: "能",
        thefork: "不能",
        zenchef: "不能",
        guestonline: "不能",
      },
    },
  ],
  ceQueKlarrNeFaitPas: "Klarr 做不到的事",
  limites: [
    {
      titre: "Klarr 不会为您带客",
      texte:
        "TheFork 是一个平台：人们在上面找餐厅，心里还没定下哪一家。Klarr 完全不做这件事。它服务的是已经在找您、或通过 Google 找到您的客人。一月里客人稀少的周二，付给 TheFork 的那笔抽成，可能是当月最值的一笔投入。",
    },
    {
      titre: "Google 里没有「预订」按钮",
      texte:
        "「Reserve with Google」让客人不离开 Google 页面就能订座。Klarr 不在这个项目里。但您可以把自己的订座链接贴进 Google 商家资料：Google 会显示一个按钮，指向您的页面。免费、立刻生效，也不用求人。",
    },
    {
      titre: "不接其他系统的桌位图",
      texte:
        "Klarr 不与另外三套系统对接。如果您已经在用 TheFork，两者可以并行——TheFork 负责它的平台客源，Klarr 负责您的直接订位——但两本订位簿是分开的。",
    },
  ],
  lesTarifs: "Klarr 的价格",
  tarifReservations: "订座",
  tarifVisibilite: "您的曝光",
  tarifLesDeux: "两者一起",
  tarifs: {
    visibilite: `${PRIX_MODULE.visibilite}（${PRIX_MODULE_TTC.visibilite}）—— ${ESSAI_JOURS.visibilite} 天试用`,
    reservations: `${PRIX_MODULE.reservations}（${PRIX_MODULE_TTC.reservations}）—— ${ESSAI_JOURS.reservations} 天试用`,
    pack: `${PRIX_PACK}（${PRIX_PACK_TTC}），比分开买便宜百分之十一`,
  },
  questionsFrequentes: "常见问题",
  questions: [
    {
      question: "哪套订座系统不抽成？",
      reponse: `Klarr、Zenchef 和 Guestonline 都是收订阅费，不按人头抽成。TheFork 靠抽成盈利，通过它平台订位的每位客人收一到两欧元。按 2026 年 9 月的记录，三家不抽成的里面 Klarr 最便宜，${PRIX_MODULE.reservations}。`,
    },
    {
      question: "可以同时用 Klarr 和 TheFork 吗？",
      reponse:
        "可以，而且往往正是合理的搭配。TheFork 带来不认识您的客人，收它的抽成；Klarr 不抽成地接下已经在找您的客人。两本订位簿分开。",
    },
    {
      question: "Klarr 会取代我的 Google 商家资料吗？",
      reponse:
        "不会，它负责盯着它、帮您维护它。订座在您自己的页面上完成，把那个链接贴进 Google 商家资料即可。",
    },
    {
      question: "Klarr 有开通费吗？",
      reponse: `没有。没有安装费，没有合约期，在后台一键即可取消。订座模块试用 ${ESSAI_JOURS.reservations} 天，曝光模块试用 ${ESSAI_JOURS.visibilite} 天。`,
    },
  ],
  avantDeChoisir:
    "在做决定之前，先看看自己目前的状况：您的 Google 商家资料究竟展示了什么、评价说了什么，以及当客人问 AI 附近哪里能吃饭时，AI 会怎么回答。免费，不需要银行卡。",
  testerMaPresence: "测试我的线上曝光",
};

export const COMPARATIF: Record<Langue, ClesComparatif> = { fr, en, zh };
