import type { Langue } from "@/lib/i18n/langues";

/**
 * Les textes des outils gratuits, en trois langues.
 *
 * **Pourquoi ces pages-là doivent être traduites plus que les autres.**
 * Un restaurateur français perdu dans le droit français finit par
 * trouver : il connaît les mots, il sait qui appeler, il a un comptable.
 * Celui qui arrive de Shanghai ou de Londres ne sait même pas que
 * « destination du bail » et « destination urbanistique » sont deux
 * choses différentes, ni qu'une assemblée générale de copropriété peut
 * lui refuser un conduit. C'est exactement le lecteur pour qui ces
 * outils ont le plus de valeur — et on les lui avait écrits en français.
 *
 * **Le principe de traduction, et il n'est pas neutre.** Les termes
 * administratifs français restent en français, suivis de leur sens entre
 * parenthèses : « déspécialisation », « règlement sanitaire
 * départemental », « assemblée générale ». Traduire « déspécialisation »
 * en anglais ou en chinois donne un mot que personne ne prononcera au
 * téléphone et qu'aucun syndic ne reconnaîtra. Le lecteur a besoin de
 * comprendre ET de pouvoir répéter le mot exact à son interlocuteur.
 *
 * Toutes les langues d'un même texte vivent sur la même ligne. C'est ce
 * qui permet de relire une traduction à côté de son original plutôt que
 * de sauter entre trois fichiers — et cette relecture est due, puisque
 * ni l'anglais ni le chinois ici n'ont encore été vus par quelqu'un dont
 * c'est la langue.
 */

export type Trad = Record<Langue, string>;

export function t(trad: Trad, langue: Langue): string {
  return trad[langue] ?? trad.fr;
}

/** L'en-tête de chaque outil. */
export const ENTETE = {
  retour: {
    fr: "Retour à l'accueil",
    en: "Back to home",
    zh: "返回首页",
  },
} satisfies Record<string, Trad>;

/** Le pied de page qui enchaîne les outils. */
export const SUITE = {
  surtitre: {
    fr: "L'outil suivant",
    en: "Next tool",
    zh: "下一个工具",
  },
  continuer: { fr: "Continuer →", en: "Continue →", zh: "继续 →" },
  revenir: {
    fr: "← Revenir aux outils",
    en: "← Back to the tools",
    zh: "← 返回工具列表",
  },
  fini: {
    fr: "Vous avez fait le tour des quatre. Le reste du parcours est dans le journal, démarche par démarche.",
    en: "You have been through all four. The rest of the journey is in the journal, step by step.",
    zh: "四个工具您都看完了。其余的开业流程在我们的专栏里，一步一步写明。",
  },
  diagnostic: {
    titre: {
      fr: "Le diagnostic du local",
      en: "The site check",
      zh: "选址诊断",
    },
    pourquoi: {
      fr: "Les cinq points qui empêchent d'ouvrir, avant de signer.",
      en: "The five points that stop a restaurant opening — before you sign.",
      zh: "签约前必须查清的五个致命点。",
    },
  },
  calendrier: {
    titre: {
      fr: "Le calendrier d'ouverture",
      en: "The opening timeline",
      zh: "开业时间表",
    },
    pourquoi: {
      fr: "Quand commencer quoi, à rebours depuis votre date.",
      en: "What to start when, counting back from your opening date.",
      zh: "从您的开业日期倒推，每件事该何时着手。",
    },
  },
  audit: {
    titre: {
      fr: "L'audit de votre fiche Google",
      en: "Your Google listing audit",
      zh: "Google 商家资料检测",
    },
    pourquoi: {
      fr: "Ce que Google, les avis et les IA disent de vous.",
      en: "What Google, the reviews and the AIs say about you.",
      zh: "Google、点评和 AI 如今怎么谈论您。",
    },
  },
  calculateur: {
    titre: {
      fr: "Le calculateur de commissions",
      en: "The commission calculator",
      zh: "抽成计算器",
    },
    pourquoi: {
      fr: "Ce que la plateforme vous coûte, avec vos chiffres.",
      en: "What the platform costs you, using your own numbers.",
      zh: "用您自己的数字，算出平台到底抽走多少。",
    },
  },
};

