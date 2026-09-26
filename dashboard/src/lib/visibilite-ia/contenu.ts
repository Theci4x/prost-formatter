import {
  ESSAI_JOURS,
  PRIX_MODULE,
  PRIX_MODULE_TTC,
  PRIX_PACK,
  PRIX_PACK_TTC,
} from "@/lib/abonnement/modules";
import { PLAFONDS } from "@/lib/ai-visibility/quota";
import { PRIX_EN, PRIX_ZH } from "@/lib/abonnement/prix-affiches";
import type { Langue } from "@/lib/i18n/langues";

/**
 * La page « comment apparaître dans ChatGPT quand on cherche où manger ».
 *
 * À mi-chemin entre le guide et la page produit, parce que celui qui tape
 * cette question veut d'abord comprendre. Les deux règles de la page
 * « sans commission » valent ici, et une troisième s'y ajoute :
 *
 * - rien qui n'existe pas dans le produit : chaque fonction citée a son
 *   écran, chaque capture vient du restaurant de démonstration ;
 * - pas de témoignage ni de chiffre de résultat qu'on n'a pas ;
 * - **aucune promesse d'apparaître.** Personne ne décide de ce qu'un
 *   assistant répond. On vend la mesure et le plan, pas la place.
 *
 * Et on dit comment on mesure : par l'API de chaque assistant, sans la
 * recherche web en direct de l'application grand public — sauf Perplexity,
 * qui cherche sur le web par construction. Une mesure dont on cache la
 * méthode ne vaut pas mieux qu'une promesse.
 */

export type EtapeIa = {
  capture: string;
  titre: string;
  texte: string;
  alt: string;
};

export type ContenuVisibiliteIa = {
  titreSeo: string;
  descriptionSeo: string;
  fil: string;
  titre: string;
  chapo: string;
  tester: string;
  essayer: string;
  sousBoutons: string;
  changeTitre: string;
  change: string[];
  criteresTitre: string;
  criteresChapo: string;
  criteres: { titre: string; texte: string }[];
  mesurerTitre: string;
  mesurer: string[];
  video: { titre: string; legende: string; description: string };
  klarrTitre: string;
  klarrChapo: string;
  etapes: EtapeIa[];
  fonctionsTitre: string;
  fonctions: string[];
  assistantsTitre: string;
  assistants: string;
  limitesTitre: string;
  limites: { titre: string; texte: string }[];
  tarifsTitre: string;
  tarifs: { nom: string; prix: string; detail: string }[];
  frais: string[];
  questionsTitre: string;
  questions: { question: string; reponse: string }[];
  finTitre: string;
  finTexte: string;
  pourAllerPlusLoin: string;
  liens: { href: string; texte: string }[];
  captureDemo: string;
};

const ASSISTANTS = "ChatGPT, Claude, Gemini, Perplexity et Le Chat (Mistral)";

