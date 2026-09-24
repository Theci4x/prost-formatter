import type { Langue } from "@/lib/i18n/langues";
import type { EtatBon } from "@/lib/bons/regles";

/**
 * Les bons cadeaux côté maison — la page du tableau de bord, ses
 * formulaires et leurs messages —, dans les trois langues. La page
 * publique d'achat a son propre dictionnaire (`bons.ts`).
 */
export type ClesBonsCaisse = {
  titre: (nom: string) => string;
  chapo: string;
  etats: Record<EtatBon, string>;
  aServir: string;
  valables: string;
  utilises: string;
  offertsParToi: string;
  filtres: Record<EtatBon | "tous", string>;
  migration: string;
  sansStripe: string;
  relierStripe: string;
  encaisses: (n: number) => string;
  reste: (montant: string, n: number) => string;
  aucunEnCours: string;
  expirent: (n: number) => string;
  enVente: string;
  pasEnVente: string;
  voirPage: string;
  copierAdresse: string;
  adresseCopiee: string;
  aPartager: string;
  sansAdresse: string;
  caisse: string;
  codeAria: string;
  chercher: string;
  introuvableAvant: string;
  introuvableApres: string;
  pour: (nom: string) => string;
  sansNom: string;
  offertPar: (nom: string) => string;
  offertParMaison: string;
  valeur: string;
  resteCol: string;
  jusquau: string;
  expireProlonger: string;
  prolonger: string;
  deduitLe: (montant: string, jour: string) => string;
  tousTitre: string;
  nbBons: (n: number) => string;
  aucunBon: string;
  aucunFiltre: string;
  laMaison: string;
  jusquauDate: (jour: string) => string;
  voir: string;
  annuler: string;
  annulerAvertissement: string;
  annulerCe: string;
  piedTva: string;
  reglages: string;
  offrir: string;
  offrirChapo: string;

  // Formulaires
  vendreEnLigne: string;
  vendreAide: string;
  montantsProposes: string;
  montantsAide: string;
  duree: string;
  mois: (n: number) => string;
  dureeAide: string;
  motPage: string;
  motExemple: string;
  enregistrement: string;
  enregistrer: string;
  montantADeduire: string;
  unInstant: string;
  deduire: string;
  montantEuros: string;
  pourQui: string;
  sonEmail: string;
  unMot: string;
  creation: string;
  creer: string;

  // Messages des actions
  inconnu: string;
  bonInconnu: string;
  montantsInvalides: string;
  migration85: string;
  impossible: string;
  enregistre: string;
  montantManquant: string;
  depasse: string;
  encaissementImpossible: string;
  noteReste: (montant: string) => string;
  noteEpuise: string;
  montantLibre: string;
  nomManquant: string;
  emailInvalide: string;
  creationImpossible: string;
  creeEnvoye: (code: string, email: string) => string;
  cree: (code: string) => string;
};

