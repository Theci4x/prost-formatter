import type { Langue } from "@/lib/i18n/langues";
import type { Trad } from "@/lib/i18n/outils";

/**
 * Le calendrier d'ouverture, remonté depuis la date visée.
 *
 * **On ne calcule que les délais qui sont les mêmes partout.** C'est la
 * règle du fichier, et elle vient d'un constat simple : un outil qui
 * annonce « déposez votre demande de terrasse deux mois avant » se trompe
 * dans la moitié des communes, et celui qui s'en aperçoit est celui qui
 * ouvre en retard. Un délai faux est pire qu'un délai absent, parce qu'on
 * s'organise dessus.
 *
 * Deux natures de jalons, donc, et l'écran les distingue à l'œil nu.
 *
 * **National** : le texte fixe le délai, il vaut de Brest à Menton, on
 * calcule la date. La déclaration de licence quinze jours avant
 * l'ouverture en est le cas type.
 *
 * **Local** : la mairie, la préfecture ou la copropriété décident, et le
 * délai va de trois semaines à huit mois selon l'endroit et le moment.
 * On ne calcule rien. On dit à quel moment de la chaîne ça se place, et
 * à qui téléphoner pour connaître le délai réel.
 *
 * Ce qui reste utile dans les deux cas, et qui est la vraie valeur de la
 * page : **l'ordre**. Ce qui doit précéder quoi ne dépend d'aucune
 * commune. Le permis d'exploitation avant la déclaration de licence,
 * l'autorisation de travaux avant le chantier, le chantier avant la
 * commission de sécurité. Un restaurateur qui découvre l'ordre trois
 * semaines trop tard n'a pas perdu trois semaines : il a perdu le temps
 * de tout reprendre dans le bon sens.
 *
 * **Les dates se formatent dans la langue du lecteur**, pas seulement
 * les textes. Un calendrier qui annonce « mardi 1 juin 2027 » à
 * quelqu'un qui lit le chinois lui redonne à traduire ce qu'on venait
 * de lui traduire.
 */

export type Nature = "national" | "local";

export type PhaseId =
  | "avant-signature"
  | "societe"
  | "autorisations"
  | "travaux"
  | "avant-ouverture"
  | "ouverture";

export type Phase = { id: PhaseId; titre: Trad; chapo: Trad };

export const PHASES: Phase[] = [
  {
    id: "avant-signature",
    titre: { fr: "Avant de signer", en: "Before you sign", zh: "签约之前" },
    chapo: {
      fr: "Rien de ce qui suit ne sert si le local ne peut pas accueillir un restaurant.",
      en: "None of what follows matters if the site cannot take a restaurant at all.",
      zh: "如果这个铺面根本开不了餐厅，下面所有的事都没有意义。",
    },
  },
  {
    id: "societe",
    titre: { fr: "La société", en: "The company", zh: "公司主体" },
    chapo: {
      fr: "Elle doit exister avant de signer un bail et d'ouvrir un compte.",
      en: "It has to exist before you sign a lease or open a bank account.",
      zh: "签租约、开银行账户之前，公司必须已经存在。",
    },
  },
  {
    id: "autorisations",
    titre: { fr: "Les autorisations", en: "The permits", zh: "各项许可" },
    chapo: {
      fr: "C'est ici que les délais varient le plus, et qu'un coup de téléphone en mairie vaut mieux qu'un tableau.",
      en: "This is where timescales vary most, and where one call to the town hall beats any table.",
      zh: "这一段的时间差别最大，打一通电话问市政厅，胜过查任何表格。",
    },
  },
  {
    id: "travaux",
    titre: { fr: "Les travaux", en: "The building works", zh: "装修施工" },
    chapo: {
      fr: "Ils ne commencent qu'une fois les autorisations obtenues.",
      en: "They only start once the permits are in hand.",
      zh: "必须等许可到手之后才能动工。",
    },
  },
  {
    id: "avant-ouverture",
    titre: {
      fr: "Juste avant d'ouvrir",
      en: "Just before opening",
      zh: "开业前夕",
    },
    chapo: {
      fr: "Les formalités qui ont une date limite écrite dans un texte.",
      en: "The formalities whose deadline is written into law.",
      zh: "这些手续的截止期限是法律白纸黑字规定的。",
    },
  },
  {
    id: "ouverture",
    titre: {
      fr: "Le jour J et après",
      en: "Opening day and after",
      zh: "开业当天及之后",
    },
    chapo: {
      fr: "Ce qui doit être en place quand le premier client entre.",
      en: "What has to be in place when the first customer walks in.",
      zh: "第一位客人进门时，这些必须已经就位。",
    },
  },
];

