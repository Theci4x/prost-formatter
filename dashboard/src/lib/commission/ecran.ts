import type { Trad } from "@/lib/i18n/outils";

/**
 * Les textes du calculateur de commissions, en trois langues.
 *
 * **Le calcul peut conclure contre nous, et la traduction ne l'adoucit
 * pas.** C'est la règle de `calcul.ts`, et elle se perdrait vite ici :
 * il est tentant, en réécrivant une phrase dans une autre langue, de
 * faire disparaître « nous vous disons de ne pas le prendre ». Les trois
 * verdicts disent donc la même chose avec la même franchise, y compris
 * celui qui nous fait perdre la vente.
 *
 * Les montants ne sont jamais écrits dans ces phrases : ils arrivent par
 * les jetons `{ecart}`, `{gaspillage}`, `{mois}`, `{prix}`, `{part}` et
 * `{seuil}`, remplis par la page à partir de `calcul.ts`. Un chiffre
 * recopié ici mentirait le jour où l'abonnement change de prix.
 */

export const ECRAN = {
  surtitre: { fr: "Calculateur", en: "Calculator", zh: "计算器" },
  titre: {
    fr: "Combien vous coûtent vos commissions ?",
    en: "What are your commissions costing you?",
    zh: "平台抽成到底花了您多少钱？",
  },
  chapo: {
    fr: "Trois chiffres, dont un que les comparateurs d'éditeurs ne posent jamais : la part de vos clients qui seraient venus sans la plateforme. C'est celui qui décide.",
    en: "Three numbers, one of which vendors' comparison tools never ask for: the share of your customers who would have come anyway, without the platform. That is the one that decides.",
    zh: "三个数字，其中一个是各家厂商的「对比工具」从来不问的：您的客人里，有多少本来就会来、根本不需要平台。决定性的就是这一个。",
  },

  champCouverts: {
    fr: "Couverts réservés via la plateforme, par mois",
    en: "Covers booked through the platform, per month",
    zh: "每月通过平台订位的人数",
  },
  aideCouverts: {
    fr: "Pas votre total de couverts : seulement ceux qui passent par elle.",
    en: "Not your total covers: only the ones that go through it.",
    zh: "不是您的总客数：只算经由平台来的那部分。",
  },
  champCommission: {
    fr: "Commission par couvert, en euros",
    en: "Commission per cover, in euros",
    zh: "每位客人的抽成，以欧元计",
  },
  aideCommission: {
    fr: "Entre 1 et 2 € chez la plupart des plateformes françaises. Prenez le vôtre, il se négocie.",
    en: "Between €1 and €2 on most French platforms. Use your own figure — it is negotiable.",
    zh: "法国大多数平台在 1 到 2 欧之间。填您自己的数字，这个是可以谈的。",
  },
  champAcquis: {
    fr: "Sur 100 de ces clients, combien seraient venus sans elle ?",
    en: "Out of 100 of those customers, how many would have come anyway?",
    zh: "这些客人里，每 100 位有多少本来就会来？",
  },
  aideAcquis: {
    fr: "Personne ne le sait au couvert près. Vos habitués, ceux qui vous cherchaient par votre nom, ceux qui passaient devant : estimez.",
    en: "Nobody knows this to the cover. Your regulars, those who searched for you by name, those walking past: give an estimate.",
    zh: "没人能精确到个位。您的熟客、专门搜您店名的人、路过进来的人——估个数就行。",
  },
  bouton: { fr: "Calculer", en: "Run the numbers", zh: "开始计算" },

  surUneAnnee: { fr: "Sur une année", en: "Over a year", zh: "以一年计" },
  ligneCout: {
    fr: "Ce que la commission vous coûte",
    en: "What the commission costs you",
    zh: "抽成一共花了您多少",
  },
  /** `{mois}` : le même coût, ramené au mois. */
  aideCout: {
    fr: "{mois} par mois",
    en: "{mois} per month",
    zh: "每月 {mois}",
  },
  ligneGaspillage: {
    fr: "Payé sur des clients qui seraient venus quand même",
    en: "Paid on customers who would have come anyway",
    zh: "花在本来就会来的客人身上",
  },
  /** `{part}` : le pourcentage saisi par le lecteur. */
  aideGaspillage: {
    fr: "{part} % de la commission",
    en: "{part}% of the commission",
    zh: "占抽成的 {part}%",
  },
  ligneAcquisition: {
    fr: "Payé pour une vraie découverte",
    en: "Paid for a genuine new customer",
    zh: "花在真正的新客上",
  },
  aideAcquisition: {
    fr: "Là, la commission achète quelque chose",
    en: "Here, the commission is buying something",
    zh: "这部分抽成是买到东西的",
  },
  ligneAbonnement: {
    fr: "L'abonnement Klarr, module Réservations",
    en: "The Klarr subscription, Réservations module",
    zh: "Klarr 订阅费，Réservations（订位）模块",
  },
  /** `{prix}` : le prix mensuel, tiré de `modules.ts`. */
  aideAbonnement: {
    fr: "{prix} € HT par mois, sans commission",
    en: "€{prix} per month excl. VAT, no commission",
    zh: "每月 {prix} 欧（不含增值税），不抽成",
  },
  horsTaxes: { fr: "HT", en: "excl. VAT", zh: "不含税" },

  /** `{ecart}` : ce que l'abonnement fait économiser sur l'année. */
  abonnementTitre: {
    fr: "L'abonnement vous coûterait {ecart} de moins par an.",
    en: "The subscription would cost you {ecart} less per year.",
    zh: "改用订阅，一年能少花 {ecart}。",
  },
  /** `{gaspillage}` : la part payée sur des clients déjà acquis. */
  abonnementTexte: {
    fr: "Et surtout : les {gaspillage} payés sur des clients déjà acquis ne servent à rien. C'est cette ligne-là qu'un abonnement supprime — pas la découverte, que vous continuerez de payer autrement.",
    en: "And more to the point: the {gaspillage} paid on customers you already had buys nothing. That is the line a subscription removes — not the discovery, which you will go on paying for one way or another.",
    zh: "更关键的是：花在既有客人身上的那 {gaspillage}，什么也没买到。订阅制砍掉的正是这一项——不是拉新，拉新您换个方式照样要付钱。",
  },
  /** `{ecart}` : l'écart annuel, jugé trop faible pour changer d'outil. */
  limiteTitre: {
    fr: "L'écart est de {ecart} par an. C'est peu.",
    en: "The gap is {ecart} a year. That is not much.",
    zh: "差距是一年 {ecart}。这不算多。",
  },
  limiteTexte: {
    fr: "À ce niveau, changer d'outil ne se justifie pas par le prix seul. Regardez plutôt ce que vous perdez d'autre : la relation au client, le fichier, la main sur vos disponibilités. Si ça vous est égal, restez.",
    en: "At that level, switching tools is not justified by price alone. Look instead at what else you are giving up: the relationship with the customer, the mailing list, control over your own availability. If none of that matters to you, stay put.",
    zh: "差这么点钱，光凭价格不值得换系统。真正该看的是您还失去了什么：和客人的直接关系、客户名单、对自家台位的掌控。如果这些您都不在乎，那就别动。",
  },
  commissionTitre: {
    fr: "À votre volume, la commission vous coûte moins cher que notre abonnement.",
    en: "At your volume, the commission costs you less than our subscription.",
    zh: "以您目前的量来算，抽成比我们的订阅更便宜。",
  },
  /** `{seuil}` : le volume à partir duquel l'abonnement devient moins cher. */
  commissionTexte: {
    fr: "Nous vendons l'abonnement, et nous vous disons de ne pas le prendre : en dessous d'environ {seuil} réservés par mois à ce tarif, la plateforme est le bon calcul. Revenez quand vous les dépasserez.",
    en: "We sell the subscription, and we are telling you not to take it: below roughly {seuil} booked per month at that rate, the platform is the right call. Come back when you go past that.",
    zh: "订阅是我们卖的，而我们劝您别买：按这个费率，每月订位低于大约 {seuil}时，用平台才是划算的。等您超过了再回来找我们。",
  },
  /** Quand la commission est nulle : aucun seuil n'existe. */
  ceVolume: { fr: "ce volume", en: "that volume", zh: "这个量" },
  /** `{n}` couverts, au pluriel de chaque langue. */
  couverts: {
    fr: "{n} couverts",
    en: "{n} covers",
    zh: "{n} 位客人",
  },

  note: {
    fr: "Ce calcul ne compte que les commissions. Il ignore ce qu'une plateforme apporte — de la demande que vous n'auriez pas eue — et ce qu'elle coûte en plus : l'adresse e-mail de votre client, que vous ne récupérez pas.",
    en: "This calculation counts commissions only. It ignores what a platform brings you — demand you would not otherwise have had — and what it costs you on top: your customer's email address, which you never get back.",
    zh: "这个计算只算抽成。它没算平台带来的好处——您本来接不到的那部分需求——也没算它额外拿走的东西：您客人的邮箱地址，那是拿不回来的。",
  },
  neutreTitre: {
    fr: "Nous ne sommes pas neutres, et autant le dire.",
    en: "We are not neutral, and we may as well say so.",
    zh: "我们不是中立的，索性说明白。",
  },
  neutreTexte: {
    fr: "Klarr vend une page de réservation à l'abonnement, sans commission : nous avons un intérêt direct à ce que vous trouviez les commissions trop chères. C'est pourquoi ce calculateur vous donne la méthode plutôt qu'un résultat, et vous dit quand rester où vous êtes.",
    en: "Klarr sells a booking page on subscription, with no commission: we have a direct interest in you finding commissions too expensive. That is why this calculator hands you the method rather than a verdict, and tells you when to stay where you are.",
    zh: "Klarr 卖的是按月订阅、不抽成的订位页：您觉得抽成太贵，对我们有直接好处。正因如此，这个计算器给您的是算法本身，而不是一个结论，并且会在该留下时告诉您留下。",
  },
  lienJournal: {
    fr: "Le raisonnement en entier, dans le journal →",
    en: "The full reasoning, in the journal →",
    zh: "完整的推演，在我们的专栏里 →",
  },
  lienComparatif: {
    fr: "Le comparatif avec TheFork, Zenchef et Guestonline →",
    en: "The comparison with TheFork, Zenchef and Guestonline →",
    zh: "与 TheFork、Zenchef、Guestonline 的对比 →",
  },
} satisfies Record<string, Trad>;

/** Remplace les jetons `{clé}` d'un texte traduit par leurs valeurs. */
export function remplir(
  texte: string,
  valeurs: Record<string, string | number>,
): string {
  return Object.entries(valeurs).reduce(
    (acc, [cle, valeur]) => acc.split(`{${cle}}`).join(String(valeur)),
    texte,
  );
}
