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
};

export const RESERVER: Record<Langue, ClesReserver> = { fr, en, zh };
