import type { Langue } from "@/lib/i18n/langues";
import type { Article, CategorieAide } from "@/types/aide";

/**
 * Le centre d'aide : sa navigation, dans les trois langues.
 *
 * **Les articles eux-mêmes restent en français**, et c'est un choix assumé
 * plutôt qu'un oubli. Leurs pages sont pré-générées : c'est ce qui les fait
 * remonter dans Google, et les rendre dynamiques pour lire un témoin de
 * langue coûterait ce référencement. Les traduire suppose de leur donner
 * une adresse par langue, comme le journal — un autre chantier.
 *
 * Ce qui se traduit ici, c'est ce qui permet de **trouver son chemin** :
 * les rubriques, les titres et les résumés. Un restaurateur qui lit
 * l'anglais ou le chinois voit ce que chaque article couvre, et sait
 * lequel ouvrir. C'est la moitié utile, et elle ne coûte rien à personne.
 */

export type ClesAide = {
  aide: string;
  metaDescription: string;
  chapo: string;
  vousNeTrouvezPas: string;
  ecrivezNous: string;
  ecrireAKlarr: string;
  ecrire: string;
  dansLaMemeRubrique: string;
  touteLAide: string;
  aideDe: string;
  retourALAide: string;

  /** Le pied de page commun. */
  accueil: string;
  mentionsLegales: string;
  conditionsGenerales: string;
  confidentialite: string;

  /** La page de contact. */
  contactMetaDescription: string;
  contactConnecte: string;
  contactVisiteur: string;
  preferezVotreMessagerie: string;
  votreAdresse: string;
  votreQuestion: string;
  exempleQuestion: string;
  envoi: string;
  cestEnvoye: string;
  reponseDansLaJournee: string;
  /** Les refus du formulaire, indexés comme l'action les nomme. */
  erreursDemande: Record<"missing" | "email" | "trop" | "generic", string>;

  /**
   * Affiché en tête d'un article, pour qui ne lit pas le français. Vide en
   * français, où il n'y a rien à annoncer.
   */
  articleEnFrancais: string;

  rubriques: Record<CategorieAide, { titre: string; resume: string }>;

  /** La recherche en tête du centre d'aide. */
  rechercher: string;
  effacer: string;
  resultats(n: number): string;
  aucunResultat: string;
  nombreArticles(n: number): string;
  mentionneAussi: string;
};

