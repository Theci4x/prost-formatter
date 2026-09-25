import type { Traductions } from "@/lib/i18n/t";

/** La page Équipe et le formulaire d'ajout. */
export const EQUIPE: Traductions = {
  Propriétaire: { en: "Owner", zh: "店主" },
  Gérant: { en: "Manager", zh: "店长" },
  Service: { en: "Staff", zh: "服务员" },
  "Tout, y compris l'abonnement et l'équipe.": {
    en: "Everything, including the subscription and the team.",
    zh: "所有权限，包括订阅和团队管理。",
  },
  "Tout le quotidien, sauf l'abonnement, Stripe et l'équipe.": {
    en: "All day-to-day work, except the subscription, Stripe and the team.",
    zh: "所有日常事务，订阅、Stripe 和团队管理除外。",
  },
  "Les réservations et l'écran de salle, rien d'autre.": {
    en: "Bookings and the floor screen, nothing else.",
    zh: "仅限订位和前厅屏幕。",
  },
  "Équipe — {nom}": { en: "Team — {nom}", zh: "团队 — {nom}" },
  "Chacun se connecte avec son propre compte. Un serveur voit les réservations et l'écran de salle ; il ne voit ni ta fiche Google, ni tes réseaux, ni ton abonnement.":
    {
      en: "Everyone signs in with their own account. A server sees bookings and the floor screen; they don't see your Google listing, your social media or your subscription.",
      zh: "每个人都用自己的账户登录。服务员可以看到订位和前厅屏幕，但看不到您的 Google 商家资料、社交媒体和订阅信息。",
    },
  "personne dans l'équipe": { en: "person on the team", zh: "位团队成员" },
  "personnes dans l'équipe": { en: "people on the team", zh: "位团队成员" },
  gérant: { en: "manager", zh: "位店长" },
  gérants: { en: "managers", zh: "位店长" },
  "en service": { en: "on staff", zh: "位服务员" },
  "compte pas encore créé": {
    en: "account not created yet",
    zh: "个账户尚未创建",
  },
  "comptes pas encore créés": {
    en: "accounts not created yet",
    zh: "个账户尚未创建",
  },
  "{n} personne": { en: "{n} person", zh: "{n} 人" },
  "{n} personnes": { en: "{n} people", zh: "{n} 人" },
  "Ton équipe": { en: "Your team", zh: "您的团队" },
  Toi: { en: "You", zh: "你" },
  "Compte actif": { en: "Active account", zh: "账户已启用" },
  "Doit créer son compte avec cette adresse": {
    en: "Needs to create an account with this address",
    zh: "需要用此邮箱创建账户",
  },
  "Ajouter quelqu'un": { en: "Add someone", zh: "添加成员" },
  "Seul le propriétaire de l'établissement peut ajouter ou retirer quelqu'un.":
    {
      en: "Only the restaurant's owner can add or remove someone.",
      zh: "只有餐厅店主可以添加或移除成员。",
    },
  "Qui voit quoi": { en: "Who sees what", zh: "权限一览" },
  Accès: { en: "Access", zh: "权限" },
  "Réservations et écran de salle": {
    en: "Bookings and floor screen",
    zh: "订位和前厅屏幕",
  },
  "Carte, photos, site, avis, visibilité": {
    en: "Menu, photos, website, reviews, visibility",
    zh: "菜单、照片、官网、评价、曝光",
  },
  "Fichier client et campagnes": {
    en: "Customer list and campaigns",
    zh: "顾客档案和营销活动",
  },
  "Abonnement, Stripe et équipe": {
    en: "Subscription, Stripe and team",
    zh: "订阅、Stripe 和团队",
  },
  "← Mes restaurants": { en: "← My restaurants", zh: "← 我的餐厅" },

  // Le formulaire
  "Adresse e-mail": { en: "Email address", zh: "邮箱地址" },
  "jean@exemple.fr": { en: "jane@example.com", zh: "wang@example.com" },
  Rôle: { en: "Role", zh: "角色" },
  "Klarr n'envoie pas encore d'e-mail : dis-lui de créer son compte sur klarr.net avec exactement cette adresse. Il retrouvera l'établissement à sa première connexion.":
    {
      en: "Klarr doesn't send an email yet: tell them to create their account on klarr.net with exactly this address. They'll find the restaurant when they first sign in.",
      zh: "Klarr 暂时不会发送邀请邮件：请让对方用这个邮箱在 klarr.net 上注册账户。首次登录时就能看到这家餐厅。",
    },
  "Ajout…": { en: "Adding…", zh: "正在添加…" },
  "Ajouter à l'équipe": { en: "Add to the team", zh: "添加到团队" },
  "Seul le propriétaire peut composer l'équipe.": {
    en: "Only the owner can build the team.",
    zh: "只有店主可以管理团队。",
  },
  "Indique une adresse e-mail valide.": {
    en: "Enter a valid email address.",
    zh: "请输入有效的邮箱地址。",
  },
  "Cette adresse fait déjà partie de l'équipe.": {
    en: "This address is already on the team.",
    zh: "此邮箱已在团队中。",
  },
  "L'ajout a échoué. Réessaie dans un instant.": {
    en: "Adding failed. Try again in a moment.",
    zh: "添加失败，请稍后再试。",
  },
};
