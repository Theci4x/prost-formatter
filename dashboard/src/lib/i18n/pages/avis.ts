import type { Traductions } from "@/lib/i18n/t";

/** La page Avis du tableau de bord : la page, les tuiles, les cartes, les réponses. */
export const AVIS: Traductions = {
  // La page
  "Avis — {nom}": { en: "Reviews — {nom}", zh: "评价 — {nom}" },
  "Migration à passer :": {
    en: "Migration to run:",
    zh: "需要执行数据库迁移：",
  },
  "le suivi des réponses (supabase/migrations/0081_avis_reponses.sql) n'est pas encore en place. Tu peux déjà rédiger et copier tes réponses ; « J'ai publié » s'enregistrera une fois la migration passée.":
    {
      en: "reply tracking (supabase/migrations/0081_avis_reponses.sql) isn't in place yet. You can already draft and copy your replies; “I've published” will be saved once the migration has run.",
      zh: "回复跟踪（supabase/migrations/0081_avis_reponses.sql）尚未启用。您已经可以撰写并复制回复；迁移完成后，「我已发布」才会被保存。",
    },
  "Klarr rédige une réponse pour chaque avis, dans la langue du client. En attendant que Google ouvre la publication directe, copie-la, colle-la sous l'avis, puis coche « J'ai publié » : l'avis sort de la liste à traiter.":
    {
      en: "Klarr drafts a reply to every review, in the customer's language. Until Google opens direct publishing, copy it, paste it under the review, then tick “I've published”: the review leaves the to-do list.",
      zh: "Klarr 会用顾客的语言为每条评价撰写回复。在 Google 开放直接发布之前，请复制回复，粘贴到评价下方，然后点击「我已发布」：该评价就会移出待处理列表。",
    },
  "Demander un avis le lendemain": {
    en: "Ask for a review the next day",
    zh: "第二天邀请顾客评价",
  },
  "Retours clients privés": {
    en: "Private customer feedback",
    zh: "顾客私下反馈",
  },
  "note moyenne, toutes plateformes": {
    en: "average rating, all platforms",
    zh: "平均评分（所有平台）",
  },
  "note moyenne": { en: "average rating", zh: "平均评分" },
  "avis au total": { en: "reviews in total", zh: "条评价（总计）" },
  "avis de 3 étoiles ou moins sans réponse": {
    en: "reviews of 3 stars or less without a reply",
    zh: "条三星及以下的评价未回复",
  },
  "derniers avis avec une réponse": {
    en: "latest reviews with a reply",
    zh: "条最新评价已回复",
  },
  "Tous · {n}": { en: "All · {n}", zh: "全部 · {n}" },
  "À traiter · {n}": { en: "To handle · {n}", zh: "待处理 · {n}" },
  "Sans réponse · {n}": { en: "No reply · {n}", zh: "未回复 · {n}" },
  "Charger les derniers avis Tripadvisor": {
    en: "Load the latest Tripadvisor reviews",
    zh: "加载最新的 Tripadvisor 评价",
  },
  "l'établissement que tu as choisi": {
    en: "the restaurant you chose",
    zh: "您选择的餐厅",
  },
  "nom visible en chargeant les avis": {
    en: "name shown once reviews are loaded",
    zh: "加载评价后显示名称",
  },
  "Derniers avis": { en: "Latest reviews", zh: "最新评价" },
  "Les plateformes n'en transmettent que quelques-uns — les plus récents ou les plus pertinents selon elles.":
    {
      en: "Platforms only pass on a few — the most recent or the most relevant in their view.",
      zh: "各平台只会提供少量评价——它们认为最新或最相关的那些。",
    },
  "Aucun avis à afficher pour l'instant — la raison est indiquée sur chaque plateforme, au-dessus.":
    {
      en: "No reviews to show yet — the reason is given on each platform, above.",
      zh: "暂时没有可显示的评价——原因已在上方各平台中说明。",
    },
  "Répondre à un autre avis": {
    en: "Reply to another review",
    zh: "回复其他评价",
  },
  "Google ne transmet que cinq avis, pas forcément les plus récents. Pour les autres — ou ceux de TheFork et d'ailleurs — colle l'avis ici : Klarr propose la réponse, tu la copies.":
    {
      en: "Google only passes on five reviews, not necessarily the most recent. For the others — or those from TheFork and elsewhere — paste the review here: Klarr suggests the reply, you copy it.",
      zh: "Google 只提供五条评价，而且不一定是最新的。其他评价——或来自 TheFork 等平台的评价——请粘贴到这里：Klarr 会给出回复建议，您复制即可。",
    },

  // Les tuiles de plateforme
  "{note} sur 5": { en: "{note} out of 5", zh: "{note} 分（满分 5）" },
  "Non configuré — ajoutez une clé API {label} pour l'activer.": {
    en: "Not set up — add a {label} API key to turn it on.",
    zh: "未配置——添加 {label} API 密钥即可启用。",
  },
  "Premier relevé {label} la nuit prochaine.": {
    en: "First {label} check tonight.",
    zh: "今晚将首次读取 {label} 数据。",
  },
  "Établissement introuvable sur {label}.": {
    en: "Restaurant not found on {label}.",
    zh: "在 {label} 上找不到该餐厅。",
  },
  "Relevé le {date} — mise à jour la nuit prochaine.": {
    en: "Checked on {date} — updated tonight.",
    zh: "{date} 读取——今晚更新。",
  },
  "Relevé le {date}. Klarr relève {label} une fois par semaine.": {
    en: "Checked on {date}. Klarr checks {label} once a week.",
    zh: "{date} 读取。Klarr 每周读取一次 {label}。",
  },
  "Votre fiche {label} est marquée « fermée temporairement ». Tant que c'est le cas, {label} ne transmet plus vos avis — ils reviendront d'eux-mêmes à la réouverture.":
    {
      en: "Your {label} listing is marked “temporarily closed”. While it is, {label} no longer passes on your reviews — they'll come back on their own when you reopen.",
      zh: "您的 {label} 商家资料被标记为「暂停营业」。在此期间，{label} 不再提供您的评价——重新营业后会自动恢复。",
    },
  "{label} affiche {n} avis mais n'en transmet aucun pour le moment. Ils restent lisibles sur la fiche.":
    {
      en: "{label} shows {n} reviews but isn't passing any on for now. They can still be read on the listing.",
      zh: "{label} 显示有 {n} 条评价，但目前没有提供任何一条。您仍可在商家页面上查看。",
    },
  "Aucun avis sur {label} pour le moment.": {
    en: "No reviews on {label} yet.",
    zh: "{label} 上暂时没有评价。",
  },
  "{n} à lire": { en: "{n} to read", zh: "{n} 条待读" },
  "{n} avis": { en: "{n} reviews", zh: "{n} 条评价" },
  "Voir la fiche {label} →": {
    en: "View the {label} listing →",
    zh: "查看 {label} 页面 →",
  },

  // Les cartes d'avis
  "À traiter en premier": { en: "Handle first", zh: "优先处理" },
  "Note sans commentaire.": {
    en: "Rating with no comment.",
    zh: "仅评分，无文字。",
  },

  // La réponse
  "Répondu le {date}": { en: "Replied on {date}", zh: "{date} 已回复" },
  "Modifier la réponse": { en: "Edit the reply", zh: "修改回复" },
  "Remettre dans « sans réponse »": {
    en: "Move back to “no reply”",
    zh: "移回「未回复」",
  },
  "Rédaction…": { en: "Writing…", zh: "正在撰写…" },
  "Proposer une autre réponse": {
    en: "Suggest another reply",
    zh: "换一个回复",
  },
  "Proposer une réponse": { en: "Suggest a reply", zh: "生成回复建议" },
  "Écrire moi-même": { en: "Write it myself", zh: "自己写" },
  "Merci pour votre visite…": {
    en: "Thank you for your visit…",
    zh: "感谢您的光临…",
  },
  "Copiée ✓": { en: "Copied ✓", zh: "已复制 ✓" },
  "Ouvrir l'avis pour coller la réponse ↗": {
    en: "Open the review to paste the reply ↗",
    zh: "打开评价并粘贴回复 ↗",
  },
  "J'ai publié cette réponse": {
    en: "I've published this reply",
    zh: "我已发布此回复",
  },
  "Relis avant de publier : c'est ton nom sous la réponse.": {
    en: "Read it over before publishing: it's your name under the reply.",
    zh: "发布前请再读一遍：回复下方署的是您的名字。",
  },

  // Répondre à un avis collé à la main
  Plateforme: { en: "Platform", zh: "平台" },
  Note: { en: "Rating", zh: "评分" },
  "{n} étoile": { en: "{n} star", zh: "{n} 星" },
  "{n} étoiles": { en: "{n} stars", zh: "{n} 星" },
  "Prénom du client": { en: "Customer's first name", zh: "顾客名字" },
  facultatif: { en: "optional", zh: "选填" },
  "L'avis": { en: "The review", zh: "评价内容" },
  "Colle ici le texte de l'avis": {
    en: "Paste the review text here",
    zh: "在此粘贴评价内容",
  },
  Autre: { en: "Other", zh: "其他" },

  // Tripadvisor : le bon établissement
  Confirmé: { en: "Confirmed", zh: "已确认" },
  "Trouvé automatiquement": { en: "Found automatically", zh: "自动找到" },
  "Aucun établissement associé.": {
    en: "No restaurant linked.",
    zh: "尚未关联餐厅。",
  },
  "Ce n'est pas mon établissement": {
    en: "That's not my restaurant",
    zh: "这不是我的餐厅",
  },
  "Le chercher": { en: "Find it", zh: "查找" },
  "Cherche ton établissement": {
    en: "Find your restaurant",
    zh: "查找您的餐厅",
  },
  "Nom du restaurant et ville": {
    en: "Restaurant name and town",
    zh: "餐厅名称和城市",
  },
  "Recherche…": { en: "Searching…", zh: "正在搜索…" },
  Chercher: { en: "Search", zh: "搜索" },
  "Revenir à la recherche automatique": {
    en: "Go back to automatic search",
    zh: "恢复自动查找",
  },

  // Les messages des actions
  "La rédaction automatique nécessite une clé d'API Anthropic, pas encore configurée.":
    {
      en: "Automatic drafting needs an Anthropic API key, which isn't set up yet.",
      zh: "自动撰写需要 Anthropic API 密钥，目前尚未配置。",
    },
  "Restaurant introuvable.": {
    en: "Restaurant not found.",
    zh: "找不到该餐厅。",
  },
  "Klarr n'a pas pu proposer de réponse à cet avis. Écris-la toi-même, ou réessaie.":
    {
      en: "Klarr couldn't suggest a reply to this review. Write it yourself, or try again.",
      zh: "Klarr 无法为这条评价生成回复。请自己撰写，或再试一次。",
    },
  "La rédaction n'a rien donné. Réessaie dans un instant.": {
    en: "The draft came back empty. Try again in a moment.",
    zh: "没有生成任何内容，请稍后再试。",
  },
  "La rédaction a échoué. Réessaie dans un instant.": {
    en: "Drafting failed. Try again in a moment.",
    zh: "撰写失败，请稍后再试。",
  },
  "Donne au moins trois caractères.": {
    en: "Enter at least three characters.",
    zh: "请至少输入三个字符。",
  },
  "Aucun établissement trouvé. Essaie en ajoutant la ville.": {
    en: "No restaurant found. Try adding the town.",
    zh: "没有找到餐厅。请尝试加上城市名。",
  },
  "Tripadvisor n'a pas répondu. Réessaie dans un instant.": {
    en: "Tripadvisor didn't respond. Try again in a moment.",
    zh: "Tripadvisor 没有响应，请稍后再试。",
  },
};