/**
 * Le formulaire « rappelez-moi le mois de mon ouverture ».
 *
 * Il vit sur deux pages traduites, et c'est le seul endroit de la série
 * où le lecteur écrit plutôt que de lire : un bloc resté en français au
 * milieu d'une page chinoise n'est pas seulement inélégant, il fait
 * douter de ce qu'on est en train de donner comme adresse.
 *
 * Les refus viennent du serveur, qui répond en français et pose un code
 * dans l'en-tête ; `motifs` est la table de correspondance. Un code
 * inconnu retombe sur le texte français du serveur — une phrase qu'on ne
 * lit pas vaut mieux qu'un formulaire qui ne dit rien.
 */
export const RAPPEL = {
  titre: {
    fr: "On vous rappelle le mois de votre ouverture ?",
    en: "Shall we get back to you the month you open?",
    zh: "要我们在您开业那个月联系您吗？",
  },
  chapo: {
    fr: "Votre carnet de réservation, votre fiche Google et vos premiers couverts se décident dans les semaines qui précèdent l'ouverture. C'est là qu'on vous est utile, pas aujourd'hui.",
    en: "Your booking system, your Google listing and your first covers are all decided in the weeks before opening. That is when we are useful to you — not today.",
    zh: "订位系统、Google 商家资料、最早的那批客人，都是在开业前几周定下来的。我们在那个时候才帮得上您，不是今天。",
  },
  email: { fr: "Votre e-mail", en: "Your email", zh: "您的邮箱" },
  date: {
    fr: "Votre date d'ouverture",
    en: "Your opening date",
    zh: "您的开业日期",
  },
  nom: { fr: "Votre nom", en: "Your name", zh: "您的姓名" },
  etablissement: { fr: "Le restaurant", en: "The restaurant", zh: "餐厅名称" },
  ville: { fr: "La ville", en: "The town", zh: "所在城市" },
  facultatif: { fr: "(facultatif)", en: "(optional)", zh: "（选填）" },
  placeholderEtablissement: {
    fr: "Nom, ou « pas encore décidé »",
    en: "A name, or “not decided yet”",
    zh: "名字，或者填「还没定」",
  },
  bouton: {
    fr: "Me rappeler le moment venu",
    en: "Remind me when the time comes",
    zh: "到时候提醒我",
  },
  enCours: { fr: "Enregistrement…", en: "Saving…", zh: "正在保存…" },
  promesse: {
    fr: "Votre adresse ne sert qu'à ça : un appel ou un message, une fois, le mois de votre ouverture. Pas de lettre d'information, pas de revente, rien entre-temps. Pour être retiré de la liste avant ou après, un mot à contact@klarr.net suffit.",
    en: "Your address is used for that and nothing else: one call or one message, once, the month you open. No newsletter, no reselling, nothing in between. To be taken off the list, before or after, one line to contact@klarr.net is enough.",
    zh: "您的邮箱只用于这一件事：在您开业那个月，联系您一次，一通电话或一条消息。没有推送邮件，不会转卖，中间不打扰。想随时退出，写一封信到 contact@klarr.net 就行。",
  },
  faitTitre: {
    fr: "C'est noté. On vous rappelle le mois venu.",
    en: "Noted. We will come back to you that month.",
    zh: "记下了。到那个月我们会联系您。",
  },
  faitTexte: {
    fr: "D'ici là, vous n'entendrez pas parler de nous. Si votre date bouge, revenez remplir le même formulaire : elle se corrige.",
    en: "Until then you will not hear from us. If your date moves, come back and fill in the same form: it overwrites the old one.",
    zh: "在那之前您不会收到我们任何消息。如果日期有变动，回来重新填一次这张表就行，会直接覆盖。",
  },
  motifs: {
    illisible: {
      fr: "La demande n'a pas été comprise. Réessayez.",
      en: "The request could not be read. Please try again.",
      zh: "请求没能被读取，请再试一次。",
    },
    email: {
      fr: "Cette adresse e-mail ne semble pas valide.",
      en: "That email address does not look valid.",
      zh: "这个邮箱地址看起来不对。",
    },
    "date-absente": {
      fr: "Indiquez une date d'ouverture, même approximative.",
      en: "Give an opening date, even a rough one.",
      zh: "请填一个开业日期，大概的也可以。",
    },
    "date-illisible": {
      fr: "Cette date ne se lit pas.",
      en: "That date cannot be read.",
      zh: "这个日期读不出来。",
    },
    "date-passee": {
      fr: "Cette date est passée. Si vous êtes déjà ouvert, écrivez-nous plutôt à contact@klarr.net.",
      en: "That date is in the past. If you are already open, write to us at contact@klarr.net instead.",
      zh: "这个日期已经过了。如果您已经开业，请直接写信到 contact@klarr.net。",
    },
    "date-lointaine": {
      fr: "Au-delà de trois ans, revenez nous voir quand le projet se précisera.",
      en: "Beyond three years out, come back when the project firms up.",
      zh: "三年以后的日期，等项目更明确了再回来找我们。",
    },
    limite: {
      fr: "Nous avons déjà votre demande.",
      en: "We already have your request.",
      zh: "我们已经收到您的请求了。",
    },
    serveur: {
      fr: "L'enregistrement a échoué. Écrivez-nous à contact@klarr.net.",
      en: "Saving failed. Write to us at contact@klarr.net.",
      zh: "保存失败。请写信到 contact@klarr.net。",
    },
    reseau: {
      fr: "L'envoi a échoué. Écrivez-nous à contact@klarr.net.",
      en: "Sending failed. Write to us at contact@klarr.net.",
      zh: "发送失败。请写信到 contact@klarr.net。",
    },
  } satisfies Record<string, Trad>,
};