export type Jalon = {
  id: string;
  phase: PhaseId;
  titre: Trad;
  quoi: Trad;
  nature: Nature;
  /**
   * Nombre de jours avant l'ouverture, pour les seuls jalons nationaux.
   * Absent sur un jalon local : on n'invente pas une date.
   */
  joursAvant?: number;
  /** Ce qui doit être fait d'abord. C'est l'information stable. */
  apres?: string;
  /** Qui détient le délai, quand nous ne le détenons pas. */
  aQuiDemander?: Trad;
  article?: string;
};

export const JALONS: Jalon[] = [
  {
    id: "diagnostic",
    phase: "avant-signature",
    titre: {
      fr: "Vérifier les cinq points bloquants",
      en: "Check the five blocking points",
      zh: "查清五个致命点",
    },
    quoi: {
      fr: "Extraction, destination du bail, copropriété, ERP, terrasse. Ce sont les seuls qui peuvent rendre le projet impossible plutôt que coûteux.",
      en: "Extraction, the lease's permitted use, the co-ownership rules, the public-venue rules, the terrace. These are the only ones that can make the project impossible rather than merely expensive.",
      zh: "排烟、租约用途、共有产权规约、ERP 公共场所规范、露天座位。只有这五点可能让项目彻底做不成，而不只是变贵。",
    },
    nature: "local",
    aQuiDemander: {
      fr: "Le syndic, le bailleur, la mairie.",
      en: "The syndic, the landlord, the town hall.",
      zh: "syndic（大楼管理方）、房东、市政厅。",
    },
  },
  {
    id: "societe",
    phase: "societe",
    titre: {
      fr: "Immatriculer la société",
      en: "Register the company",
      zh: "注册公司",
    },
    quoi: {
      fr: "Par le guichet unique des formalités des entreprises. Le numéro qui en sort vous sera demandé partout ensuite.",
      en: "Through the guichet unique, France's single business-formalities portal. The number it issues will be asked for everywhere afterwards.",
      zh: "通过 guichet unique（企业手续统一窗口）办理。拿到的公司编号，之后办任何事都会被要求提供。",
    },
    nature: "local",
    aQuiDemander: {
      fr: "Le guichet unique. Comptez large : c'est un passage obligé pour presque tout le reste.",
      en: "The guichet unique. Allow plenty of time: almost everything else depends on it.",
      zh: "找 guichet unique。时间要留宽裕：后面几乎所有事都卡在这一步。",
    },
  },
  {
    id: "bail",
    phase: "societe",
    titre: { fr: "Signer le bail", en: "Sign the lease", zh: "签订租约" },
    quoi: {
      fr: "Une fois, et seulement une fois, les cinq points levés et la société créée.",
      en: "Once — and only once — the five points are cleared and the company exists.",
      zh: "必须等五个致命点都查清、公司也注册好之后，才签。",
    },
    nature: "local",
    apres: "diagnostic",
  },
  {
    id: "travaux-autorisation",
    phase: "autorisations",
    titre: {
      fr: "Déposer l'autorisation de travaux",
      en: "File the building-works permit",
      zh: "递交施工许可申请",
    },
    quoi: {
      fr: "Tout aménagement d'un établissement recevant du public passe par une autorisation, qui traite en même temps la sécurité incendie et l'accessibilité.",
      en: "Any fit-out of a public-access venue needs a permit, which covers fire safety and accessibility at the same time.",
      zh: "公共场所的任何装修都要申请许可，消防安全和无障碍会在同一份申请里一并审核。",
    },
    nature: "local",
    apres: "bail",
    aQuiDemander: {
      fr: "La mairie, service urbanisme ou ERP. Le délai d'instruction dépend de la commune et de la saison — demandez-le, ne le devinez pas.",
      en: "The town hall, planning or ERP desk. Processing time depends on the commune and the season — ask, do not guess.",
      zh: "找市政厅的规划科或 ERP 窗口。审批时间因城市和季节而异——去问，别猜。",
    },
    article: "erp-restaurant-categorie-commission-securite",
  },
  {
    id: "destination-urbanisme",
    phase: "autorisations",
    titre: {
      fr: "Changer la destination, s'il y a lieu",
      en: "Change the permitted use, if needed",
      zh: "如有必要，办理用途变更",
    },
    quoi: {
      fr: "Si le local n'est pas déjà un commerce de restauration au sens de l'urbanisme.",
      en: "If the unit is not already classed as restaurant use under planning rules.",
      zh: "如果这个铺面在城市规划分类上本来就不是餐饮用途。",
    },
    nature: "local",
    apres: "bail",
    aQuiDemander: {
      fr: "La mairie, service urbanisme.",
      en: "The town hall, planning department.",
      zh: "市政厅的 service urbanisme（城市规划科）。",
    },
  },
  {
    id: "copro-ag",
    phase: "autorisations",
    titre: {
      fr: "Faire voter l'assemblée générale",
      en: "Get the owners' meeting to vote",
      zh: "取得业主大会表决通过",
    },
    quoi: {
      fr: "Conduit d'extraction, enseigne, climatisation, tout ce qui touche aux parties communes.",
      en: "Extraction flue, shopfront sign, air conditioning — anything touching the building's common parts.",
      zh: "排烟管道、招牌、空调，凡是动到大楼共有部分的都算。",
    },
    nature: "local",
    apres: "bail",
    aQuiDemander: {
      fr: "Le syndic. C'est le délai le plus imprévisible du parcours : une AG ordinaire se tient une fois par an, et une extraordinaire se convoque.",
      en: "The syndic. This is the least predictable delay of the whole journey: an ordinary meeting is held once a year, and an extraordinary one has to be called.",
      zh: "找 syndic。这是整个流程里最难预料的一环：常规业主大会一年才开一次，临时大会则要专门召集。",
    },
  },
  {
    id: "terrasse",
    phase: "autorisations",
    titre: {
      fr: "Demander la terrasse",
      en: "Apply for the terrace",
      zh: "申请露天座位",
    },
    quoi: {
      fr: "L'autorisation du prédécesseur ne se transmet pas : la vôtre est une demande nouvelle.",
      en: "Your predecessor's permit does not transfer: yours is a fresh application.",
      zh: "前一家的许可不会转给您：您这是一份全新的申请。",
    },
    nature: "local",
    apres: "bail",
    aQuiDemander: {
      fr: "La mairie, service du domaine public.",
      en: "The town hall, public-space department.",
      zh: "市政厅负责公共空间占用的部门。",
    },
    article: "terrasse-restaurant-autorisation-domaine-public",
  },
  {
    id: "chantier",
    phase: "travaux",
    titre: {
      fr: "Lancer le chantier",
      en: "Start the works",
      zh: "开工装修",
    },
    quoi: {
      fr: "Après les autorisations, jamais avant. Des travaux commencés sans autorisation peuvent être arrêtés, et l'ouverture avec.",
      en: "After the permits, never before. Works started without a permit can be stopped — and the opening with them.",
      zh: "必须在许可下来之后，绝不能提前。没有许可就开工，工程可能被勒令停止，开业也跟着泡汤。",
    },
    nature: "local",
    apres: "travaux-autorisation",
    article: "diagnostics-avant-travaux-restaurant",
  },
  {
    id: "commission",
    phase: "travaux",
    titre: {
      fr: "Passer la commission de sécurité",
      en: "Pass the safety commission",
      zh: "通过安全委员会审查",
    },
    quoi: {
      fr: "Selon la catégorie de l'établissement. Elle intervient une fois les travaux terminés, et elle peut demander des reprises.",
      en: "Depending on the venue's category. It comes once the works are finished, and it can require changes.",
      zh: "视场所的 ERP 类别而定。装修完工后才会来，而且可能要求返工。",
    },
    nature: "local",
    apres: "chantier",
    aQuiDemander: {
      fr: "La mairie. Gardez de la marge : une reprise se refait.",
      en: "The town hall. Keep some slack: rework takes time.",
      zh: "找市政厅。时间要留余量：返工是要重做的。",
    },
  },
  {
    id: "permis-exploitation",
    phase: "avant-ouverture",
    titre: {
      fr: "Passer le permis d'exploitation",
      en: "Take the permis d'exploitation",
      zh: "考取 permis d'exploitation（经营许可培训证）",
    },
    quoi: {
      fr: "Une formation obligatoire pour servir de l'alcool. Elle dure trois jours, réduits si vous justifiez d'une longue expérience du métier. Sans elle, pas de licence.",
      en: "A compulsory course to serve alcohol. Three days, shortened if you can show long experience in the trade. Without it, no licence.",
      zh: "卖酒必须先上的法定培训课，三天，有多年从业经验可缩短。没有它就拿不到酒牌。",
    },
    nature: "national",
    // Ni une date limite légale ni un délai de traitement : un jalon posé
    // assez tôt pour que la licence, qui en dépend, reste déposable dans
    // son propre délai. On le dit sur l'écran plutôt que de le déguiser
    // en obligation.
    joursAvant: 45,
    aQuiDemander: {
      fr: "Un organisme agréé.",
      en: "An approved training body.",
      zh: "经官方认可的培训机构。",
    },
    article: "permis-exploitation-licence-restaurant",
  },
  {
    id: "licence",
    phase: "avant-ouverture",
    titre: {
      fr: "Déclarer la licence de débit de boissons",
      en: "File the alcohol licence declaration",
      zh: "申报酒类经营许可",
    },
    quoi: {
      fr: "Une déclaration à déposer en mairie — à la préfecture de police à Paris. Le délai est fixé par la loi et il est le même partout.",
      en: "A declaration filed at the town hall — at the police prefecture in Paris. The deadline is set by law and is the same everywhere.",
      zh: "向市政厅递交申报，巴黎则递交给警察总局。期限由法律规定，全国一致。",
    },
    nature: "national",
    joursAvant: 15,
    apres: "permis-exploitation",
    article: "permis-exploitation-licence-restaurant",
  },
  {
    id: "declaration-sanitaire",
    phase: "avant-ouverture",
    titre: {
      fr: "Déclarer l'activité aux services vétérinaires",
      en: "Register with the food-safety authority",
      zh: "向食品卫生主管部门申报",
    },
    quoi: {
      fr: "Manipuler des denrées animales impose une déclaration. Immatriculer sa société ne déclare pas son restaurant : ce sont deux démarches sans rapport.",
      en: "Handling food of animal origin requires a registration. Registering your company does not register your restaurant: they are two unrelated steps.",
      zh: "处理动物源性食品必须申报。注册公司不等于申报了餐厅——这是两件毫不相干的手续。",
    },
    nature: "national",
    joursAvant: 1,
    article: "declaration-sanitaire-restaurant-ddpp",
  },
  {
    id: "haccp",
    phase: "avant-ouverture",
    titre: {
      fr: "Former quelqu'un à l'hygiène alimentaire",
      en: "Get someone trained in food hygiene",
      zh: "派人参加食品卫生培训",
    },
    quoi: {
      fr: "Au moins une personne de l'établissement, et ce n'est pas un classeur qu'on achète.",
      en: "At least one person in the venue — and it is not a folder you buy.",
      zh: "店里至少要有一个人受过培训，而不是买一本文件夹放着就算数。",
    },
    nature: "national",
    joursAvant: 30,
    article: "haccp-plan-maitrise-sanitaire-restaurant",
  },
  {
    id: "sacem",
    phase: "avant-ouverture",
    titre: {
      fr: "Déclarer la musique",
      en: "Declare the music",
      zh: "申报背景音乐版权",
    },
    quoi: {
      fr: "Avant la première diffusion, pas après la première facture.",
      en: "Before the first note is played, not after the first invoice arrives.",
      zh: "在第一次放音乐之前申报，而不是等收到第一张账单才办。",
    },
    nature: "national",
    joursAvant: 15,
    article: "sacem-spre-restaurant-musique",
  },
  {
    id: "fiche-google",
    phase: "ouverture",
    titre: {
      fr: "Créer et vérifier la fiche Google",
      en: "Create and verify the Google listing",
      zh: "创建并验证 Google 商家资料",
    },
    quoi: {
      fr: "La vérification passe souvent par un courrier postal : commencez avant d'ouvrir, pas le jour de l'ouverture.",
      en: "Verification often goes through a posted letter: start before you open, not on opening day.",
      zh: "验证往往要靠寄信完成：请在开业前就开始，而不是开业当天。",
    },
    nature: "national",
    joursAvant: 30,
    article: "fiche-google-restaurant-ce-qui-compte-vraiment",
  },
  {
    id: "reservation",
    phase: "ouverture",
    titre: {
      fr: "Ouvrir les réservations",
      en: "Open your bookings",
      zh: "开放订位",
    },
    quoi: {
      fr: "Une page à votre nom, et son adresse dans le champ « réservations » de la fiche Google. C'est le geste qui rapporte le plus de couverts, et il ne dépend de personne.",
      en: "A booking page in your own name, with its address in the “reservations” field of your Google listing. This is the single highest-yielding move, and it depends on nobody.",
      zh: "做一个属于您自己的订位页，把网址填进 Google 商家资料的「预订」栏。这是回报最高的一步，而且不求任何人。",
    },
    nature: "national",
    joursAvant: 21,
    apres: "fiche-google",
  },
  {
    id: "affichage",
    phase: "ouverture",
    titre: {
      fr: "Afficher les prix et les allergènes",
      en: "Display prices and allergens",
      zh: "公示价格与过敏原",
    },
    quoi: {
      fr: "Prix nets taxes et service compris, et l'information sur les allergènes accessible sans que le client ait à la demander.",
      en: "Prices inclusive of tax and service, and allergen information available without the customer having to ask for it.",
      zh: "价格须为含税含服务费的净价；过敏原信息必须让客人不用开口问就能看到。",
    },
    nature: "national",
    joursAvant: 0,
  },
];

