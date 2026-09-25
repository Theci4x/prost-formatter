import type { Traductions } from "@/lib/i18n/t";

/**
 * La page Questions fréquentes. Les questions et réponses suggérées ne
 * sont pas traduites : elles partent telles quelles sur la page publique,
 * qui parle à des clients français.
 */
export const FAQ: Traductions = {
  "Questions fréquentes — {nom}": { en: "FAQ — {nom}", zh: "常见问题 — {nom}" },
  "Ces réponses s'affichent sur ta page publique et sont lues par Google et les assistants, qui les reprennent presque mot pour mot quand on leur demande si tu as une terrasse ou si tu acceptes les chiens. Accessoirement, elles épargnent autant d'appels en plein service.":
    {
      en: "These answers appear on your public page and are read by Google and AI assistants, which repeat them almost word for word when someone asks whether you have a terrace or accept dogs. As a bonus, they save you as many calls during service.",
      zh: "这些回答会显示在您的公开页面上，并被 Google 和 AI 助手读取。当有人问您是否有露台、是否允许带狗时，它们几乎会逐字引用。另外，还能帮您在营业高峰时少接很多电话。",
    },
  "Les questions et réponses s'affichent telles quelles sur ta page publique : écris-les dans la langue de tes clients.":
    {
      en: "Questions and answers appear as-is on your public page: write them in your customers' language.",
      zh: "问题和回答会原样显示在您的公开页面上：请用顾客的语言填写。",
    },
  "Voir sur mon site ↗": { en: "View on my site ↗", zh: "在我的网站上查看 ↗" },
  "Ta page répond aux {n} questions qu'on pose le plus. C'est autant d'appels que tu ne prendras pas en plein service.":
    {
      en: "Your page answers the {n} most frequently asked questions. That's as many calls you won't take during service.",
      zh: "您的页面已回答了最常见的 {n} 个问题。营业高峰时就能少接这么多电话。",
    },
  "Ta page répond à {n} question sur {total}. Pour les {reste} autres, les clients appellent — ou vont voir ailleurs.":
    {
      en: "Your page answers {n} question out of {total}. For the other {reste}, customers call — or go elsewhere.",
      zh: "您的页面回答了 {total} 个问题中的 {n} 个。其余 {reste} 个问题，顾客只能打电话——或者去别家。",
    },
  "Ta page répond à {n} questions sur {total}. Pour les {reste} autres, les clients appellent — ou vont voir ailleurs.":
    {
      en: "Your page answers {n} questions out of {total}. For the other {reste}, customers call — or go elsewhere.",
      zh: "您的页面回答了 {total} 个问题中的 {n} 个。其余 {reste} 个问题，顾客只能打电话——或者去别家。",
    },
  "Une autre question": { en: "Another question", zh: "其他问题" },
  "Sur ta page": { en: "On your page", zh: "您页面上的内容" },
  "{n} question": { en: "{n} question", zh: "{n} 个问题" },
  "{n} questions": { en: "{n} questions", zh: "{n} 个问题" },
  "Aucune question pour l'instant. Commence par les deux ou trois qu'on te pose au téléphone toutes les semaines.":
    {
      en: "No questions yet. Start with the two or three you're asked on the phone every week.",
      zh: "暂时没有问题。先从每周电话里最常被问到的两三个问题开始吧。",
    },
  "Supprimer « {question} »": {
    en: "Delete “{question}”",
    zh: "删除「{question}」",
  },

  // Réponds en un appui
  "Réponds en un appui": { en: "Answer in one tap", zh: "一键回答" },
  "Choisis la phrase qui correspond à ta maison. Tu pourras la retoucher ensuite — c'est un point de départ, pas un texte imposé.":
    {
      en: "Choose the sentence that fits your restaurant. You can edit it afterwards — it's a starting point, not a fixed text.",
      zh: "选择符合您餐厅情况的句子。之后可以再修改——这只是起点，不是固定文本。",
    },

  // Le formulaire
  "Les plus demandées — clique pour la reprendre": {
    en: "Most asked — click to use it",
    zh: "最常见的问题——点击即可使用",
  },
  "La question, telle qu'on te la pose": {
    en: "The question, as you're asked it",
    zh: "问题（按顾客的问法填写）",
  },
  "Avez-vous une terrasse ?": {
    en: "Do you have a terrace?",
    zh: "你们有露台吗？",
  },
  "Ta réponse": { en: "Your answer", zh: "您的回答" },
  "Oui, une terrasse de vingt couverts, chauffée jusqu'en novembre.": {
    en: "Yes, a terrace for twenty, heated until November.",
    zh: "有，露台可坐二十人，供暖到十一月。",
  },
  "Une ou deux phrases. C'est ce texte que les assistants reprendront, souvent mot pour mot.":
    {
      en: "One or two sentences. This is the text assistants will repeat, often word for word.",
      zh: "一两句话即可。AI 助手会引用这段文字，常常是逐字引用。",
    },
  "Question ajoutée.": { en: "Question added.", zh: "问题已添加。" },
  "Écris la question.": { en: "Write the question.", zh: "请填写问题。" },
  "Une question sans réponse ne sert à rien.": {
    en: "A question without an answer is no use.",
    zh: "没有回答的问题没有意义。",
  },
  "Enregistrement impossible. Réessaie.": {
    en: "Couldn't save. Try again.",
    zh: "无法保存，请重试。",
  },
};
