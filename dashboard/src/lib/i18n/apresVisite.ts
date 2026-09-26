import type { Langue } from "@/lib/i18n/langues";

/** La page « Après la visite » du tableau de bord, dans les trois langues. */
export type ClesApresVisite = {
  titre: (nom: string) => string;
  chapo: string;
  envoyees: (n: number) => string;
  rienParti: string;
  coupe: string;
  retours: (n: number) => string;
  echecs: (n: number) => string;
  graphiqueAria: (pic: number) => string;
  bulleJour: (jour: string, n: number) => string;
  envoisParJour: string;
  aujourdhui: string;
  actifTitre: string;
  coupeTitre: string;
  actifTexte: string;
  coupeTexte: string;
  couper: string;
  remettre: string;
  lireMessages: string;
  pasDeFicheAvant: string;
  pasDeFicheLien: string;
  recoitTitre: string;
  langues: Record<Langue, string>;
  envoyePar: string;
  apercuTitre: string;
  sansAdresse: string;
  parcoursTitre: string;
  parcours: { quand: string; quoi: string }[];
  exclusTitre: string;
  exclus: { titre: string; detail: string }[];
};

const fr: ClesApresVisite = {
  titre: (nom) => `Après la visite — ${nom}`,
  chapo:
    "Le lendemain de leur venue, vers 11 h, tes clients reçoivent un merci et une invitation à laisser un avis sur Google, avec juste dessous un lien pour t'écrire directement. Même message pour tout le monde : Google interdit de n'inviter que les clients contents.",
  envoyees: (n) => {
    const s = n > 1 ? "s" : "";
    return `demande${s} d'avis envoyée${s} ces 30 derniers jours`;
  },
  rienParti:
    "Rien n'est encore parti : le premier envoi suivra le premier service noté dans le carnet.",
  coupe: "L'envoi est coupé : aucun client ne reçoit la demande.",
  retours: (n) => {
    const s = n > 1 ? "s" : "";
    return `Et ${n} message${s} privé${s} reçu${s} sur la même période.`;
  },
  echecs: (n) => {
    const s = n > 1 ? "s" : "";
    return ` ${n} adresse${s} refusée${s} : ces clients-là n'ont rien reçu.`;
  },
  graphiqueAria: (pic) =>
    `Envois par jour sur 30 jours, au plus ${pic} un même jour`,
  bulleJour: (jour, n) => `${jour} : ${n} envoi${n > 1 ? "s" : ""}`,
  envoisParJour: "Envois par jour",
  aujourdhui: "aujourd'hui",
  actifTitre: "Envoyée chaque matin",
  coupeTitre: "Coupée",
  actifTexte:
    "Aux clients venus la veille, une fois par trimestre au plus pour un habitué.",
  coupeTexte:
    "Plus aucun client ne la reçoit. Tu peux la remettre quand tu veux.",
  couper: "Couper l'envoi",
  remettre: "Remettre l'envoi",
  lireMessages: "Lire les messages privés →",
  pasDeFicheAvant:
    "Klarr ne connaît pas encore ta fiche Google : le bouton mène à ta page d'avis, qui la retrouve toute seule. Pour qu'il aille droit au formulaire Google, ouvre une fois ",
  pasDeFicheLien: "la page Fiche Google",
  recoitTitre: "Ce que reçoit le client",
  langues: { fr: "Français", en: "Anglais", zh: "Chinois" },
  envoyePar: "envoyé par Klarr · les réponses te reviennent",
  apercuTitre: "Aperçu de la demande d'avis",
  sansAdresse:
    "Rien ne part tant que ta page de réservation n'a pas d'adresse : c'est elle qui porte le lien vers ta fiche Google et le formulaire pour t'écrire.",
  parcoursTitre: "Le parcours",
  parcours: [
    {
      quand: "Le soir",
      quoi: "Le client dîne chez toi, sa table est dans le carnet.",
    },
    {
      quand: "Le lendemain, vers 11 h",
      quoi: "Il reçoit un merci, dans la langue où il a réservé.",
    },
    { quand: "Un clic", quoi: "Il laisse un avis sur ta fiche Google…" },
    {
      quand: "… ou il t'écrit",
      quoi: "Son message arrive dans tes retours, sans passer par Google.",
    },
  ],
  exclusTitre: "Qui ne la reçoit pas",
  exclus: [
    { titre: "Les absents", detail: "notés comme tels dans le carnet" },
    { titre: "Les tables importées", detail: "venues d'un autre outil" },
    {
      titre: "Les habitués déjà sollicités",
      detail: "une demande tous les 90 jours au plus",
    },
    { titre: "Les désinscrits", detail: "le lien est en bas de chaque envoi" },
  ],
};

