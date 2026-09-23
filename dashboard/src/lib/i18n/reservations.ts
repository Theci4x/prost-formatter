import type { Langue } from "@/lib/i18n/langue";

/**
 * Le carnet de réservation, dans les trois langues.
 *
 * Deuxième dictionnaire d'écran, après celui de l'accueil, et le plus
 * lourd : c'est la page qu'un restaurateur ouvre vingt fois par jour.
 * Elle porte donc la règle qui vaudra pour les vingt-six suivantes —
 * **une chaîne quand la phrase est figée, une fonction dès qu'elle
 * compte quelque chose.** Le français accorde, l'anglais accorde
 * autrement, et le chinois exige un spécificatif qui dépend de ce qu'on
 * compte : 位 pour un couvert, 条 pour une demande, 天 pour un jour.
 *
 * Les dates ne sont pas ici mais dans `dates.ts` : elles servent aussi
 * ailleurs, et un format recopié d'un écran à l'autre finit par diverger.
 *
 * Le français tutoie, l'anglais et le chinois non — c'est la convention
 * posée dans `accueil.ts`, et elle tient pour tout le tableau de bord.
 */

export type ClesReservations = {
  titre(restaurant: string): string;
  chapo: string;
  liens: Record<"service" | "plan" | "experiences" | "configuration", string>;

  statuts: Record<
    "demande" | "confirmee" | "refusee" | "annulee" | "expiree",
    string
  >;
  annuleeParClient: string;

  optionExpiree: string;
  optionHeures(h: number): string;
  optionJours(j: number): string;

  couverts(n: number): string;
  privatisation: string;
  priseAuTelephone: string;
  accepteRecontact: string;
  minimumConsommation(montant: string, taxe: string): string;
  ht: string;
  ttc: string;

  tableVide: string;
  retirerConstat: string;
  pasVenus: string;

  salleTenue(restant: string | null): string;
  lienCaution: string;
  lienAcompte: string;
  relancer: string;
  relanceLe(quand: string): string;
  dejaEncaisse: string;
  pasDeCaution: string;

  devisStatut(statut: string): string;
  devisAcompte(montant: string): string;
  reprendreBrouillon: string;
  ouvrirDevis: string;
  etablirDevis: string;
  annulerReservation: string;

  enCours: Record<
    | "enregistrement"
    | "envoi"
    | "retrait"
    | "levee"
    | "ouverture"
    | "annulation",
    string
  >;

  aTraiter: string;
  /** Les trois compteurs en tête d'écran. */
  compteurATraiter(n: number): string;
  compteurGaranties(n: number): string;
  compteurCouvertsDuJour(n: number): string;
  compteurAVenir(n: number): string;
  aucuneDemande: string;
  garanties: string;
  garantiesChapo: string;
  calendrier: string;
  moisPrecedent: string;
  moisSuivant: string;
  choisirJour: string;
  cliquerDate: string;
  rienPrevu: string;

  /** Les composants de la ligne : décision, note, caution, lien. */
  accepter: string;
  confirmationEnCours: string;
  refuser: string;
  refusEnCours: string;
  noteInterne: string;
  jamaisVisible: string;
  placeholderNote: string;
  enregistrer: string;
  noteEnregistree: string;
  lienPaiement: string;
  copier: string;
  copie: string;
  debiterCaution: string;
  libererGroupeVenu: string;
  combienPrelever: string;
  auMaximum(montant: string): string;
  preleverMaintenant: string;
  prelevementEnCours: string;
  annuler: string;

  /** Les coordonnées du client, corrigeables sur place. */
  corriger: string;
  renvoyerEmail: string;
  nomClient: string;
  emailClient: string;
  telephoneClient: string;
  placeholderEmail: string;
  placeholderTelephone: string;
  fermer: string;
  enregistre: string;
  dejaEnvoyes: string;

  /** La saisie d'une réservation prise au téléphone. */
  saisieTitre: string;
  saisieOuvrir: string;
  champNom: string;
  champEmail: string;
  champDate: string;
  champCouverts: string;
  champService: string;
  champType: string;
  typeTable: string;
  typePrivatisation: string;
  champEspace: string;
  espaceOption(nom: string, capacite: number): string;
  facultatif: string;
  placeholderEmailClient: string;
  placeholderNoteSaisie: string;
  enregistrerReservation: string;

  /** Les statistiques du carnet. */
  statistiques: string;
  fenetre(jours: number): string;
  periode(jours: number): string;
  tuiles: Record<
    "couverts" | "reservations" | "venuesPage" | "acceptees",
    string
  >;
  absences(tables: number, couverts: number, taux: string): string;
  parJour: string;
  parEspace: string;
  espaceSupprime: string;
  parType: string;
  individuelles: string;
  privatisations: string;
  parOrigine: string;
  tapage: string;
  telephone: string;
  uniteCouverts: string;
  detailBarre(reservations: number, couverts: number): string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesReservations = {
  titre: (r) => `Réservations — ${r}`,
  chapo:
    "Les demandes arrivent ici. Tant qu'elles ne sont pas tranchées, elles bloquent le créneau — jusqu'à l'expiration de leur option.",
  liens: {
    service: "Écran de service",
    plan: "Plan de salle",
    experiences: "Expériences",
    configuration: "Espaces, services et page publique",
  },
  statuts: {
    demande: "En attente",
    confirmee: "Confirmée",
    refusee: "Refusée",
    annulee: "Annulée",
    expiree: "Option expirée",
  },
  annuleeParClient: "Annulée par le client",
  optionExpiree: "Option expirée",
  optionHeures: (h) => `Option : ${h} h restantes`,
  optionJours: (j) => `Option : ${j} j restants`,
  couverts: (n) => `${n} couvert${s(n)}`,
  privatisation: "privatisation",
  priseAuTelephone: "prise au téléphone",
  accepteRecontact: "Accepte d'être recontacté",
  minimumConsommation: (m, taxe) =>
    `Minimum de consommation annoncé : ${m} € ${taxe}`,
  ht: "HT",
  ttc: "TTC",
  tableVide: "Table restée vide",
  retirerConstat: "Retirer ce constat",
  pasVenus: "Ils ne sont pas venus",
  salleTenue: (restant) =>
    `Acceptée — la salle est tenue${restant ? ` ${restant}` : ""}, et ne sera ferme qu'une fois la carte enregistrée.`,
  lienCaution:
    "Ton client a reçu ce lien par e-mail : il enregistrera sa carte, rien ne sera prélevé.",
  lienAcompte:
    "Ton client a reçu ce lien par e-mail : il paiera sur ton compte Stripe, sans commission.",
  relancer: "Relancer par e-mail",
  relanceLe: (q) => `Relancé le ${q}`,
  dejaEncaisse: "Déjà encaissé (virement, espèces)",
  pasDeCaution: "Ne pas demander de caution",
  devisStatut: (st) => `Devis ${st}`,
  devisAcompte: (m) => ` · acompte ${m}`,
  reprendreBrouillon: "Reprendre le brouillon",
  ouvrirDevis: "Ouvrir le devis",
  etablirDevis: "Établir un devis",
  annulerReservation: "Annuler cette réservation",
  enCours: {
    enregistrement: "Enregistrement…",
    envoi: "Envoi…",
    retrait: "Retrait…",
    levee: "Levée…",
    ouverture: "Ouverture…",
    annulation: "Annulation…",
  },
  aTraiter: "À traiter",
  compteurATraiter: (n) => (n > 1 ? "demandes à traiter" : "demande à traiter"),
  compteurGaranties: (n) =>
    n > 1 ? "acomptes ou cautions à régler" : "acompte ou caution à régler",
  compteurCouvertsDuJour: (n) =>
    n > 1 ? "couverts confirmés aujourd'hui" : "couvert confirmé aujourd'hui",
  compteurAVenir: (n) =>
    n > 1 ? "réservations confirmées à venir" : "réservation confirmée à venir",
  aucuneDemande: "Aucune demande en attente.",
  garanties: "Acomptes et cautions",
  garantiesChapo:
    "Les réservations à venir qui engagent de l'argent, et où elles en sont. Elles quittent cette liste une fois le service passé.",
  calendrier: "Calendrier",
  moisPrecedent: "Mois précédent",
  moisSuivant: "Mois suivant",
  choisirJour: "Choisis un jour",
  cliquerDate:
    "Clique sur une date du calendrier pour voir ce qui est prévu ce jour-là.",
  rienPrevu: "Rien de prévu ce jour-là.",
  accepter: "Accepter",
  confirmationEnCours: "Confirmation…",
  refuser: "Refuser",
  refusEnCours: "Refus…",
  noteInterne: "Note interne",
  jamaisVisible: "(jamais visible du client)",
  placeholderNote: "Allergie aux fruits de mer, arrive à 19h30…",
  enregistrer: "Enregistrer",
  noteEnregistree: "Note enregistrée.",
  lienPaiement: "Lien de paiement de l'acompte",
  copier: "Copier",
  copie: "Copié",
  debiterCaution: "Débiter la caution",
  libererGroupeVenu: "Libérer — le groupe est venu",
  combienPrelever: "Combien prélever ?",
  auMaximum: (m) => `€ — ${m} au maximum`,
  preleverMaintenant: "Prélever maintenant",
  prelevementEnCours: "Prélèvement…",
  annuler: "Annuler",
  corriger: "Corriger",
  renvoyerEmail: "Renvoyer l'e-mail",
  nomClient: "Nom du client",
  emailClient: "Adresse e-mail du client",
  telephoneClient: "Téléphone du client",
  placeholderEmail: "adresse@exemple.fr",
  placeholderTelephone: "06 12 34 56 78",
  fermer: "Fermer",
  enregistre: "Enregistré.",
  dejaEnvoyes:
    "Les e-mails déjà envoyés ne repartent pas. Un devis, lui, se renvoie.",
  saisieTitre: "Réservation prise au téléphone",
  saisieOuvrir: "+ Réservation prise au téléphone",
  champNom: "Nom du client",
  champEmail: "E-mail",
  champDate: "Date",
  champCouverts: "Couverts",
  champService: "Service",
  champType: "Type",
  typeTable: "Réservation individuelle",
  typePrivatisation: "Privatisation d'un espace",
  champEspace: "Espace à privatiser",
  espaceOption: (nom, capacite) => `${nom} — ${capacite} couverts`,
  facultatif: "(facultatif)",
  placeholderEmailClient: "client@exemple.fr",
  placeholderNoteSaisie: "Table près de la fenêtre, allergie…",
  enregistrerReservation: "Enregistrer la réservation",
  statistiques: "Statistiques",
  fenetre: (j) =>
    `Ce qui s'est passé sur les ${j} derniers jours, aujourd'hui compris. Ce qui est à venir est dans le calendrier.`,
  periode: (j) => (j === 365 ? "1 an" : `${j} j`),
  tuiles: {
    couverts: "Couverts confirmés",
    reservations: "Réservations confirmées",
    venuesPage: "Venues de ta page",
    acceptees: "Demandes acceptées",
  },
  absences: (t, c, taux) =>
    `${t} table${s(t)} restée${s(t)} vide${s(t)} — ${c} couvert${s(c)} perdu${s(c)}, soit ${taux} des réservations confirmées.`,
  parJour: "Couverts par jour de la semaine",
  parEspace: "Couverts par espace",
  espaceSupprime: "Espace supprimé",
  parType: "Individuelles et privatisations",
  individuelles: "Individuelles",
  privatisations: "Privatisations",
  parOrigine: "D'où viennent les réservations",
  tapage: "Ta page en ligne",
  telephone: "Téléphone",
  uniteCouverts: "couverts",
  detailBarre: (r, c) => `${r} réservation${s(r)}, ${c} couvert${s(c)}`,
};

const en: ClesReservations = {
  titre: (r) => `Bookings — ${r}`,
  chapo:
    "Requests land here. Until you decide on them, they hold the slot — up until their option expires.",
  liens: {
    service: "Service screen",
    plan: "Floor plan",
    experiences: "Experiences",
    configuration: "Rooms, services and public page",
  },
  statuts: {
    demande: "Pending",
    confirmee: "Confirmed",
    refusee: "Declined",
    annulee: "Cancelled",
    expiree: "Option expired",
  },
  annuleeParClient: "Cancelled by the customer",
  optionExpiree: "Option expired",
  optionHeures: (h) => `Option: ${h} h left`,
  optionJours: (j) => `Option: ${j} day${s(j)} left`,
  couverts: (n) => `${n} cover${s(n)}`,
  privatisation: "private hire",
  priseAuTelephone: "taken by phone",
  accepteRecontact: "Happy to be contacted again",
  minimumConsommation: (m, taxe) => `Minimum spend quoted: €${m} ${taxe}`,
  ht: "excl. VAT",
  ttc: "incl. VAT",
  tableVide: "Table left empty",
  retirerConstat: "Undo this",
  pasVenus: "They did not turn up",
  salleTenue: (restant) =>
    `Accepted — the room is held${restant ? ` ${restant}` : ""}, and will only be firm once the card is on file.`,
  lienCaution:
    "Your customer has this link by email: they will save their card, nothing is charged.",
  lienAcompte:
    "Your customer has this link by email: they will pay into your Stripe account, with no commission.",
  relancer: "Send a reminder",
  relanceLe: (q) => `Reminded on ${q}`,
  dejaEncaisse: "Already received (transfer, cash)",
  pasDeCaution: "Do not ask for a card",
  devisStatut: (st) => `Quote ${st}`,
  devisAcompte: (m) => ` · deposit ${m}`,
  reprendreBrouillon: "Back to the draft",
  ouvrirDevis: "Open the quote",
  etablirDevis: "Draw up a quote",
  annulerReservation: "Cancel this booking",
  enCours: {
    enregistrement: "Saving…",
    envoi: "Sending…",
    retrait: "Removing…",
    levee: "Waiving…",
    ouverture: "Opening…",
    annulation: "Cancelling…",
  },
  aTraiter: "To handle",
  compteurATraiter: (n) => (n === 1 ? "request to handle" : "requests to handle"),
  compteurGaranties: (n) =>
    n === 1 ? "deposit or hold to settle" : "deposits or holds to settle",
  compteurCouvertsDuJour: (n) =>
    n === 1 ? "guest confirmed today" : "guests confirmed today",
  compteurAVenir: (n) =>
    n === 1 ? "upcoming confirmed booking" : "upcoming confirmed bookings",
  aucuneDemande: "No pending request.",
  garanties: "Deposits and card guarantees",
  garantiesChapo:
    "Upcoming bookings with money committed, and where each one stands. They leave this list once the service is over.",
  calendrier: "Calendar",
  moisPrecedent: "Previous month",
  moisSuivant: "Next month",
  choisirJour: "Pick a day",
  cliquerDate: "Click a date in the calendar to see what is booked that day.",
  rienPrevu: "Nothing booked that day.",
  accepter: "Accept",
  confirmationEnCours: "Confirming…",
  refuser: "Decline",
  refusEnCours: "Declining…",
  noteInterne: "Internal note",
  jamaisVisible: "(never shown to the customer)",
  placeholderNote: "Shellfish allergy, arriving at 7.30pm…",
  enregistrer: "Save",
  noteEnregistree: "Note saved.",
  lienPaiement: "Deposit payment link",
  copier: "Copy",
  copie: "Copied",
  debiterCaution: "Charge the card",
  libererGroupeVenu: "Release — the party came",
  combienPrelever: "How much to charge?",
  auMaximum: (m) => `€ — ${m} at most`,
  preleverMaintenant: "Charge now",
  prelevementEnCours: "Charging…",
  annuler: "Cancel",
  corriger: "Correct",
  renvoyerEmail: "Resend the email",
  nomClient: "Customer name",
  emailClient: "Customer email address",
  telephoneClient: "Customer phone",
  placeholderEmail: "name@example.com",
  placeholderTelephone: "+33 6 12 34 56 78",
  fermer: "Close",
  enregistre: "Saved.",
  dejaEnvoyes:
    "Emails already sent do not go out again. A quote, however, can be resent.",
  saisieTitre: "Booking taken by phone",
  saisieOuvrir: "+ Booking taken by phone",
  champNom: "Customer name",
  champEmail: "Email",
  champDate: "Date",
  champCouverts: "Covers",
  champService: "Service",
  champType: "Type",
  typeTable: "Individual booking",
  typePrivatisation: "Private hire of a room",
  champEspace: "Room to hire",
  espaceOption: (nom, capacite) => `${nom} — ${capacite} covers`,
  facultatif: "(optional)",
  placeholderEmailClient: "customer@example.com",
  placeholderNoteSaisie: "Table by the window, allergy…",
  enregistrerReservation: "Save the booking",
  statistiques: "Statistics",
  fenetre: (j) =>
    `What happened over the last ${j} days, today included. What is still to come is in the calendar.`,
  periode: (j) => (j === 365 ? "1 year" : `${j} d`),
  tuiles: {
    couverts: "Confirmed covers",
    reservations: "Confirmed bookings",
    venuesPage: "From your page",
    acceptees: "Requests accepted",
  },
  absences: (t, c, taux) =>
    `${t} table${s(t)} left empty — ${c} cover${s(c)} lost, that is ${taux} of confirmed bookings.`,
  parJour: "Covers by day of the week",
  parEspace: "Covers by room",
  espaceSupprime: "Deleted room",
  parType: "Individual and private hire",
  individuelles: "Individual",
  privatisations: "Private hire",
  parOrigine: "Where bookings come from",
  tapage: "Your online page",
  telephone: "Phone",
  uniteCouverts: "covers",
  detailBarre: (r, c) => `${r} booking${s(r)}, ${c} cover${s(c)}`,
};

const zh: ClesReservations = {
  titre: (r) => `订位 — ${r}`,
  chapo:
    "订位申请都会到这里。在您做出决定之前，它们会一直占住该时段，直到保留期到期为止。",
  liens: {
    service: "现场服务屏",
    plan: "餐厅平面图",
    experiences: "特色体验",
    configuration: "区域、服务时段与对外页面",
  },
  statuts: {
    demande: "待处理",
    confirmee: "已确认",
    refusee: "已拒绝",
    annulee: "已取消",
    expiree: "保留已过期",
  },
  annuleeParClient: "客人主动取消",
  optionExpiree: "保留已过期",
  optionHeures: (h) => `保留：还剩 ${h} 小时`,
  optionJours: (j) => `保留：还剩 ${j} 天`,
  couverts: (n) => `${n} 位客人`,
  privatisation: "包场",
  priseAuTelephone: "电话订位",
  accepteRecontact: "同意日后再联系",
  minimumConsommation: (m, taxe) => `已告知的最低消费：${m} 欧元（${taxe}）`,
  ht: "不含税",
  ttc: "含税",
  tableVide: "客人未到，空桌",
  retirerConstat: "撤销这个标记",
  pasVenus: "他们没有来",
  salleTenue: (restant) =>
    `已接受——场地暂为您保留${restant ? `（${restant}）` : ""}，但要等银行卡登记完成才算最终确定。`,
  lienCaution: "客人已通过邮件收到这个链接：他会登记银行卡，不会扣款。",
  lienAcompte:
    "客人已通过邮件收到这个链接：他会付款到您的 Stripe 账户，我们不抽成。",
  relancer: "邮件催一次",
  relanceLe: (q) => `已于 ${q} 催过`,
  dejaEncaisse: "已另行收到（转账、现金）",
  pasDeCaution: "不要求登记银行卡",
  devisStatut: (st) => `报价单${st}`,
  devisAcompte: (m) => ` · 订金 ${m}`,
  reprendreBrouillon: "继续编辑草稿",
  ouvrirDevis: "打开报价单",
  etablirDevis: "制作报价单",
  annulerReservation: "取消这笔订位",
  enCours: {
    enregistrement: "正在保存…",
    envoi: "正在发送…",
    retrait: "正在撤销…",
    levee: "正在免除…",
    ouverture: "正在打开…",
    annulation: "正在取消…",
  },
  aTraiter: "待处理",
  compteurATraiter: () => "条待处理请求",
  compteurGaranties: () => "笔订金或担保待处理",
  compteurCouvertsDuJour: () => "位今日已确认客人",
  compteurAVenir: () => "个即将到来的已确认订位",
  aucuneDemande: "没有待处理的订位申请。",
  garanties: "订金与银行卡担保",
  garantiesChapo:
    "即将到来、且涉及金钱的订位，以及各自的进度。服务结束后它们会自动离开这个列表。",
  calendrier: "日历",
  moisPrecedent: "上个月",
  moisSuivant: "下个月",
  choisirJour: "选择一天",
  cliquerDate: "点击日历上的日期，查看当天的安排。",
  rienPrevu: "当天没有安排。",
  accepter: "接受",
  confirmationEnCours: "正在确认…",
  refuser: "拒绝",
  refusEnCours: "正在拒绝…",
  noteInterne: "内部备注",
  jamaisVisible: "（客人永远看不到）",
  placeholderNote: "对贝类过敏，19:30 到…",
  enregistrer: "保存",
  noteEnregistree: "备注已保存。",
  lienPaiement: "订金支付链接",
  copier: "复制",
  copie: "已复制",
  debiterCaution: "扣取担保金",
  libererGroupeVenu: "解除担保——客人已到店",
  combienPrelever: "扣多少？",
  auMaximum: (m) => `欧元 — 最多 ${m}`,
  preleverMaintenant: "立即扣款",
  prelevementEnCours: "正在扣款…",
  annuler: "取消",
  corriger: "修正",
  renvoyerEmail: "重发邮件",
  nomClient: "客人姓名",
  emailClient: "客人邮箱",
  telephoneClient: "客人电话",
  placeholderEmail: "name@example.com",
  placeholderTelephone: "+33 6 12 34 56 78",
  fermer: "关闭",
  enregistre: "已保存。",
  dejaEnvoyes: "已经发出去的邮件不会再发一次。报价单则可以重发。",
  saisieTitre: "电话订位登记",
  saisieOuvrir: "+ 电话订位登记",
  champNom: "客人姓名",
  champEmail: "邮箱",
  champDate: "日期",
  champCouverts: "人数",
  champService: "服务时段",
  champType: "类型",
  typeTable: "散客订位",
  typePrivatisation: "包场",
  champEspace: "包场区域",
  espaceOption: (nom, capacite) => `${nom} — 可容纳 ${capacite} 位`,
  facultatif: "（选填）",
  placeholderEmailClient: "customer@example.com",
  placeholderNoteSaisie: "靠窗的桌子、过敏…",
  enregistrerReservation: "保存订位",
  statistiques: "数据统计",
  fenetre: (j) => `过去 ${j} 天（含今天）的情况。将要发生的，请看日历。`,
  periode: (j) => (j === 365 ? "1 年" : `${j} 天`),
  tuiles: {
    couverts: "已确认客数",
    reservations: "已确认订位",
    venuesPage: "来自您的订位页",
    acceptees: "已接受的申请",
  },
  absences: (t, c, taux) =>
    `${t} 桌客人没来 — 损失 ${c} 位客人，占已确认订位的 ${taux}。`,
  parJour: "按星期几统计客数",
  parEspace: "按区域统计客数",
  espaceSupprime: "已删除的区域",
  parType: "散客与包场",
  individuelles: "散客",
  privatisations: "包场",
  parOrigine: "订位从哪里来",
  tapage: "您的在线订位页",
  telephone: "电话",
  uniteCouverts: "位客人",
  detailBarre: (r, c) => `${r} 笔订位，${c} 位客人`,
};

export const RESERVATIONS: Record<Langue, ClesReservations> = { fr, en, zh };
