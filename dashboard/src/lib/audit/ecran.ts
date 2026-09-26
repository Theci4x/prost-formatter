import type { Trad } from "@/lib/i18n/outils";

/**
 * La page qui présente l'audit de visibilité, en trois langues.
 *
 * Les trois piliers sont décrits d'après ce que `lib/audit/scoring.ts`
 * mesure vraiment. Écrire ici une liste plus flatteuse que l'algorithme
 * serait le plus court chemin vers un prospect déçu à la lecture de son
 * rapport — et la traduction ne change rien à cette règle : on traduit
 * ce que le code fait, pas ce qu'on aimerait qu'il fasse.
 *
 * Le nom du module payant n'est pas traduit. Il vient de `modules.ts`,
 * c'est celui qui figurera sur la facture, et un restaurateur qui écrit
 * pour poser une question doit pouvoir le nommer comme nous.
 */

export type Pilier = {
  id: "fiche" | "avis" | "ia";
  titre: Trad;
  quoi: Trad;
  signaux: Trad[];
  /** Le slug français ; l'adresse se résout dans la langue du lecteur. */
  article: { slug: string; titre: Trad };
};

export const PILIERS: Pilier[] = [
  {
    id: "fiche",
    titre: { fr: "La fiche", en: "The listing", zh: "商家资料" },
    quoi: {
      fr: "Ce que Google affiche de vous à quelqu'un qui cherche un restaurant dans votre rue.",
      en: "What Google shows of you to someone looking for a restaurant in your street.",
      zh: "当有人在您那条街上找餐厅时，Google 会把您呈现成什么样。",
    },
    signaux: [
      {
        fr: "Le téléphone et le site sont-ils renseignés",
        en: "Are the phone number and website filled in",
        zh: "电话和网站有没有填",
      },
      {
        fr: "Les horaires sont-ils publiés",
        en: "Are the opening hours published",
        zh: "营业时间有没有公布",
      },
      {
        fr: "Combien de photos — en dessous d'une quinzaine, une fiche paraît vide",
        en: "How many photos — below fifteen or so, a listing looks empty",
        zh: "有多少张照片——少于十五张，资料看上去就是空的",
      },
      {
        fr: "La note, et le nombre d'avis qui la porte",
        en: "The rating, and how many reviews are holding it up",
        zh: "评分，以及支撑这个评分的评价数量",
      },
    ],
    article: {
      slug: "pourquoi-je-sors-derriere-mon-voisin-google-maps",
      titre: {
        fr: "Pourquoi vous sortez derrière le restaurant d'à côté",
        en: "Why you rank below the restaurant next door",
        zh: "为什么您排在隔壁那家餐厅后面",
      },
    },
  },
  {
    id: "avis",
    titre: { fr: "Les avis", en: "The reviews", zh: "顾客评价" },
    quoi: {
      fr: "Pas seulement la note : le volume, et surtout la fraîcheur.",
      en: "Not just the rating: the volume, and above all how recent they are.",
      zh: "不只看分数：还要看数量，尤其是新鲜程度。",
    },
    signaux: [
      { fr: "La note moyenne", en: "The average rating", zh: "平均分" },
      {
        fr: "Le nombre d'avis, jusqu'à deux cents",
        en: "The number of reviews, counted up to two hundred",
        zh: "评价数量，最多计到两百条",
      },
      {
        fr: "La part de vos avis qui datent de moins de six mois",
        en: "The share of your reviews less than six months old",
        zh: "半年以内的评价占多大比例",
      },
      {
        fr: "Une bonne note vieille de trois ans pèse moins qu'une note correcte alimentée chaque mois",
        en: "A great rating three years old counts for less than a decent one fed every month",
        zh: "三年前的高分，不如一个每月都有新评价的中等分数管用",
      },
    ],
    article: {
      slug: "avis-google-restaurant-ce-qui-est-interdit",
      titre: {
        fr: "Les avis Google : ce que vous n'avez pas le droit de faire",
        en: "Google reviews: what you are not allowed to do",
        zh: "Google 评价：哪些事您没有权利做",
      },
    },
  },
  {
    id: "ia",
    titre: { fr: "Les IA", en: "The AIs", zh: "AI 助手" },
    quoi: {
      fr: "Ce qu'un assistant répond quand on lui demande où manger chez vous.",
      en: "What an assistant answers when asked where to eat in your area.",
      zh: "当有人问 AI「您这一带去哪儿吃」时，它会怎么回答。",
    },
    signaux: [
      {
        fr: "Votre site est-il joignable",
        en: "Is your website reachable",
        zh: "您的网站能不能打开",
      },
      {
        fr: "Porte-t-il un balisage que les machines lisent",
        en: "Does it carry markup that machines can read",
        zh: "网页里有没有机器能读的结构化标记",
      },
      {
        fr: "Ce balisage dit-il « restaurant », ou seulement « site web »",
        en: "Does that markup say “restaurant”, or only “website”",
        zh: "这些标记写的是「餐厅」，还是只写了「网站」",
      },
      {
        fr: "Vos réseaux sont-ils déclarés comme étant les vôtres",
        en: "Are your social accounts declared as being yours",
        zh: "您的社交账号有没有被声明为您本人的",
      },
    ],
    article: {
      slug: "pourquoi-chatgpt-ne-parle-pas-de-votre-restaurant",
      titre: {
        fr: "Pourquoi ChatGPT ne parle jamais de votre restaurant",
        en: "Why ChatGPT never mentions your restaurant",
        zh: "为什么 ChatGPT 从来不提您的餐厅",
      },
    },
  },
];