const fr: ClesBonsCaisse = {
  titre: (nom) => `Bons cadeaux — ${nom}`,
  chapo:
    "Tes clients offrent un repas chez toi depuis une page à ton nom. Le paiement arrive sur ton compte Stripe, sans commission Klarr ; le bénéficiaire montre son code à l'addition, et tu le déduis ici.",
  etats: {
    attente: "Paiement en cours",
    valide: "Valable",
    epuise: "Utilisé",
    expire: "Expiré",
    annule: "Annulé",
  },
  aServir: "À servir",
  valables: "Valables",
  utilises: "Utilisés",
  offertsParToi: "Offerts par toi",
  filtres: {
    tous: "Tous",
    attente: "En attente",
    valide: "Valables",
    epuise: "Utilisés",
    expire: "Expirés",
    annule: "Annulés",
  },
  migration:
    "Migration à passer : supabase/migrations/0085_bons_cadeaux.sql n'est pas encore en place. La page s'ouvrira une fois la migration passée.",
  sansStripe:
    "Pour vendre des bons, relie d'abord ton compte Stripe : c'est lui qui reçoit l'argent.",
  relierStripe: "Relier mon compte Stripe",
  encaisses: (n) => {
    const s = n > 1 ? "s" : "";
    return `encaissés sur ${n} bon${s} vendu${s}`;
  },
  reste: (montant, n) => {
    const s = n > 1 ? "s" : "";
    return `Il reste ${montant} à servir sur ${n} bon${s} valable${s}.`;
  },
  aucunEnCours: "Aucun bon en cours : tout ce qui a été vendu a été servi.",
  expirent: (n) => ` ${n} expire${n > 1 ? "nt" : ""} dans les 30 jours.`,
  enVente: "En vente en ligne",
  pasEnVente: "Pas en vente",
  voirPage: "Voir la page ↗",
  copierAdresse: "Copier l'adresse",
  adresseCopiee: "Adresse copiée ✓",
  aPartager:
    "À coller dans ta bio Instagram, sur ta vitrine et ta fiche Google. C'est en novembre et décembre que les bons se vendent.",
  sansAdresse:
    "Ta page de réservation n'a pas encore d'adresse : la page de bons cadeaux utilisera la même.",
  caisse: "Encaisser un bon",
  codeAria: "Code du bon",
  chercher: "Chercher",
  introuvableAvant: "Aucun bon",
  introuvableApres:
    "chez toi. Vérifie les lettres : le code n'a ni 0, ni O, ni 1, ni I, ni L.",
  pour: (nom) => `Pour ${nom}`,
  sansNom: "Sans nom",
  offertPar: (nom) => ` · offert par ${nom}`,
  offertParMaison: " · offert par la maison",
  valeur: "Valeur",
  resteCol: "Reste",
  jusquau: "Jusqu'au",
  expireProlonger: "Expiré. Tu peux lui accorder trois mois de plus.",
  prolonger: "Prolonger de 3 mois",
  deduitLe: (m, j) => `${m} déduits le ${j}`,
  tousTitre: "Tous les bons",
  nbBons: (n) => `${n} bon${n > 1 ? "s" : ""}`,
  aucunBon:
    "Aucun bon pour l'instant. Les bons vendus et offerts apparaîtront ici.",
  aucunFiltre: "Aucun bon dans ce filtre.",
  laMaison: "La maison",
  jusquauDate: (j) => `jusqu'au ${j}`,
  voir: "Voir",
  annuler: "Annuler",
  annulerAvertissement:
    "Rembourse-le d'abord dans Stripe si le client l'a payé. Le bon ne sera plus accepté.",
  annulerCe: "Annuler ce bon",
  piedTva:
    "Rembourser un bon se fait dans ton tableau de bord Stripe ; annule-le ensuite ici pour qu'il ne soit plus accepté. Côté TVA, un bon utilisable sur toute ta carte se déclare quand il est utilisé, pas à l'achat — ton comptable te le confirmera.",
  reglages: "Réglages",
  offrir: "Offrir un bon",
  offrirChapo: "Un geste, un concours : sans paiement.",

  vendreEnLigne: "Vendre des bons cadeaux en ligne",
  vendreAide: "Décoché, la page reste en ligne mais n'accepte plus d'achat.",
  montantsProposes: "Montants proposés",
  montantsAide:
    "En euros, séparés par des virgules. Le client peut aussi choisir un montant libre entre 20 et 500 €.",
  duree: "Durée de validité",
  mois: (n) => `${n} mois`,
  dureeAide: "À partir du jour de l'achat.",
  motPage: "Un mot sur la page (facultatif)",
  motExemple:
    "Valable midi et soir, boissons comprises. Pas valable le soir du 31 décembre.",
  enregistrement: "Enregistrement…",
  enregistrer: "Enregistrer",
  montantADeduire: "Montant à déduire",
  unInstant: "Un instant…",
  deduire: "Déduire du bon",
  montantEuros: "Montant (€)",
  pourQui: "Pour qui",
  sonEmail: "Son e-mail (facultatif)",
  unMot: "Un mot (facultatif)",
  creation: "Création…",
  creer: "Créer le bon",

  inconnu: "Établissement inconnu.",
  bonInconnu: "Bon inconnu.",
  montantsInvalides:
    "Indique au moins un montant entre 20 et 500 €, par exemple « 50, 80, 100 ».",
  migration85: "La migration 0085 n'est pas encore passée.",
  impossible: "Enregistrement impossible. Réessaie.",
  enregistre: "Enregistré.",
  montantManquant: "Indique le montant à déduire.",
  depasse: "Ce montant dépasse le solde, ou le bon n'est plus valable.",
  encaissementImpossible: "Encaissement impossible. Réessaie.",
  noteReste: (m) => `C'est noté. Il reste ${m} sur ce bon.`,
  noteEpuise: "C'est noté. Le bon est entièrement utilisé.",
  montantLibre: "Choisis un montant entre 20 et 500 €.",
  nomManquant: "Indique le nom du bénéficiaire.",
  emailInvalide: "Cette adresse e-mail ne semble pas valide.",
  creationImpossible: "Création impossible. Réessaie.",
  creeEnvoye: (code, email) => `Bon ${code} créé et envoyé à ${email}.`,
  cree: (code) =>
    `Bon ${code} créé. Tu peux l'ouvrir dans la liste pour l'imprimer.`,
};

