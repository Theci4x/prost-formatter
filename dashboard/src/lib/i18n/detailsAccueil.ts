import type { Langue } from "@/lib/i18n/langue";

/**
 * Les chiffres de l'écran d'accueil, dans les trois langues.
 *
 * Séparés du dictionnaire `accueil.ts`, et il y a une raison. Là-bas,
 * chaque clé est une phrase figée qu'on traduit une fois. Ici, chaque
 * phrase compte quelque chose — des plats, des avis, des couverts — et
 * une phrase qui compte ne se met pas en gabarit : le français accorde,
 * l'anglais accorde autrement, et le chinois n'accorde pas mais exige un
 * spécificatif qui change selon ce qu'on compte (道 pour un plat, 位 pour
 * une personne, 张 pour une photo, 条 pour un message).
 *
 * D'où des fonctions plutôt que des chaînes. C'est le même choix que
 * pour `resumeCalendrier` et `resumeFiltre`, et pour la même raison : un
 * « 1 plats » fait douter de tout le reste de l'écran.
 *
 * Ces phrases restaient en français alors que les libellés au-dessus
 * étaient traduits — une carte moitié chinoise, moitié française, ce qui
 * se voit immédiatement et donne l'impression d'un travail à l'abandon.
 */

export type DetailsAccueil = {
  rienEnAttente: string;
  aConfirmer(n: number): string;
  aucunClient: string;
  clients(total: number, joignables: number): string;
  personneAcceptee: string;
  destinataires(n: number): string;
  aucunCouvert: string;
  couvertsAujourdhui(n: number): string;
  enLigne: string;
  pasPublie: string;
  carteVide: string;
  cartePubliee(plats: number): string;
  carteNonPubliee(plats: number): string;
  aucunePhoto: string;
  photos(n: number, couverture: boolean): string;
  avancement(faites: number, total: number): string;
  premierReleve: string;
  note(note: string, avis: number, semaine: number | null): string;
  rienDeNouveau: string;
  aLire(n: number): string;
  aucuneProgrammee: string;
  prochainePublication(date: string): string;
  pasEncoreVerifie: string;
  citeSur(citees: number, total: number): string;
  rienDeRelie: string;
  /** Les quatre grands chiffres en tête de carte. */
  aucunCouvertConfirme: string;
  couvertsMidiSoir: string;
  demandesAConfirmer(n: number): string;
  retoursClientsALire(n: number): string;
  surGoogleAvis(n: number): string;
  surGoogleSemaine(n: number): string;
  /** L'en-tête de la page : le titre et le bouton d'ajout. */
  titreListe(n: number): string;
  ajouterRestaurant: string;
};

const s = (n: number) => (n > 1 ? "s" : "");
const signe = (n: number) => (n > 0 ? `+${n}` : String(n));

const fr: DetailsAccueil = {
  rienEnAttente: "Rien en attente",
  aConfirmer: (n) => `${n} demande${s(n)} à confirmer`,
  aucunClient: "Aucun client enregistré",
  clients: (t, j) => `${t} client${s(t)} · ${j} joignable${s(j)}`,
  personneAcceptee: "Personne n'a encore accepté",
  destinataires: (n) => `${n} destinataire${s(n)}`,
  aucunCouvert: "Aucun couvert confirmé aujourd'hui",
  couvertsAujourdhui: (n) => `${n} couvert${s(n)} aujourd'hui`,
  enLigne: "En ligne",
  pasPublie: "Pas encore publié",
  carteVide: "Pas encore saisie",
  cartePubliee: (p) => `Publiée · ${p} plat${s(p)}`,
  carteNonPubliee: (p) => `${p} plat${s(p)}, pas encore publiée`,
  aucunePhoto: "Aucune photo",
  photos: (n, c) => `${n} photo${s(n)}${c ? " · couverture choisie" : ""}`,
  avancement: (f, t) => `${f} sur ${t}`,
  premierReleve: "Premier relevé la nuit prochaine",
  note: (note, avis, semaine) =>
    `${note} ★ · ${avis} avis${semaine ? ` · ${signe(semaine)} cette semaine` : ""}`,
  rienDeNouveau: "Rien de nouveau",
  aLire: (n) => `${n} à lire`,
  aucuneProgrammee: "Aucune programmée",
  prochainePublication: (date) => `Prochaine : ${date}`,
  pasEncoreVerifie: "Pas encore vérifié",
  citeSur: (c, t) => `Cité sur ${c} question${s(c)} sur ${t}`,
  rienDeRelie: "Rien de relié",
  aucunCouvertConfirme: "aucun couvert confirmé",
  couvertsMidiSoir: "couverts midi · soir",
  demandesAConfirmer: (n) => `demande${s(n)} à confirmer`,
  retoursClientsALire: (n) => `retour${s(n)} client${s(n)} à lire`,
  surGoogleAvis: (n) => `sur Google · ${n} avis`,
  surGoogleSemaine: (n) => `sur Google · ${signe(n)} avis cette semaine`,
  titreListe: (n) => (n === 1 ? "Votre restaurant" : "Vos restaurants"),
  ajouterRestaurant: "Ajouter un restaurant",
};