/** Le plan d'ouverture, qui relie les quatre. */
export const PLAN = {
  surtitre: { fr: "Ouvrir", en: "Opening", zh: "开业" },
  titre: {
    fr: "Par quoi commencer",
    en: "Where to start",
    zh: "从哪里开始",
  },
  chapo: {
    fr: "Quatre outils, gratuits, sans compte à créer, dans l'ordre où les questions se posent vraiment. Aucun ne vous vend quoi que ce soit — et deux d'entre eux peuvent conclure contre nous.",
    en: "Four tools, free, no account needed, in the order the questions actually come up. None of them sells you anything — and two of them can conclude against us.",
    zh: "四个免费工具，无需注册，按问题真正出现的顺序排列。没有一个在向您推销——其中两个甚至可能得出对我们不利的结论。",
  },
  moments: {
    diagnostic: {
      fr: "Avant de signer",
      en: "Before you sign",
      zh: "签约之前",
    },
    calendrier: {
      fr: "Une fois le local tenu",
      en: "Once the site is secured",
      zh: "确定铺面之后",
    },
    audit: {
      fr: "Dans les semaines qui précèdent",
      en: "In the weeks before opening",
      zh: "开业前几周",
    },
    calculateur: {
      fr: "Quand le carnet se choisit",
      en: "When you choose your booking system",
      zh: "挑选订位系统时",
    },
  },
  titres: {
    diagnostic: {
      fr: "Ce local peut-il accueillir un restaurant ?",
      en: "Can this site take a restaurant?",
      zh: "这个铺面能开餐厅吗？",
    },
    calendrier: {
      fr: "Quand commencer chaque démarche ?",
      en: "When should each step begin?",
      zh: "每项手续该什么时候开始？",
    },
    audit: {
      fr: "Est-ce qu'on vous trouve ?",
      en: "Can people find you?",
      zh: "别人找得到您吗？",
    },
    calculateur: {
      fr: "Commission ou abonnement ?",
      en: "Commission or subscription?",
      zh: "按人头抽成，还是按月订阅？",
    },
  },
  textes: {
    diagnostic: {
      fr: "Extraction, destination du bail, copropriété, ERP, terrasse. Cinq points, et ce sont les seuls qui peuvent rendre le projet impossible plutôt que coûteux. Tout le reste se rattrape ; ceux-là, non.",
      en: "Kitchen extraction, the lease's permitted use, the building's co-ownership rules, public-venue safety rules, the pavement terrace. Five points — the only ones that can make the project impossible rather than merely expensive. Everything else can be fixed later; these cannot.",
      zh: "排烟、租约用途、共有产权规约、公共场所安全规范（ERP）、露天座位。这五点是唯一可能让项目彻底告吹、而不只是变贵的因素。其余的都能事后补救，这五点不能。",
    },
    calendrier: {
      fr: "Donnez votre date d'ouverture, on remonte le fil. Les délais fixés par un texte sont calculés ; ceux qui dépendent de votre mairie sont signalés comme tels plutôt que devinés.",
      en: "Give us your opening date and we work backwards. Deadlines set by law are calculated; those that depend on your town hall are flagged as such rather than guessed.",
      zh: "输入开业日期，我们倒着排。法律规定的期限会直接算给您；取决于当地市政厅的，我们标明「需自行询问」，而不是瞎猜。",
    },
    audit: {
      fr: "La fiche Google se crée avant l'ouverture, pas le jour J : sa vérification passe souvent par un courrier postal. On regarde ce que Google, les avis et les IA disent de vous aujourd'hui.",
      en: "A Google listing is created before opening, not on the day: verification often goes through a posted letter. We look at what Google, the reviews and the AIs say about you today.",
      zh: "Google 商家资料要在开业前就建好，而不是当天：验证往往需要寄信，来回要时间。我们看看 Google、点评和 AI 现在是怎么说您的。",
    },
    calculateur: {
      fr: "La question se tranche avec vos chiffres, pas avec les nôtres. Le calculateur peut très bien conclure que la plateforme vous coûte moins cher — il le dit quand c'est le cas.",
      en: "This is settled with your numbers, not ours. The calculator may well conclude that the platform costs you less — and it says so when that is the case.",
      zh: "这个问题要用您的数字来判断，不是我们的。计算器完全可能得出「平台更划算」的结论——真是如此时，它会直说。",
    },
  },
  actions: {
    diagnostic: {
      fr: "Faire le diagnostic",
      en: "Run the check",
      zh: "开始诊断",
    },
    calendrier: {
      fr: "Voir le calendrier",
      en: "See the timeline",
      zh: "查看时间表",
    },
    audit: { fr: "Auditer la fiche", en: "Audit the listing", zh: "检测资料" },
    calculateur: {
      fr: "Faire le calcul",
      en: "Run the numbers",
      zh: "开始计算",
    },
  },
  resteTitre: {
    fr: "Et le reste du parcours",
    en: "And the rest of the journey",
    zh: "其余的流程",
  },
  resteTexte: {
    fr: "Licence, déclaration sanitaire, hygiène, musique, TVA, bruit : le journal les traite un par un, avec les textes en bas de page pour que vous puissiez vérifier.",
    en: "Alcohol licence, food-safety registration, hygiene, music royalties, VAT, noise: the journal covers them one by one, with the legal texts at the foot of each article so you can check for yourself.",
    zh: "酒类执照、食品卫生申报、HACCP、音乐版权、增值税、噪音：专栏逐条讲解，每篇文末附上法条原文，您可以自己核对。",
  },
  journal: { fr: "Le journal →", en: "The journal →", zh: "查看专栏 →" },
} satisfies Record<string, unknown>;