const en: ClesBonsCaisse = {
  titre: (nom) => `Gift cards — ${nom}`,
  chapo:
    "Your guests give a meal at your place from a page in your name. Payment goes to your Stripe account, with no Klarr commission; the recipient shows their code when paying, and you deduct it here.",
  etats: {
    attente: "Payment pending",
    valide: "Valid",
    epuise: "Used",
    expire: "Expired",
    annule: "Cancelled",
  },
  aServir: "Still to serve",
  valables: "Valid",
  utilises: "Used",
  offertsParToi: "Given by you",
  filtres: {
    tous: "All",
    attente: "Pending",
    valide: "Valid",
    epuise: "Used",
    expire: "Expired",
    annule: "Cancelled",
  },
  migration:
    "Migration to run: supabase/migrations/0085_bons_cadeaux.sql is not in place yet. The page will open once it has run.",
  sansStripe:
    "To sell gift cards, first connect your Stripe account: it's the one that receives the money.",
  relierStripe: "Connect my Stripe account",
  encaisses: (n) => `collected from ${n} gift card${n === 1 ? "" : "s"} sold`,
  reste: (montant, n) =>
    `${montant} still to serve on ${n} valid gift card${n === 1 ? "" : "s"}.`,
  aucunEnCours: "No gift card outstanding: everything sold has been served.",
  expirent: (n) => ` ${n} expire${n === 1 ? "s" : ""} within 30 days.`,
  enVente: "On sale online",
  pasEnVente: "Not on sale",
  voirPage: "View the page ↗",
  copierAdresse: "Copy the address",
  adresseCopiee: "Address copied ✓",
  aPartager:
    "Paste it in your Instagram bio, on your website and your Google listing. Gift cards sell in November and December.",
  sansAdresse:
    "Your booking page has no address yet: the gift card page will use the same one.",
  caisse: "Redeem a gift card",
  codeAria: "Gift card code",
  chercher: "Search",
  introuvableAvant: "No gift card",
  introuvableApres:
    "at your restaurant. Check the letters: the code has no 0, O, 1, I or L.",
  pour: (nom) => `For ${nom}`,
  sansNom: "No name",
  offertPar: (nom) => ` · given by ${nom}`,
  offertParMaison: " · given by the restaurant",
  valeur: "Value",
  resteCol: "Remaining",
  jusquau: "Valid until",
  expireProlonger: "Expired. You can grant three more months.",
  prolonger: "Extend by 3 months",
  deduitLe: (m, j) => `${m} deducted on ${j}`,
  tousTitre: "All gift cards",
  nbBons: (n) => `${n} gift card${n === 1 ? "" : "s"}`,
  aucunBon: "No gift cards yet. Cards sold and given will appear here.",
  aucunFiltre: "No gift card in this filter.",
  laMaison: "The restaurant",
  jusquauDate: (j) => `until ${j}`,
  voir: "View",
  annuler: "Cancel",
  annulerAvertissement:
    "Refund it in Stripe first if the guest paid for it. The card will no longer be accepted.",
  annulerCe: "Cancel this gift card",
  piedTva:
    "Refunds are made in your Stripe dashboard; then cancel the card here so it's no longer accepted. For VAT, a card usable on your whole menu is declared when it's used, not when it's bought — your accountant will confirm.",
  reglages: "Settings",
  offrir: "Give a gift card",
  offrirChapo: "A gesture, a contest: no payment.",

  vendreEnLigne: "Sell gift cards online",
  vendreAide:
    "Unticked, the page stays online but no longer accepts purchases.",
  montantsProposes: "Suggested amounts",
  montantsAide:
    "In euros, separated by commas. Guests can also pick any amount between €20 and €500.",
  duree: "Validity",
  mois: (n) => `${n} months`,
  dureeAide: "From the day of purchase.",
  motPage: "A note on the page (optional)",
  motExemple:
    "Valid for lunch and dinner, drinks included. Not valid on New Year's Eve.",
  enregistrement: "Saving…",
  enregistrer: "Save",
  montantADeduire: "Amount to deduct",
  unInstant: "One moment…",
  deduire: "Deduct from card",
  montantEuros: "Amount (€)",
  pourQui: "For whom",
  sonEmail: "Their email (optional)",
  unMot: "A note (optional)",
  creation: "Creating…",
  creer: "Create the gift card",

  inconnu: "Unknown restaurant.",
  bonInconnu: "Unknown gift card.",
  montantsInvalides:
    "Enter at least one amount between €20 and €500, e.g. “50, 80, 100”.",
  migration85: "Migration 0085 has not been run yet.",
  impossible: "Couldn't save. Please try again.",
  enregistre: "Saved.",
  montantManquant: "Enter the amount to deduct.",
  depasse: "This amount exceeds the balance, or the card is no longer valid.",
  encaissementImpossible: "Couldn't redeem. Please try again.",
  noteReste: (m) => `Done. ${m} left on this card.`,
  noteEpuise: "Done. The card is fully used.",
  montantLibre: "Choose an amount between €20 and €500.",
  nomManquant: "Enter the recipient's name.",
  emailInvalide: "This email address doesn't look valid.",
  creationImpossible: "Couldn't create it. Please try again.",
  creeEnvoye: (code, email) =>
    `Gift card ${code} created and sent to ${email}.`,
  cree: (code) =>
    `Gift card ${code} created. Open it from the list to print it.`,
};

