import type { Traductions } from "@/lib/i18n/t";

/**
 * La page Visibilité IA. Les questions suivies restent dans la langue où
 * le restaurateur les écrit : ce sont celles de ses clients.
 */
export const VISIBILITE_IA: Traductions = {
  "Visibilité IA — {nom}": {
    en: "AI visibility — {nom}",
    zh: "AI 曝光度 — {nom}",
  },
  "De plus en plus de clients demandent à ChatGPT, Claude ou Gemini où aller manger. Pose les questions qu'ils poseraient : Klarr regarde si les assistants te citent, qui ils citent à ta place, et te dit quoi corriger.":
    {
      en: "More and more customers ask ChatGPT, Claude or Gemini where to eat. Ask the questions they would: Klarr checks whether the assistants mention you, who they mention instead, and tells you what to fix.",
      zh: "越来越多的顾客会问 ChatGPT、Claude 或 Gemini 去哪里吃饭。输入顾客会问的问题：Klarr 会查看 AI 助手是否推荐您、推荐了谁而不是您，并告诉您该改进什么。",
    },
  "Aucun assistant n'est configuré.": {
    en: "No assistant is set up.",
    zh: "尚未配置任何 AI 助手。",
  },
  "Les analyses ne peuvent pas être lancées tant qu'aucune clé d'API n'est renseignée. Tu peux déjà enregistrer tes questions : elles seront analysables dès qu'une clé sera en place.":
    {
      en: "Analyses can't run until an API key is entered. You can already save your questions: they'll be ready to analyse as soon as a key is in place.",
      zh: "在填写 API 密钥之前无法运行分析。您可以先保存问题：密钥配置好后即可分析。",
    },
  "Score de visibilité IA": { en: "AI visibility score", zh: "AI 曝光评分" },
  "= stable": { en: "= stable", zh: "= 持平" },
  "sur les questions réanalysées": {
    en: "on re-analysed questions",
    zh: "（仅重新分析的问题）",
  },
  "depuis la dernière analyse": {
    en: "since the last analysis",
    zh: "（与上次分析相比）",
  },
  "{n} réponse": { en: "{n} answer", zh: "{n} 条回答" },
  "{n} réponses": { en: "{n} answers", zh: "{n} 条回答" },
  "{n} assistant": { en: "{n} assistant", zh: "{n} 个助手" },
  "{n} assistants": { en: "{n} assistants", zh: "{n} 个助手" },
  "On me découvre": { en: "Discovering me", zh: "发现我" },
  "On me compare": { en: "Comparing me", zh: "比较我" },
  "On me réserve": { en: "Booking me", zh: "预订我" },
  "Le client explore un quartier ou un genre, sans idée précise. Y figurer construit la notoriété.":
    {
      en: "The customer is exploring a neighbourhood or a type of food, with no precise idea. Appearing here builds awareness.",
      zh: "顾客在浏览某个街区或某类餐厅，还没有明确目标。出现在这里能提升知名度。",
    },
  "Le client a réduit son choix et cherche le meilleur. Y figurer se dispute avec vos voisins directs.":
    {
      en: "The customer has narrowed their choice and wants the best. Appearing here is a fight with your direct neighbours.",
      zh: "顾客已经缩小了范围，正在找最好的。在这里要和附近的直接竞争对手争夺位置。",
    },
  "Le client sait ce qu'il veut et cherche où le réserver. C'est l'intention qui remplit la salle — et celle qui compte vraiment.":
    {
      en: "The customer knows what they want and is looking where to book it. This is the intent that fills the room — the one that really counts.",
      zh: "顾客已经知道自己想要什么，正在找地方预订。这是能带来客流的意图——也是真正重要的意图。",
    },
  "Rang parmi les noms cités": {
    en: "Rank among names mentioned",
    zh: "在被推荐名单中的排名",
  },
  "sur {n}": { en: "of {n}", zh: "共 {n} 个" },
  "Position moyenne quand cité": {
    en: "Average position when mentioned",
    zh: "被推荐时的平均位置",
  },
  "dans la réponse": { en: "in the answer", zh: "（回答中）" },
  "jamais cité": { en: "never mentioned", zh: "从未被推荐" },
  "Questions suivies": { en: "Questions tracked", zh: "跟踪的问题" },
  "{n} analysée": { en: "{n} analysed", zh: "{n} 个已分析" },
  "{n} analysées": { en: "{n} analysed", zh: "{n} 个已分析" },
  "Par assistant": { en: "By assistant", zh: "按助手" },
  "Comment lire ce score": {
    en: "How to read this score",
    zh: "如何理解这个评分",
  },
  "Pour chaque intention, on compte la part des réponses où tu es cité. Le score les pondère : « on me réserve » compte pour la moitié, « on me compare » pour trois dixièmes, « on me découvre » pour deux. Une intention sans analyse est simplement ignorée, elle ne te pénalise pas. Le rang te compte parmi tous les noms que les assistants ont cités sur tes questions.":
    {
      en: "For each intent, we count the share of answers that mention you. The score weights them: “booking me” counts for half, “comparing me” for three tenths, “discovering me” for two. An intent with no analysis is simply ignored and doesn't penalise you. The rank places you among all the names the assistants mentioned on your questions.",
      zh: "对每种意图，统计回答中提到您的比例。评分按权重计算：「预订我」占一半，「比较我」占十分之三，「发现我」占十分之二。没有分析的意图会被忽略，不会扣分。排名是指您在 AI 助手针对您的问题推荐的所有名字中的位置。",
    },
  "Ce que tu peux faire": { en: "What you can do", zh: "您可以做什么" },
  "Qui l'IA cite à ta place": {
    en: "Who AI mentions instead of you",
    zh: "AI 推荐了谁而不是您",
  },
  "Ta part de voix": { en: "Your share of voice", zh: "您的声量占比" },
  "Tes questions ({n})": { en: "Your questions ({n})", zh: "您的问题（{n}）" },
  "écrit le {date}": { en: "written on {date}", zh: "{date} 生成" },
  Priorité: { en: "Priority", zh: "优先" },
  "Ouvrir « {ecran} » →": { en: "Open “{ecran}” →", zh: "打开「{ecran}」→" },
  Vitrine: { en: "Website", zh: "官网" },
  Carte: { en: "Menu", zh: "菜单" },
  Photos: { en: "Photos", zh: "照片" },
  "Questions fréquentes": { en: "FAQ", zh: "常见问题" },
  "Expériences et privatisation": {
    en: "Experiences and private hire",
    zh: "体验活动和包场",
  },
  "Fiche Google": { en: "Google listing", zh: "Google 商家资料" },
  "SEO et mots-clés": { en: "SEO and keywords", zh: "SEO 和关键词" },
  Avis: { en: "Reviews", zh: "评价" },
  "Pas encore de plan. Il se déduit de tes analyses et de ta fiche — carte, photos, questions fréquentes, espaces privatisables.":
    {
      en: "No plan yet. It's drawn from your analyses and your profile — menu, photos, FAQ, private spaces.",
      zh: "暂时没有计划。计划会根据您的分析结果和资料生成——菜单、照片、常见问题、可包场的场地。",
    },
  "Réécrire le plan": { en: "Rewrite the plan", zh: "重新生成计划" },
  "Écrire mon plan d'action": {
    en: "Write my action plan",
    zh: "生成我的行动计划",
  },
  "Claude lit tes analyses et ta fiche…": {
    en: "Claude is reading your analyses and profile…",
    zh: "Claude 正在阅读您的分析和资料…",
  },
  "Quand le client veut réserver": {
    en: "When the customer wants to book",
    zh: "当顾客想预订时",
  },
  "Voir aussi toutes questions confondues": {
    en: "See also all questions combined",
    zh: "查看所有问题的汇总",
  },
  "Analyse une question « On me réserve » et ce tableau se dédoublera : tes vrais concurrents ne sont pas ceux qui partagent un mot-clé avec toi, ce sont ceux qu'on cite quand un client cherche où réserver.":
    {
      en: "Analyse a “Booking me” question and this table will split in two: your real competitors aren't those who share a keyword with you, they're the ones mentioned when a customer is looking where to book.",
      zh: "分析一个「预订我」类的问题，这个表格就会分成两部分：您真正的竞争对手不是和您共享关键词的店，而是顾客想预订时被推荐的店。",
    },
  "Tes questions": { en: "Your questions", zh: "您的问题" },
  "Une question que poserait un client": {
    en: "A question a customer would ask",
    zh: "顾客可能会问的问题",
  },
  "ex : où réserver pour un anniversaire dans le 11e ?": {
    en: "e.g.: où réserver pour un anniversaire dans le 11e ?",
    zh: "例如：où réserver pour un anniversaire dans le 11e ?",
  },
  "Ce que le client cherche": {
    en: "What the customer wants",
    zh: "顾客的意图",
  },
  "Commencer : proposer six questions": {
    en: "Start: suggest six questions",
    zh: "开始：推荐六个问题",
  },
  "Proposer d'autres questions": {
    en: "Suggest more questions",
    zh: "推荐更多问题",
  },
  "Le modèle écrit tes questions…": {
    en: "The model is writing your questions…",
    zh: "模型正在生成问题…",
  },
  "Les propositions partent de tes mots-clés et, si ton compte Google est relié, des requêtes réellement tapées par ceux qui t'ont trouvé.":
    {
      en: "Suggestions come from your keywords and, if your Google account is linked, from the searches actually typed by people who found you. They're written in French, like your customers' questions.",
      zh: "推荐基于您的关键词；如果关联了 Google 账户，还会参考找到您的顾客实际搜索的内容。问题用法语撰写，与您顾客的提问方式一致。",
    },
  "cité {part} % · {citees}/{analysees}": {
    en: "mentioned {part}% · {citees}/{analysees}",
    zh: "被推荐 {part}% · {citees}/{analysees}",
  },
  "Assistants interrogés aujourd'hui : {liste}. Les autres s'activeront automatiquement dès que leur clé d'API sera renseignée. Les analyses portent sur les connaissances propres de chaque assistant ; les réponses affichées dans les applications grand public (qui vont chercher sur le web en direct) demanderaient un accès supplémentaire.":
    {
      en: "Assistants queried today: {liste}. The others will switch on automatically once their API key is entered. Analyses cover each assistant's own knowledge; the answers shown in consumer apps (which search the web live) would need additional access.",
      zh: "今天查询的助手：{liste}。其他助手在填写 API 密钥后会自动启用。分析基于每个助手自身的知识；消费级应用中显示的回答（会实时联网搜索）需要额外的访问权限。",
    },
  aucun: { en: "none", zh: "无" },

  // Le démarrage
  "Pose les questions de tes clients": {
    en: "Ask your customers' questions",
    zh: "输入顾客会问的问题",
  },
  "Six sont proposées d'un clic, à partir de tes mots-clés et de ce que tes clients tapent sur Google.":
    {
      en: "Six are suggested in one click, from your keywords and what your customers type on Google.",
      zh: "一键即可获得六个推荐问题，基于您的关键词和顾客在 Google 上的搜索。",
    },
  "Lance une analyse": { en: "Run an analysis", zh: "运行分析" },
  "Chaque assistant configuré répond comme il le ferait à un client. On note si tu es cité, à quelle place, et qui l'est à ta place.":
    {
      en: "Each configured assistant answers as it would to a customer. We note whether you're mentioned, in what position, and who is instead.",
      zh: "每个已配置的助手都会像回答顾客一样作答。我们记录您是否被推荐、排在第几，以及谁被推荐而不是您。",
    },
  "Applique ton plan": { en: "Apply your plan", zh: "执行计划" },
  "Claude croise les réponses et ta fiche Klarr pour te dire quoi corriger, et où.":
    {
      en: "Claude cross-checks the answers with your Klarr profile to tell you what to fix, and where.",
      zh: "Claude 会对照回答和您的 Klarr 资料，告诉您该改进什么、在哪里改。",
    },
  "Trois pas pour obtenir ton premier score. Compte cinq minutes, dont une à attendre les assistants.":
    {
      en: "Three steps to get your first score. Allow five minutes, one of them waiting for the assistants.",
      zh: "三步即可获得第一个评分。大约五分钟，其中一分钟是等待 AI 助手回答。",
    },
  "Commence par « Proposer six questions », juste en dessous : six questions prêtes en un clic.":
    {
      en: "Start with “Suggest six questions”, just below: six questions ready in one click.",
      zh: "从下方的「推荐六个问题」开始：一键生成六个问题。",
    },
  "{n} question prête — lance une analyse ci-dessous.": {
    en: "{n} question ready — run an analysis below.",
    zh: "{n} 个问题已就绪——请在下方运行分析。",
  },
  "{n} questions prêtes — lance une analyse ci-dessous.": {
    en: "{n} questions ready — run an analysis below.",
    zh: "{n} 个问题已就绪——请在下方运行分析。",
  },

  // Le palmarès
  "tu es #{rang} sur {total}": {
    en: "you're #{rang} of {total}",
    zh: "您排第 {rang}，共 {total} 个",
  },
  "Nombre de réponses où chaque nom apparaît, sur les {n} analysées. Toi compris.":
    {
      en: "Number of answers where each name appears, out of the {n} analysed. You included.",
      zh: "在已分析的 {n} 条回答中，每个名字出现的次数。包括您自己。",
    },
  "… {n} autre nom cité": {
    en: "… {n} other name mentioned",
    zh: "……还有 {n} 个名字",
  },
  "… {n} autres noms cités": {
    en: "… {n} other names mentioned",
    zh: "……还有 {n} 个名字",
  },
  toi: { en: "you", zh: "您" },

  // Une question
  "Supprimer la question": { en: "Delete the question", zh: "删除问题" },
  cité: { en: "mentioned", zh: "被推荐" },
  "cité #{rang}": { en: "mentioned #{rang}", zh: "被推荐 #{rang}" },
  "non cité": { en: "not mentioned", zh: "未被推荐" },
  "Voir les réponses complètes": {
    en: "See the full answers",
    zh: "查看完整回答",
  },
  "Cités à ta place : {liste}": {
    en: "Mentioned instead of you: {liste}",
    zh: "被推荐而不是您的：{liste}",
  },
  "Pas encore analysée.": { en: "Not analysed yet.", zh: "尚未分析。" },
  "Relancer l'analyse": { en: "Run the analysis again", zh: "重新分析" },
  Analyser: { en: "Analyse", zh: "分析" },
  "Les assistants répondent… (30 s à 1 min)": {
    en: "The assistants are answering… (30 s to 1 min)",
    zh: "AI 助手正在回答…（30 秒至 1 分钟）",
  },

  // La part de voix
  "Part de voix": { en: "Share of voice", zh: "声量占比" },
  "Sur tous les noms d'établissements que les assistants ont cités dans tes analyses, {n} % sont le tien. Le taux de citation dit si tu figures dans la réponse ; la part de voix dit quelle place tu y prends.":
    {
      en: "Of all the restaurant names the assistants mentioned in your analyses, {n}% are yours. The mention rate says whether you appear in the answer; share of voice says how much room you take in it.",
      zh: "在 AI 助手于您的分析中提到的所有餐厅名字里，有 {n}% 是您。推荐率表示您是否出现在回答中；声量占比表示您在回答中占多大分量。",
    },
  "{reponses} réponse sur {jours} jour d'analyse": {
    en: "{reponses} answer over {jours} day of analysis",
    zh: "{jours} 天分析中的 {reponses} 条回答",
  },
  "{reponses} réponse sur {jours} jours d'analyse": {
    en: "{reponses} answer over {jours} days of analysis",
    zh: "{jours} 天分析中的 {reponses} 条回答",
  },
  "{reponses} réponses sur {jours} jour d'analyse": {
    en: "{reponses} answers over {jours} day of analysis",
    zh: "{jours} 天分析中的 {reponses} 条回答",
  },
  "{reponses} réponses sur {jours} jours d'analyse": {
    en: "{reponses} answers over {jours} days of analysis",
    zh: "{jours} 天分析中的 {reponses} 条回答",
  },
  "Voir les valeurs": { en: "See the values", zh: "查看数值" },
  "Part des réponses citant chaque établissement, jour par jour.": {
    en: "Share of answers mentioning each restaurant, day by day.",
    zh: "每天提到各餐厅的回答占比。",
  },
  Jour: { en: "Day", zh: "日期" },
  "Part des réponses citant {nom} et ses concurrents, du {debut} au {fin}.": {
    en: "Share of answers mentioning {nom} and its competitors, from {debut} to {fin}.",
    zh: "{debut} 至 {fin} 期间，提到 {nom} 及其竞争对手的回答占比。",
  },
  "La courbe apparaîtra à ta deuxième analyse.": {
    en: "The chart will appear with your second analysis.",
    zh: "第二次分析后会显示曲线。",
  },
  "Une part de voix ne vaut que comparée à celle d'avant. Relance une analyse dans quelques jours — après avoir travaillé ton plan d'action — et tu verras si le travail a payé.":
    {
      en: "A share of voice only means something compared with the previous one. Run another analysis in a few days — after working on your action plan — and you'll see whether it paid off.",
      zh: "声量占比只有和之前比较才有意义。执行行动计划几天后再运行一次分析，就能看到效果。",
    },

  // Les messages des actions
  "Établissement introuvable.": {
    en: "Restaurant not found.",
    zh: "找不到该餐厅。",
  },
  "Question introuvable.": { en: "Question not found.", zh: "找不到该问题。" },
  "Aucun assistant n'a répondu. Réessaie dans un instant.": {
    en: "No assistant responded. Try again in a moment.",
    zh: "没有助手响应，请稍后再试。",
  },
  "L'analyse a abouti mais n'a pas pu être enregistrée.": {
    en: "The analysis finished but couldn't be saved.",
    zh: "分析已完成，但无法保存。",
  },
  "L'analyse a échoué. Réessaie dans un instant.": {
    en: "The analysis failed. Try again in a moment.",
    zh: "分析失败，请稍后再试。",
  },
  "Réponse inattendue du modèle. Réessaie.": {
    en: "Unexpected answer from the model. Try again.",
    zh: "模型返回了意外的结果，请重试。",
  },
  "Le modèle n'a proposé aucune question. Réessaie.": {
    en: "The model didn't suggest any questions. Try again.",
    zh: "模型没有推荐任何问题，请重试。",
  },
  "Les questions n'ont pas pu être enregistrées.": {
    en: "The questions couldn't be saved.",
    zh: "无法保存问题。",
  },
  "La proposition a échoué. Réessaie dans un instant.": {
    en: "Suggesting failed. Try again in a moment.",
    zh: "推荐失败，请稍后再试。",
  },
  "Analyse d'abord une question : le plan en découle.": {
    en: "Analyse a question first: the plan comes from it.",
    zh: "请先分析一个问题：计划是根据分析生成的。",
  },
  "Le modèle n'a proposé aucune action. Réessaie.": {
    en: "The model didn't suggest any actions. Try again.",
    zh: "模型没有给出任何行动建议，请重试。",
  },
  "Le plan n'a pas pu être enregistré.": {
    en: "The plan couldn't be saved.",
    zh: "无法保存计划。",
  },
  "Le plan n'a pas pu être écrit. Réessaie dans un instant.": {
    en: "The plan couldn't be written. Try again in a moment.",
    zh: "无法生成计划，请稍后再试。",
  },
  "Trop d'analyses aujourd'hui. Le compteur repart demain — écris-moi si tu en as vraiment besoin de plus.":
    {
      en: "Too many analyses today. The counter resets tomorrow — write to me if you really need more.",
      zh: "今天的分析次数已达上限。计数明天重置——如确实需要更多，请联系我。",
    },
  "Trop de propositions de questions aujourd'hui. Le compteur repart demain.": {
    en: "Too many question suggestions today. The counter resets tomorrow.",
    zh: "今天的问题推荐次数已达上限。计数明天重置。",
  },
  "Trop de plans écrits aujourd'hui. Le compteur repart demain.": {
    en: "Too many plans written today. The counter resets tomorrow.",
    zh: "今天生成计划的次数已达上限。计数明天重置。",
  },
};
