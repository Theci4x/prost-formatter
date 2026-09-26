import type { Langue } from "@/lib/i18n/langues";

/**
 * Ce que répondent les actions publiques quand elles refusent.
 *
 * Ces phrases arrivent dans la langue du visiteur, pas dans celle du
 * serveur : une action lit le témoin comme la page qui l'a affichée. Sans
 * ça, un client chinois remplissait un formulaire entièrement traduit et
 * recevait « Cette adresse e-mail ne semble pas valide. » — la seule
 * phrase qu'il ne pouvait pas lire étant précisément celle qui lui
 * demandait de corriger quelque chose.
 *
 * Le tutoiement du français n'est pas un oubli : c'est celui du reste de
 * la page de réservation, qui s'adresse au convive.
 */

export type ClesErreurs = {
  nomEtEmail: string;
  emailInvalide: string;
  typeInconnu: string;
  nombreInvalide: string;
  etablissementIntrouvable: string;
  plusDeReservationEnLigne: string;
  tropDeDemandes: string;
  espacePlusPropose: string;
  servicePasCeJour: string;
  heureHorsListe: string;
  creneauPrisTable: string;
  creneauPris: string;
  envoiEchoue: string;

  /** L'inscription à un atelier. */
  dateInvalide: string;
  nombreDePlaces: string;
  experiencePlusProposee: string;
  pasDeSeanceCeJour: string;
  inscriptionEchouee: string;
};

const fr: ClesErreurs = {
  nomEtEmail: "Indique ton nom et ton adresse e-mail.",
  emailInvalide: "Cette adresse e-mail ne semble pas valide.",
  typeInconnu: "Type de réservation inconnu.",
  nombreInvalide: "Nombre de convives invalide.",
  etablissementIntrouvable: "Établissement introuvable.",
  plusDeReservationEnLigne:
    "Cet établissement ne prend plus de réservation en ligne. Appelle-le directement.",
  tropDeDemandes:
    "Tu as déjà envoyé plusieurs demandes aujourd'hui. Appelle l'établissement directement, il te répondra plus vite.",
  espacePlusPropose: "Cet espace n'est plus proposé à la réservation.",
  servicePasCeJour: "Ce service n'est pas assuré ce jour-là.",
  heureHorsListe: "Choisis une heure d'arrivée dans la liste proposée.",
  creneauPrisTable:
    "Ce créneau vient d'être pris pendant que tu remplissais le formulaire. Recharge la page : il reste peut-être de la place à une autre heure.",
  creneauPris:
    "Ce créneau vient d'être pris. Choisis-en un autre, ou une autre date.",
  envoiEchoue: "L'envoi a échoué. Réessaie dans un instant.",

  dateInvalide: "Date invalide.",
  nombreDePlaces: "Indiquez un nombre de places.",
  experiencePlusProposee: "Cette expérience n'est plus proposée.",
  pasDeSeanceCeJour: "Aucune séance n'a lieu ce jour-là.",
  inscriptionEchouee: "L'inscription a échoué. Réessayez dans un instant.",
};

const en: ClesErreurs = {
  nomEtEmail: "Please give your name and your e-mail address.",
  emailInvalide: "That e-mail address does not look valid.",
  typeInconnu: "Unknown booking type.",
  nombreInvalide: "Invalid number of guests.",
  etablissementIntrouvable: "Restaurant not found.",
  plusDeReservationEnLigne:
    "This restaurant no longer takes bookings online. Please call them directly.",
  tropDeDemandes:
    "You have already sent several requests today. Call the restaurant directly — they will answer faster.",
  espacePlusPropose: "This space is no longer open for booking.",
  servicePasCeJour: "That service does not run on that day.",
  heureHorsListe: "Please pick an arrival time from the list.",
  creneauPrisTable:
    "That slot was taken while you were filling in the form. Reload the page: there may still be room at another time.",
  creneauPris: "That slot has just been taken. Pick another one, or another date.",
  envoiEchoue: "Sending failed. Please try again in a moment.",

  dateInvalide: "Invalid date.",
  nombreDePlaces: "Please give a number of places.",
  experiencePlusProposee: "This experience is no longer offered.",
  pasDeSeanceCeJour: "There is no session on that day.",
  inscriptionEchouee: "The booking failed. Please try again in a moment.",
};

const zh: ClesErreurs = {
  nomEtEmail: "请填写您的姓名和电子邮箱。",
  emailInvalide: "这个电子邮箱地址看起来不正确。",
  typeInconnu: "订位类型无法识别。",
  nombreInvalide: "人数不正确。",
  etablissementIntrouvable: "找不到这家餐厅。",
  plusDeReservationEnLigne: "这家餐厅不再接受在线订位，请直接致电。",
  tropDeDemandes:
    "您今天已经提交了多次申请。请直接致电餐厅，他们会更快回复您。",
  espacePlusPropose: "这个空间已不再开放预订。",
  servicePasCeJour: "这一天没有这个餐次。",
  heureHorsListe: "请从列表中选择一个到店时间。",
  creneauPrisTable:
    "您填写表单的时候，这个时段刚被订走了。请刷新页面：换一个时间也许还有位子。",
  creneauPris: "这个时段刚被订走了。请换一个时段，或换一天。",
  envoiEchoue: "提交失败。请稍后再试。",

  dateInvalide: "日期不正确。",
  nombreDePlaces: "请填写名额数量。",
  experiencePlusProposee: "这个活动已不再提供。",
  pasDeSeanceCeJour: "这一天没有场次。",
  inscriptionEchouee: "报名失败。请稍后再试。",
};

export const ERREURS: Record<Langue, ClesErreurs> = { fr, en, zh };
