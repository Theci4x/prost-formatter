import type { Traductions } from "@/lib/i18n/t";

/** La page Connexions, et le bouton de connexion Facebook. */
export const CONNEXIONS: Traductions = {
  "Connexions — {nom}": { en: "Connections — {nom}", zh: "账户连接 — {nom}" },
  "Relie tes comptes à Klarr pour qu'il puisse lire tes avis, tes publications et tes statistiques, et encaisser tes acomptes. Tu restes propriétaire de tes comptes : la connexion se retire quand tu veux, depuis « Gérer ».":
    {
      en: "Link your accounts to Klarr so it can read your reviews, posts and statistics, and collect your deposits. You still own your accounts: you can remove the connection whenever you like, from “Manage”.",
      zh: "将您的账户关联到 Klarr，它就能读取您的评价、帖子和统计数据，并收取定金。账户始终归您所有：随时可以在「管理」中解除连接。",
    },
  "Compte connecté avec succès.": {
    en: "Account connected successfully.",
    zh: "账户连接成功。",
  },
  "La connexion Stripe n'a pas abouti.": {
    en: "The Stripe connection didn't go through.",
    zh: "Stripe 连接未成功。",
  },
  "Voir le détail et réessayer": {
    en: "See the details and try again",
    zh: "查看详情并重试",
  },
  "compte relié": { en: "account linked", zh: "个账户已关联" },
  "comptes reliés": { en: "accounts linked", zh: "个账户已关联" },
  "tout est relié": { en: "everything is linked", zh: "全部已关联" },
  "à relier : {liste}": { en: "to link: {liste}", zh: "待关联：{liste}" },
  Actifs: { en: "Active", zh: "已启用" },
  "À finir": { en: "To finish", zh: "待完成" },
  "paiements en ligne": { en: "online payments", zh: "在线收款" },
  "dossier Stripe à terminer": {
    en: "Stripe details to finish",
    zh: "Stripe 资料待完善",
  },
  "{n} relié sur {total}": {
    en: "{n} of {total} linked",
    zh: "已关联 {n}/{total}",
  },
  "{n} reliés sur {total}": {
    en: "{n} of {total} linked",
    zh: "已关联 {n}/{total}",
  },
  "Tes comptes": { en: "Your accounts", zh: "您的账户" },
  "À terminer": { en: "To finish", zh: "待完成" },
  "Terminer le dossier": { en: "Finish the setup", zh: "完成资料" },
  Connecter: { en: "Connect", zh: "连接" },
  "Connecter via Facebook": {
    en: "Connect via Facebook",
    zh: "通过 Facebook 连接",
  },
  "Ta fiche établissement, tes avis, tes horaires.": {
    en: "Your business listing, your reviews, your opening hours.",
    zh: "您的商家资料、评价和营业时间。",
  },
  "Ta note et tes avis": {
    en: "Your rating and reviews",
    zh: "您的评分和评价",
  },
  "Ta fiche et tes horaires": {
    en: "Your listing and opening hours",
    zh: "您的商家资料和营业时间",
  },
  "Tes statistiques : apparitions, appels, itinéraires": {
    en: "Your statistics: views, calls, directions",
    zh: "您的统计数据：展示、电话、路线",
  },
  "Tes recherches Google (Search Console)": {
    en: "Your Google searches (Search Console)",
    zh: "您的 Google 搜索数据（Search Console）",
  },
  "Ta page, tes publications, tes abonnés.": {
    en: "Your page, your posts, your followers.",
    zh: "您的主页、帖子和粉丝。",
  },
  "Ta page et ses publications": {
    en: "Your page and its posts",
    zh: "您的主页及其帖子",
  },
  "Tes abonnés": { en: "Your followers", zh: "您的粉丝" },
  "Se connecte en même temps que ta page Facebook.": {
    en: "Connects together with your Facebook page.",
    zh: "与您的 Facebook 主页一起连接。",
  },
  "Ton flux sur ton site vitrine": {
    en: "Your feed on your website",
    zh: "在您的官网上展示动态",
  },
  "Tes publications": { en: "Your posts", zh: "您的帖子" },
  "Acomptes, cautions et expériences payées d'avance.": {
    en: "Deposits, card holds and prepaid experiences.",
    zh: "定金、信用卡预授权和预付费体验活动。",
  },
  "Acomptes sur les privatisations": {
    en: "Deposits on private bookings",
    zh: "包场定金",
  },
  "Empreintes de carte": { en: "Card holds", zh: "信用卡预授权" },
  "Expériences payées d'avance": {
    en: "Prepaid experiences",
    zh: "预付费体验活动",
  },
  " — dossier à terminer": { en: " — setup to finish", zh: " — 资料待完善" },
  "Ton compte, tes vidéos, tes vues.": {
    en: "Your account, your videos, your views.",
    zh: "您的账户、视频和播放量。",
  },
  "Tes vidéos et tes vues": {
    en: "Your videos and views",
    zh: "您的视频和播放量",
  },

  // Le bouton Facebook
  "Connecter Facebook / Instagram": {
    en: "Connect Facebook / Instagram",
    zh: "连接 Facebook / Instagram",
  },
  "Connexion...": { en: "Connecting...", zh: "正在连接..." },
  "La connexion a échoué. Réessaie.": {
    en: "The connection failed. Try again.",
    zh: "连接失败，请重试。",
  },
  "Configuration Facebook manquante (NEXT_PUBLIC_FACEBOOK_APP_ID).": {
    en: "Facebook configuration missing (NEXT_PUBLIC_FACEBOOK_APP_ID).",
    zh: "缺少 Facebook 配置（NEXT_PUBLIC_FACEBOOK_APP_ID）。",
  },
  "Le SDK Facebook se charge encore, réessaie dans quelques secondes.": {
    en: "The Facebook SDK is still loading, try again in a few seconds.",
    zh: "Facebook SDK 仍在加载，请几秒后再试。",
  },
  "Les autorisations ont été refusées. Relance la connexion et accepte l'accès aux Pages.":
    {
      en: "Permissions were refused. Start the connection again and allow access to Pages.",
      zh: "授权被拒绝。请重新连接，并允许访问主页。",
    },
  "Connexion annulée. La fenêtre Facebook s'est fermée avant la fin.": {
    en: "Connection cancelled. The Facebook window closed before the end.",
    zh: "连接已取消。Facebook 窗口在完成前被关闭。",
  },
  "Plusieurs Pages Facebook sont associées à ton compte. Laquelle correspond à ce restaurant ?":
    {
      en: "Several Facebook Pages are linked to your account. Which one is this restaurant?",
      zh: "您的账户关联了多个 Facebook 主页。哪一个是这家餐厅的？",
    },
};
