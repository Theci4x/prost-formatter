import type { Langue } from "@/lib/i18n/langue";

/**
 * L'écran de service, dans les trois langues.
 *
 * C'est celui du coup de feu : on le lit debout, entre deux plats, sur
 * un téléphone posé près de la caisse. Les phrases y sont donc plus
 * courtes qu'ailleurs, et c'est délibéré — un paragraphe qu'on doit
 * finir de lire pendant qu'une table attend n'est pas lu.
 *
 * Il partage plusieurs composants avec le carnet, qui gardent leur
 * dictionnaire : ce qui est ici n'est que ce que cet écran dit en
 * propre.
 */

export type ClesService = {
  retourCarnet: string;
  retirerLot: string;
  veille: string;
  aujourdhui: string;
  lendemain: string;

  ferme: string;
  fermePour(motif: string): string;
  fermeAucuneReservation: string;
  fermePrevenir: string;

  enAttente: string;
  aucunService: string;
  personnePourInstant: string;
  heuresIndicatives(premier: string): string;

  /** Le plan de salle. */
  tableOccupee(table: string, noms: string, couverts: number): string;
  tableLibre(table: string, places: number): string;
  tableDeCetteReservation: string;
  aPlacer: string;
  tableEtPlaces(nom: string, places: number): string;

  /** La ligne dépliable d'un convive. */
  privatise: string;
  absent: string;
  appeler: string;
  email: string;
  niTelephoneNiAdresse: string;
  arrivee: string;
  couvertsLabel: string;
  occasion: string;
  ceQueLeClientAEcrit: string;
  votreNote: string;
  retirerConstatAbsence: string;
  noterAbsent: string;
  annulerCetteTable: string;
  enCoursRetrait: string;
  enCoursEnregistrement: string;
  enCoursAnnulation: string;

  /** Les compteurs du haut. */
  compteurCouverts: string;
  compteurReservations(n: number): string;
  compteurATrancher: string;
  compteurAPlacer: string;
  aPlacerPastille(n: number): string;
  couvertsSurCapacite(occupes: number, capacite: number): string;

  /** La feuille de service imprimable (et son PDF). */
  exporterPdf: string;
  imprimer: string;
  astucePdf: string;
  retourService: string;
  feuilleTitre: string;
  editeeLe(quand: string): string;
  colArrive: string;
  colHeure: string;
  colClient: string;
  colCouverts: string;
  colTable: string;
  colTelephone: string;
  colNotes: string;
  totalService(couverts: number, tables: number): string;
  aucuneReservationService: string;
  demandesNonConfirmees: string;
  sansEspace: string;
};

const fr: ClesService = {
  retourCarnet: "← Réservations",
  retirerLot: "Retirer un lot",
  veille: "← Veille",
  aujourdhui: "Aujourd'hui",
  lendemain: "Lendemain →",
  ferme: "Fermé ce jour-là.",
  fermePour: (m) => `Fermé — ${m}`,
  fermeAucuneReservation: "Aucune réservation ne peut être prise ce jour-là.",
  fermePrevenir:
    "Les convives ci-dessous étaient attendus : pense à les prévenir.",
  enAttente: "En attente de ta réponse",
  aucunService: "Aucun service ce jour-là.",
  personnePourInstant: "Personne pour l'instant.",
  heuresIndicatives: (premier) =>
    `Heures indicatives : Klarr retient le service, pas l'heure d'arrivée de chaque table. ${premier} est le début du premier service.`,
  tableOccupee: (t, noms, c) => `${t} — ${noms} (${c} couverts)`,
  tableLibre: (t, p) => `${t} — libre, ${p} places`,
  tableDeCetteReservation: "Table de cette réservation",
  aPlacer: "À placer",
  tableEtPlaces: (nom, p) => `${nom} · ${p}p`,
  privatise: "privatisé",
  absent: "absent",
  appeler: "Appeler",
  email: "E-mail",
  niTelephoneNiAdresse: "Ce client n'a laissé ni téléphone ni adresse.",
  arrivee: "Arrivée",
  couvertsLabel: "Couverts",
  occasion: "Occasion",
  ceQueLeClientAEcrit: "Ce que le client a écrit",
  votreNote: "Votre note",
  retirerConstatAbsence: "Retirer le constat d'absence",
  noterAbsent: "Noter comme absent",
  annulerCetteTable: "Annuler cette table",
  enCoursRetrait: "Retrait…",
  enCoursEnregistrement: "Enregistrement…",
  enCoursAnnulation: "Annulation…",
  compteurCouverts: "couverts attendus",
  compteurReservations: (n) => (n > 1 ? "réservations" : "réservation"),
  compteurATrancher: "à trancher",
  compteurAPlacer: "à placer",
  aPlacerPastille: (n) => `${n} à placer`,
  couvertsSurCapacite: (o, c) => `${o} / ${c} couverts`,
  exporterPdf: "Exporter en PDF",
  imprimer: "Imprimer ou enregistrer en PDF",
  astucePdf:
    "Pour un PDF, choisis « Enregistrer au format PDF » comme imprimante.",
  retourService: "← Retour au service",
  feuilleTitre: "Feuille de service",
  editeeLe: (q) => `Éditée le ${q}`,
  colArrive: "Arrivé",
  colHeure: "Heure",
  colClient: "Client",
  colCouverts: "Couv.",
  colTable: "Table",
  colTelephone: "Téléphone",
  colNotes: "Notes",
  totalService: (c, t) =>
    `${c} couvert${c > 1 ? "s" : ""} · ${t} table${t > 1 ? "s" : ""}`,
  aucuneReservationService: "Aucune réservation sur ce service.",
  demandesNonConfirmees: "Demandes pas encore confirmées",
  sansEspace: "Sans espace",
};

