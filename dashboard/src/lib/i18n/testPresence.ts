export type Lang = "fr" | "en" | "zh";

export const languages: { code: Lang; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

/** Vrai quand la valeur reçue du formulaire est une langue connue. */
export function estLangue(valeur: unknown): valeur is Lang {
  return valeur === "fr" || valeur === "en" || valeur === "zh";
}

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
      privacyNotice:
        "Vos coordonnées servent uniquement à vous transmettre ce test et à vous recontacter à ce sujet. Elles ne sont ni revendues ni utilisées à des fins publicitaires. Vous pouvez en demander l'effacement à tout moment — voir notre [[politique de confidentialité]].",
      submit: "Demander mon test gratuit",
      submitting: "Analyse en cours...",
      submittingDetail:
        "On lit ta fiche Google, on regarde ton site, puis on demande à l'IA. Une trentaine de secondes.",
      missingFields: "Merci de remplir tous les champs.",
      genericError: "Une erreur est survenue, réessaie dans un instant.",
      quotaError:
        "Tu as déjà lancé plusieurs tests aujourd'hui. Reviens demain, ou écris-nous : on le fait pour toi.",
      telephoneError:
        "Ce numéro ne semble pas valide. Un numéro français fait dix chiffres (06 12 34 56 78).",
      choixTitle: "Lequel est le vôtre ?",
      choixBody:
        "Plusieurs établissements portent ce nom. Choisissez le bon : nous préférons vous le demander plutôt que d'analyser celui du voisin.",
      choixAucun: "Aucun de ces établissements",
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
      actionsTitre: "Par quoi commencer",
      actionsVide:
        "Rien d'urgent : tout ce que nous regardons est déjà en place.",
      avecKlarr: "Avec Klarr",
      courriel: {
        surtitre: "Test de présence en ligne",
        bonjour: (prenom: string) => `Bonjour ${prenom},`,
        intro: (etablissement: string) =>
          `Voici le résultat du test de ${etablissement}, tel qu'il s'est affiché après votre demande. Gardez-le : il se relit à tête reposée, et se montre à un associé.`,
        scoreDe: "Score de présence en ligne",
        iaTitre: "Ce qu'une IA répond aujourd'hui",
        iaSousTitre: "à un client qui cherche un restaurant comme le vôtre",
        citeRang: (rang: number) => `Vous êtes cité en position ${rang}.`,
        cite: "Vous êtes cité dans la réponse.",
        nonCite: "Vous n'apparaissez pas dans la réponse.",
        aVotrePlace: "L'IA cite à votre place",
        sansNous:
          "Ces points se corrigent seuls, sans nous — et c'est le mieux à faire. Si vous préférez les traiter depuis un seul écran, Klarr est gratuit pendant trente jours, sans carte bancaire.",
        bouton: "Essayer Klarr gratuitement",
        sousBouton: "Trente jours offerts · sans carte bancaire",
        ensemble:
          "Et si vous voulez qu'on regarde ces résultats ensemble, répondez simplement à ce message.",
        signature: "L'équipe Klarr",
        sujet: (etablissement: string, score: number) =>
          `Votre test de présence en ligne — ${etablissement} : ${score}/100`,
        pied: "Vous recevez ce message parce que vous avez demandé ce test sur klarr.net. Il ne sera suivi d'aucun autre sans votre accord.",
      },
      impacts: {
        fort: "Impact fort",
        moyen: "Impact moyen",
        faible: "Impact faible",
      },
      actions: {
        siteAbsent: {
          titre: "Avoir un site que les moteurs peuvent lire",
          constat:
            "Aucun site n'est déclaré sur votre fiche Google. Il n'y a donc rien à analyser, et le pilier Visibilité IA reste à zéro.",
          klarr:
            "Votre page de réservation est un site : une adresse à coller sur votre fiche, que Google et les assistants IA savent lire.",
        },
        siteInjoignable: {
          titre: "Rendre votre site accessible",
          constat:
            "Le site déclaré ({hote}) n'a pas répondu pendant l'analyse. Tant qu'il ne répond pas, ni son balisage ni sa lisibilité ne peuvent être évalués.",
          klarr:
            "Votre page de réservation répond, tout le temps, sans rien à maintenir.",
        },
        balisageAbsent: {
          titre: "Ajouter le balisage « Restaurant » à votre site",
          constat:
            "Votre site répond, mais ne contient aucune donnée structurée : les moteurs y lisent du texte, pas un restaurant avec une adresse, des horaires et une carte.",
          klarr:
            "Votre page publie ce balisage d'elle-même : adresse, horaires, fourchette de prix, note, lien vers la carte.",
        },
        balisageNonRestaurant: {
          titre: "Déclarer un restaurant, pas un site",
          constat:
            "Votre site porte des données structurées, mais aucune ne déclare un établissement de restauration : ni adresse, ni horaires exploitables.",
          klarr:
            "Votre page publie ce balisage d'elle-même : adresse, horaires, fourchette de prix, note, lien vers la carte.",
        },
        reseauxAbsents: {
          titre: "Relier votre site à vos réseaux",
          constat:
            "Aucun lien vers vos comptes n'est déclaré dans le balisage. Votre site, votre fiche Google et vos réseaux sont traités comme trois établissements différents.",
          klarr:
            "Vos comptes sont déclarés dès que vous les connectez, en deux clics.",
        },
        horairesAbsents: {
          titre: "Renseigner vos horaires sur Google",
          constat:
            "Votre fiche Google n'indique aucun horaire. Un client qui ne sait pas si vous êtes ouvert ne prend pas le risque de se déplacer.",
          klarr:
            "Vos services publient vos horaires sur votre page et dans son balisage. La fiche Google, elle, reste à compléter chez Google.",
        },
        photosPeuNombreuses: {
          titre: "Publier plus de photos sur votre fiche",
          constat:
            "Nombre de photos sur votre fiche : {n}. En dessous d'une quinzaine, elle paraît vide à côté de celle du voisin.",
          klarr: null,
        },
        avisPeuNombreux: {
          titre: "Demander des avis à vos habitués",
          constat:
            "Nombre d'avis sur votre fiche : {n}. En dessous d'une vingtaine, une note reste fragile : un seul client mécontent la fait bouger.",
          klarr: null,
        },
        avisAnciens: {
          titre: "Faire remonter des avis récents",
          constat:
            "Sur les {total} avis analysés, {n} datent de moins de six mois. Un client qui ne lit que des avis d'il y a deux ans se demande ce qui s'est passé depuis.",
          klarr: null,
        },
      },
      avis: "avis",
      poids: "pondération",
      piliers: {
        local: "Fiche Google",
        reputation: "Avis",
        geo: "Présence IA",
      },
      oral: {
        titre: "À passer en revue ensemble",
        sousTitre: "Des points qui comptent, mais qu'aucun outil ne mesure.",
        points: [
          "Vos réseaux sociaux : nombre d'abonnés, régularité des publications, réponses aux messages.",
          "Vos photos : celles du plat contre celles de la salle, ce qu'elles promettent.",
          "Vos privatisations : ce que vous vendez déjà, et à quel prix.",
          "Votre saisonnalité : les creux qu'il faudrait remplir en priorité.",
        ],
      },
      ia: {
        titre: "Ce que l'IA répond à vos clients",
        question: "Question posée",
        cite: "Vous êtes cité dans la réponse.",
        citeRang: "Vous êtes cité en position {rang}.",
        pasCite: "Vous n'apparaissez pas dans la réponse.",
        concurrents: "L'IA cite à votre place",
        aucun: "Aucun établissement n'est nommé.",
      },
      essai: {
        titre: "Corrigez tout ça dès maintenant",
        corps:
          "Les trente premiers jours sont offerts, sans carte bancaire. Vous repartez avec votre page de réservation en ligne, vos horaires et votre carte publiés, et le suivi de ce que l'IA dit de vous.",
        bouton: "Commencer mon essai gratuit",
      },
      imprimer: "Imprimer / Enregistrer en PDF",
      recontacted:
        "On vous recontacte aussi pour approfondir ces résultats ensemble.",
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
      privacyNotice:
        "Your details are used only to send you this review and to follow up about it. They are never sold or used for advertising. You can ask for them to be deleted at any time — see our [[privacy policy]].",
      submit: "Request my free review",
      submitting: "Analyzing...",
      submittingDetail:
        "We read your Google listing, check your website, then ask the AI. About thirty seconds.",
      missingFields: "Please fill in all fields.",
      genericError: "Something went wrong, please try again in a moment.",
      quotaError:
        "You have already run several tests today. Come back tomorrow, or write to us and we will run it for you.",
      telephoneError:
        "That number does not look valid. Include the country code for numbers outside France (+44…).",
      choixTitle: "Which one is yours?",
      choixBody:
        "Several places share that name. Pick the right one — we would rather ask than analyse your neighbour's.",
      choixAucun: "None of these",
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
      actionsTitre: "Where to start",
      actionsVide: "Nothing urgent: everything we look at is already in place.",
      avecKlarr: "With Klarr",
      courriel: {
        surtitre: "Online presence check",
        bonjour: (prenom: string) => `Hello ${prenom},`,
        intro: (etablissement: string) =>
          `Here is the result of the check for ${etablissement}, as it appeared after your request. Keep it: it reads better later, and it is worth showing a partner.`,
        scoreDe: "Online presence score",
        iaTitre: "What an AI answers today",
        iaSousTitre: "to a guest looking for a restaurant like yours",
        citeRang: (rang: number) => `You are cited in position ${rang}.`,
        cite: "You are cited in the answer.",
        nonCite: "You do not appear in the answer.",
        aVotrePlace: "The AI names instead",
        sansNous:
          "These points can be fixed on your own, without us — and that is the best thing to do. If you would rather handle them from one screen, Klarr is free for thirty days, no card required.",
        bouton: "Try Klarr for free",
        sousBouton: "Thirty days free · no card required",
        ensemble:
          "And if you would like to go through these results together, simply reply to this message.",
        signature: "The Klarr team",
        sujet: (etablissement: string, score: number) =>
          `Your online presence check — ${etablissement}: ${score}/100`,
        pied: "You are receiving this message because you requested this check on klarr.net. No other message will follow without your consent.",
      },
      impacts: {
        fort: "High impact",
        moyen: "Medium impact",
        faible: "Low impact",
      },
      actions: {
        siteAbsent: {
          titre: "Have a website engines can read",
          constat:
            "No website is listed on your Google profile. There is nothing to analyse, so the AI visibility pillar stays at zero.",
          klarr:
            "Your booking page is a website: one address to put on your listing, readable by Google and AI assistants.",
        },
        siteInjoignable: {
          titre: "Make your website reachable",
          constat:
            "The listed website ({hote}) did not respond during the scan. Until it does, neither its markup nor its readability can be assessed.",
          klarr: "Your booking page answers, always, with nothing to maintain.",
        },
        balisageAbsent: {
          titre: "Add « Restaurant » markup to your website",
          constat:
            "Your website responds but carries no structured data: engines read text there, not a restaurant with an address, opening hours and a menu.",
          klarr:
            "Your page publishes that markup on its own: address, hours, price range, rating, link to the menu.",
        },
        balisageNonRestaurant: {
          titre: "Declare a restaurant, not a website",
          constat:
            "Your website carries structured data, but none of it declares a food establishment: no usable address or opening hours.",
          klarr:
            "Your page publishes that markup on its own: address, hours, price range, rating, link to the menu.",
        },
        reseauxAbsents: {
          titre: "Link your website to your social accounts",
          constat:
            "No link to your accounts is declared in the markup. Your website, your Google listing and your social accounts are treated as three different businesses.",
          klarr:
            "Your accounts are declared as soon as you connect them, in two clicks.",
        },
        horairesAbsents: {
          titre: "Add your opening hours on Google",
          constat:
            "Your Google listing shows no opening hours. A guest who cannot tell whether you are open will not risk the trip.",
          klarr:
            "Your services publish your hours on your page and in its markup. The Google listing itself still has to be filled in on Google.",
        },
        photosPeuNombreuses: {
          titre: "Publish more photos on your listing",
          constat:
            "Photos on your listing: {n}. Below fifteen or so, it looks empty next to the place across the street.",
          klarr: null,
        },
        avisPeuNombreux: {
          titre: "Ask your regulars for reviews",
          constat:
            "Reviews on your listing: {n}. Below twenty or so, a rating stays fragile: a single unhappy guest moves it.",
          klarr: null,
        },
        avisAnciens: {
          titre: "Bring in recent reviews",
          constat:
            "Of the {total} reviews analysed, {n} are less than six months old. A guest reading only two-year-old reviews wonders what has happened since.",
          klarr: null,
        },
      },
      avis: "reviews",
      poids: "weight",
      piliers: {
        local: "Google listing",
        reputation: "Reviews",
        geo: "AI presence",
      },
      oral: {
        titre: "To go through together",
        sousTitre: "Things that matter, that no tool can measure.",
        points: [
          "Your social accounts: followers, how regularly you post, how you reply.",
          "Your photos: the dish versus the room, and what they promise.",
          "Your private hire: what you already sell, and at what price.",
          "Your seasons: the quiet weeks worth filling first.",
        ],
      },
      ia: {
        titre: "What AI tells your customers",
        question: "Question asked",
        cite: "You are named in the answer.",
        citeRang: "You are named in position {rang}.",
        pasCite: "You do not appear in the answer.",
        concurrents: "AI names instead",
        aucun: "No venue is named.",
      },
      essai: {
        titre: "Fix all this right now",
        corps:
          "The first thirty days are free, no card required. You leave with your booking page online, your hours and menu published, and a running check on what AI says about you.",
        bouton: "Start my free trial",
      },
      imprimer: "Print / Save as PDF",
      recontacted: "We'll also reach out to go through these results together.",
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
    title: "免费测评您餐厅的线上形象",
    subtitle:
      "留下您的联系方式，我们会查看您的 Google 商家资料，并把结果和建议反馈给您。",
    form: {
      prenom: "名",
      nom: "姓",
      entreprise: "餐厅/店铺名称",
      ville: "城市",
      email: "邮箱",
      telephone: "电话",
      privacyNotice:
        "您的联系方式仅用于向您发送本次测评结果，并就此与您联系，绝不会出售，也不会用于广告。您可以随时要求删除——详情请见我们的[[《隐私政策》]]。",
      submit: "申请免费测评",
      submitting: "分析中...",
      submittingDetail:
        "我们正在读取您的 Google 商户信息、检查网站，然后询问 AI。约三十秒。",
      missingFields: "请填写所有字段。",
      genericError: "出现错误，请稍后重试。",
      quotaError:
        "您今天已经进行了多次测试。请明天再来，或与我们联系，我们代您完成。",
      telephoneError: "该号码似乎无效。法国以外的号码请加国家代码（+86…）。",
      choixTitle: "哪一家是您的？",
      choixBody:
        "有多家同名商户。请选择正确的一家——我们宁可多问一句，也不愿分析邻店。",
      choixAucun: "都不是",
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
      actionsTitre: "从哪里开始",
      actionsVide: "没有紧急事项：我们检查的各项都已就位。",
      avecKlarr: "使用 Klarr",
      courriel: {
        surtitre: "在线形象测评",
        bonjour: (prenom: string) => `${prenom}，您好：`,
        intro: (etablissement: string) =>
          `这是 ${etablissement} 的测评结果，与您提交后页面上显示的一致。请保留：稍后再读更清楚，也可以给合伙人看。`,
        scoreDe: "在线形象得分",
        iaTitre: "AI 今天是这样回答的",
        iaSousTitre: "当顾客在找一家像您这样的餐厅时",
        citeRang: (rang: number) => `您在回答中排第 ${rang} 位。`,
        cite: "您出现在回答中。",
        nonCite: "您没有出现在回答中。",
        aVotrePlace: "AI 推荐的是",
        sansNous:
          "这些问题您完全可以自己解决，不需要我们——这也是最好的做法。如果您更愿意在一个界面里处理，Klarr 前三十天免费，无需绑定银行卡。",
        bouton: "免费试用 Klarr",
        sousBouton: "免费三十天 · 无需银行卡",
        ensemble: "如果您想和我们一起看看这些结果，直接回复这封邮件即可。",
        signature: "Klarr 团队",
        sujet: (etablissement: string, score: number) =>
          `您的在线形象测评 — ${etablissement}：${score}/100`,
        pied: "您收到这封邮件，是因为您在 klarr.net 上申请了这项测评。未经您同意，不会再有其他邮件。",
      },
      impacts: {
        fort: "影响大",
        moyen: "影响中等",
        faible: "影响较小",
      },
      actions: {
        siteAbsent: {
          titre: "拥有一个搜索引擎能读懂的网站",
          constat:
            "您的 Google 商家资料未填写网站，因此无从分析，AI 可见度一项为零。",
          klarr:
            "您的预订页面就是一个网站：把这个网址填进商家资料，Google 和 AI 助手都能读懂。",
        },
        siteInjoignable: {
          titre: "让您的网站可以访问",
          constat:
            "扫描时，所填网站（{hote}）没有响应。在它恢复之前，无法评估其结构化标记与可读性。",
          klarr: "您的预订页面始终在线，且无需维护。",
        },
        balisageAbsent: {
          titre: "为网站添加「Restaurant」结构化标记",
          constat:
            "网站可以访问，但没有任何结构化数据：搜索引擎只读到文字，而不是一家有地址、营业时间和菜单的餐厅。",
          klarr:
            "您的页面会自动发布这些标记：地址、营业时间、价格区间、评分、菜单链接。",
        },
        balisageNonRestaurant: {
          titre: "声明这是一家餐厅，而不只是一个网站",
          constat:
            "网站有结构化数据，但没有一项把它声明为餐饮场所：既无可用地址，也无营业时间。",
          klarr:
            "您的页面会自动发布这些标记：地址、营业时间、价格区间、评分、菜单链接。",
        },
        reseauxAbsents: {
          titre: "把网站与社交账号关联起来",
          constat:
            "标记中没有指向您账号的链接。您的网站、Google 商家资料和社交账号被视为三家不同的店。",
          klarr: "只要连接账号，两步即可自动声明。",
        },
        horairesAbsents: {
          titre: "在 Google 上填写营业时间",
          constat:
            "您的 Google 商家资料没有营业时间。顾客不知道是否营业，就不会冒险跑一趟。",
          klarr:
            "您的餐段会在页面及其标记中公布营业时间。Google 商家资料仍需在 Google 上补充。",
        },
        photosPeuNombreuses: {
          titre: "在商家资料上发布更多照片",
          constat:
            "商家资料照片数：{n}。少于十五张时，与街对面的同行相比会显得空荡。",
          klarr: null,
        },
        avisPeuNombreux: {
          titre: "邀请常客留下评价",
          constat:
            "商家资料评价数：{n}。少于二十条时，评分很脆弱：一位不满意的顾客就能拉低它。",
          klarr: null,
        },
        avisAnciens: {
          titre: "让近期评价浮上来",
          constat:
            "在分析的 {total} 条评价中，有 {n} 条是近六个月内的。只读到两年前评价的顾客，会怀疑这期间发生了什么。",
          klarr: null,
        },
      },
      avis: "条评价",
      poids: "权重",
      piliers: {
        local: "Google 商家资料",
        reputation: "评价",
        geo: "人工智能中的可见度",
      },
      oral: {
        titre: "需要一起讨论的内容",
        sousTitre: "这些很重要，但没有任何工具能衡量。",
        points: [
          "您的社交账号：粉丝数量、发布频率、回复情况。",
          "您的照片：菜品与环境，它们传达了什么。",
          "您的包场业务：目前销售的内容和价格。",
          "您的淡旺季：最需要优先填补的空档。",
        ],
      },
      ia: {
        titre: "人工智能如何回答您的顾客",
        question: "所提问题",
        cite: "答案中提到了您。",
        citeRang: "您在答案中排名第 {rang} 位。",
        pasCite: "答案中没有提到您。",
        concurrents: "人工智能提到的是",
        aucun: "没有提到任何商家。",
      },
      essai: {
        titre: "立即着手改进",
        corps:
          "前三十天免费，无需绑定银行卡。您将获得在线预订页面、已发布的营业时间和菜单，以及人工智能对您评价的持续跟踪。",
        bouton: "开始免费试用",
      },
      imprimer: "打印 / 保存为 PDF",
      recontacted: "我们也会联系您，一起深入了解这些结果。",
    },
    faqTitle: "常见问题",
    faq: [
      {
        question: "免费测评包含什么内容？",
        answer:
          "我们会查看您的 Google 商家资料（信息、评价、照片、关键词），并告诉您哪些地方可以改进。",
      },
      {
        question: "真的完全免费、无需承诺吗？",
        answer: "是的，无需信用卡。这只是第一次沟通，看看 Klarr 能否帮到您。",
      },
      {
        question: "你们多久会联系我？",
        answer: "通常在 48 个工作小时内，通过电话或邮件联系您。",
      },
      {
        question: "我的信息会被用于其他用途吗？",
        answer: "不会，仅用于就本次测评与您联系。",
      },
    ],
  },
} satisfies Record<Lang, unknown>;