const zh: ClesBonsCaisse = {
  titre: (nom) => `礼品卡 — ${nom}`,
  chapo:
    "客人可以在以您店名命名的页面上购买礼品卡，请别人来您店里吃饭。款项进入您的 Stripe 账户，Klarr 不抽成；收礼人结账时出示兑换码，您在这里扣款。",
  etats: {
    attente: "付款中",
    valide: "有效",
    epuise: "已用完",
    expire: "已过期",
    annule: "已作废",
  },
  aServir: "待兑现",
  valables: "有效",
  utilises: "已用完",
  offertsParToi: "店家赠送",
  filtres: {
    tous: "全部",
    attente: "待付款",
    valide: "有效",
    epuise: "已用完",
    expire: "已过期",
    annule: "已作废",
  },
  migration:
    "需要执行迁移：supabase/migrations/0085_bons_cadeaux.sql 尚未执行。执行后此页面即可使用。",
  sansStripe: "要销售礼品卡，请先连接您的 Stripe 账户：款项会进入这个账户。",
  relierStripe: "连接我的 Stripe 账户",
  encaisses: (n) => `来自已售出的 ${n} 张礼品卡`,
  reste: (montant, n) => `${n} 张有效礼品卡还有 ${montant} 待兑现。`,
  aucunEnCours: "没有未兑现的礼品卡：已售出的都已使用。",
  expirent: (n) => `其中 ${n} 张将在 30 天内过期。`,
  enVente: "正在在线销售",
  pasEnVente: "未开放销售",
  voirPage: "查看页面 ↗",
  copierAdresse: "复制网址",
  adresseCopiee: "网址已复制 ✓",
  aPartager:
    "可以放在 Instagram 简介、官网和 Google 商家资料上。礼品卡在 11 月和 12 月卖得最好。",
  sansAdresse: "您的订位页面还没有网址：礼品卡页面会使用同一个网址。",
  caisse: "兑换礼品卡",
  codeAria: "礼品卡兑换码",
  chercher: "查找",
  introuvableAvant: "您店里没有兑换码为",
  introuvableApres: "的礼品卡。请核对字母：兑换码里没有 0、O、1、I、L。",
  pour: (nom) => `收礼人：${nom}`,
  sansNom: "未填姓名",
  offertPar: (nom) => ` · 由 ${nom} 赠送`,
  offertParMaison: " · 店家赠送",
  valeur: "面额",
  resteCol: "余额",
  jusquau: "有效期至",
  expireProlonger: "已过期。您可以再延长三个月。",
  prolonger: "延长 3 个月",
  deduitLe: (m, j) => `${j} 扣除 ${m}`,
  tousTitre: "全部礼品卡",
  nbBons: (n) => `${n} 张`,
  aucunBon: "暂无礼品卡。售出和赠送的礼品卡都会显示在这里。",
  aucunFiltre: "该筛选下没有礼品卡。",
  laMaison: "店家",
  jusquauDate: (j) => `有效期至 ${j}`,
  voir: "查看",
  annuler: "作废",
  annulerAvertissement:
    "如果客人已付款，请先在 Stripe 里退款。作废后这张礼品卡将无法再使用。",
  annulerCe: "作废这张礼品卡",
  piedTva:
    "退款请在 Stripe 后台操作，然后在这里作废，以免再被使用。增值税方面，可用于全部菜单的礼品卡在使用时申报，而不是购买时——请与您的会计确认。",
  reglages: "设置",
  offrir: "赠送礼品卡",
  offrirChapo: "表达心意或举办活动：无需付款。",

  vendreEnLigne: "在线销售礼品卡",
  vendreAide: "取消勾选后，页面仍然在线，但不再接受购买。",
  montantsProposes: "可选面额",
  montantsAide:
    "以欧元为单位，用逗号分隔。客人也可以自选 20 到 500 欧之间的金额。",
  duree: "有效期",
  mois: (n) => `${n} 个月`,
  dureeAide: "从购买当天起计算。",
  motPage: "页面上的说明（选填）",
  motExemple: "午市和晚市均可使用，含饮品。12 月 31 日晚上不可使用。",
  enregistrement: "正在保存…",
  enregistrer: "保存",
  montantADeduire: "扣除金额",
  unInstant: "请稍候…",
  deduire: "从礼品卡扣除",
  montantEuros: "金额（€）",
  pourQui: "送给谁",
  sonEmail: "收礼人邮箱（选填）",
  unMot: "留言（选填）",
  creation: "正在创建…",
  creer: "创建礼品卡",

  inconnu: "未知的餐厅。",
  bonInconnu: "未知的礼品卡。",
  montantsInvalides:
    "请至少填写一个 20 到 500 欧之间的金额，例如「50, 80, 100」。",
  migration85: "0085 号迁移尚未执行。",
  impossible: "保存失败，请重试。",
  enregistre: "已保存。",
  montantManquant: "请填写要扣除的金额。",
  depasse: "金额超过余额，或者这张礼品卡已失效。",
  encaissementImpossible: "扣款失败，请重试。",
  noteReste: (m) => `已记录。这张礼品卡还剩 ${m}。`,
  noteEpuise: "已记录。这张礼品卡已全部用完。",
  montantLibre: "请选择 20 到 500 欧之间的金额。",
  nomManquant: "请填写收礼人姓名。",
  emailInvalide: "这个邮箱地址似乎无效。",
  creationImpossible: "创建失败，请重试。",
  creeEnvoye: (code, email) => `礼品卡 ${code} 已创建，并已发送到 ${email}。`,
  cree: (code) => `礼品卡 ${code} 已创建。可以在列表中打开并打印。`,
};

export const BONS_CAISSE: Record<Langue, ClesBonsCaisse> = { fr, en, zh };