const fr: ContenuVisibiliteIa = {
  titreSeo: "Apparaître dans ChatGPT quand on cherche un restaurant",
  descriptionSeo:
    "Comment ChatGPT, Gemini ou Perplexity choisissent les restaurants qu'ils recommandent, comment savoir s'ils vous citent, et ce que Klarr mesure pour vous. Démonstration en vidéo.",
  fil: "Visibilité IA",
  titre:
    "Comment apparaître dans ChatGPT, Gemini ou Perplexity quand un client cherche où manger",
  chapo:
    "De plus en plus de clients ne tapent plus « restaurant Lyon 2e » dans Google : ils demandent à un assistant où dîner ce soir. Celui-ci nomme deux ou trois maisons, et s'arrête. Voici comment il choisit, comment savoir s'il vous cite, et ce que Klarr fait pour vous le dire.",
  tester: "Tester gratuitement ce que l'IA dit de mon restaurant",
  essayer: `Essayer Klarr ${ESSAI_JOURS.visibilite} jours`,
  sousBoutons:
    "Le test est gratuit, sans carte bancaire : il pose une question à un assistant et vous montre s'il vous cite, et qui il cite à votre place.",
  changeTitre: "Ce qui a changé",
  change: [
    "Une recherche Google rend une liste : dix résultats, une carte, et une deuxième page pour qui insiste. Un assistant rend une réponse. Il choisit deux ou trois établissements, explique pourquoi, et n'en cite pas d'autres.",
    "Pour un restaurant, la conséquence est simple : on y est, ou on n'existe pas dans cette réponse-là. Et il n'y a aucun classement à consulter pour savoir où l'on en est.",
  ],
  criteresTitre: "Comment un assistant choisit les restaurants qu'il cite",
  criteresChapo:
    "Aucun éditeur ne publie sa recette, et elle change. Mais les assistants ne connaissent de votre restaurant que ce que leurs sources en disent, et ces sources sont connues. Cinq choses comptent, et ce sont celles que vous pouvez travailler.",
  criteres: [
    {
      titre: "Une fiche Google complète et vivante",
      texte:
        "Horaires exacts, catégorie juste, photos récentes, et des avis auxquels vous répondez. C'est la source que presque tous les assistants recoupent.",
    },
    {
      titre: "Des mentions ailleurs que chez vous",
      texte:
        "Presse locale, guides, blogs, annuaires. Un restaurant dont on parle est un restaurant que l'assistant a lu.",
    },
    {
      titre: "Un site lisible par une machine",
      texte:
        "Votre carte, vos horaires, votre type de cuisine et votre adresse en texte, pas seulement dans une photo ou un PDF.",
    },
    {
      titre: "Des données structurées",
      texte:
        "Le balisage qui dit explicitement « ceci est un restaurant, voici sa carte et ses horaires ». Il ne se voit pas à l'écran, mais il se lit.",
    },
    {
      titre: "La même information partout",
      texte:
        "Même nom, même adresse, mêmes horaires sur Google, TripAdvisor, votre site et vos réseaux. Une adresse qui diffère d'une ligne suffit à semer le doute.",
    },
  ],
  mesurerTitre: "Savoir si l'IA vous cite",
  mesurer: [
    "Il n'y a qu'une façon de le savoir : poser la question, lire la réponse, la dater, et recommencer. Vous pouvez le faire vous-même sur votre téléphone. Mais une réponse isolée ne dit pas grand-chose : elle change d'un jour à l'autre, d'un assistant à l'autre, et dépend des mots de la question.",
    "Pour savoir si ce que vous corrigez sert à quelque chose, il faut les mêmes questions, posées aux mêmes assistants, à intervalles réguliers, avec les réponses gardées. C'est exactement ce que fait Klarr.",
  ],
  video: {
    titre: "Klarr Visibilité IA, en moins d'une minute",
    legende:
      "Enregistré sur le restaurant de démonstration de Klarr, La Table d'Anselme, à Lyon. Les écrans sont ceux que vous aurez.",
    description:
      "Le tableau de bord Visibilité IA de La Table d'Anselme : le score et les assistants qui la citent, la réponse complète de chaque assistant à une question, les restaurants cités à sa place, sa part de voix dans le temps, puis le plan d'action qui renvoie vers l'écran où faire la correction.",
  },
  klarrTitre: "Ce que fait Klarr",
  klarrChapo:
    "Quatre écrans, de la question du client à ce qu'il faut corriger. Les annotations en orange montrent où regarder.",
  etapes: [
    {
      capture: "1-score",
      titre: "1. Vous voyez d'un coup d'œil si les assistants vous citent",
      texte:
        "Un score sur 100, calculé sur vos questions et pondéré selon ce que cherche le client : découvrir un quartier, comparer, ou réserver. En dessous, le détail assistant par assistant.",
      alt: "Le score de visibilité IA de La Table d'Anselme, avec le détail par intention et par assistant.",
    },
    {
      capture: "2-reponses",
      titre: "2. Vous lisez la réponse exacte de chaque assistant",
      texte:
        "Pour chaque question que poserait un client, Klarr indique si chaque assistant vous cite et à quel rang, et garde sa réponse complète, datée. Vous relancez l'analyse quand vous voulez.",
      alt: "Une question suivie dans Klarr, avec le résultat de chaque assistant et le classement des restaurants cités.",
    },
    {
      capture: "3-concurrents",
      titre: "3. Vous savez qui est cité à votre place",
      texte:
        "Les restaurants que les assistants nomment sur vos questions, du plus cité au moins cité, et votre part de voix dans le temps face à eux.",
      alt: "Le classement des restaurants cités par les assistants, et la part de voix de La Table d'Anselme dans le temps.",
    },
    {
      capture: "4-plan",
      titre: "4. Vous savez quoi corriger, et où",
      texte:
        "Klarr lit les réponses et écrit un plan de quelques actions, par ordre de priorité. Chacune renvoie vers l'écran de Klarr où faire la correction : votre FAQ, votre vitrine, vos avis.",
      alt: "Le plan d'action écrit par Klarr, avec trois actions et un lien vers l'écran concerné pour chacune.",
    },
  ],
  fonctionsTitre: "Dans le module Visibilité",
  fonctions: [
    "Vos questions, rangées selon l'intention du client : découvrir, comparer, réserver.",
    "Des questions proposées à partir de vos mots-clés et, si votre compte Google est relié, des recherches réellement tapées par ceux qui vous ont trouvé.",
    "La réponse complète de chaque assistant, gardée avec sa date.",
    "Cité ou non, à quel rang, et qui est cité à votre place.",
    "Votre part de voix dans le temps, face aux restaurants cités avec vous.",
    "Un plan d'action écrit à partir des réponses, relié aux écrans de Klarr.",
    "Et dans le même module : le suivi de votre fiche Google et de vos avis, votre carte, vos photos, et un site vitrine avec ses données structurées.",
  ],
  assistantsTitre: "Quels assistants ?",
  assistants: `Klarr peut interroger ${ASSISTANTS}. Il les interroge par leur API : pour tous sauf Perplexity, la réponse vient des connaissances propres de l'assistant, sans la recherche sur le web en direct que fait parfois l'application. Perplexity, lui, cherche sur le web à chaque question. La réponse peut donc différer de celle qu'un client voit sur son téléphone, qui tient compte de sa position et de son historique. Ce que Klarr mesure, c'est ce que l'assistant sait de vous, et son évolution dans le temps.`,
  limitesTitre: "Ce que Klarr ne fait pas",
  limites: [
    {
      titre: "Il ne vous garantit pas d'être cité",
      texte:
        "Personne ne décide de ce qu'un assistant répond, et méfiez-vous de qui le promet. Klarr mesure, explique et vous dit quoi corriger ; il ne vend pas de place dans les réponses.",
    },
    {
      titre: "Il ne voit pas l'écran de vos clients",
      texte:
        "Chaque client reçoit une réponse un peu différente selon l'endroit où il se trouve et ce qu'il a déjà demandé. Klarr mesure une réponse de référence, la même à chaque fois, pour que les comparaisons dans le temps aient un sens.",
    },
    {
      titre: "Il ne donne pas de résultat du jour au lendemain",
      texte:
        "Les assistants mettent à jour leurs connaissances à leur rythme. Une correction sur votre fiche ou votre site peut mettre des semaines à se refléter. D'où l'intérêt de garder les réponses datées.",
    },
  ],
  tarifsTitre: "Tarifs",
  tarifs: [
    {
      nom: "Votre visibilité",
      prix: PRIX_MODULE.visibilite,
      detail: `${PRIX_MODULE_TTC.visibilite} · ${ESSAI_JOURS.visibilite} jours d'essai`,
    },
    {
      nom: "Visibilité + réservations",
      prix: PRIX_PACK,
      detail: `${PRIX_PACK_TTC} · onze pour cent de moins que séparément`,
    },
  ],
  frais: [
    "Les analyses sont comprises dans l'abonnement, sans supplément par question ni par assistant.",
    `Un plafond de ${PLAFONDS.analyse} analyses par jour et par établissement évite les accidents ; un usage normal en est très loin.`,
    "Sans engagement : vous résiliez en un clic depuis le tableau de bord.",
  ],
  questionsTitre: "Questions fréquentes",
  questions: [
    {
      question: "Peut-on payer pour apparaître dans ChatGPT ?",
      reponse:
        "Klarr ne vend aucune place dans les réponses des assistants, et ne connaît pas de moyen sérieux d'en acheter une pour un restaurant. Ce qui compte, ce sont les sources que l'assistant lit : votre fiche Google, vos avis, les mentions de votre restaurant, votre site.",
    },
    {
      question: "Quelles questions faut-il suivre ?",
      reponse:
        "Celles que posent vos clients, avec leurs mots : « où manger une cuisine du marché à Lyon », « un restaurant avec salon privé pour douze personnes ». Klarr vous en propose à partir de vos mots-clés, et vous pouvez écrire les vôtres.",
    },
    {
      question: "Combien de temps avant de voir un effet ?",
      reponse:
        "Personne ne peut le dire à l'avance. Les assistants mettent à jour leurs connaissances à leur rythme, et une correction peut mettre des semaines à apparaître dans leurs réponses. C'est pour ça que Klarr garde chaque réponse avec sa date : vous voyez quand quelque chose bouge.",
    },
    {
      question: "Pourquoi ma réponse est-elle différente sur mon téléphone ?",
      reponse:
        "L'application tient compte de l'endroit où vous êtes, de votre historique, et parfois d'une recherche sur le web. Klarr interroge chaque assistant par son API, sans ces éléments, pour obtenir une réponse comparable d'une fois à l'autre.",
    },
    {
      question: "Faut-il prendre aussi le module Réservations ?",
      reponse: `Non, les deux modules s'achètent séparément. La visibilité seule coûte ${PRIX_MODULE.visibilite} (${PRIX_MODULE_TTC.visibilite}). Les deux ensemble coûtent ${PRIX_PACK}.`,
    },
    {
      question: "Le test gratuit, c'est quoi exactement ?",
      reponse:
        "Vous donnez votre prénom, votre e-mail, le nom de votre restaurant et sa ville, puis vous choisissez votre établissement. Le test analyse votre fiche Google, votre site, et pose une question à un assistant pour voir s'il vous cite. Il est gratuit et ne demande pas de carte bancaire.",
    },
  ],
  finTitre: "Savoir ce que l'IA dit de vous, dès aujourd'hui",
  finTexte: `Commencez par le test gratuit. Si vous voulez suivre vos questions dans le temps, le module Visibilité s'essaie ${ESSAI_JOURS.visibilite} jours.`,
  pourAllerPlusLoin: "Pour aller plus loin",
  liens: [
    {
      href: "/blog/pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
      texte: "Pourquoi ChatGPT ne parle jamais de votre restaurant",
    },
    {
      href: "/blog/fiche-google-restaurant-ce-qui-compte-vraiment",
      texte: "Votre fiche Google, ligne par ligne",
    },
    {
      href: "/comparatif-logiciels-reservation-restaurant",
      texte: "Comparer Klarr, TheFork, Zenchef et Guestonline",
    },
  ],
  captureDemo: "Capture du restaurant de démonstration",
};