const fr: ClesAide = {
  aide: "Aide",
  metaDescription:
    "Le mode d'emploi de Klarr : réservations, plan de salle, carte, acomptes, équipe. Des réponses courtes, écrites pour des restaurateurs.",
  chapo:
    "Comment se servir de Klarr, en clair. Chaque article répond à une question qu'on se pose vraiment, et dit aussi ce que Klarr ne fait pas encore.",
  vousNeTrouvezPas: "Vous ne trouvez pas ?",
  ecrivezNous:
    "Écrivez-nous : une vraie réponse, écrite à la main, dans la journée.",
  ecrireAKlarr: "Écrire à Klarr",
  ecrire: "Écrire",
  dansLaMemeRubrique: "Dans la même rubrique",
  touteLAide: "← Toute l'aide",
  aideDe: "Aide de",
  retourALAide: "Retour à l'aide",

  accueil: "Accueil",
  mentionsLegales: "Mentions légales",
  conditionsGenerales: "Conditions générales",
  confidentialite: "Confidentialité",

  contactMetaDescription:
    "Une question que l'aide ne couvre pas ? Écrivez-nous : nous répondons dans la journée.",
  contactConnecte:
    "Votre établissement et l'écran d'où vous écrivez sont joints au message : vous n'avez rien à expliquer de tout ça.",
  contactVisiteur:
    "Une question sur Klarr, avant ou après l'inscription. Nous répondons dans la journée, par une vraie réponse écrite à la main.",
  preferezVotreMessagerie: "Vous préférez votre messagerie ?",
  votreAdresse: "Votre adresse e-mail",
  votreQuestion: "Votre question",
  exempleQuestion: "Ce que vous cherchez à faire, et ce qui bloque.",
  envoi: "Envoi…",
  cestEnvoye: "C'est envoyé.",
  reponseDansLaJournee:
    "Nous répondons dans la journée, à l'adresse de votre compte.",
  erreursDemande: {
    missing: "Écrivez d'abord votre question.",
    email: "Il nous faut une adresse pour vous répondre.",
    trop: "Vous avez déjà écrit plusieurs fois aujourd'hui. Nous vous répondons.",
    generic: "L'envoi a échoué. Écrivez-nous à contact@klarr.net.",
  },

  articleEnFrancais: "",

  rechercher: "Chercher : acompte, plan de salle, fermer un jour…",
  effacer: "Effacer",
  resultats: (n) => `${n} article${n > 1 ? "s" : ""} trouvé${n > 1 ? "s" : ""}`,
  aucunResultat:
    "Aucun article ne répond à cette recherche. Essayez un autre mot, ou écrivez-nous.",
  mentionneAussi: "Mentionné aussi dans",
  nombreArticles: (n) => `${n} article${n > 1 ? "s" : ""}`,

  rubriques: {
    decouvrir: {
      titre: "Découvrir Klarr",
      resume: "Ce que c'est, ce que ça coûte, et ce que ça ne fait pas.",
    },
    demarrer: {
      titre: "Démarrer",
      resume: "Créer son établissement et ouvrir sa page de réservation.",
    },
    reservations: {
      titre: "Réservations",
      resume: "Prendre, confirmer et suivre les réservations, jour après jour.",
    },
    salle: {
      titre: "Salle et plan de table",
      resume: "Dessiner ses salles, placer ses clients, fermer des jours.",
    },
    carte: {
      titre: "La carte",
      resume: "Saisir sa carte, la publier, le QR code et l'anglais.",
    },
    argent: {
      titre: "Acomptes et paiements",
      resume: "Stripe, acomptes de privatisation, cautions, abonnement.",
    },
    equipe: {
      titre: "Équipe",
      resume: "Donner un accès à son gérant et à ses serveurs.",
    },
    visibilite: {
      titre: "Visibilité",
      resume: "Fiche Google, avis, réseaux sociaux, présence dans les IA.",
    },
  },
};

const en: ClesAide = {
  aide: "Help",
  metaDescription:
    "The Klarr manual: bookings, table plan, menu, deposits, team. Short answers, written for restaurant owners.",
  chapo:
    "How to use Klarr, plainly. Each article answers a question people actually ask, and also says what Klarr does not do yet.",
  vousNeTrouvezPas: "Can't find it?",
  ecrivezNous: "Write to us: a real answer, written by hand, the same day.",
  ecrireAKlarr: "Write to Klarr",
  ecrire: "Write",
  dansLaMemeRubrique: "In the same section",
  touteLAide: "← All help",
  aideDe: "Help for",
  retourALAide: "Back to help",

  accueil: "Home",
  mentionsLegales: "Legal notice",
  conditionsGenerales: "Terms of use",
  confidentialite: "Privacy",

  contactMetaDescription:
    "A question the help centre does not cover? Write to us: we answer the same day.",
  contactConnecte:
    "Your restaurant and the screen you are writing from are attached to the message: you have none of that to explain.",
  contactVisiteur:
    "A question about Klarr, before or after signing up. We answer the same day, with a real answer written by hand.",
  preferezVotreMessagerie: "Would you rather use your own mail?",
  votreAdresse: "Your e-mail address",
  votreQuestion: "Your question",
  exempleQuestion: "What you are trying to do, and what is blocking you.",
  envoi: "Sending…",
  cestEnvoye: "Sent.",
  reponseDansLaJournee: "We answer the same day, to your account's address.",
  erreursDemande: {
    missing: "Write your question first.",
    email: "We need an address to reply to.",
    trop: "You have already written several times today. We are on it.",
    generic: "Sending failed. Write to us at contact@klarr.net.",
  },

  articleEnFrancais:
    "This article is in French. Its page is pre-generated, which is what makes it findable; the summary above tells you what it covers.",

  rechercher: "Search: deposit, floor plan, closing a day…",
  effacer: "Clear",
  resultats: (n) => `${n} article${n > 1 ? "s" : ""} found`,
  aucunResultat:
    "No article matches this search. Try another word, or write to us.",
  mentionneAussi: "Also mentioned in",
  nombreArticles: (n) => `${n} article${n > 1 ? "s" : ""}`,

  rubriques: {
    decouvrir: {
      titre: "Getting to know Klarr",
      resume: "What it is, what it costs, and what it does not do.",
    },
    demarrer: {
      titre: "Getting started",
      resume: "Create your restaurant and open your booking page.",
    },
    reservations: {
      titre: "Bookings",
      resume: "Take, confirm and follow bookings, day after day.",
    },
    salle: {
      titre: "Room and table plan",
      resume: "Draw your rooms, seat your guests, close days.",
    },
    carte: {
      titre: "The menu",
      resume: "Enter your menu, publish it, the QR code and English.",
    },
    argent: {
      titre: "Deposits and payments",
      resume: "Stripe, private-hire deposits, card holds, subscription.",
    },
    equipe: {
      titre: "Team",
      resume: "Give access to your manager and your waiters.",
    },
    visibilite: {
      titre: "Visibility",
      resume: "Google listing, reviews, social networks, presence in AI.",
    },
  },
};