export type JalonDate = Jalon & {
  /** Nulle sur un jalon local : on n'a pas de date à donner. */
  date: Date | null;
  /** Le jalon qui doit précéder, résolu. */
  precedent: Jalon | null;
};

/** Lit une date de formulaire. Null si absente ou illisible. */
export function lireDate(brut: string | string[] | undefined): Date | null {
  const texte = Array.isArray(brut) ? brut[0] : brut;
  if (!texte || !/^\d{4}-\d{2}-\d{2}$/.test(texte)) return null;
  const date = new Date(`${texte}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calendrier(ouverture: Date | null): JalonDate[] {
  return JALONS.map((jalon) => ({
    ...jalon,
    date:
      ouverture && jalon.joursAvant !== undefined
        ? new Date(ouverture.getTime() - jalon.joursAvant * 86400000)
        : null,
    precedent: jalon.apres
      ? (JALONS.find((autre) => autre.id === jalon.apres) ?? null)
      : null,
  }));
}

export function jalonsDe(calendrier: JalonDate[], phase: PhaseId): JalonDate[] {
  return calendrier.filter((jalon) => jalon.phase === phase);
}

/** La locale d'affichage d'une date, par langue. */
const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

export function dateLisible(date: Date, langue: Langue): string {
  return new Intl.DateTimeFormat(LOCALE[langue] ?? "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Une date d'ouverture par défaut : dans six mois, ni hier ni dans dix ans. */
export function ouvertureParDefaut(aujourdhui = new Date()): string {
  const dans = new Date(aujourdhui.getTime() + 182 * 86400000);
  return dans.toISOString().slice(0, 10);
}

/** Les libellés de l'écran, qui ne dépendent d'aucun jalon. */
export const ECRAN = {
  surtitre: { fr: "Calendrier", en: "Timeline", zh: "时间表" },
  titre: {
    fr: "Quand commencer quoi",
    en: "What to start when",
    zh: "什么时候做什么",
  },
  chapo: {
    fr: "Donnez votre date d'ouverture : on remonte le fil. Les démarches dont le délai est fixé par un texte reçoivent une date. Celles qui dépendent de votre mairie, de votre préfecture ou de votre copropriété reçoivent un numéro à appeler — pas une date inventée.",
    en: "Give us your opening date and we work back up the chain. Steps whose deadline is set by law get a date. Those that depend on your town hall, your prefecture or your building's owners get a number to call — not an invented date.",
    zh: "输入开业日期，我们往回倒排。凡是法律规定期限的，直接给您日期；凡是取决于市政厅、省府或业主大会的，我们给您一个该打的电话——而不是编一个日期。",
  },
  pourquoiTitre: {
    fr: "Pourquoi on ne vous donne pas toutes les dates.",
    en: "Why we do not give you every date.",
    zh: "为什么我们不把所有日期都算给您。",
  },
  pourquoiTexte: {
    fr: "Un délai d'instruction en mairie va de trois semaines à plusieurs mois selon la commune, la saison et le dossier. Un outil qui annoncerait « deux mois » se tromperait une fois sur deux, et celui qui s'en apercevrait serait celui qui ouvre en retard. Ce qui ne varie jamais, en revanche, c'est l'ordre : c'est lui que cette page vous donne en entier.",
    en: "A town-hall review takes anywhere from three weeks to several months depending on the commune, the season and the file. A tool announcing “two months” would be wrong half the time, and the person who found out would be the one opening late. What never varies is the order — and that is what this page gives you in full.",
    zh: "市政厅的审批时间从三周到好几个月都有，取决于城市、季节和材料本身。一个张口就说「两个月」的工具，有一半时候是错的，而发现它错了的人，就是那个延迟开业的人。真正永远不变的是顺序——这一页把顺序完整地给您。",
  },
  champ: {
    fr: "Votre date d'ouverture, même approximative",
    en: "Your opening date, even a rough one",
    zh: "您的开业日期，大概也行",
  },
  bouton: { fr: "Remonter le fil", en: "Work it back", zh: "倒排时间表" },
  ouvertureLe: {
    fr: "Ouverture le",
    en: "Opening on",
    zh: "开业日：",
  },
  aDemander: {
    fr: "délai à demander",
    en: "ask for the timescale",
    zh: "需自行询问时限",
  },
  apres: { fr: "Après :", en: "After:", zh: "须在此之后：" },
  aQuiDemander: { fr: "À qui demander :", en: "Who to ask:", zh: "该问谁：" },
  enSavoirPlus: {
    fr: "En savoir plus →",
    en: "Read more →",
    zh: "了解更多 →",
  },
  note: {
    fr: "Les dates calculées sont des dates limites, pas des dates conseillées : s'y prendre la veille de l'échéance, c'est n'avoir aucune marge si un dossier est incomplet. Cette page vit dans son adresse — gardez-la, elle se recalcule si votre date bouge.",
    en: "The calculated dates are deadlines, not recommendations: leaving it to the day before means no slack at all if a file turns out incomplete. This page lives in its address — keep it, and it recalculates if your date moves.",
    zh: "算出来的是「最后期限」，不是「建议日期」：拖到前一天才办，材料一旦不齐就完全没有回旋余地。这个页面的内容就在网址里——存下来，开业日期改了它会重新计算。",
  },
  localTitre: {
    fr: "Avant tout ça, il y a le local.",
    en: "Before any of this, there is the site.",
    zh: "在这一切之前，先看铺面。",
  },
  localTexte: {
    fr: "Aucune de ces démarches ne sert si l'extraction, la destination du bail ou la copropriété rendent le projet impossible. Ces cinq points-là se vérifient avant de signer.",
    en: "None of these steps matters if extraction, the lease's permitted use or the co-ownership rules make the project impossible. Those five points are checked before signing.",
    zh: "如果排烟、租约用途或共有产权规约让项目根本做不成，上面这些手续一件都没用。那五点要在签约前查清。",
  },
  localLien: {
    fr: "Ce local peut-il accueillir votre restaurant ? →",
    en: "Can this site take your restaurant? →",
    zh: "这个铺面能开您的餐厅吗？ →",
  },
} satisfies Record<string, Trad>;

/**
 * La phrase de comptage, par langue.
 *
 * Même raison que dans le diagnostic : le pluriel ne se gabarite pas, et
 * « 1 démarches » ferait douter du reste du calcul.
 */
export function resumeCalendrier(
  calcules: number,
  total: number,
  langue: Langue,
): string {
  if (langue === "en") {
    return `${calcules} of the ${total} steps have a deadline set by law: those carry a date. The rest depend on people you have to call.`;
  }
  if (langue === "zh") {
    return `${total} 项手续中，有 ${calcules} 项的期限由法律规定，所以能给出具体日期。其余的取决于您要联系的机构。`;
  }
  return `${calcules} démarche${calcules > 1 ? "s" : ""} sur ${total} ${calcules > 1 ? "ont" : "a"} un délai fixé par un texte : ${calcules > 1 ? "elles portent" : "elle porte"} une date. Les autres dépendent de gens qu'il faut appeler.`;
}