const en: ContenuVisibiliteIa = {
  titreSeo: "Show up in ChatGPT when people look for a restaurant",
  descriptionSeo:
    "How ChatGPT, Gemini or Perplexity choose the restaurants they recommend, how to know whether they mention you, and what Klarr measures for you. Video demo.",
  fil: "AI visibility",
  titre:
    "How to show up in ChatGPT, Gemini or Perplexity when a guest asks where to eat",
  chapo:
    "More and more guests no longer type “restaurant near me” into Google: they ask an assistant where to have dinner tonight. It names two or three places, and stops. Here is how it chooses, how to know whether it mentions you, and what Klarr does to tell you.",
  tester: "Test for free what AI says about my restaurant",
  essayer: `Try Klarr for ${ESSAI_JOURS.visibilite} days`,
  sousBoutons:
    "The test is free, no card needed: it asks an assistant one question and shows whether it mentions you, and who it names instead.",
  changeTitre: "What has changed",
  change: [
    "A Google search returns a list: ten results, a map, and a second page for anyone who insists. An assistant returns an answer. It picks two or three places, explains why, and names no others.",
    "For a restaurant, the consequence is simple: you are in that answer, or you do not exist in it. And there is no ranking to look up to know where you stand.",
  ],
  criteresTitre: "How an assistant chooses the restaurants it names",
  criteresChapo:
    "No company publishes its recipe, and it changes. But assistants only know about your restaurant what their sources say, and those sources are known. Five things matter, and they are the ones you can work on.",
  criteres: [
    {
      titre: "A complete, living Google listing",
      texte:
        "Accurate opening hours, the right category, recent photos, and reviews you reply to. It is the source almost every assistant cross-checks.",
    },
    {
      titre: "Mentions beyond your own site",
      texte:
        "Local press, guides, blogs, directories. A restaurant people write about is a restaurant the assistant has read about.",
    },
    {
      titre: "A site a machine can read",
      texte:
        "Your menu, hours, cuisine and address as text, not only in a photo or a PDF.",
    },
    {
      titre: "Structured data",
      texte:
        "The markup that says plainly “this is a restaurant, here are its menu and hours”. It does not show on screen, but it gets read.",
    },
    {
      titre: "The same information everywhere",
      texte:
        "Same name, same address, same hours on Google, TripAdvisor, your site and your social pages. An address that differs by one line is enough to sow doubt.",
    },
  ],
  mesurerTitre: "Knowing whether AI mentions you",
  mesurer: [
    "There is only one way to find out: ask the question, read the answer, date it, and do it again. You can do it yourself on your phone. But a single answer says little: it changes from day to day, from one assistant to another, and depends on the wording of the question.",
    "To know whether what you fix makes a difference, you need the same questions, asked to the same assistants, at regular intervals, with the answers kept. That is exactly what Klarr does.",
  ],
  video: {
    titre: "Klarr AI visibility, in under a minute",
    legende:
      "Recorded on Klarr's demo restaurant, La Table d'Anselme, in Lyon. These are the screens you will get.",
    description:
      "La Table d'Anselme's AI visibility dashboard: the score and the assistants that mention it, each assistant's full answer to a question, the restaurants named instead, its share of voice over time, then the action plan that leads to the screen where the fix is made.",
  },
  klarrTitre: "What Klarr does",
  klarrChapo:
    "Four screens, from the guest's question to what needs fixing. The orange notes show where to look.",
  etapes: [
    {
      capture: "1-score",
      titre: "1. You see at a glance whether assistants mention you",
      texte:
        "A score out of 100, worked out from your questions and weighted by what the guest is after: discovering an area, comparing, or booking. Below, the breakdown assistant by assistant.",
      alt: "La Table d'Anselme's AI visibility score, broken down by intent and by assistant.",
    },
    {
      capture: "2-reponses",
      titre: "2. You read each assistant's exact answer",
      texte:
        "For each question a guest would ask, Klarr shows whether each assistant mentions you and in what position, and keeps its full, dated answer. You run the analysis again whenever you like.",
      alt: "A tracked question in Klarr, with each assistant's result and the ranking of the restaurants named.",
    },
    {
      capture: "3-concurrents",
      titre: "3. You know who is named instead of you",
      texte:
        "The restaurants the assistants name on your questions, from most to least mentioned, and your share of voice against them over time.",
      alt: "The ranking of restaurants named by the assistants, and La Table d'Anselme's share of voice over time.",
    },
    {
      capture: "4-plan",
      titre: "4. You know what to fix, and where",
      texte:
        "Klarr reads the answers and writes a short plan, in order of priority. Each action links to the Klarr screen where the fix is made: your FAQ, your showcase site, your reviews.",
      alt: "The action plan written by Klarr, with three actions and a link to the relevant screen for each.",
    },
  ],
  fonctionsTitre: "In the Visibility module",
  fonctions: [
    "Your questions, sorted by the guest's intent: discover, compare, book.",
    "Questions suggested from your keywords and, if your Google account is linked, from searches actually typed by those who found you.",
    "Each assistant's full answer, kept with its date.",
    "Mentioned or not, in what position, and who is named instead.",
    "Your share of voice over time, against the restaurants named alongside you.",
    "An action plan written from the answers, linked to Klarr's screens.",
    "And in the same module: tracking of your Google listing and reviews, your menu, your photos, and a showcase site with its structured data.",
  ],
  assistantsTitre: "Which assistants?",
  assistants: `Klarr can ask ${ASSISTANTS.replace(" et ", " and ")}. It asks them through their API: for all but Perplexity, the answer comes from the assistant's own knowledge, without the live web search the app sometimes does. Perplexity searches the web for every question. The answer may therefore differ from what a guest sees on their phone, which takes their location and history into account. What Klarr measures is what the assistant knows about you, and how that changes over time.`,
  limitesTitre: "What Klarr does not do",
  limites: [
    {
      titre: "It does not guarantee you will be mentioned",
      texte:
        "Nobody decides what an assistant answers, and be wary of anyone who promises it. Klarr measures, explains and tells you what to fix; it does not sell a place in the answers.",
    },
    {
      titre: "It does not see your guests' screens",
      texte:
        "Each guest gets a slightly different answer depending on where they are and what they have asked before. Klarr measures a reference answer, the same each time, so that comparisons over time mean something.",
    },
    {
      titre: "It does not give overnight results",
      texte:
        "Assistants update what they know at their own pace. A fix on your listing or site can take weeks to show. That is why dated answers matter.",
    },
  ],
  tarifsTitre: "Pricing",
  tarifs: [
    {
      nom: "Your visibility",
      prix: `${PRIX_EN.visibilite} excl. VAT / month`,
      detail: `${PRIX_EN.visibiliteTTC} incl. VAT · ${ESSAI_JOURS.visibilite}-day trial`,
    },
    {
      nom: "Visibility + bookings",
      prix: `${PRIX_EN.pack} excl. VAT / month`,
      detail: `${PRIX_EN.packTTC} incl. VAT · eleven per cent less than separately`,
    },
  ],
  frais: [
    "Analyses are included in the subscription, with no extra charge per question or per assistant.",
    `A cap of ${PLAFONDS.analyse} analyses per day per restaurant prevents accidents; normal use is nowhere near it.`,
    "No contract: you cancel in one click from the dashboard.",
  ],
  questionsTitre: "Frequently asked questions",
  questions: [
    {
      question: "Can you pay to appear in ChatGPT?",
      reponse:
        "Klarr sells no place in assistants' answers, and knows of no serious way for a restaurant to buy one. What counts are the sources the assistant reads: your Google listing, your reviews, mentions of your restaurant, your site.",
    },
    {
      question: "Which questions should I track?",
      reponse:
        "The ones your guests ask, in their words: “where to eat market cuisine in Lyon”, “a restaurant with a private room for twelve”. Klarr suggests some from your keywords, and you can write your own.",
    },
    {
      question: "How long before I see an effect?",
      reponse:
        "Nobody can say in advance. Assistants update what they know at their own pace, and a fix can take weeks to appear in their answers. That is why Klarr keeps each answer with its date: you see when something moves.",
    },
    {
      question: "Why is the answer different on my phone?",
      reponse:
        "The app takes into account where you are, your history, and sometimes a web search. Klarr asks each assistant through its API, without those factors, to get an answer that can be compared from one time to the next.",
    },
    {
      question: "Do I also need the Bookings module?",
      reponse: `No, the two modules are sold separately. Visibility alone costs ${PRIX_EN.visibilite} excl. VAT a month (${PRIX_EN.visibiliteTTC} incl. VAT). Both together cost ${PRIX_EN.pack} excl. VAT a month.`,
    },
    {
      question: "What exactly is the free test?",
      reponse:
        "You give your first name, your e-mail, your restaurant's name and town, then pick your restaurant. The test analyses your Google listing and your site, and asks an assistant one question to see whether it mentions you. It is free and needs no card.",
    },
  ],
  finTitre: "Know what AI says about you, starting today",
  finTexte: `Start with the free test. If you want to track your questions over time, the Visibility module comes with a ${ESSAI_JOURS.visibilite}-day trial.`,
  pourAllerPlusLoin: "Further reading",
  liens: [
    {
      href: "/blog/en/pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
      texte: "Why ChatGPT never talks about your restaurant",
    },
    {
      href: "/blog/en/fiche-google-restaurant-ce-qui-compte-vraiment",
      texte: "Your Google listing, line by line",
    },
    {
      href: "/comparatif-logiciels-reservation-restaurant",
      texte: "Compare Klarr, TheFork, Zenchef and Guestonline",
    },
  ],
  captureDemo: "Screenshot of the demo restaurant",
};

