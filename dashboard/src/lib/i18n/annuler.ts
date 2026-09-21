import type { Langue } from "@/lib/i18n/langues";

/**
 * Les deux pages qu'un client atteint depuis un courriel : « ma
 * réservation » et « me désinscrire ».
 *
 * Elles portent « noindex » — un lien personnel n'a rien à faire dans un
 * moteur de recherche — et peuvent donc suivre la langue du navigateur.
 *
 * On y trouve aussi les motifs de refus, ceux que rendent `peutAnnuler` et
 * `peutModifier`. Ce sont les phrases les plus délicates du lot : elles
 * disent à quelqu'un qu'il doit décrocher son téléphone, et elles doivent
 * expliquer pourquoi sans avoir l'air de se défiler.
 *
 * Le tutoiement du français est celui des courriels de réservation, qui
 * s'adressent au convive.
 */

export type ClesAnnuler = {
  /** L'écran « ma réservation ». */
  maReservation: string;
  resume(maison: string, date: string, heure: string | null, couverts: number): string;
  lEtablissement: string;
  lienPerime: string;
  signatureReservations: string;

  /** L'annulation. */
  cestAnnule: string;
  merciDeLAvoirRendue: string;
  annulationEnCours: string;
  annulerMaReservation: string;

  /** La modification. */
  cestModifie: string;
  modifierMaReservation: string;
  dateLabel: string;
  heureLabel: string;
  convivesLabel: string;
  modificationEnCours: string;
  enregistrerLeChangement: string;
  laisserCommeCa: string;

  /** Ce que refusent les deux actions. */
  lienInvalide: string;
  lienPlusValide: string;
  annulationEchouee: string;
  modificationEchouee: string;
  choisisUneDate: string;
  indiqueDesConvives: string;
  plusModifiableEnLigne: string;
  servicePasCeJour: string;
  changementsFerment(heures: number): string;
  servicePasse: string;
  heureHorsListe: string;
  creneauPlusLibre: string;

  /** Les verdicts. */
  dejaAnnulee: string;
  plusRienAModifier: string;
  plusActive: string;
  devisAccepte: string;
  acompteRegleAnnulation: string;
  acompteRegleModification: string;
  empreintePrise: string;
  servicePasseAnnulation: string;
  servicePasseModification: string;

  /** L'écran « me désinscrire ». */
  meDesinscrire: string;
  desabonnementLienPerime: string;
  /**
   * Trois phrases rendues en deux morceaux, autour de l'adresse.
   *
   * L'adresse est ce que la personne vient vérifier — elle en a souvent
   * plusieurs, et elle veut savoir laquelle est concernée. Elle reste donc
   * en gras. Mais elle ne tombe pas au même endroit selon la langue :
   * « C'est fait. jean@… ne recevra plus… » contre
   * « 已完成。jean@… 不会再收到… ». Une phrase à trous n'y suffit pas ; deux
   * morceaux, si.
   */
  dejaDesinscrite(maison: string): { avant: string; apres: string };
  recoitLesActualites(maison: string): { avant: string; apres: string };
  cestFait(maison: string): { avant: string; apres: string };
  courrielsDeService: string;
  desinscriptionEnCours: string;
  desinscriptionEchouee: string;
  signatureEnvois: string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesAnnuler = {
  maReservation: "Ma réservation",
  resume: (maison, date, heure, couverts) =>
    `${maison} — ${date}${heure ? ` à ${heure}` : ""}, ${couverts} couvert${s(couverts)}.`,
  lEtablissement: "L’établissement",
  lienPerime:
    "Ce lien n’est plus valide. Si tu dois annuler une réservation, contacte directement l’établissement.",
  signatureReservations: "Réservations propulsées par",

  cestAnnule:
    "C’est annulé. L’établissement est prévenu et ta table est remise à la réservation.",
  merciDeLAvoirRendue:
    "Merci de l’avoir rendue : c’est ce qui permet à quelqu’un d’autre de dîner ce soir-là.",
  annulationEnCours: "Annulation…",
  annulerMaReservation: "Annuler ma réservation",

  cestModifie:
    "C’est modifié. L’établissement est prévenu, et tu reçois la confirmation par e-mail.",
  modifierMaReservation: "Modifier ma réservation",
  dateLabel: "Date",
  heureLabel: "Heure",
  convivesLabel: "Convives",
  modificationEnCours: "Modification…",
  enregistrerLeChangement: "Enregistrer le changement",
  laisserCommeCa: "Laisser comme ça",

  lienInvalide: "Lien invalide.",
  lienPlusValide: "Ce lien n’est plus valide.",
  annulationEchouee: "L’annulation a échoué. Réessaie dans un instant.",
  modificationEchouee: "La modification a échoué. Réessaie dans un instant.",
  choisisUneDate: "Choisis une date.",
  indiqueDesConvives: "Indique un nombre de convives.",
  plusModifiableEnLigne:
    "Cette réservation ne peut plus être modifiée en ligne. Contacte l’établissement.",
  servicePasCeJour: "Ce service n’est pas assuré ce jour-là.",
  changementsFerment: (heures) =>
    `Les changements ferment ${heures} h avant le service.`,
  servicePasse: "Ce service est passé.",
  heureHorsListe: "Choisis une heure dans la liste proposée.",
  creneauPlusLibre:
    "Ce créneau n’est plus libre. Choisis-en un autre, ou contacte l’établissement.",

  dejaAnnulee: "Cette réservation est déjà annulée. Il n’y a rien de plus à faire.",
  plusRienAModifier:
    "Cette réservation est annulée : il n’y a plus rien à modifier.",
  plusActive:
    "Cette réservation n’est plus active : elle n’a pas été retenue par l’établissement.",
  devisAccepte:
    "Un devis a été accepté pour cet événement : le prix a été arrêté pour ce nombre de convives. Contacte l’établissement, il établira une nouvelle proposition.",
  acompteRegleAnnulation:
    "Un acompte a été réglé pour cette réservation. Contacte directement l’établissement : lui seul peut décider du remboursement.",
  acompteRegleModification:
    "Un acompte a été réglé pour cette réservation. Contacte directement l’établissement : lui seul peut revoir ce qui a été convenu.",
  empreintePrise:
    "Une empreinte de carte a été enregistrée pour cette réservation. Contacte l’établissement pour la modifier.",
  servicePasseAnnulation: "Ce service est passé : il n’y a plus rien à annuler.",
  servicePasseModification:
    "Ce service est passé : il n’y a plus rien à modifier.",

  meDesinscrire: "Me désinscrire",
  desabonnementLienPerime:
    "Ce lien n’est plus valide. Si vous continuez de recevoir des messages, répondez-y directement : l’adresse de réponse est celle de l’établissement.",
  dejaDesinscrite: (maison) => ({
    avant: "",
    apres: ` est déjà désinscrite des actualités de ${maison}. Il n’y a rien de plus à faire.`,
  }),
  recoitLesActualites: (maison) => ({
    avant: "",
    apres: ` reçoit les actualités et offres de ${maison}. Un clic suffit pour arrêter.`,
  }),
  cestFait: (maison) => ({
    avant: "C’est fait. ",
    apres: ` ne recevra plus les actualités de ${maison}.`,
  }),
  courrielsDeService:
    "Les e-mails liés à vos réservations — confirmation, rappel, annulation — continuent de partir : ce ne sont pas des messages commerciaux, et vous en avez besoin.",
  desinscriptionEnCours: "En cours…",
  desinscriptionEchouee: "La désinscription a échoué. Réessayez dans un instant.",
  signatureEnvois: "Envois propulsés par",
};

const en: ClesAnnuler = {
  maReservation: "My booking",
  resume: (maison, date, heure, couverts) =>
    `${maison} — ${date}${heure ? ` at ${heure}` : ""}, ${couverts} guest${s(couverts)}.`,
  lEtablissement: "The restaurant",
  lienPerime:
    "This link is no longer valid. If you need to cancel a booking, contact the restaurant directly.",
  signatureReservations: "Bookings powered by",

  cestAnnule:
    "Cancelled. The restaurant has been told, and your table is back up for booking.",
  merciDeLAvoirRendue:
    "Thank you for giving it back: that is what lets someone else have dinner that evening.",
  annulationEnCours: "Cancelling…",
  annulerMaReservation: "Cancel my booking",

  cestModifie:
    "Changed. The restaurant has been told, and your confirmation is on its way by e-mail.",
  modifierMaReservation: "Change my booking",
  dateLabel: "Date",
  heureLabel: "Time",
  convivesLabel: "Guests",
  modificationEnCours: "Saving…",
  enregistrerLeChangement: "Save the change",
  laisserCommeCa: "Leave it as it is",

  lienInvalide: "Invalid link.",
  lienPlusValide: "This link is no longer valid.",
  annulationEchouee: "The cancellation failed. Please try again in a moment.",
  modificationEchouee: "The change failed. Please try again in a moment.",
  choisisUneDate: "Please pick a date.",
  indiqueDesConvives: "Please give a number of guests.",
  plusModifiableEnLigne:
    "This booking can no longer be changed online. Please contact the restaurant.",
  servicePasCeJour: "That service does not run on that day.",
  changementsFerment: (heures) =>
    `Changes close ${heures} h before service.`,
  servicePasse: "That service is over.",
  heureHorsListe: "Please pick a time from the list.",
  creneauPlusLibre:
    "That slot is no longer free. Pick another one, or contact the restaurant.",

  dejaAnnulee: "This booking is already cancelled. There is nothing more to do.",
  plusRienAModifier: "This booking is cancelled: there is nothing left to change.",
  plusActive:
    "This booking is no longer active: the restaurant did not take it.",
  devisAccepte:
    "A quote has been accepted for this event: the price was settled for that number of guests. Contact the restaurant and they will draw up a new proposal.",
  acompteRegleAnnulation:
    "A deposit has been paid for this booking. Contact the restaurant directly: only they can decide on a refund.",
  acompteRegleModification:
    "A deposit has been paid for this booking. Contact the restaurant directly: only they can revisit what was agreed.",
  empreintePrise:
    "A card hold was taken for this booking. Contact the restaurant to change it.",
  servicePasseAnnulation: "That service is over: there is nothing left to cancel.",
  servicePasseModification: "That service is over: there is nothing left to change.",

  meDesinscrire: "Unsubscribe",
  desabonnementLienPerime:
    "This link is no longer valid. If you keep receiving messages, just reply to them: the reply address is the restaurant's own.",
  dejaDesinscrite: (maison) => ({
    avant: "",
    apres: ` is already unsubscribed from ${maison}'s news. There is nothing more to do.`,
  }),
  recoitLesActualites: (maison) => ({
    avant: "",
    apres: ` receives news and offers from ${maison}. One click is enough to stop.`,
  }),
  cestFait: (maison) => ({
    avant: "Done. ",
    apres: ` will no longer receive ${maison}'s news.`,
  }),
  courrielsDeService:
    "E-mails about your bookings — confirmation, reminder, cancellation — keep coming: they are not marketing, and you need them.",
  desinscriptionEnCours: "Working…",
  desinscriptionEchouee:
    "Unsubscribing failed. Please try again in a moment.",
  signatureEnvois: "E-mails powered by",
};

const zh: ClesAnnuler = {
  maReservation: "我的订位",
  resume: (maison, date, heure, couverts) =>
    `${maison} —— ${date}${heure ? ` ${heure}` : ""}，${couverts} 位。`,
  lEtablissement: "本店",
  lienPerime: "这个链接已失效。如果您需要取消订位，请直接联系餐厅。",
  signatureReservations: "订座技术支持",

  cestAnnule: "已取消。餐厅已收到通知，您的桌位重新开放预订。",
  merciDeLAvoirRendue: "谢谢您把桌位还回来：这样别人当晚才有位子吃饭。",
  annulationEnCours: "正在取消……",
  annulerMaReservation: "取消我的订位",

  cestModifie: "已修改。餐厅已收到通知，确认信也会发到您的邮箱。",
  modifierMaReservation: "修改我的订位",
  dateLabel: "日期",
  heureLabel: "时间",
  convivesLabel: "人数",
  modificationEnCours: "正在保存……",
  enregistrerLeChangement: "保存修改",
  laisserCommeCa: "不改了",

  lienInvalide: "链接无效。",
  lienPlusValide: "这个链接已失效。",
  annulationEchouee: "取消失败。请稍后再试。",
  modificationEchouee: "修改失败。请稍后再试。",
  choisisUneDate: "请选择日期。",
  indiqueDesConvives: "请填写人数。",
  plusModifiableEnLigne: "这个订位无法再在线修改。请联系餐厅。",
  servicePasCeJour: "这一天没有这个餐次。",
  changementsFerment: (heures) => `修改在开餐前 ${heures} 小时截止。`,
  servicePasse: "这一餐次已经结束。",
  heureHorsListe: "请从列表中选择一个时间。",
  creneauPlusLibre: "这个时段已经没有位子了。请换一个时段，或联系餐厅。",

  dejaAnnulee: "这个订位已经取消了。无需再做什么。",
  plusRienAModifier: "这个订位已取消：没有什么可以修改了。",
  plusActive: "这个订位已失效：餐厅没有接受它。",
  devisAccepte:
    "这场活动的报价单已被接受：价格是按这个人数定下的。请联系餐厅，他们会重新出一份报价。",
  acompteRegleAnnulation:
    "这个订位已经支付了定金。请直接联系餐厅：只有他们能决定是否退款。",
  acompteRegleModification:
    "这个订位已经支付了定金。请直接联系餐厅：只有他们能重新商定。",
  empreintePrise: "这个订位已经做了信用卡预授权。请联系餐厅修改。",
  servicePasseAnnulation: "这一餐次已经结束：没有什么可以取消了。",
  servicePasseModification: "这一餐次已经结束：没有什么可以修改了。",

  meDesinscrire: "退订",
  desabonnementLienPerime:
    "这个链接已失效。如果您还继续收到邮件，直接回复即可：回复地址就是餐厅的地址。",
  dejaDesinscrite: (maison) => ({
    avant: "",
    apres: ` 已经退订了${maison}的消息。无需再做什么。`,
  }),
  recoitLesActualites: (maison) => ({
    avant: "",
    apres: ` 正在接收${maison}的消息与优惠。点一下即可停止。`,
  }),
  cestFait: (maison) => ({
    avant: "已完成。",
    apres: ` 不会再收到${maison}的消息。`,
  }),
  courrielsDeService:
    "与您订位相关的邮件——确认、提醒、取消——仍会发送：这些不是营销邮件，您需要它们。",
  desinscriptionEnCours: "正在处理……",
  desinscriptionEchouee: "退订失败。请稍后再试。",
  signatureEnvois: "邮件技术支持",
};

export const ANNULER: Record<Langue, ClesAnnuler> = { fr, en, zh };
