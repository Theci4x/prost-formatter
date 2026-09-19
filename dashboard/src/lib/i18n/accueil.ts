import type { Langue } from "@/lib/i18n/langue";

/**
 * L'écran d'accueil du tableau de bord, dans les trois langues.
 *
 * Premier dictionnaire d'une série : la mécanique et le nommage posés ici
 * valent pour les vingt-et-un écrans qui suivront. Les clés décrivent ce
 * que la phrase désigne, jamais son contenu — « reservations.resume » et
 * non « leCarnetTesSalles », sans quoi une reformulation obligerait à
 * renommer la clé partout.
 *
 * Le français tutoie, l'anglais et le chinois non : le tutoiement est une
 * familiarité de marque qui ne se traduit pas, et le vouvoiement forcé en
 * anglais sonnerait faux.
 */

export type ClesAccueil = {
  groupes: Record<"service" | "maison" | "visibilite" | "reglages", string>;
  entrees: Record<
    | "reservations"
    | "service"
    | "vitrine"
    | "carte"
    | "photos"
    | "faq"
    | "experiences"
    | "avis"
    | "retours"
    | "seo"
    | "posts"
    | "visibiliteIa"
    | "notifications"
    | "connexions"
    | "paiements"
    | "equipe"
    | "abonnement",
    { label: string; resume: string }
  >;
  langue: { choisir: string };
};

const fr: ClesAccueil = {
  groupes: {
    service: "Le service",
    maison: "Votre maison",
    visibilite: "Votre visibilité",
    reglages: "Réglages",
  },
  entrees: {
    reservations: {
      label: "Réservations",
      resume: "Le carnet, tes salles, tes services et ton plan de salle.",
    },
    service: {
      label: "Service",
      resume: "L'écran de salle, pour le coup de feu.",
    },
    vitrine: {
      label: "Site vitrine",
      resume: "Le site de ton restaurant, fait de ce que tu as déjà rempli.",
    },
    carte: {
      label: "Carte",
      resume: "Tes plats, leurs prix, leurs photos, et le QR code à poser.",
    },
    photos: {
      label: "Photos",
      resume: "Ce que voit un client avant de choisir de venir.",
    },
    faq: {
      label: "Questions fréquentes",
      resume: "Ce qu'on te demande au téléphone, répondu une fois pour toutes.",
    },
    experiences: {
      label: "Expériences",
      resume: "Ateliers, dégustations, soirées à places comptées.",
    },
    avis: {
      label: "Avis",
      resume: "Tes avis Google, et des réponses prêtes à relire.",
    },
    retours: {
      label: "Retours clients",
      resume: "Ce qu'on préfère te dire en privé. Totem ou QR code.",
    },
    seo: {
      label: "Référencement",
      resume: "Ce que Google sait de toi, et ce qui lui manque.",
    },
    posts: {
      label: "Publications Google",
      resume: "Écris tes posts à l'avance, Klarr les publie.",
    },
    visibiliteIa: {
      label: "Visibilité IA",
      resume: "Es-tu cité quand on demande à une IA où dîner ?",
    },
    notifications: {
      label: "Notifications",
      resume: "Être prévenu sur ton téléphone.",
    },
    connexions: {
      label: "Connexions",
      resume: "Google, Facebook, Instagram, TikTok.",
    },
    paiements: {
      label: "Paiements",
      resume: "Acomptes, cautions, compte Stripe.",
    },
    equipe: { label: "Équipe", resume: "Qui accède à quoi." },
    abonnement: { label: "Abonnement", resume: "Ta formule, tes factures." },
  },
  langue: { choisir: "Langue" },
};

const en: ClesAccueil = {
  groupes: {
    service: "Service",
    maison: "Your place",
    visibilite: "Your visibility",
    reglages: "Settings",
  },
  entrees: {
    reservations: {
      label: "Bookings",
      resume: "The book, your rooms, your services and your floor plan.",
    },
    service: {
      label: "Service",
      resume: "The floor screen, for the rush.",
    },
    vitrine: {
      label: "Website",
      resume: "Your restaurant's site, built from what you already filled in.",
    },
    carte: {
      label: "Menu",
      resume: "Your dishes, their prices, their photos, and the QR code.",
    },
    photos: {
      label: "Photos",
      resume: "What a guest sees before deciding to come.",
    },
    faq: {
      label: "Frequent questions",
      resume: "What people ask on the phone, answered once and for all.",
    },
    experiences: {
      label: "Experiences",
      resume: "Workshops, tastings, evenings with limited seats.",
    },
    avis: {
      label: "Reviews",
      resume: "Your Google reviews, with replies ready to check.",
    },
    retours: {
      label: "Guest feedback",
      resume: "What people would rather tell you privately. Sign or QR code.",
    },
    seo: {
      label: "Search",
      resume: "What Google knows about you, and what it is missing.",
    },
    posts: {
      label: "Google posts",
      resume: "Write your posts ahead, Klarr publishes them.",
    },
    visibiliteIa: {
      label: "AI visibility",
      resume: "Are you named when someone asks an AI where to eat?",
    },
    notifications: {
      label: "Notifications",
      resume: "Be told on your phone.",
    },
    connexions: {
      label: "Connections",
      resume: "Google, Facebook, Instagram, TikTok.",
    },
    paiements: {
      label: "Payments",
      resume: "Deposits, guarantees, Stripe account.",
    },
    equipe: { label: "Team", resume: "Who has access to what." },
    abonnement: { label: "Subscription", resume: "Your plan, your invoices." },
  },
  langue: { choisir: "Language" },
};

const zh: ClesAccueil = {
  groupes: {
    service: "营业",
    maison: "您的店",
    visibilite: "您的曝光",
    reglages: "设置",
  },
  entrees: {
    reservations: {
      label: "订座",
      resume: "订座本、包间、服务时段和座位图。",
    },
    service: { label: "现场", resume: "用餐高峰时的现场屏幕。" },
    vitrine: {
      label: "官网",
      resume: "用您已填写的内容生成的餐厅网站。",
    },
    carte: {
      label: "菜单",
      resume: "菜品、价格、照片，以及可张贴的二维码。",
    },
    photos: { label: "照片", resume: "客人决定光临前所看到的。" },
    faq: {
      label: "常见问题",
      resume: "电话里被反复问到的问题，一次性答清楚。",
    },
    experiences: {
      label: "活动",
      resume: "工作坊、品鉴会、限位晚宴。",
    },
    avis: {
      label: "评价",
      resume: "您的谷歌评价，以及可供过目的回复。",
    },
    retours: {
      label: "客人反馈",
      resume: "客人更愿意私下告诉您的话。立牌或二维码。",
    },
    seo: {
      label: "搜索排名",
      resume: "谷歌对您的了解，以及还缺什么。",
    },
    posts: {
      label: "谷歌动态",
      resume: "提前写好动态，Klarr 按时发布。",
    },
    visibiliteIa: {
      label: "AI 曝光",
      resume: "有人问 AI 去哪儿吃饭时，会提到您吗？",
    },
    notifications: { label: "通知", resume: "在手机上收到提醒。" },
    connexions: {
      label: "账号连接",
      resume: "谷歌、Facebook、Instagram、TikTok。",
    },
    paiements: { label: "收款", resume: "订金、押金、Stripe 账户。" },
    equipe: { label: "团队", resume: "谁能访问什么。" },
    abonnement: { label: "订阅", resume: "您的方案与账单。" },
  },
  langue: { choisir: "语言" },
};

export const ACCUEIL: Record<Langue, ClesAccueil> = { fr, en, zh };