const zh: ContenuVisibiliteIa = {
  titreSeo: "让顾客在 ChatGPT 里找餐厅时看到您",
  descriptionSeo:
    "ChatGPT、Gemini、Perplexity 如何挑选它们推荐的餐厅，如何知道它们有没有提到您，以及 Klarr 为您衡量什么。附视频演示。",
  fil: "AI 曝光度",
  titre: "顾客问 ChatGPT、Gemini 或 Perplexity 去哪吃饭时，如何让它们提到您",
  chapo:
    "越来越多的顾客不再在 Google 上搜索「附近的餐厅」，而是直接问 AI 助手今晚去哪吃。助手只会说出两三家店，然后就结束了。下面说明它如何选择、如何知道它有没有提到您，以及 Klarr 如何告诉您。",
  tester: "免费测试 AI 如何评价我的餐厅",
  essayer: `免费试用 Klarr ${ESSAI_JOURS.visibilite} 天`,
  sousBoutons:
    "测试免费，无需银行卡：它会向一个 AI 助手提一个问题，告诉您它有没有提到您，以及它提到了哪些别家。",
  changeTitre: "变化在哪里",
  change: [
    "Google 搜索给出的是一个列表：十个结果、一张地图，还有第二页。AI 助手给出的是一个答案：它挑出两三家，说明理由，其他的一概不提。",
    "对餐厅来说，结果很简单：要么在答案里，要么在这个答案里根本不存在。而且没有任何排名可以查看自己的位置。",
  ],
  criteresTitre: "AI 助手如何挑选它提到的餐厅",
  criteresChapo:
    "没有哪家公司公开它的规则，而且规则一直在变。但助手对您餐厅的了解，只来自它读到的资料，而这些资料是已知的。有五件事最重要，也正是您可以着手改进的。",
  criteres: [
    {
      titre: "完整且活跃的 Google 商家资料",
      texte:
        "准确的营业时间、正确的类别、最近的照片，以及您有回复的评价。几乎所有助手都会参考这个来源。",
    },
    {
      titre: "在别处被提到",
      texte:
        "本地媒体、美食指南、博客、名录。被人写到的餐厅，才是助手读到过的餐厅。",
    },
    {
      titre: "机器能读懂的网站",
      texte:
        "菜单、营业时间、菜系和地址以文字呈现，而不只是放在照片或 PDF 里。",
    },
    {
      titre: "结构化数据",
      texte:
        "明确告诉机器「这是一家餐厅，这是它的菜单和营业时间」的标记。屏幕上看不到，但会被读取。",
    },
    {
      titre: "各处信息一致",
      texte:
        "在 Google、TripAdvisor、您的网站和社交媒体上使用相同的名称、地址和营业时间。地址差一行，就足以让助手产生怀疑。",
    },
  ],
  mesurerTitre: "如何知道 AI 有没有提到您",
  mesurer: [
    "只有一种办法：提出问题、读答案、记下日期，然后再问一次。您可以自己在手机上做。但单个答案说明不了太多：它每天都在变，每个助手都不同，还取决于问题的措辞。",
    "要知道您的改进有没有用，就需要把同样的问题，定期问同样的助手，并把答案保存下来。这正是 Klarr 做的事。",
  ],
  video: {
    titre: "Klarr AI 曝光度，不到一分钟看完",
    legende:
      "在 Klarr 的演示餐厅 La Table d'Anselme（里昂）上录制。画面就是您将使用的界面。",
    description:
      "La Table d'Anselme 的 AI 曝光度面板：得分和提到它的助手、每个助手对一个问题的完整回答、被提到的其他餐厅、它在一段时间内的声量占比，以及指向修改页面的行动计划。",
  },
  klarrTitre: "Klarr 能做什么",
  klarrChapo:
    "四个画面，从顾客的问题到需要修改的地方。橙色标注指出该看的位置。",
  etapes: [
    {
      capture: "1-score",
      titre: "1. 一眼看出助手有没有提到您",
      texte:
        "一个满分 100 的得分，根据您的问题计算，并按顾客的意图加权：了解一个街区、比较，或订位。下方是每个助手的明细。",
      alt: "La Table d'Anselme 的 AI 曝光度得分，按意图和助手细分。",
    },
    {
      capture: "2-reponses",
      titre: "2. 读到每个助手的原话",
      texte:
        "对于顾客可能提出的每个问题，Klarr 显示每个助手有没有提到您、排在第几，并保存带日期的完整回答。您可以随时重新分析。",
      alt: "Klarr 中跟踪的一个问题，显示每个助手的结果和被提到餐厅的排名。",
    },
    {
      capture: "3-concurrents",
      titre: "3. 知道谁被提到而不是您",
      texte:
        "助手在您的问题上提到的餐厅，按提及次数排列，以及您相对于它们的声量占比变化。",
      alt: "助手提到的餐厅排名，以及 La Table d'Anselme 的声量占比变化。",
    },
    {
      capture: "4-plan",
      titre: "4. 知道该改什么、在哪里改",
      texte:
        "Klarr 阅读这些回答，写出几条按优先级排列的行动建议。每一条都链接到 Klarr 中对应的修改页面：您的常见问题、展示网站、评价。",
      alt: "Klarr 写出的行动计划，包含三条建议，每条都附有对应页面的链接。",
    },
  ],
  fonctionsTitre: "曝光度模块包含",
  fonctions: [
    "您的问题，按顾客意图分类：了解、比较、订位。",
    "根据您的关键词推荐问题；如果关联了 Google 账户，还会参考找到您的人真实搜索过的词。",
    "每个助手的完整回答，带日期保存。",
    "有没有被提到、排在第几，以及谁被提到而不是您。",
    "您与同时被提到的餐厅相比的声量占比变化。",
    "根据回答写出的行动计划，并链接到 Klarr 的相应页面。",
    "同一模块还包括：Google 商家资料和评价跟踪、菜单、照片，以及带结构化数据的展示网站。",
  ],
  assistantsTitre: "支持哪些助手？",
  assistants:
    "Klarr 可以询问 ChatGPT、Claude、Gemini、Perplexity 和 Le Chat（Mistral）。它通过各助手的 API 提问：除 Perplexity 外，回答来自助手自身的知识，不包括应用有时会做的实时网络搜索。Perplexity 则每个问题都会上网搜索。因此，回答可能与顾客在手机上看到的不同，后者会考虑其位置和历史记录。Klarr 衡量的是助手对您的了解，以及它随时间的变化。",
  limitesTitre: "Klarr 不做什么",
  limites: [
    {
      titre: "不保证您一定会被提到",
      texte:
        "没有人能决定助手怎么回答，对承诺这一点的人要保持警惕。Klarr 负责衡量、解释并告诉您该改什么；它不出售回答中的位置。",
    },
    {
      titre: "看不到顾客的屏幕",
      texte:
        "每位顾客得到的回答会因所在位置和提问历史而略有不同。Klarr 每次衡量的是同一个参考回答，这样随时间的比较才有意义。",
    },
    {
      titre: "不会一夜见效",
      texte:
        "助手按自己的节奏更新知识。您在商家资料或网站上的修改，可能要几周后才会体现出来。这正是保存带日期回答的意义。",
    },
  ],
  tarifsTitre: "价格",
  tarifs: [
    {
      nom: "您的曝光度",
      prix: `每月 ${PRIX_ZH.visibilite}（不含税）`,
      detail: `含税 ${PRIX_ZH.visibiliteTTC} · ${ESSAI_JOURS.visibilite} 天试用`,
    },
    {
      nom: "曝光度 + 订位",
      prix: `每月 ${PRIX_ZH.pack}（不含税）`,
      detail: `含税 ${PRIX_ZH.packTTC} · 比分开购买便宜百分之十一`,
    },
  ],
  frais: [
    "分析费用已包含在订阅中，不按问题或助手额外收费。",
    `每家餐厅每天最多 ${PLAFONDS.analyse} 次分析，用于防止意外；正常使用远远达不到。`,
    "无需签约：在后台一键取消。",
  ],
  questionsTitre: "常见问题",
  questions: [
    {
      question: "可以花钱出现在 ChatGPT 里吗？",
      reponse:
        "Klarr 不出售助手回答中的任何位置，也不知道餐厅有什么可靠的方法能买到。重要的是助手读取的资料：您的 Google 商家资料、评价、别处对您的提及，以及您的网站。",
    },
    {
      question: "应该跟踪哪些问题？",
      reponse:
        "就是顾客会问的问题，用他们的说法：「里昂哪里能吃到市场时令菜」「有十二人包间的餐厅」。Klarr 会根据您的关键词推荐，您也可以自己写。",
    },
    {
      question: "多久能看到效果？",
      reponse:
        "没有人能提前知道。助手按自己的节奏更新知识，一处修改可能要几周才会出现在回答里。所以 Klarr 会带日期保存每个回答：您能看到什么时候发生了变化。",
    },
    {
      question: "为什么我手机上看到的回答不一样？",
      reponse:
        "应用会考虑您的位置、历史记录，有时还会上网搜索。Klarr 通过 API 提问，不包含这些因素，这样每次得到的回答才能互相比较。",
    },
    {
      question: "还需要订位模块吗？",
      reponse: `不需要，两个模块分开购买。单独的曝光度模块每月 ${PRIX_ZH.visibilite}（不含税），含税 ${PRIX_ZH.visibiliteTTC}。两个一起每月 ${PRIX_ZH.pack}（不含税）。`,
    },
    {
      question: "免费测试具体是什么？",
      reponse:
        "您提供名字、电子邮箱、餐厅名称和所在城市，然后选择您的餐厅。测试会分析您的 Google 商家资料和网站，并向一个助手提一个问题，看它有没有提到您。免费，无需银行卡。",
    },
  ],
  finTitre: "今天就了解 AI 如何评价您",
  finTexte: `先做免费测试。如果想长期跟踪您的问题，曝光度模块可以试用 ${ESSAI_JOURS.visibilite} 天。`,
  pourAllerPlusLoin: "延伸阅读",
  liens: [
    {
      href: "/blog/zh/pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
      texte: "为什么 ChatGPT 从不提到您的餐厅",
    },
    {
      href: "/blog/zh/fiche-google-restaurant-ce-qui-compte-vraiment",
      texte: "逐项解读您的 Google 商家资料",
    },
    {
      href: "/comparatif-logiciels-reservation-restaurant",
      texte: "比较 Klarr、TheFork、Zenchef 和 Guestonline",
    },
  ],
  captureDemo: "演示餐厅截图",
};

export const VISIBILITE_IA: Record<Langue, ContenuVisibiliteIa> = {
  fr,
  en,
  zh,
};