const en: DetailsAccueil = {
  rienEnAttente: "Nothing pending",
  aConfirmer: (n) => `${n} request${s(n)} to confirm`,
  aucunClient: "No customer on file",
  clients: (t, j) => `${t} customer${s(t)} · ${j} contactable`,
  personneAcceptee: "Nobody has opted in yet",
  destinataires: (n) => `${n} recipient${s(n)}`,
  aucunCouvert: "No covers confirmed today",
  couvertsAujourdhui: (n) => `${n} cover${s(n)} today`,
  enLigne: "Online",
  pasPublie: "Not published yet",
  carteVide: "Not entered yet",
  cartePubliee: (p) => `Published · ${p} dish${p > 1 ? "es" : ""}`,
  carteNonPubliee: (p) => `${p} dish${p > 1 ? "es" : ""}, not published yet`,
  aucunePhoto: "No photo",
  photos: (n, c) => `${n} photo${s(n)}${c ? " · cover chosen" : ""}`,
  avancement: (f, t) => `${f} of ${t}`,
  premierReleve: "First reading tonight",
  note: (note, avis, semaine) =>
    `${note} ★ · ${avis} review${avis > 1 ? "s" : ""}${semaine ? ` · ${signe(semaine)} this week` : ""}`,
  rienDeNouveau: "Nothing new",
  aLire: (n) => `${n} to read`,
  aucuneProgrammee: "None scheduled",
  prochainePublication: (date) => `Next: ${date}`,
  pasEncoreVerifie: "Not checked yet",
  citeSur: (c, t) => `Cited in ${c} question${s(c)} out of ${t}`,
  rienDeRelie: "Nothing connected",
  aucunCouvertConfirme: "no covers confirmed",
  couvertsMidiSoir: "covers lunch · dinner",
  demandesAConfirmer: (n) => `request${s(n)} to confirm`,
  retoursClientsALire: (n) => `customer note${s(n)} to read`,
  surGoogleAvis: (n) => `on Google · ${n} review${n > 1 ? "s" : ""}`,
  surGoogleSemaine: (n) => `on Google · ${signe(n)} reviews this week`,
  titreListe: (n) => (n === 1 ? "Your restaurant" : "Your restaurants"),
  ajouterRestaurant: "Add a restaurant",
};

const zh: DetailsAccueil = {
  rienEnAttente: "没有待处理",
  aConfirmer: (n) => `${n} 条订位待确认`,
  aucunClient: "还没有客户记录",
  clients: (t, j) => `${t} 位客户 · ${j} 位可联系`,
  personneAcceptee: "还没有人同意接收",
  destinataires: (n) => `${n} 位收件人`,
  aucunCouvert: "今天还没有确认的客人",
  couvertsAujourdhui: (n) => `今天 ${n} 位客人`,
  enLigne: "已上线",
  pasPublie: "尚未发布",
  carteVide: "还没有录入",
  cartePubliee: (p) => `已发布 · ${p} 道菜`,
  carteNonPubliee: (p) => `${p} 道菜，尚未发布`,
  aucunePhoto: "还没有照片",
  photos: (n, c) => `${n} 张照片${c ? " · 已选封面" : ""}`,
  avancement: (f, t) => `${t} 项已完成 ${f} 项`,
  premierReleve: "今晚首次采集",
  note: (note, avis, semaine) =>
    `${note} ★ · ${avis} 条评价${semaine ? ` · 本周 ${signe(semaine)}` : ""}`,
  rienDeNouveau: "没有新内容",
  aLire: (n) => `${n} 条待读`,
  aucuneProgrammee: "没有已排期的",
  prochainePublication: (date) => `下一次：${date}`,
  pasEncoreVerifie: "尚未检测",
  citeSur: (c, t) => `${t} 个问题中被提及 ${c} 次`,
  rienDeRelie: "还没有绑定任何账号",
  aucunCouvertConfirme: "今天没有确认的客人",
  couvertsMidiSoir: "午市 · 晚市客数",
  demandesAConfirmer: () => "条订位待确认",
  retoursClientsALire: () => "条客人反馈待读",
  surGoogleAvis: (n) => `Google 上 ${n} 条评价`,
  surGoogleSemaine: (n) => `Google 上本周 ${signe(n)} 条评价`,
  titreListe: () => "您的餐厅",
  ajouterRestaurant: "添加餐厅",
};

export const DETAILS: Record<Langue, DetailsAccueil> = { fr, en, zh };

/** Une date courte, dans la langue du lecteur. */
const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

/** La date du jour, en toutes lettres, dans la langue du lecteur. */
export function dateDuJour(langue: Langue, aujourdhui = new Date()): string {
  return aujourdhui.toLocaleDateString(LOCALE[langue] ?? "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function dateCourte(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleDateString(LOCALE[langue] ?? "fr-FR", {
    day: "numeric",
    month: "short",
  });
}
