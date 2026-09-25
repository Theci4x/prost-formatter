import type { Traductions } from "@/lib/i18n/t";

/** La fiche de l'établissement : modifier, créer, et le formulaire commun. */
export const FICHE: Traductions = {
  // Modifier
  "Modifier {nom}": { en: "Edit {nom}", zh: "修改 {nom}" },
  "La fiche de ta maison : ce qu'elle est, où elle se trouve et quand elle ouvre. Klarr la reprend partout — site vitrine, page de réservation, questions posées aux assistants IA.":
    {
      en: "Your restaurant's profile: what it is, where it is and when it's open. Klarr uses it everywhere — website, booking page, questions asked to AI assistants.",
      zh: "您餐厅的基本资料：是什么、在哪里、什么时候营业。Klarr 会在各处使用它——官网、订位页面，以及向 AI 助手提出的问题。",
    },
  "champs de la fiche remplis": {
    en: "profile fields filled in",
    zh: "项资料已填写",
  },
  "jour d'ouverture par semaine": {
    en: "day open per week",
    zh: "天每周营业",
  },
  "jours d'ouverture par semaine": {
    en: "days open per week",
    zh: "天每周营业",
  },
  "{n} h": { en: "{n} h", zh: "{n} 小时" },
  "d'ouverture par semaine": { en: "open per week", zh: "每周营业时长" },
  "Où ces informations apparaissent": {
    en: "Where this information appears",
    zh: "这些信息会出现在哪里",
  },
  "Site vitrine": { en: "Website", zh: "官网" },
  "Nom, adresse, horaires et description, en tête de ta page.": {
    en: "Name, address, opening hours and description, at the top of your page.",
    zh: "名称、地址、营业时间和介绍，显示在页面顶部。",
  },
  "Page de réservation": { en: "Booking page", zh: "订位页面" },
  "Le nom et l'adresse que voit le client au moment de réserver.": {
    en: "The name and address the customer sees when booking.",
    zh: "顾客订位时看到的名称和地址。",
  },
  "Visibilité IA": { en: "AI visibility", zh: "AI 曝光度" },
  "Type de cuisine et description servent à vérifier si les assistants te citent.":
    {
      en: "Cuisine type and description are used to check whether assistants mention you.",
      zh: "菜系和介绍用于检查 AI 助手是否会推荐您。",
    },

  // Créer
  "Ajouter un restaurant": { en: "Add a restaurant", zh: "添加餐厅" },
  "Le nom suffit pour commencer : tout le reste se complète ou se corrige plus tard, depuis « Modifier ». Ces informations alimentent ton site vitrine, ta page de réservation et ce que les assistants IA savent de toi.":
    {
      en: "The name is enough to get started: everything else can be filled in or corrected later, from “Edit”. This information feeds your website, your booking page and what AI assistants know about you.",
      zh: "填写名称即可开始：其余内容都可以稍后在「修改」中补充或更正。这些信息会用于您的官网、订位页面，以及 AI 助手对您的了解。",
    },
  "seul champ obligatoire : le nom": {
    en: "required field only: the name",
    zh: "项必填：名称",
  },
  "2 min": { en: "2 min", zh: "2 分钟" },
  "pour remplir la fiche": { en: "to fill in the profile", zh: "即可填完资料" },
  "14 j": { en: "14 days", zh: "14 天" },
  "d'essai, dès la création": {
    en: "free trial, from creation",
    zh: "免费试用，创建即开始",
  },
  "Créer le restaurant": { en: "Create the restaurant", zh: "创建餐厅" },
  "Et ensuite": { en: "What's next", zh: "接下来" },
  "Ta carte et tes photos": { en: "Your menu and photos", zh: "菜单和照片" },
  "Les plats, les allergènes et quelques belles photos : c'est ce que les clients regardent avant de réserver.":
    {
      en: "Dishes, allergens and a few nice photos: that's what customers look at before booking.",
      zh: "菜品、过敏原和几张好看的照片：这是顾客订位前会看的内容。",
    },
  "Ta page de réservation": { en: "Your booking page", zh: "订位页面" },
  "Tes services, tes salles et tes tables. Les demandes arrivent ensuite dans ton carnet, sans commission.":
    {
      en: "Your services, rooms and tables. Requests then arrive in your booking book, with no commission.",
      zh: "设置营业时段、场地和餐桌。之后订位请求会直接进入您的订位簿，不收佣金。",
    },
  "Ton site vitrine": { en: "Your website", zh: "您的官网" },
  "Il se construit avec la fiche, la carte et les photos. Tu le publies quand il te plaît.":
    {
      en: "It's built from your profile, menu and photos. You publish it whenever you like.",
      zh: "官网由资料、菜单和照片自动生成。您可以随时发布。",
    },

  // Le formulaire
  "L'établissement": { en: "The restaurant", zh: "餐厅信息" },
  "Ce que voient tes clients sur ton site vitrine et ta page de réservation.": {
    en: "What your customers see on your website and booking page.",
    zh: "顾客在官网和订位页面上看到的内容。",
  },
  Nom: { en: "Name", zh: "名称" },
  Adresse: { en: "Address", zh: "地址" },
  Téléphone: { en: "Phone", zh: "电话" },
  "Site web": { en: "Website", zh: "网站" },
  "Type de cuisine": { en: "Cuisine type", zh: "菜系" },
  "(ce que cherchent Google et les assistants)": {
    en: "(what Google and assistants search for)",
    zh: "（Google 和 AI 助手搜索的依据）",
  },
  "Sépare par des virgules. C'est ce qui permet d'être proposé sur « restaurant allemand près de République ».":
    {
      en: "Separate with commas. It's what gets you suggested for “German restaurant near République”.",
      zh: "用逗号分隔。这样才能出现在「共和广场附近的德国餐厅」这类搜索中。",
    },
  "Allemande, brasserie": { en: "German, brasserie", zh: "德国菜，啤酒馆" },
  Description: { en: "Description", zh: "介绍" },
  "Ta cuisine, ton ambiance, ce qui te distingue — en quelques phrases.": {
    en: "Your food, your atmosphere, what sets you apart — in a few sentences.",
    zh: "用几句话介绍您的菜品、氛围和特色。",
  },
  "{n} caractères · idéal {min} à {max}": {
    en: "{n} characters · ideally {min} to {max}",
    zh: "{n} 个字符 · 建议 {min} 至 {max}",
  },
  "Horaires d'ouverture": { en: "Opening hours", zh: "营业时间" },
  "Ceux de ta devanture, pas tes créneaux de réservation. Active « Coupure » si tu fermes entre le déjeuner et le dîner.":
    {
      en: "The hours on your door, not your booking slots. Turn on “Break” if you close between lunch and dinner.",
      zh: "填写门店的营业时间，而不是订位时段。如果午餐和晚餐之间休息，请开启「中间休息」。",
    },
  "{n} jour sur 7": { en: "{n} day out of 7", zh: "每周 {n} 天" },
  "{n} jours sur 7": { en: "{n} days out of 7", zh: "每周 {n} 天" },
  "{jour}, ouverture": { en: "{jour}, opening", zh: "{jour}，开门" },
  "{jour}, fermeture": { en: "{jour}, closing", zh: "{jour}，打烊" },
  "{jour}, réouverture": { en: "{jour}, reopening", zh: "{jour}，重新营业" },
  "{jour}, seconde fermeture": {
    en: "{jour}, second closing",
    zh: "{jour}，第二次打烊",
  },
  à: { en: "to", zh: "至" },
  Coupure: { en: "Break", zh: "中间休息" },
  Fermé: { en: "Closed", zh: "休息" },
  "le soir": { en: "evening", zh: "晚市" },
  "Enregistrement...": { en: "Saving...", zh: "正在保存..." },
  "Une fois enregistré, tu reviens à l'accueil du tableau de bord.": {
    en: "Once saved, you go back to the dashboard home.",
    zh: "保存后将返回后台首页。",
  },
};
