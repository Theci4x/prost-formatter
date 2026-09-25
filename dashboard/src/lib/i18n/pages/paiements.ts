import type { Traductions } from "@/lib/i18n/t";

/** La page Paiements (le compte Stripe du restaurant). */
export const PAIEMENTS: Traductions = {
  "Connexion annulée : rien n'a été relié.": {
    en: "Connection cancelled: nothing was linked.",
    zh: "连接已取消：没有关联任何账户。",
  },
  "La connexion a expiré. Relance-la depuis cette page.": {
    en: "The connection expired. Start it again from this page.",
    zh: "连接已过期，请在此页面重新发起。",
  },
  "Stripe n'a pas renvoyé d'autorisation. Réessaie.": {
    en: "Stripe didn't send back an authorisation. Try again.",
    zh: "Stripe 没有返回授权，请重试。",
  },
  "Ce restaurant n'est pas le tien.": {
    en: "This restaurant isn't yours.",
    zh: "这家餐厅不属于您。",
  },
  "Stripe a refusé la connexion. Réessaie dans un instant.": {
    en: "Stripe refused the connection. Try again in a moment.",
    zh: "Stripe 拒绝了连接，请稍后再试。",
  },
  "Klarr n'est pas encore configuré pour Stripe Connect. Ce n'est pas de ton fait — préviens-nous.":
    {
      en: "Klarr isn't set up for Stripe Connect yet. It's not your doing — let us know.",
      zh: "Klarr 尚未配置 Stripe Connect。这不是您的问题——请通知我们。",
    },
  "La connexion a échoué.": {
    en: "The connection failed.",
    zh: "连接失败。",
  },
  "Ce compte Stripe est celui de Klarr lui-même : Stripe refuse qu'il encaisse pour un restaurant. Retire la connexion ci-dessous, puis relie le compte Stripe du restaurant.":
    {
      en: "This Stripe account is Klarr's own: Stripe won't let it collect payments for a restaurant. Remove the connection below, then link the restaurant's Stripe account.",
      zh: "这个 Stripe 账户是 Klarr 自己的：Stripe 不允许它为餐厅收款。请在下方移除连接，然后关联餐厅自己的 Stripe 账户。",
    },
  "Stripe ne reconnaît pas ce compte comme relié à Klarr, qui tourne en mode {mode}. La connexion a sans doute été retirée chez Stripe, ou faite dans l'autre mode. Retire-la ci-dessous, puis relie ton compte à nouveau.":
    {
      en: "Stripe doesn't recognise this account as linked to Klarr, which is running in {mode} mode. The connection was probably removed on Stripe's side, or made in the other mode. Remove it below, then link your account again.",
      zh: "Stripe 不认为此账户已关联到 Klarr（当前为{mode}模式）。连接可能已在 Stripe 端被移除，或是在另一种模式下建立的。请在下方移除，然后重新关联您的账户。",
    },
  test: { en: "test", zh: "测试" },
  réel: { en: "live", zh: "正式" },
  "Stripe vérifie encore ton dossier. Tant que c'est en cours, aucun paiement ne peut être encaissé.":
    {
      en: "Stripe is still reviewing your details. Until that's done, no payment can be collected.",
      zh: "Stripe 仍在审核您的资料。审核完成前无法收款。",
    },
  "Ton dossier Stripe est incomplet : ouvre ton tableau de bord Stripe et termine l'inscription pour encaisser.":
    {
      en: "Your Stripe details are incomplete: open your Stripe dashboard and finish signing up to collect payments.",
      zh: "您的 Stripe 资料不完整：请打开 Stripe 后台完成注册，才能收款。",
    },
  "Paiements — {nom}": { en: "Payments — {nom}", zh: "收款 — {nom}" },
  "Relie ton compte Stripe pour demander un acompte sur une privatisation, prendre une empreinte de carte en garantie, ou faire payer une expérience à l'avance. L'argent va directement chez toi : Klarr ne le touche jamais et ne prélève aucune commission.":
    {
      en: "Link your own Stripe account to ask for a deposit on a private booking, hold a card as a guarantee, or take payment for an experience in advance. The money goes straight to you: Klarr never touches it and takes no commission.",
      zh: "关联您自己的 Stripe 账户，即可为包场收取定金、预授权信用卡作为担保，或提前收取体验活动的费用。款项直接进入您的账户：Klarr 从不经手，也不收取任何佣金。",
    },
  "Ton compte Stripe est relié.": {
    en: "Your Stripe account is linked.",
    zh: "您的 Stripe 账户已关联。",
  },
  Prêt: { en: "Ready", zh: "就绪" },
  "À finir": { en: "To finish", zh: "待完成" },
  "compte Stripe à relier": {
    en: "Stripe account to link",
    zh: "Stripe 账户待关联",
  },
  "compte Stripe, prêt à encaisser": {
    en: "Stripe account, ready to collect",
    zh: "Stripe 账户，可以收款",
  },
  "dossier Stripe à terminer": {
    en: "Stripe details to finish",
    zh: "Stripe 资料待完善",
  },
  "d'acomptes encaissés": { en: "in deposits collected", zh: "已收定金" },
  "empreinte de carte en cours": {
    en: "card hold in progress",
    zh: "笔信用卡预授权进行中",
  },
  "empreintes de carte en cours": {
    en: "card holds in progress",
    zh: "笔信用卡预授权进行中",
  },
  "paiement en attente du client": {
    en: "payment awaiting the customer",
    zh: "笔付款等待顾客完成",
  },
  "paiements en attente du client": {
    en: "payments awaiting the customer",
    zh: "笔付款等待顾客完成",
  },
  "Ton compte Stripe": { en: "Your Stripe account", zh: "您的 Stripe 账户" },
  "Prêt à encaisser": { en: "Ready to collect", zh: "可以收款" },
  "Pas encore prêt": { en: "Not ready yet", zh: "尚未就绪" },
  "Compte Stripe relié": {
    en: "Linked Stripe account",
    zh: "已关联的 Stripe 账户",
  },
  "Ouvrir mon tableau de bord Stripe ↗": {
    en: "Open my Stripe dashboard ↗",
    zh: "打开我的 Stripe 后台 ↗",
  },
  "Retirer la connexion": { en: "Remove the connection", zh: "移除连接" },
  "Tes virements, tes remboursements et tes litiges restent dans ton tableau de bord Stripe, comme aujourd'hui.":
    {
      en: "Your payouts, refunds and disputes stay in your Stripe dashboard, as they do today.",
      zh: "您的转账、退款和争议仍在 Stripe 后台处理，和现在一样。",
    },
  "Aucun compte relié": { en: "No account linked", zh: "未关联账户" },
  "Tu peux relier un compte Stripe existant, ou en créer un pendant la connexion si tu n'en as pas encore. Stripe demandera une pièce d'identité et ton RIB.":
    {
      en: "You can link an existing Stripe account, or create one while connecting if you don't have one yet. Stripe will ask for ID and your bank details.",
      zh: "您可以关联已有的 Stripe 账户；如果还没有，也可以在连接过程中创建。Stripe 会要求提供身份证件和银行账户信息。",
    },
  "Connecter mon compte Stripe": {
    en: "Connect my Stripe account",
    zh: "连接我的 Stripe 账户",
  },
  "Ce que tu peux encaisser": {
    en: "What you can collect",
    zh: "您可以收取的款项",
  },
  "Un acompte sur une privatisation": {
    en: "A deposit on a private booking",
    zh: "包场定金",
  },
  "Le client verse une somme à la réservation : la salle ne se bloque pas pour rien.":
    {
      en: "The customer pays an amount when booking: the room isn't held for nothing.",
      zh: "顾客在订位时支付一笔款项：场地不会白白被占用。",
    },
  "Régler les espaces": { en: "Set up spaces", zh: "设置场地" },
  "Une empreinte de carte": { en: "A card hold", zh: "信用卡预授权" },
  "Rien n'est débité. En cas de table vide sans prévenir, tu prélèves le montant annoncé.":
    {
      en: "Nothing is charged. If the table stays empty without notice, you collect the stated amount.",
      zh: "不会扣款。如果顾客未通知就没来，您可以收取事先说明的金额。",
    },
  "Régler les garanties": { en: "Set up guarantees", zh: "设置担保" },
  "Une expérience payée d'avance": {
    en: "An experience paid in advance",
    zh: "预付费体验活动",
  },
  "Dégustation, atelier, soirée à thème : la place est payée en réservant.": {
    en: "Tasting, workshop, themed evening: the seat is paid for when booking.",
    zh: "品鉴会、工作坊、主题晚会：订位时即付款。",
  },
  "Voir les expériences": { en: "View experiences", zh: "查看体验活动" },
  "← Toutes mes connexions": {
    en: "← All my connections",
    zh: "← 我的所有连接",
  },
};