const en: ClesService = {
  retourCarnet: "← Bookings",
  retirerLot: "Redeem a prize",
  veille: "← Previous day",
  aujourdhui: "Today",
  lendemain: "Next day →",
  ferme: "Closed that day.",
  fermePour: (m) => `Closed — ${m}`,
  fermeAucuneReservation: "No booking can be taken that day.",
  fermePrevenir: "The guests below were expected: remember to let them know.",
  enAttente: "Waiting for your answer",
  aucunService: "No service that day.",
  personnePourInstant: "Nobody yet.",
  heuresIndicatives: (premier) =>
    `Times are indicative: Klarr holds the service, not each table's arrival time. ${premier} is when the first service starts.`,
  tableOccupee: (t, noms, c) => `${t} — ${noms} (${c} covers)`,
  tableLibre: (t, p) => `${t} — free, ${p} seats`,
  tableDeCetteReservation: "Table for this booking",
  aPlacer: "To seat",
  tableEtPlaces: (nom, p) => `${nom} · ${p} seats`,
  privatise: "private hire",
  absent: "no-show",
  appeler: "Call",
  email: "Email",
  niTelephoneNiAdresse: "This guest left neither phone nor email.",
  arrivee: "Arrival",
  couvertsLabel: "Covers",
  occasion: "Occasion",
  ceQueLeClientAEcrit: "What the guest wrote",
  votreNote: "Your note",
  retirerConstatAbsence: "Undo the no-show",
  noterAbsent: "Mark as no-show",
  annulerCetteTable: "Cancel this table",
  enCoursRetrait: "Removing…",
  enCoursEnregistrement: "Saving…",
  enCoursAnnulation: "Cancelling…",
  compteurCouverts: "covers expected",
  compteurReservations: (n) => (n > 1 ? "bookings" : "booking"),
  compteurATrancher: "to decide",
  compteurAPlacer: "to seat",
  aPlacerPastille: (n) => `${n} to seat`,
  couvertsSurCapacite: (o, c) => `${o} / ${c} covers`,
  exporterPdf: "Export as PDF",
  imprimer: "Print or save as PDF",
  astucePdf: "For a PDF, pick “Save as PDF” as the printer.",
  retourService: "← Back to service",
  feuilleTitre: "Service sheet",
  editeeLe: (q) => `Printed on ${q}`,
  colArrive: "Arrived",
  colHeure: "Time",
  colClient: "Guest",
  colCouverts: "Covers",
  colTable: "Table",
  colTelephone: "Phone",
  colNotes: "Notes",
  totalService: (c, t) =>
    `${c} cover${c > 1 ? "s" : ""} · ${t} table${t > 1 ? "s" : ""}`,
  aucuneReservationService: "No booking for this service.",
  demandesNonConfirmees: "Requests not confirmed yet",
  sansEspace: "No area",
};

const zh: ClesService = {
  retourCarnet: "← 订位",
  retirerLot: "核销奖品",
  veille: "← 前一天",
  aujourdhui: "今天",
  lendemain: "后一天 →",
  ferme: "当天不营业。",
  fermePour: (m) => `不营业 — ${m}`,
  fermeAucuneReservation: "当天无法接受任何订位。",
  fermePrevenir: "下面这些客人原本要来：记得通知他们。",
  enAttente: "等待您回复",
  aucunService: "当天没有服务时段。",
  personnePourInstant: "目前还没有人。",
  heuresIndicatives: (premier) =>
    `时间仅供参考：Klarr 记录的是服务时段，而不是每桌的到店时间。${premier} 是第一轮服务的开始时间。`,
  tableOccupee: (t, noms, c) => `${t} — ${noms}（${c} 位）`,
  tableLibre: (t, p) => `${t} — 空桌，${p} 个座位`,
  tableDeCetteReservation: "这笔订位的桌号",
  aPlacer: "待安排",
  tableEtPlaces: (nom, p) => `${nom} · ${p} 座`,
  privatise: "包场",
  absent: "未到",
  appeler: "打电话",
  email: "邮箱",
  niTelephoneNiAdresse: "这位客人既没留电话，也没留邮箱。",
  arrivee: "到店时间",
  couvertsLabel: "人数",
  occasion: "场合",
  ceQueLeClientAEcrit: "客人的留言",
  votreNote: "您的备注",
  retirerConstatAbsence: "撤销「未到」标记",
  noterAbsent: "标记为未到",
  annulerCetteTable: "取消这一桌",
  enCoursRetrait: "正在撤销…",
  enCoursEnregistrement: "正在保存…",
  enCoursAnnulation: "正在取消…",
  compteurCouverts: "预计人数",
  compteurReservations: () => "笔订位",
  compteurATrancher: "待处理",
  compteurAPlacer: "待安排",
  aPlacerPastille: (n) => `${n} 桌待安排`,
  couvertsSurCapacite: (o, c) => `${o} / ${c} 位`,
  exporterPdf: "导出 PDF",
  imprimer: "打印或保存为 PDF",
  astucePdf: "如需 PDF，请在打印机中选择「另存为 PDF」。",
  retourService: "← 返回服务",
  feuilleTitre: "服务单",
  editeeLe: (q) => `打印于 ${q}`,
  colArrive: "已到",
  colHeure: "时间",
  colClient: "客人",
  colCouverts: "人数",
  colTable: "桌号",
  colTelephone: "电话",
  colNotes: "备注",
  totalService: (c, t) => `${c} 位 · ${t} 桌`,
  aucuneReservationService: "这个时段没有订位。",
  demandesNonConfirmees: "尚未确认的请求",
  sansEspace: "未指定区域",
};

export const SERVICE: Record<Langue, ClesService> = { fr, en, zh };