const en: ClesApresVisite = {
  titre: (nom) => `After the visit — ${nom}`,
  chapo:
    "The day after their visit, around 11am, your guests receive a thank-you and an invitation to leave a Google review, with a link just below to write to you directly. Same message for everyone: Google forbids inviting only happy guests.",
  envoyees: (n) =>
    `review request${n === 1 ? "" : "s"} sent in the last 30 days`,
  rienParti:
    "Nothing has gone out yet: the first email will follow the first service recorded in the booking book.",
  coupe: "Sending is off: no guest receives the request.",
  retours: (n) =>
    `And ${n} private message${n === 1 ? "" : "s"} received over the same period.`,
  echecs: (n) =>
    ` ${n} address${n === 1 ? " was" : "es were"} rejected: those guests received nothing.`,
  graphiqueAria: (pic) =>
    `Emails sent per day over 30 days, at most ${pic} on a single day`,
  bulleJour: (jour, n) => `${jour}: ${n} sent`,
  envoisParJour: "Emails per day",
  aujourdhui: "today",
  actifTitre: "Sent every morning",
  coupeTitre: "Off",
  actifTexte:
    "To guests who came the day before, at most once a quarter for a regular.",
  coupeTexte: "No guest receives it any more. You can turn it back on anytime.",
  couper: "Turn off",
  remettre: "Turn back on",
  lireMessages: "Read private messages →",
  pasDeFicheAvant:
    "Klarr doesn't know your Google listing yet: the button leads to your review page, which finds it on its own. For it to go straight to the Google form, open once ",
  pasDeFicheLien: "the Google listing page",
  recoitTitre: "What the guest receives",
  langues: { fr: "French", en: "English", zh: "Chinese" },
  envoyePar: "sent by Klarr · replies come back to you",
  apercuTitre: "Preview of the review request",
  sansAdresse:
    "Nothing goes out until your booking page has an address: it carries the link to your Google listing and the form to write to you.",
  parcoursTitre: "The journey",
  parcours: [
    {
      quand: "In the evening",
      quoi: "The guest dines with you; their table is in the booking book.",
    },
    {
      quand: "The next day, around 11am",
      quoi: "They receive a thank-you, in the language they booked in.",
    },
    { quand: "One click", quoi: "They leave a review on your Google listing…" },
    {
      quand: "… or write to you",
      quoi: "Their message lands in your feedback, not on Google.",
    },
  ],
  exclusTitre: "Who doesn't receive it",
  exclus: [
    { titre: "No-shows", detail: "marked as such in the booking book" },
    { titre: "Imported bookings", detail: "coming from another tool" },
    {
      titre: "Regulars already asked",
      detail: "one request every 90 days at most",
    },
    {
      titre: "Unsubscribed guests",
      detail: "the link is at the bottom of every email",
    },
  ],
};

const zh: ClesApresVisite = {
  titre: (nom) => `用餐之后 — ${nom}`,
  chapo:
    "客人用餐的第二天上午 11 点左右，会收到一封感谢邮件，邀请他们在 Google 上留下评价，下方还有一个直接写信给您的链接。所有人收到同样的邮件：Google 禁止只邀请满意的客人。",
  envoyees: () => "封邀评邮件（最近 30 天）",
  rienParti: "还没有发出任何邮件：订位簿里记录第一次用餐后就会开始发送。",
  coupe: "已关闭发送：没有客人会收到邀评邮件。",
  retours: (n) => `同一时期还收到 ${n} 条私下留言。`,
  echecs: (n) => `${n} 个邮箱地址被拒收：这些客人没有收到邮件。`,
  graphiqueAria: (pic) => `最近 30 天每天的发送数量，单日最多 ${pic} 封`,
  bulleJour: (jour, n) => `${jour}：发送 ${n} 封`,
  envoisParJour: "每天发送数量",
  aujourdhui: "今天",
  actifTitre: "每天早上发送",
  coupeTitre: "已关闭",
  actifTexte: "发给前一天来过的客人；熟客每季度最多收到一次。",
  coupeTexte: "现在没有客人会收到。您可以随时重新开启。",
  couper: "关闭发送",
  remettre: "重新开启",
  lireMessages: "查看私下留言 →",
  pasDeFicheAvant:
    "Klarr 还不知道您的 Google 商家资料：按钮会先打开您的评价页面，由它自动找到商家资料。想让按钮直接打开 Google 评价表单，请打开一次",
  pasDeFicheLien: "「Google 商家资料」页面",
  recoitTitre: "客人收到的邮件",
  langues: { fr: "法语", en: "英语", zh: "中文" },
  envoyePar: "由 Klarr 发送 · 回复会发到您这里",
  apercuTitre: "邀评邮件预览",
  sansAdresse:
    "订位页面还没有网址时不会发送任何邮件：邮件里指向 Google 商家资料的链接和给您写信的表单都在订位页面上。",
  parcoursTitre: "流程",
  parcours: [
    { quand: "当天晚上", quoi: "客人在您店里用餐，桌位记录在订位簿里。" },
    {
      quand: "第二天上午 11 点左右",
      quoi: "客人收到一封感谢邮件，语言和订位时一致。",
    },
    { quand: "点一下", quoi: "在您的 Google 商家资料上留下评价……" },
    {
      quand: "……或写信给您",
      quoi: "留言进入「客人反馈」，不会出现在 Google 上。",
    },
  ],
  exclusTitre: "哪些客人不会收到",
  exclus: [
    { titre: "没来的客人", detail: "在订位簿里标记为未到" },
    { titre: "导入的预订", detail: "来自其他订位工具" },
    { titre: "最近已邀请过的熟客", detail: "每 90 天最多一次" },
    { titre: "已退订的客人", detail: "每封邮件底部都有退订链接" },
  ],
};

export const APRES_VISITE: Record<Langue, ClesApresVisite> = { fr, en, zh };