const zh: ClesAide = {
  aide: "帮助",
  metaDescription:
    "Klarr 使用手册：订座、桌位图、菜单、定金、团队。简短的答案，为餐厅老板写的。",
  chapo:
    "怎么用 Klarr，说清楚。每篇文章回答一个真正会被问到的问题，也写明 Klarr 目前还做不到什么。",
  vousNeTrouvezPas: "没找到？",
  ecrivezNous: "写信给我们：当天回复，一封手写的真回答。",
  ecrireAKlarr: "写信给 Klarr",
  ecrire: "写信",
  dansLaMemeRubrique: "同一栏目下",
  touteLAide: "← 全部帮助",
  aideDe: "帮助中心",
  retourALAide: "返回帮助",

  accueil: "首页",
  mentionsLegales: "法律声明",
  conditionsGenerales: "使用条款",
  confidentialite: "隐私政策",

  contactMetaDescription: "帮助中心没写到的问题？写信给我们：当天回复。",
  contactConnecte: "您的餐厅和您所在的界面会随消息一起发来：这些都不用您解释。",
  contactVisiteur:
    "关于 Klarr 的问题，注册前后都可以问。我们当天回复，一封手写的真回答。",
  preferezVotreMessagerie: "更习惯用自己的邮箱？",
  votreAdresse: "您的电子邮箱",
  votreQuestion: "您的问题",
  exempleQuestion: "您想做什么，以及卡在哪里。",
  envoi: "正在发送……",
  cestEnvoye: "已发送。",
  reponseDansLaJournee: "我们当天回复，发到您账户的邮箱。",
  erreursDemande: {
    missing: "请先写下您的问题。",
    email: "我们需要一个邮箱地址才能回复您。",
    trop: "您今天已经写了好几次了。我们正在处理。",
    generic: "发送失败。请写信到 contact@klarr.net。",
  },

  articleEnFrancais:
    "这篇文章是法语的。它的页面是预先生成的，这正是它能被搜到的原因；上面的摘要说明了它讲什么。",

  rechercher: "搜索：定金、平面图、某天不营业……",
  effacer: "清除",
  resultats: (n) => `找到 ${n} 篇文章`,
  aucunResultat: "没有文章符合这个搜索。换个词试试，或者给我们写信。",
  mentionneAussi: "也提到于",
  nombreArticles: (n) => `${n} 篇文章`,

  rubriques: {
    decouvrir: {
      titre: "认识 Klarr",
      resume: "它是什么、要多少钱，以及它不做什么。",
    },
    demarrer: {
      titre: "开始使用",
      resume: "建好餐厅，开通订座页面。",
    },
    reservations: {
      titre: "订座",
      resume: "日复一日地接单、确认、跟进。",
    },
    salle: {
      titre: "餐厅与桌位图",
      resume: "画出您的餐厅、安排客人、关掉某些日子。",
    },
    carte: {
      titre: "菜单",
      resume: "录入菜单、发布、二维码与英文版。",
    },
    argent: {
      titre: "定金与收款",
      resume: "Stripe、包场定金、信用卡担保、订阅。",
    },
    equipe: {
      titre: "团队",
      resume: "给经理和服务员开权限。",
    },
    visibilite: {
      titre: "曝光",
      resume: "Google 商家资料、评价、社交网络、在 AI 里的存在。",
    },
  },
};