export const ECRAN = {
  surtitre: { fr: "Gratuit", en: "Free", zh: "免费" },
  titre: {
    fr: "Ce que Google dit de votre restaurant aujourd'hui",
    en: "What Google says about your restaurant today",
    zh: "Google 现在是怎么描述您的餐厅的",
  },
  chapo: {
    fr: "Donnez le nom et l'adresse. On regarde votre fiche réelle — pas un modèle — et on vous rend la liste de ce qui manque, classée par ce qui rapporte le plus. Sans compte à créer.",
    en: "Give us the name and the address. We look at your actual listing — not a template — and hand you the list of what is missing, ranked by what pays off most. No account needed.",
    zh: "填店名和地址。我们查的是您真实的商家资料，不是套模板，然后把缺什么列给您，按回报高低排序。无需注册。",
  },
  bouton: {
    fr: "Lancer l'audit",
    en: "Run the audit",
    zh: "开始检测",
  },
  regardeTitre: {
    fr: "Ce qu'on regarde",
    en: "What we look at",
    zh: "我们查什么",
  },
  frontiereTitre: {
    fr: "Ce qui est gratuit, et ce qui ne l'est pas",
    en: "What is free, and what is not",
    zh: "哪些免费，哪些不免费",
  },
  gratuitFort: {
    fr: "Le constat est gratuit",
    en: "The diagnosis is free",
    zh: "这份诊断是免费的",
  },
  gratuitSuite: {
    fr: ", et il l'est vraiment : vous repartez avec la liste, vous la traitez vous-même si vous voulez, et nous n'avons rien à y redire. C'est du travail de fiche, pas de la magie — quelqu'un de méthodique y arrive.",
    en: ", and genuinely so: you leave with the list, you work through it yourself if you want, and we have nothing to say about it. It is listing work, not magic — anyone methodical gets there.",
    zh: "，而且是真的免费：清单您带走，想自己动手就自己动手，我们没有二话。这是耐心整理资料的活，不是什么魔法——有条理的人自己也能做。",
  },
  payantFort: {
    fr: "Ce qui se paie, c'est de ne plus avoir à y penser.",
    en: "What you pay for is no longer having to think about it.",
    zh: "花钱买的，是从此不用再操这份心。",
  },
  /** `{module}` et `{prix}` viennent de `modules.ts`, jamais recopiés. */
  payantTexte: {
    fr: "Le module « {module} », à {prix}, tient la fiche à jour, centralise les avis et vous propose des réponses, suit vos mots-clés et regarde ce que les IA racontent de vous. La différence entre les deux n'est pas le savoir : c'est les heures du mardi après-midi.",
    en: "The « {module} » module, at {prix}, keeps the listing current, gathers the reviews in one place and drafts replies for you, tracks your keywords and watches what the AIs say about you. The difference between the two is not knowledge: it is Tuesday afternoons.",
    zh: "「{module}」模块，{prix}，帮您把资料保持最新，把评价集中到一处并替您起草回复，跟踪关键词，盯着 AI 怎么谈论您。两者的差别不在于懂不懂，而在于周二下午那几个小时。",
  },
  gesteTexte: {
    fr: "Et le geste qui rapporte le plus ne dépend de personne : mettez l'adresse de votre page de réservation dans le champ prévu de votre fiche Google. Cinq minutes, une fois, gratuit, et sans nous.",
    en: "And the single highest-yielding move depends on nobody: put your booking page's address in the field your Google listing provides for it. Five minutes, once, free, and without us.",
    zh: "而回报最高的那一步，不求任何人：把您订位页的网址填进 Google 商家资料里对应的那一栏。五分钟，一次性，免费，而且用不着我们。",
  },
  ouvertureTitre: {
    fr: "Vous n'avez pas encore ouvert ?",
    en: "Not open yet?",
    zh: "还没开业？",
  },
  ouvertureTexte: {
    fr: "La fiche Google se crée avant l'ouverture : la vérification passe souvent par un courrier postal, et l'attendre le jour J revient à ouvrir sans exister sur la carte.",
    en: "A Google listing is created before opening: verification often goes through a posted letter, and waiting for it on the day means opening without existing on the map.",
    zh: "Google 商家资料要在开业前就建好：验证往往靠寄信，等到开业当天才办，等于开门时地图上还没有您。",
  },
  ouvertureLien: {
    fr: "Le calendrier, à rebours depuis votre date d'ouverture →",
    en: "The timeline, counting back from your opening date →",
    zh: "从您的开业日期倒推的时间表 →",
  },
} satisfies Record<string, Trad>;
