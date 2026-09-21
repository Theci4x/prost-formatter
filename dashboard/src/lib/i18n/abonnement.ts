import type { Langue } from "@/lib/i18n/langue";

/**
 * L'écran d'abonnement, dans les trois langues.
 *
 * C'est celui où se décide l'argent, et le seul du tableau de bord où
 * une phrase mal comprise coûte directement quelque chose : un
 * restaurateur qui ne saisit pas que « Ajouter » veut dire « passer au
 * pack » croira souscrire une seconde fois.
 *
 * Deux précautions valent pour les trois langues. On distingue toujours
 * **le prix hors taxes et le prix débité** — c'est le second qui part de
 * la banque, et une surprise au débit est une résiliation. Et on nomme
 * toujours la date à laquelle un module **se ferme**, plutôt que de dire
 * qu'il « expire » : l'un se comprend sans contexte, l'autre non.
 *
 * Les libellés et les prix des modules viennent de `modules.ts`, jamais
 * recopiés ici : le jour où un tarif change, il change à un seul
 * endroit.
 */

export type ClesAbonnement = {
  titre(restaurant: string): string;

  statuts: Record<
    | "active"
    | "trialing"
    | "past_due"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "unpaid",
    string
  >;

  erreurTitre: string;
  erreurConfiguration: string;
  erreurDejaAbonne: string;

  banqueAttend(montant: string): string;
  factureAttend(montant: string): string;
  authentificationTexte: string;
  relancesTexte: string;
  confirmerPaiement: string;
  regler: string;

  souscriptionAbandonnee: string;
  basculePack: string;

  essaiBandeau(jours: number): string;
  essaiChapo: string;
  essaiEnCours(jours: number): string;

  statutLabel: string;
  resiliationDemandee: string;
  prendFinLe(date: string): string;
  prochainRenouvellement(date: string): string;
  fermeraCeJourLa: string;
  ouvertPendantEssai: string;
  moduleFerme: string;
  gerer: string;
  sabonner: string;

  prendreLesDeux: string;
  ajouterModule(module: string): string;
  packExplication: string;
  passerAuPack: string;

  pied: string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesAbonnement = {
  titre: (r) => `Abonnement — ${r}`,
  statuts: {
    active: "Actif",
    trialing: "Période d'essai",
    past_due: "Paiement en retard",
    canceled: "Résilié",
    incomplete: "Paiement incomplet",
    incomplete_expired: "Paiement expiré",
    unpaid: "Impayé",
  },
  erreurTitre: "La souscription n'a pas pu s'ouvrir.",
  erreurConfiguration:
    "Aucun tarif n'est configuré pour ce module (STRIPE_PRICE_ID_…).",
  erreurDejaAbonne:
    "Ce module est déjà payé. Utilisez « Gérer » pour changer de carte ou résilier — souscrire une seconde fois vous ferait payer deux fois.",
  banqueAttend: (m) => `Ta banque attend ta confirmation pour ${m}.`,
  factureAttend: (m) => `Une facture de ${m} attend son règlement.`,
  authentificationTexte:
    "Ta carte est bonne — il manque seulement la validation de sécurité de ta banque. Sans elle, le paiement n'aboutit pas et ton abonnement finira par se fermer.",
  relancesTexte:
    "Ton abonnement reste ouvert le temps des relances, puis se fermera. Régler maintenant évite la coupure.",
  confirmerPaiement: "Confirmer le paiement",
  regler: "Régler",
  souscriptionAbandonnee: "Souscription abandonnée. Rien n'a été prélevé.",
  basculePack:
    "C'est fait : ton abonnement couvre maintenant les deux modules. Seule la différence au prorata t'a été facturée, et ta date de renouvellement n'a pas changé.",
  essaiBandeau: (j) => `Essai gratuit — ${j} jour${s(j)} restant${s(j)}.`,
  essaiChapo:
    "Chaque module a sa propre période, indiquée ci-dessous. Ensuite ils se paient séparément, et ta page de réservation comme ton site vitrine restent en ligne tant que le module correspondant l'est.",
  essaiEnCours: (j) => `Essai en cours — ${j} jour${s(j)} restant${s(j)}.`,
  statutLabel: "Statut :",
  resiliationDemandee: " — résiliation demandée",
  prendFinLe: (d) => `Prend fin le ${d}`,
  prochainRenouvellement: (d) => `Prochain renouvellement : ${d}`,
  fermeraCeJourLa: " — le module se fermera ce jour-là.",
  ouvertPendantEssai: "Ouvert pendant l'essai. Souscris pour le garder.",
  moduleFerme: "Ce module est fermé.",
  gerer: "Gérer",
  sabonner: "S'abonner",
  prendreLesDeux: "Prendre les deux",
  ajouterModule: (m) => `Ajouter ${m}`,
  packExplication:
    "Ton abonnement passe au pack, qui ouvre les deux modules pour moins cher que les deux pris séparément. Tu ne paies aujourd'hui que la différence au prorata des jours restants, et ta date de renouvellement ne change pas.",
  passerAuPack: "Passer au pack",
  pied: "Les deux modules s'achètent séparément : tu peux prendre la visibilité sans les réservations, ou l'inverse. Un abonnement vaut pour cet établissement — un second restaurant a son propre carnet, sa propre fiche Google et sa propre clientèle, donc ses propres abonnements. Aucune commission par couvert, jamais.",
};

const en: ClesAbonnement = {
  titre: (r) => `Subscription — ${r}`,
  statuts: {
    active: "Active",
    trialing: "Trial",
    past_due: "Payment overdue",
    canceled: "Cancelled",
    incomplete: "Payment incomplete",
    incomplete_expired: "Payment expired",
    unpaid: "Unpaid",
  },
  erreurTitre: "The subscription could not be opened.",
  erreurConfiguration:
    "No price is configured for this module (STRIPE_PRICE_ID_…).",
  erreurDejaAbonne:
    "This module is already paid for. Use “Manage” to change card or cancel — subscribing a second time would charge you twice.",
  banqueAttend: (m) => `Your bank is waiting for you to confirm ${m}.`,
  factureAttend: (m) => `An invoice of ${m} is waiting to be settled.`,
  authentificationTexte:
    "Your card is fine — only your bank's security check is missing. Without it the payment does not go through, and your subscription will eventually close.",
  relancesTexte:
    "Your subscription stays open while reminders go out, then closes. Paying now avoids the cut-off.",
  confirmerPaiement: "Confirm the payment",
  regler: "Pay",
  souscriptionAbandonnee: "Subscription abandoned. Nothing was charged.",
  basculePack:
    "Done: your subscription now covers both modules. Only the pro-rata difference was charged, and your renewal date has not changed.",
  essaiBandeau: (j) => `Free trial — ${j} day${s(j)} left.`,
  essaiChapo:
    "Each module has its own trial period, shown below. After that they are paid for separately, and both your booking page and your website stay online for as long as the matching module is.",
  essaiEnCours: (j) => `Trial running — ${j} day${s(j)} left.`,
  statutLabel: "Status:",
  resiliationDemandee: " — cancellation requested",
  prendFinLe: (d) => `Ends on ${d}`,
  prochainRenouvellement: (d) => `Next renewal: ${d}`,
  fermeraCeJourLa: " — the module closes that day.",
  ouvertPendantEssai: "Open during the trial. Subscribe to keep it.",
  moduleFerme: "This module is closed.",
  gerer: "Manage",
  sabonner: "Subscribe",
  prendreLesDeux: "Take both",
  ajouterModule: (m) => `Add ${m}`,
  packExplication:
    "Your subscription moves to the bundle, which opens both modules for less than the two bought separately. Today you only pay the pro-rata difference for the remaining days, and your renewal date does not change.",
  passerAuPack: "Move to the bundle",
  pied: "The two modules are bought separately: you can take visibility without bookings, or the other way round. A subscription covers this establishment — a second restaurant has its own booking system, its own Google listing and its own customers, so its own subscriptions. No commission per cover, ever.",
};

const zh: ClesAbonnement = {
  titre: (r) => `订阅 — ${r}`,
  statuts: {
    active: "生效中",
    trialing: "试用期",
    past_due: "付款逾期",
    canceled: "已取消",
    incomplete: "付款未完成",
    incomplete_expired: "付款已过期",
    unpaid: "未付款",
  },
  erreurTitre: "订阅没能开通。",
  erreurConfiguration: "这个模块还没有配置价格（STRIPE_PRICE_ID_…）。",
  erreurDejaAbonne:
    "这个模块已经付过费了。请用「管理」来更换银行卡或取消订阅——再订一次会让您付两次钱。",
  banqueAttend: (m) => `您的银行正在等您确认 ${m} 这笔支付。`,
  factureAttend: (m) => `有一张 ${m} 的账单待支付。`,
  authentificationTexte:
    "您的卡没问题——只差银行的安全验证。少了这一步，款项不会到账，订阅最终会被关闭。",
  relancesTexte: "在催款期间订阅仍然有效，之后就会关闭。现在付清可以避免中断。",
  confirmerPaiement: "确认支付",
  regler: "去支付",
  souscriptionAbandonnee: "订阅已放弃。没有扣任何款项。",
  basculePack:
    "已完成：您的订阅现在覆盖两个模块。只按剩余天数收取了差价，续费日期没有变化。",
  essaiBandeau: (j) => `免费试用 — 还剩 ${j} 天。`,
  essaiChapo:
    "每个模块都有各自的试用期，见下方。试用期结束后两者分开计费；只要对应模块还开着，您的订位页和官网就会一直在线。",
  essaiEnCours: (j) => `试用中 — 还剩 ${j} 天。`,
  statutLabel: "状态：",
  resiliationDemandee: " — 已申请取消",
  prendFinLe: (d) => `于 ${d} 结束`,
  prochainRenouvellement: (d) => `下次续费：${d}`,
  fermeraCeJourLa: " — 模块将于当天关闭。",
  ouvertPendantEssai: "试用期内已开通。订阅后可继续使用。",
  moduleFerme: "这个模块目前已关闭。",
  gerer: "管理",
  sabonner: "订阅",
  prendreLesDeux: "两个一起买",
  ajouterModule: (m) => `添加${m}`,
  packExplication:
    "您的订阅会改为套餐，同时开通两个模块，比分开买便宜。今天只需按剩余天数补差价，续费日期不变。",
  passerAuPack: "改为套餐",
  pied: "两个模块可以分开买：您可以只要曝光模块而不要订位，反过来也行。一份订阅只对应一家店——第二家店有自己的订位簿、自己的 Google 商家资料和自己的客人，因此也要有自己的订阅。永远不按人头抽成。",
};

export const ABONNEMENT: Record<Langue, ClesAbonnement> = { fr, en, zh };
