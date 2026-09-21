import type { Langue } from "@/lib/i18n/langue";

/**
 * La page de réservation, dans les trois langues.
 *
 * C'est la page qui rapporte. Un client peut lire une carte traduite,
 * s'enthousiasmer, puis tomber sur un formulaire en français : c'est là
 * qu'il abandonne, et c'est la seule page du produit où l'abandon se
 * compte en couverts perdus.
 *
 * Tout ce qui compte est une fonction. « 1 convive » et « 2 convives » ne
 * s'accordent pas pareil, l'anglais s'accorde autrement, et le chinois ne
 * s'accorde pas du tout mais réclame son classificateur — 位 pour une
 * personne à table, 道 pour un plat.
 */

export type ClesReserver = {
  chapo: string;
  dateEtCouverts(date: string, couverts: number): string;
  pasDeReservationCeJour: string;
  aQuelleHeure: string;
  completACetteHeure: string;

  reserverUneTable: string;
  uneTablePour(couverts: number): string;
  placeeParEtablissement: string;
  resteDeLaPlace(max: number): string;

  privatiserUnEspace: string;
  privatiser(nom: string): string;
  espaceAVousSeuls: string;
  pasDePrivatisationCeService: string;
  voirPour(couverts: number): string;
  jusqua(capacite: number): string;
  ouReserverSimplement: string;

  propulseePar: string;

  /** L'écran qui suit l'envoi. */
  mercititre: string;
  confirmeeTitre: string;
  confirmeeDetail: string;
  confirmeeEmpechement: string;
  attenteDelai: string;
  attenteRienDebite: string;
  faireUneAutreDemande: string;

  /** La recherche de disponibilité. */
  champDate: string;
  champConvives: string;
  unConviveDeMoins: string;
  unConviveDePlus: string;
  jeSouhaite: string;
  privatiserJusqua(nom: string, capacite: number): string;
  voirLesDisponibilites: string;

  /** Le formulaire de demande. */
  tonNom: string;
  email: string;
  telephone: string;
  occasion: string;
  occasionExemple: string;
  unMotPour: string;
  facultatif: string;
  accepteActualites(maison: string): string;
  envoi: string;
  envoyerMaDemande: string;
  annuler: string;
  apresPrivatisation: string;
  apresTable: string;

  /** Le reste de la page. */
  espacesResume: string;
  privatisationResume: string;
  nonProposee: string;
  fermerLaGalerie: string;
  ateliersTitre: string;
  ateliersChapo: string;

  /** Le résumé de l'établissement. */
  reservationResume: string;
  jusquaPersonnes(n: number): string;
  privatisationTotale: string;
  privatisationPartielle: string;
  jusquaLabel: string;

  /** Les conditions d'une privatisation, dites avant de réserver. */
  minimumConsommation(montant: string, ht: boolean): string;
  minimumConsommationPrecision: string;
  acompteDe(montant: string): string;
  acomptePrecision: string;
  carteEnGarantie(montant: string): string;
  cartePrecision: string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesReserver = {
  chapo:
    "Choisis une date et un nombre de convives : nous n'affichons que ce qui est réellement disponible. Ta demande est confirmée par l'établissement.",
  dateEtCouverts: (date, couverts) =>
    `${date} — ${couverts} convive${s(couverts)}`,
  pasDeReservationCeJour:
    "L'établissement ne prend pas de réservation ce jour-là. Essaie une autre date.",
  aQuelleHeure: "À quelle heure ?",
  completACetteHeure: "Complet à cette heure",

  reserverUneTable: "Réserver une table",
  uneTablePour: (couverts) =>
    `Une table pour ${couverts} convive${s(couverts)}`,
  placeeParEtablissement: "Placée par l'établissement, comme au téléphone.",
  resteDeLaPlace: (max) => ` Il reste de la place jusqu'à ${max} convives.`,

  privatiserUnEspace: "Privatiser un espace",
  privatiser: (nom) => `Privatiser ${nom}`,
  espaceAVousSeuls: "L'espace est à vous seuls pendant tout le service.",
  pasDePrivatisationCeService: "Cet espace ne se privatise pas sur ce service.",
  voirPour: (couverts) => `Voir pour ${couverts} convives`,
  jusqua: (capacite) => `Jusqu'à ${capacite} couvert${s(capacite)}`,
  ouReserverSimplement: "Ou réserver simplement une table",

  propulseePar: "Réservations propulsées par",

  mercititre: "Demande envoyée",
  confirmeeTitre: "C'est réservé.",
  confirmeeDetail:
    "Ta table est confirmée. Tu reçois le détail par e-mail dans quelques instants — garde-le, il rappelle l'heure et l'adresse.",
  confirmeeEmpechement:
    "Un empêchement ? Préviens l'établissement en répondant à cet e-mail. Une table rendue à temps, c'est une table qui resert.",
  attenteDelai:
    "L'établissement la reçoit à l'instant et te répond sous 48 heures. Ton créneau est mis de côté jusque-là : personne d'autre ne peut le réserver.",
  attenteRienDebite:
    "Tu recevras la confirmation par e-mail. Rien n'est débité tant que l'établissement n'a pas accepté.",
  faireUneAutreDemande: "Faire une autre demande",

  champDate: "Date",
  champConvives: "Convives",
  unConviveDeMoins: "Un convive de moins",
  unConviveDePlus: "Un convive de plus",
  jeSouhaite: "Je souhaite",
  privatiserJusqua: (nom, capacite) =>
    `Privatiser ${nom} — jusqu'à ${capacite} couvert${s(capacite)}`,
  voirLesDisponibilites: "Voir les disponibilités",

  tonNom: "Ton nom",
  email: "E-mail",
  telephone: "Téléphone",
  occasion: "Occasion",
  occasionExemple: "Anniversaire, repas d'équipe…",
  unMotPour: "Un mot pour l'établissement",
  facultatif: "(facultatif)",
  accepteActualites: (maison) =>
    `J'accepte de recevoir les actualités et offres de ${maison} par e-mail. Je peux me désinscrire à tout moment.`,
  envoi: "Envoi…",
  envoyerMaDemande: "Envoyer ma demande",
  annuler: "Annuler",
  apresPrivatisation:
    "Une privatisation est validée par l'établissement : tu reçois un e-mail de suivi tout de suite, puis sa réponse. Aucun paiement n'est demandé à cette étape.",
  apresTable:
    "Tu reçois un e-mail immédiatement : ta confirmation si la table est acquise, l'accusé de réception de ta demande sinon. Aucun paiement n'est demandé à cette étape.",

  espacesResume: "Espaces",
  privatisationResume: "Privatisation",
  nonProposee: "Non proposée",
  fermerLaGalerie: "Fermer",
  ateliersTitre: "Ateliers et expériences",
  ateliersChapo: "Des séances à places limitées, en plus du service.",

  reservationResume: "Réservation",
  jusquaPersonnes: (n) => `Jusqu'à ${n} pers.`,
  privatisationTotale: "Totale",
  privatisationPartielle: "Partielle",
  jusquaLabel: "Jusqu'à",

  minimumConsommation: (montant, ht) =>
    `Minimum de consommation : ${montant} € ${ht ? "HT" : "TTC"}`,
  minimumConsommationPrecision:
    "Rien n'est encaissé à la réservation : ce montant se règle à l'addition.",
  acompteDe: (montant) => `Acompte : ${montant} €`,
  acomptePrecision:
    "Demandé une fois la demande acceptée, par un lien de paiement sécurisé. Il vient en déduction de l'addition.",
  carteEnGarantie: (montant) => `Carte en garantie : ${montant} €`,
  cartePrecision:
    "Rien n'est prélevé. La carte est enregistrée, et ne serait débitée qu'en cas de défection.",
};

const en: ClesReserver = {
  chapo:
    "Pick a date and a number of guests: we only show what is genuinely available. Your request is confirmed by the restaurant.",
  dateEtCouverts: (date, couverts) =>
    `${date} — ${couverts} guest${s(couverts)}`,
  pasDeReservationCeJour:
    "The restaurant does not take bookings that day. Try another date.",
  aQuelleHeure: "What time?",
  completACetteHeure: "Fully booked at this time",

  reserverUneTable: "Book a table",
  uneTablePour: (couverts) => `A table for ${couverts} guest${s(couverts)}`,
  placeeParEtablissement: "Seated by the restaurant, just as if you phoned.",
  resteDeLaPlace: (max) => ` There is still room for up to ${max} guests.`,

  privatiserUnEspace: "Hire a room",
  privatiser: (nom) => `Hire ${nom}`,
  espaceAVousSeuls: "The room is yours alone for the whole service.",
  pasDePrivatisationCeService: "This room cannot be hired for that service.",
  voirPour: (couverts) => `See it for ${couverts} guests`,
  jusqua: (capacite) => `Up to ${capacite} cover${s(capacite)}`,
  ouReserverSimplement: "Or simply book a table",

  propulseePar: "Bookings powered by",

  mercititre: "Request sent",
  confirmeeTitre: "You're booked.",
  confirmeeDetail:
    "Your table is confirmed. The details are on their way by email — keep it, it carries the time and the address.",
  confirmeeEmpechement:
    "Something came up? Let the restaurant know by replying to that email. A table given back in time is a table that sells again.",
  attenteDelai:
    "The restaurant receives it right now and answers within 48 hours. Your slot is held until then: nobody else can take it.",
  attenteRienDebite:
    "You will get the confirmation by email. Nothing is charged until the restaurant accepts.",
  faireUneAutreDemande: "Make another request",

  champDate: "Date",
  champConvives: "Guests",
  unConviveDeMoins: "One guest fewer",
  unConviveDePlus: "One guest more",
  jeSouhaite: "I would like",
  privatiserJusqua: (nom, capacite) =>
    `Hire ${nom} — up to ${capacite} cover${s(capacite)}`,
  voirLesDisponibilites: "See what is available",

  tonNom: "Your name",
  email: "Email",
  telephone: "Phone",
  occasion: "Occasion",
  occasionExemple: "Birthday, team dinner…",
  unMotPour: "A word for the restaurant",
  facultatif: "(optional)",
  accepteActualites: (maison) =>
    `I agree to receive news and offers from ${maison} by email. I can unsubscribe at any time.`,
  envoi: "Sending…",
  envoyerMaDemande: "Send my request",
  annuler: "Cancel",
  apresPrivatisation:
    "A private hire is approved by the restaurant: you get a follow-up email straight away, then their answer. Nothing is charged at this stage.",
  apresTable:
    "You get an email immediately: your confirmation if the table is secured, an acknowledgement of your request otherwise. Nothing is charged at this stage.",

  espacesResume: "Rooms",
  privatisationResume: "Private hire",
  nonProposee: "Not offered",
  fermerLaGalerie: "Close",
  ateliersTitre: "Workshops and experiences",
  ateliersChapo: "Limited-seat sessions, alongside the service.",

  reservationResume: "Booking",
  jusquaPersonnes: (n) => `Up to ${n} people`,
  privatisationTotale: "Whole venue",
  privatisationPartielle: "Some rooms",
  jusquaLabel: "Up to",

  minimumConsommation: (montant, ht) =>
    `Minimum spend: €${montant} ${ht ? "excl. VAT" : "incl. VAT"}`,
  minimumConsommationPrecision:
    "Nothing is collected when you book: this amount is settled on the bill.",
  acompteDe: (montant) => `Deposit: €${montant}`,
  acomptePrecision:
    "Requested once your enquiry is accepted, through a secure payment link. It is deducted from the bill.",
  carteEnGarantie: (montant) => `Card on file: €${montant}`,
  cartePrecision:
    "Nothing is taken. The card is stored, and would only be charged if you fail to show.",
};

const zh: ClesReserver = {
  chapo: "请选择日期和人数：我们只显示真正还能订的时段。您的申请由餐厅确认。",
  dateEtCouverts: (date, couverts) => `${date} — ${couverts} 位`,
  pasDeReservationCeJour: "这一天餐厅不接受订位。请换一个日期。",
  aQuelleHeure: "几点到？",
  completACetteHeure: "这个时间已订满",

  reserverUneTable: "订一张桌子",
  uneTablePour: (couverts) => `${couverts} 位的桌子`,
  placeeParEtablissement: "由餐厅安排座位，和打电话订位一样。",
  resteDeLaPlace: (max) => ` 最多还能坐到 ${max} 位。`,

  privatiserUnEspace: "包场",
  privatiser: (nom) => `包下${nom}`,
  espaceAVousSeuls: "整个服务时段里，这个场地只属于您。",
  pasDePrivatisationCeService: "这个时段，这个场地不接受包场。",
  voirPour: (couverts) => `看看 ${couverts} 位的方案`,
  jusqua: (capacite) => `最多 ${capacite} 位`,
  ouReserverSimplement: "或者，只订一张桌子",

  propulseePar: "订位服务由 Klarr 提供",

  mercititre: "申请已发送",
  confirmeeTitre: "订位已确认。",
  confirmeeDetail:
    "您的桌子已经确认。详细信息马上会发到您的邮箱——请保留，上面有时间和地址。",
  confirmeeEmpechement:
    "临时有事？直接回复那封邮件告诉餐厅。及时退掉的桌子，还能再卖一次。",
  attenteDelai:
    "餐厅此刻就会收到，并在 48 小时内答复您。在那之前这个时段为您保留：别人订不走。",
  attenteRienDebite: "确认函会通过邮件发给您。餐厅同意之前，不会扣任何钱。",
  faireUneAutreDemande: "再提交一次申请",

  champDate: "日期",
  champConvives: "人数",
  unConviveDeMoins: "少一位",
  unConviveDePlus: "多一位",
  jeSouhaite: "我想",
  privatiserJusqua: (nom, capacite) => `包下${nom}——最多 ${capacite} 位`,
  voirLesDisponibilites: "查看可订时段",

  tonNom: "您的姓名",
  email: "邮箱",
  telephone: "电话",
  occasion: "场合",
  occasionExemple: "生日、团队聚餐……",
  unMotPour: "给餐厅留言",
  facultatif: "（选填）",
  accepteActualites: (maison) =>
    `我同意通过邮件接收${maison}的消息和优惠。我可以随时退订。`,
  envoi: "正在发送…",
  envoyerMaDemande: "发送我的申请",
  annuler: "取消",
  apresPrivatisation:
    "包场需要餐厅确认：您会立刻收到一封跟进邮件，随后收到餐厅的答复。这一步不收任何费用。",
  apresTable:
    "您会立刻收到邮件：如果桌子已经确定，那是确认函；否则是收到申请的回执。这一步不收任何费用。",

  espacesResume: "场地",
  privatisationResume: "包场",
  nonProposee: "不提供",
  fermerLaGalerie: "关闭",
  ateliersTitre: "工坊与特别体验",
  ateliersChapo: "名额有限的场次，在正常营业之外。",

  reservationResume: "订位",
  jusquaPersonnes: (n) => `最多 ${n} 位`,
  privatisationTotale: "整店",
  privatisationPartielle: "部分场地",
  jusquaLabel: "最多",

  minimumConsommation: (montant, ht) =>
    `最低消费：${montant} 欧元（${ht ? "不含税" : "含税"}）`,
  minimumConsommationPrecision: "订位时不预收：这个金额在结账时一起付。",
  acompteDe: (montant) => `定金：${montant} 欧元`,
  acomptePrecision:
    "餐厅接受申请后，会通过安全支付链接向您收取。这笔钱会从账单里扣除。",
  carteEnGarantie: (montant) => `信用卡担保：${montant} 欧元`,
  cartePrecision: "不会扣款。只是记录信用卡，只有您没来才会扣。",
};

export const RESERVER: Record<Langue, ClesReserver> = { fr, en, zh };
