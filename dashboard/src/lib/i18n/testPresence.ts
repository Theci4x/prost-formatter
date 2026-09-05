export type Lang = "fr" | "en" | "zh";

export const languages: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

export const translations = {
  fr: {
    badge: "Offert",
    title: "Testez gratuitement la présence en ligne de votre restaurant",
    subtitle:
      "Laissez-nous vos coordonnées : on regarde votre fiche Google Business Profile et on vous recontacte avec les résultats et nos recommandations.",
    form: {
      prenom: "Prénom",
      nom: "Nom",
      entreprise: "Nom du restaurant / de l'établissement",
      ville: "Ville",
      email: "Email",
      telephone: "Téléphone",
      submit: "Demander mon test gratuit",
      submitting: "Analyse en cours...",
      missingFields: "Merci de remplir tous les champs.",
      genericError: "Une erreur est survenue, réessaie dans un instant.",
      successTitle: "Merci ! On revient vers vous très vite.",
      successBody:
        "On regarde votre fiche Google et on vous recontacte avec les résultats.",
    },
    audit: {
      title: "Résultat de votre audit",
      globalLabel: "Score global",
      localSeo: "Fiche Google",
      eReputation: "E-réputation",
      geo: "Visibilité IA",
      labels: {
        excellent: "Excellent",
        bon: "Bon",
        moyen: "Moyen",
        critique: "Critique",
      },
      recontacted:
        "On vous recontacte pour approfondir ces résultats ensemble.",
    },
    faqTitle: "Questions fréquentes",
    faq: [
      {
        question: "En quoi consiste le test gratuit ?",
        answer:
          "On regarde votre fiche Google Business Profile (informations, avis, photos, mots-clés visés) et on vous partage ce qui peut être amélioré.",
      },
      {
        question: "Est-ce vraiment gratuit, sans engagement ?",
        answer:
          "Oui. Aucune carte bancaire n'est demandée. C'est un premier échange pour voir si Klarr peut vous aider.",
      },
      {
        question: "Sous combien de temps vais-je être recontacté ?",
        answer: "En général sous 48h ouvrées, par téléphone ou par email.",
      },
      {
        question: "Mes coordonnées seront-elles utilisées pour autre chose ?",
        answer: "Non, uniquement pour vous recontacter au sujet de ce test.",
      },
    ],
  },
  en: {
    badge: "Free",
    title: "Get a free review of your restaurant's online presence",
    subtitle:
      "Leave us your details: we'll take a look at your Google Business Profile and get back to you with the results and our recommendations.",
    form: {
      prenom: "First name",
      nom: "Last name",
      entreprise: "Restaurant / business name",
      ville: "City",
      email: "Email",
      telephone: "Phone",
      submit: "Request my free review",
      submitting: "Analyzing...",
      missingFields: "Please fill in all fields.",
      genericError: "Something went wrong, please try again in a moment.",
      successTitle: "Thanks! We'll be in touch shortly.",
      successBody:
        "We're reviewing your Google listing and will contact you with the results.",
    },
    audit: {
      title: "Your audit results",
      globalLabel: "Global score",
      localSeo: "Google listing",
      eReputation: "Reputation",
      geo: "AI visibility",
      labels: {
        excellent: "Excellent",
        bon: "Good",
        moyen: "Average",
        critique: "Critical",
      },
      recontacted: "We'll reach out to go through these results together.",
    },
    faqTitle: "Frequently asked questions",
    faq: [
      {
        question: "What does the free review include?",
        answer:
          "We look at your Google Business Profile (info, reviews, photos, target keywords) and share what can be improved.",
      },
      {
        question: "Is it really free, no strings attached?",
        answer:
          "Yes. No credit card required. It's a first conversation to see if Klarr can help you.",
      },
      {
        question: "How soon will I be contacted?",
        answer: "Usually within 48 business hours, by phone or email.",
      },
      {
        question: "Will my details be used for anything else?",
        answer: "No, only to contact you about this review.",
      },
    ],
  },
  zh: {
    badge: "免费",
    title: "免费测评您餐厅的在线形象",
    subtitle:
      "留下您的联系方式，我们将查看您的 Google 商家资料，并把结果和建议反馈给您。",
    form: {
      prenom: "名",
      nom: "姓",
      entreprise: "餐厅/店铺名称",
      ville: "城市",
      email: "电子邮箱",
      telephone: "电话",
      submit: "申请免费测评",
      submitting: "分析中...",
      missingFields: "请填写所有字段。",
      genericError: "出现错误，请稍后重试。",
      successTitle: "谢谢！我们会尽快与您联系。",
      successBody: "我们正在查看您的 Google 商家资料，稍后会把结果反馈给您。",
    },
    audit: {
      title: "您的测评结果",
      globalLabel: "总分",
      localSeo: "Google 资料",
      eReputation: "口碑评价",
      geo: "AI 可见度",
      labels: {
        excellent: "优秀",
        bon: "良好",
        moyen: "一般",
        critique: "较差",
      },
      recontacted: "我们会联系您，一起深入了解这些结果。",
    },
    faqTitle: "常见问题",
    faq: [
      {
        question: "免费测评包含什么内容？",
        answer:
          "我们会查看您的 Google 商家资料（信息、评价、照片、目标关键词），并告诉您可以改进的地方。",
      },
      {
        question: "真的完全免费、无需承诺吗？",
        answer: "是的，无需信用卡。这只是第一次沟通，看看 Klarr 是否能帮到您。",
      },
      {
        question: "多久会联系我？",
        answer: "通常在 48 个工作小时内，通过电话或邮件联系您。",
      },
      {
        question: "我的信息会被用于其他用途吗？",
        answer: "不会，仅用于就本次测评与您联系。",
      },
    ],
  },
} satisfies Record<Lang, unknown>;
