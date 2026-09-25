import type { Traductions } from "@/lib/i18n/t";

/** La page Fiche Google (connexion Business Profile). */
export const GOOGLE: Traductions = {
  Avis: { en: "Reviews", zh: "评价" },
  "Ta note Google et tes derniers avis, à côté des autres plateformes.": {
    en: "Your Google rating and latest reviews, next to the other platforms.",
    zh: "您的 Google 评分和最新评价，与其他平台并列显示。",
  },
  SEO: { en: "SEO", zh: "SEO" },
  "Les recherches Google qui mènent à tes pages, lues dans Search Console.": {
    en: "The Google searches that lead to your pages, read from Search Console.",
    zh: "从 Search Console 读取的、把顾客带到您页面的 Google 搜索。",
  },
  "Publications Google": { en: "Google posts", zh: "Google 帖子" },
  "Tes actualités et offres, préparées dans Klarr et publiées sur ta fiche.": {
    en: "Your news and offers, prepared in Klarr and published on your listing.",
    zh: "在 Klarr 中准备好的动态和优惠，发布到您的商家资料上。",
  },
  "Visibilité IA": { en: "AI visibility", zh: "AI 曝光度" },
  "Une fiche Google complète est l'une des sources que lisent les assistants.":
    {
      en: "A complete Google listing is one of the sources assistants read.",
      zh: "完整的 Google 商家资料是 AI 助手读取的信息来源之一。",
    },
  "Aucune fiche établissement trouvée sur ce compte Google.": {
    en: "No business listing found on this Google account.",
    zh: "此 Google 账户下没有找到商家资料。",
  },
  Choisie: { en: "Chosen", zh: "已选择" },
  "fiche établissement": { en: "business listing", zh: "商家资料" },
  "fiche inaccessible pour l'instant": {
    en: "listing unavailable for now",
    zh: "商家资料暂时无法访问",
  },
  "fiche trouvée, à choisir": {
    en: "listing found, to choose",
    zh: "个商家资料，待选择",
  },
  "fiches trouvées, à choisir": {
    en: "listings found, to choose",
    zh: "个商家资料，待选择",
  },
  "Google Business Profile — {nom}": {
    en: "Google Business Profile — {nom}",
    zh: "Google 商家资料 — {nom}",
  },
  "Ta fiche Google est souvent la première chose qu'un client voit de toi. Relie le compte qui la gère : Klarr y lit ta note, tes avis et les recherches qui t'amènent des clients, sans que tu aies à recopier quoi que ce soit.":
    {
      en: "Your Google listing is often the first thing a customer sees of you. Link the account that manages it: Klarr reads your rating, reviews and the searches that bring you customers, without you having to copy anything.",
      zh: "Google 商家资料往往是顾客对您的第一印象。关联管理它的账户：Klarr 会读取您的评分、评价以及带来顾客的搜索，无需您手动复制任何内容。",
    },
  Relié: { en: "Linked", zh: "已关联" },
  "compte Google": { en: "Google account", zh: "Google 账户" },
  "compte Google à relier": {
    en: "Google account to link",
    zh: "Google 账户待关联",
  },
  Auto: { en: "Auto", zh: "自动" },
  Assistées: { en: "Assisted", zh: "辅助" },
  "publications Google": { en: "Google posts", zh: "Google 帖子" },
  "publications Google, en 30 secondes": {
    en: "Google posts, in 30 seconds",
    zh: "Google 帖子，30 秒完成",
  },
  "Compte Google connecté avec succès.": {
    en: "Google account connected successfully.",
    zh: "Google 账户连接成功。",
  },
  "La connexion à Google a échoué. Réessaie.": {
    en: "The connection to Google failed. Try again.",
    zh: "连接 Google 失败，请重试。",
  },
  "Aucun compte relié": { en: "No account linked", zh: "未关联账户" },
  "Relie le compte Google qui gère ta fiche établissement : Klarr y lira ta note, tes avis, tes horaires et les recherches qui t'amènent des clients.":
    {
      en: "Link the Google account that manages your business listing: Klarr will read your rating, reviews, opening hours and the searches that bring you customers.",
      zh: "关联管理您商家资料的 Google 账户：Klarr 会读取您的评分、评价、营业时间以及带来顾客的搜索。",
    },
  "Connecter mon compte Google Business Profile": {
    en: "Connect my Google Business Profile account",
    zh: "连接我的 Google 商家资料账户",
  },
  "Fiche reliée": { en: "Listing linked", zh: "商家资料已关联" },
  "via {email}": { en: "via {email}", zh: "通过 {email}" },
  "Voir mes avis": { en: "See my reviews", zh: "查看我的评价" },
  "Changer de fiche": { en: "Change listing", zh: "更换商家资料" },
  "Déconnecter ce compte": {
    en: "Disconnect this account",
    zh: "断开此账户",
  },
  "Quelle fiche est la tienne ?": {
    en: "Which listing is yours?",
    zh: "哪个是您的商家资料？",
  },
  "Connecté en tant que {email}. Choisis la fiche établissement de ce restaurant :":
    {
      en: "Signed in as {email}. Choose this restaurant's business listing:",
      zh: "当前登录账户：{email}。请选择这家餐厅的商家资料：",
    },
  "Ce que Klarr en fait": {
    en: "What Klarr does with it",
    zh: "Klarr 如何使用",
  },

  // Les explications d'une erreur Business Profile (lib/google/erreurs)
  "L'accès à l'API Google Business Profile n'a pas encore été accordé à Klarr par Google. La demande est déposée et attend leur réponse. Ce n'est pas un réglage de votre côté : prévenez-nous à contact@klarr.net.":
    {
      en: "Google hasn't granted Klarr access to the Google Business Profile API yet. The request has been filed and is awaiting their answer. It's not a setting on your side: let us know at contact@klarr.net.",
      zh: "Google 尚未向 Klarr 开放 Google 商家资料 API。申请已提交，正在等待 Google 回复。这不是您这边的设置问题：请联系 contact@klarr.net。",
    },
  "L'API Google Business Profile n'est pas activée dans le projet Google Cloud de Klarr. Ce n'est pas un réglage de votre côté : prévenez-nous à contact@klarr.net.":
    {
      en: "The Google Business Profile API isn't enabled in Klarr's Google Cloud project. It's not a setting on your side: let us know at contact@klarr.net.",
      zh: "Klarr 的 Google Cloud 项目尚未启用 Google 商家资料 API。这不是您这边的设置问题：请联系 contact@klarr.net。",
    },
  "Le compte Google a été relié avant que Klarr demande l'accès aux fiches. Ouvrez Connexions, déconnectez Google puis reconnectez-le : l'autorisation sera demandée cette fois-ci.":
    {
      en: "The Google account was linked before Klarr asked for access to listings. Open Connections, disconnect Google then reconnect it: permission will be requested this time.",
      zh: "该 Google 账户是在 Klarr 申请商家资料权限之前关联的。请打开「账户连接」，断开 Google 后重新连接：这次会请求授权。",
    },
  "Ce compte Google n'a le droit de gérer aucune fiche d'établissement. Vérifiez qu'il figure bien comme propriétaire ou gestionnaire sur business.google.com.":
    {
      en: "This Google account isn't allowed to manage any business listing. Check that it's listed as an owner or manager on business.google.com.",
      zh: "此 Google 账户无权管理任何商家资料。请在 business.google.com 上确认它是所有者或管理员。",
    },
  "Aucune fiche d'établissement n'est rattachée à ce compte Google.": {
    en: "No business listing is attached to this Google account.",
    zh: "此 Google 账户下没有关联的商家资料。",
  },
  "Google n'a pas répondu. Si cela dure, écrivez-nous à contact@klarr.net.": {
    en: "Google didn't respond. If it continues, write to us at contact@klarr.net.",
    zh: "Google 没有响应。如果持续出现，请写信至 contact@klarr.net。",
  },
};