export const AIDE: Record<Langue, ClesAide> = { fr, en, zh };

/**
 * Les titres et résumés des articles, par langue.
 *
 * Une table à part, indexée par slug, plutôt que des champs ajoutés aux
 * vingt-trois fichiers de contenu : ceux-ci servent aussi de source au
 * Commis, qui ne répond qu'à partir d'eux, et je préfère ne pas y mêler
 * trois langues. Un slug absent retombe sur le français — c'est le cas
 * normal d'un article qu'on vient d'écrire.
 */
type Entree = { titre: string; resume: string };

const TITRES: Record<Exclude<Langue, "fr">, Record<string, Entree>> = {
  en: {
    "qu-est-ce-que-klarr": {
      titre: "What is Klarr?",
      resume: "What Klarr is for, who it is made for, and what it replaces.",
    },
    "combien-ca-coute": {
      titre: "What does Klarr cost?",
      resume: "The prices, what is included, and what is not.",
    },
    "ce-que-klarr-ne-fait-pas": {
      titre: "What Klarr does not do",
      resume: "The limits, said before you commit rather than after.",
    },
    "klarr-et-les-plateformes": {
      titre: "Klarr and the commission platforms",
      resume:
        "What changes when you do not pay per cover, and what it implies.",
    },
    "premiers-pas": {
      titre: "Creating your restaurant",
      resume:
        "The five minutes between an empty account and a live booking page.",
    },
    "page-de-reservation": {
      titre: "Your booking page",
      resume:
        "The address to share everywhere, what the guest sees, and what you can show.",
    },
    "demandes-reservation": {
      titre: "Accepting or declining a request",
      resume:
        "What happens between a guest asking for a table and actually having it.",
    },
    "reservation-telephone": {
      titre: "Taking a booking over the phone",
      resume:
        "Entering a booking taken by phone so it counts like all the others.",
    },
    "ecran-de-service": {
      titre: "The service screen",
      resume:
        "Today's screen: how many covers, who is coming, who is still to be seated.",
    },
    statistiques: {
      titre: "Following your bookings",
      resume:
        "What the numbers say about your service: occupancy, cancellations, busy days.",
    },
    experiences: {
      titre: "Creating an experience",
      resume:
        "Cocktail class, pasta workshop: sessions with limited places, paid up front.",
    },
    "plan-de-salle": {
      titre: "Drawing your table plan",
      resume:
        "Lay out your tables as they really are, and use them during service.",
    },
    fermetures: {
      titre: "Closing a day or a period",
      resume:
        "Holidays, bank holiday, a room already taken: block without undoing your setup.",
    },
    privatisation: {
      titre: "Private hire of a room",
      resume: "Let a whole room to a group, with or without a deposit.",
    },
    "saisir-sa-carte": {
      titre: "Entering and publishing your menu",
      resume:
        "Your dishes, in the order of a meal, with photos, visible to your guests.",
    },
    "qr-code-carte": {
      titre: "Your menu's QR code",
      resume:
        "A code to put on the tables, opening your menu on the guest's phone.",
    },
    "carte-en-anglais": {
      titre: "Your menu in English",
      resume:
        "Automatic translation, and the rule that keeps it from making you lie.",
    },
    "connecter-stripe": {
      titre: "Connecting your Stripe account",
      resume: "Take deposits into your own account, with no Klarr commission.",
    },
    "acompte-privatisation": {
      titre: "Asking for a deposit",
      resume: "Charge an advance on a private hire, and know where it stands.",
    },
    "caution-carte": {
      titre: "Asking for a card hold",
      resume:
        "Store a card without charging it, and charge it only on a no-show.",
    },
    abonnement: {
      titre: "Your subscription",
      resume: "What you pay, what you do not, and how to stop.",
    },
    "comptes-equipe": {
      titre: "Giving your team access",
      resume: "Three roles, and what each one sees — or does not.",
    },
    "fiche-google": {
      titre: "Your Google listing and your reviews",
      resume: "Link your listing, follow your rating, answer your reviews.",
    },
  },
  zh: {
    "qu-est-ce-que-klarr": {
      titre: "Klarr 是什么？",
      resume: "Klarr 做什么用、为谁而做，以及它替代了什么。",
    },
    "combien-ca-coute": {
      titre: "Klarr 多少钱？",
      resume: "价格、包含什么，以及不包含什么。",
    },
    "ce-que-klarr-ne-fait-pas": {
      titre: "Klarr 做不到的事",
      resume: "把局限写在您决定之前，而不是之后。",
    },
    "klarr-et-les-plateformes": {
      titre: "Klarr 与抽成平台",
      resume: "不按人头付费会带来什么变化，以及这意味着什么。",
    },
    "premiers-pas": {
      titre: "建好您的餐厅",
      resume: "从一个空账号到一个上线的订座页面，只隔五分钟。",
    },
    "page-de-reservation": {
      titre: "您的订座页面",
      resume: "到处都能分享的那个网址、客人看到什么，以及您能展示什么。",
    },
    "demandes-reservation": {
      titre: "接受或拒绝一个申请",
      resume: "从客人提出订位，到他真的拿到桌子，中间发生了什么。",
    },
    "reservation-telephone": {
      titre: "接电话订位",
      resume: "把电话里接到的订位录进来，让它和其他订位一样算数。",
    },
    "ecran-de-service": {
      titre: "开餐界面",
      resume: "当天的界面：多少位、谁会来、还有谁没安排座位。",
    },
    statistiques: {
      titre: "跟踪您的订座",
      resume: "数字说明了什么：满座率、取消率、哪几天最忙。",
    },
    experiences: {
      titre: "创建一个活动",
      resume: "调酒课、意面工作坊：名额有限、先付款的场次。",
    },
    "plan-de-salle": {
      titre: "画出您的桌位图",
      resume: "按真实样子摆桌子，开餐时就能用上。",
    },
    fermetures: {
      titre: "关掉某一天或某段时间",
      resume: "休假、法定假日、某个厅已被包场：不动配置就能屏蔽。",
    },
    privatisation: {
      titre: "包场一个厅",
      resume: "把整个厅租给一个团体，收不收定金都行。",
    },
    "saisir-sa-carte": {
      titre: "录入并发布菜单",
      resume: "您的菜品，按上菜顺序排列，配照片，客人看得到。",
    },
    "qr-code-carte": {
      titre: "菜单的二维码",
      resume: "贴在桌上的一个码，在客人手机上打开您的菜单。",
    },
    "carte-en-anglais": {
      titre: "英文版菜单",
      resume: "自动翻译，以及那条让它不至于替您说谎的规则。",
    },
    "connecter-stripe": {
      titre: "连接您的 Stripe 账户",
      resume: "定金直接进您自己的账户，Klarr 不抽成。",
    },
    "acompte-privatisation": {
      titre: "收取定金",
      resume: "对包场收一笔预付款，并随时知道它到哪一步了。",
    },
    "caution-carte": {
      titre: "做信用卡担保",
      resume: "记录一张卡但不扣款，只在客人没来时才扣。",
    },
    abonnement: {
      titre: "您的订阅",
      resume: "您付什么、不付什么，以及怎么停掉。",
    },
    "comptes-equipe": {
      titre: "给团队开权限",
      resume: "三种角色，以及每种角色看得到——或看不到——什么。",
    },
    "fiche-google": {
      titre: "您的 Google 商家资料与评价",
      resume: "关联资料、跟踪评分、回复评价。",
    },
  },
};

/**
 * La traduction d'un slug, ou rien.
 *
 * Rend `null` en français et pour un article pas encore traduit — les deux
 * cas où l'appelant doit s'en tenir au texte du fichier de contenu. C'est
 * ce que lit la page d'un article, pré-générée : elle ne connaît pas la
 * langue du lecteur côté serveur, et se corrige dans le navigateur.
 */
export function entreeDuSlug(slug: string, langue: Langue): Entree | null {
  if (langue === "fr") return null;
  return TITRES[langue]?.[slug] ?? null;
}

/** Le titre et le résumé d'un article, traduits si on les a. */
export function entreeArticle(article: Article, langue: Langue): Entree {
  return (
    entreeDuSlug(article.slug, langue) ?? {
      titre: article.titre,
      resume: article.resume,
    }
  );
}
