import type { Langue } from "@/lib/i18n/langues";

/**
 * Les messages qu'un client reçoit autour de sa réservation.
 *
 * Ils partent d'un serveur, longtemps après la requête qui les a
 * déclenchés — le rappel de la veille part la nuit. La langue ne peut donc
 * pas se deviner au moment de l'envoi : elle est lue quand le client
 * remplit le formulaire, et rangée avec la réservation. Comme pour le lot
 * de la roue.
 *
 * **Les alertes au restaurateur restent en français** et n'ont pas leur
 * place ici. Elles partent à l'adresse de contact de l'établissement, qui
 * n'est pas forcément un compte Klarr : on ne sait donc pas dans quelle
 * langue les écrire. Le jour où on le saura, ce sera un autre
 * dictionnaire.
 *
 * Les valeurs arrivent déjà échappées : ces fonctions produisent du HTML,
 * et c'est l'appelant qui sait ce qui vient d'un formulaire public.
 */

export type ClesCourriels = {
  bonjour(nom: string): string;
  /** « 4 couverts · Dîner » — la seconde ligne de l'encadré. */
  couvertsEtService(couverts: number, service: string | null): string;
  /** « samedi 4 octobre à 20h, 4 couverts » — dans un sujet ou une phrase. */
  quandEtCombien(quand: string, couverts: number): string;
  minimumConvenu(montant: string): string;
  /** Le lien arrive déjà bâti : c'est le HTML de l'ancre. */
  unChangement(lienHtml: string): string;
  libelleLienChangement: string;
  /**
   * Un lien dans la version texte : « libellé : adresse ».
   *
   * Le deux-points ne s'écrit pas pareil — le français pose une espace
   * devant, l'anglais rien, le chinois a son propre signe. Écrire « : » à
   * la main donnait « Change or cancel your booking : https://… », qui se
   * lit comme une traduction bâclée dans le seul message que le client
   * garde.
   */
  lienTexte(libelle: string, url: string): string;
  envoyeParKlarr: string;

  /** La demande reçue, pas encore tranchée. */
  demandeRecueSujet(maison: string): string;
  bienRecuReservation(maison: string): string;
  bienRecuPrivatisation(maison: string): string;
  pasEncoreConfirmee: string;
  siVosPlansChangent: string;

  /** La confirmation — le message que le client garde. */
  confirmeeSujet(maison: string): string;
  tableConfirmee(maison: string): string;
  unEmpechement: string;

  /** Le refus, ou l'annulation par la maison. */
  refuseeSujet(maison: string): string;
  annuleeSujet(maison: string): string;
  nePeutHonorer(maison: string, quand: string): string;
  doitAnnuler(maison: string, quand: string): string;
  rienNestFacture: string;
  repondezACetEmail: string;

  /** La modification faite par le client. */
  modifieeSujet(maison: string): string;
  bienModifiee(maison: string): string;

  /** Le lien de paiement. */
  sujetCarte(maison: string): string;
  sujetAcompte(maison: string): string;
  bonneNouvelle(maison: string): string;
  resteLaCarte(montant: string): string;
  resteLAcompte(montant: string): string;
  boutonCarte: string;
  boutonAcompte: string;
  salleReserveeJusqua(echeance: string): string;
  salleReservee: string;

  /** Le rappel de la veille. */
  rappelSujet(maison: string, quand: string): string;
  petitRappel(maison: string): string;
  empechementRappel: string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesCourriels = {
  bonjour: (nom) => `Bonjour ${nom},`,
  couvertsEtService: (couverts, service) =>
    `${couverts} couvert${s(couverts)}${service ? ` · ${service}` : ""}`,
  quandEtCombien: (quand, couverts) =>
    `${quand}, ${couverts} couvert${s(couverts)}`,
  minimumConvenu: (montant) =>
    `Minimum de consommation convenu : <strong>${montant}</strong>. Rien n'a été encaissé : ce montant se règle sur place.`,
  unChangement: (lienHtml) =>
    `Un changement ? ${lienHtml} — l'heure, le nombre de convives, ou rendre la table.`,
  libelleLienChangement: "Modifiez ou annulez votre réservation",
  lienTexte: (libelle, url) => `${libelle}\u00a0: ${url}`,
  envoyeParKlarr: "Envoyé par Klarr",

  demandeRecueSujet: (maison) => `Demande reçue — ${maison}`,
  bienRecuReservation: (maison) =>
    `Nous avons bien reçu votre demande de réservation chez ${maison}.`,
  bienRecuPrivatisation: (maison) =>
    `Nous avons bien reçu votre demande de privatisation chez ${maison}.`,
  pasEncoreConfirmee:
    "Elle n'est pas encore confirmée — le restaurant revient vers vous très vite. Vous recevrez un second message dès que ce sera fait.",
  siVosPlansChangent:
    "Si vos plans changent, répondez simplement à cet e-mail.",

  confirmeeSujet: (maison) => `Réservation confirmée — ${maison}`,
  tableConfirmee: (maison) => `Votre table est confirmée chez ${maison}.`,
  unEmpechement:
    "Un empêchement ? Prévenez-nous en répondant à cet e-mail — une table rendue à temps, c'est une table qui resert.",

  refuseeSujet: (maison) => `Demande non retenue — ${maison}`,
  annuleeSujet: (maison) => `Réservation annulée — ${maison}`,
  nePeutHonorer: (maison, quand) =>
    `${maison} ne peut malheureusement pas honorer votre demande du <strong>${quand}</strong>.`,
  doitAnnuler: (maison, quand) =>
    `${maison} doit annuler votre réservation du <strong>${quand}</strong>.`,
  rienNestFacture:
    "Rien ne vous est facturé. Si une autre date vous convient, la page de réservation vous montre ce qui reste disponible.",
  repondezACetEmail:
    "Vous pouvez répondre à cet e-mail pour joindre l'établissement.",

  modifieeSujet: (maison) => `Réservation modifiée — ${maison}`,
  bienModifiee: (maison) =>
    `Votre réservation chez ${maison} a bien été modifiée.`,

  sujetCarte: (maison) => `Carte à enregistrer — ${maison}`,
  sujetAcompte: (maison) => `Acompte à régler — ${maison}`,
  bonneNouvelle: (maison) =>
    `Bonne nouvelle : ${maison} a accepté votre demande.`,
  resteLaCarte: (montant) =>
    `Pour la confirmer définitivement, il reste à enregistrer une carte en garantie de <strong>${montant}</strong>. <strong>Rien ne sera prélevé</strong> : elle ne serait débitée qu'en cas de défection.`,
  resteLAcompte: (montant) =>
    `Pour la confirmer définitivement, il reste à régler un acompte de <strong>${montant}</strong>, qui viendra en déduction de l'addition.`,
  boutonCarte: "Enregistrer ma carte",
  boutonAcompte: "Régler l'acompte",
  salleReserveeJusqua: (echeance) =>
    `La salle vous est réservée jusqu'au ${echeance}. Passé ce délai, elle repart à la réservation.`,
  salleReservee: "La salle vous est réservée le temps de cette formalité.",

  rappelSujet: (maison, quand) => `Demain — ${maison}, ${quand}`,
  petitRappel: (maison) => `Petit rappel : vous êtes attendus chez ${maison}.`,
  empechementRappel:
    "Un empêchement ? Répondez à cet e-mail, l'établissement préfère le savoir ce soir que demain à table.",
};

const en: ClesCourriels = {
  bonjour: (nom) => `Hello ${nom},`,
  couvertsEtService: (couverts, service) =>
    `${couverts} guest${s(couverts)}${service ? ` · ${service}` : ""}`,
  quandEtCombien: (quand, couverts) =>
    `${quand}, ${couverts} guest${s(couverts)}`,
  minimumConvenu: (montant) =>
    `Agreed minimum spend: <strong>${montant}</strong>. Nothing has been charged: this is settled on the day.`,
  unChangement: (lienHtml) =>
    `Something to change? ${lienHtml} — the time, the number of guests, or give the table back.`,
  libelleLienChangement: "Change or cancel your booking",
  lienTexte: (libelle, url) => `${libelle}: ${url}`,
  envoyeParKlarr: "Sent by Klarr",

  demandeRecueSujet: (maison) => `Request received — ${maison}`,
  bienRecuReservation: (maison) =>
    `We have received your booking request for ${maison}.`,
  bienRecuPrivatisation: (maison) =>
    `We have received your private hire request for ${maison}.`,
  pasEncoreConfirmee:
    "It is not confirmed yet — the restaurant will come back to you very shortly. You will get a second e-mail as soon as it is done.",
  siVosPlansChangent: "If your plans change, just reply to this e-mail.",

  confirmeeSujet: (maison) => `Booking confirmed — ${maison}`,
  tableConfirmee: (maison) => `Your table at ${maison} is confirmed.`,
  unEmpechement:
    "Something came up? Let us know by replying to this e-mail — a table given back in time is a table that gets used.",

  refuseeSujet: (maison) => `Request not taken — ${maison}`,
  annuleeSujet: (maison) => `Booking cancelled — ${maison}`,
  nePeutHonorer: (maison, quand) =>
    `${maison} is unfortunately unable to take your request for <strong>${quand}</strong>.`,
  doitAnnuler: (maison, quand) =>
    `${maison} has to cancel your booking for <strong>${quand}</strong>.`,
  rienNestFacture:
    "You are not charged anything. If another date suits you, the booking page shows what is still available.",
  repondezACetEmail: "You can reply to this e-mail to reach the restaurant.",

  modifieeSujet: (maison) => `Booking changed — ${maison}`,
  bienModifiee: (maison) => `Your booking at ${maison} has been changed.`,

  sujetCarte: (maison) => `Card to save — ${maison}`,
  sujetAcompte: (maison) => `Deposit to pay — ${maison}`,
  bonneNouvelle: (maison) => `Good news: ${maison} has accepted your request.`,
  resteLaCarte: (montant) =>
    `To confirm it for good, a card needs to be stored as a guarantee of up to <strong>${montant}</strong>. <strong>Nothing will be charged</strong>: it would only be debited for a no-show.`,
  resteLAcompte: (montant) =>
    `To confirm it for good, a deposit of <strong>${montant}</strong> remains to be paid, and it comes off the final bill.`,
  boutonCarte: "Save my card",
  boutonAcompte: "Pay the deposit",
  salleReserveeJusqua: (echeance) =>
    `The room is held for you until ${echeance}. After that it goes back up for booking.`,
  salleReservee: "The room is held for you while you take care of this.",

  rappelSujet: (maison, quand) => `Tomorrow — ${maison}, ${quand}`,
  petitRappel: (maison) => `A quick reminder: you are expected at ${maison}.`,
  empechementRappel:
    "Something came up? Reply to this e-mail — the restaurant would rather know tonight than tomorrow at the table.",
};

const zh: ClesCourriels = {
  bonjour: (nom) => `${nom} 您好：`,
  couvertsEtService: (couverts, service) =>
    `${couverts} 位${service ? ` · ${service}` : ""}`,
  quandEtCombien: (quand, couverts) => `${quand}，${couverts} 位`,
  minimumConvenu: (montant) =>
    `约定的最低消费：<strong>${montant}</strong>。目前没有收取任何款项，这笔费用到店结算。`,
  unChangement: (lienHtml) =>
    `需要改动？${lienHtml} —— 时间、人数，或者退掉这张桌子。`,
  libelleLienChangement: "修改或取消您的订位",
  lienTexte: (libelle, url) => `${libelle}：${url}`,
  envoyeParKlarr: "由 Klarr 发送",

  demandeRecueSujet: (maison) => `已收到您的申请 —— ${maison}`,
  bienRecuReservation: (maison) => `我们已收到您在${maison}的订位申请。`,
  bienRecuPrivatisation: (maison) => `我们已收到您在${maison}的包场申请。`,
  pasEncoreConfirmee:
    "目前还未确认——餐厅会很快回复您。确认之后，您会收到第二封邮件。",
  siVosPlansChangent: "如果您的计划有变，直接回复这封邮件即可。",

  confirmeeSujet: (maison) => `订位已确认 —— ${maison}`,
  tableConfirmee: (maison) => `您在${maison}的桌位已确认。`,
  unEmpechement:
    "临时有事？回复这封邮件告诉我们——及时退回的桌子，才能再招待别人。",

  refuseeSujet: (maison) => `申请未获接受 —— ${maison}`,
  annuleeSujet: (maison) => `订位已取消 —— ${maison}`,
  nePeutHonorer: (maison, quand) =>
    `很遗憾，${maison}无法接受您 <strong>${quand}</strong> 的申请。`,
  doitAnnuler: (maison, quand) =>
    `${maison}不得不取消您 <strong>${quand}</strong> 的订位。`,
  rienNestFacture:
    "不会向您收取任何费用。如果换一天也方便，订位页面上可以看到还有哪些时段。",
  repondezACetEmail: "您可以直接回复这封邮件联系餐厅。",

  modifieeSujet: (maison) => `订位已修改 —— ${maison}`,
  bienModifiee: (maison) => `您在${maison}的订位已修改成功。`,

  sujetCarte: (maison) => `需要记录信用卡 —— ${maison}`,
  sujetAcompte: (maison) => `需要支付定金 —— ${maison}`,
  bonneNouvelle: (maison) => `好消息：${maison}已接受您的申请。`,
  resteLaCarte: (montant) =>
    `要最终确认，还需要记录一张信用卡作为担保，额度 <strong>${montant}</strong>。<strong>不会扣款</strong>：只有未到场才会扣。`,
  resteLAcompte: (montant) =>
    `要最终确认，还需要支付 <strong>${montant}</strong> 的定金，这笔钱会从最终账单中扣除。`,
  boutonCarte: "记录我的信用卡",
  boutonAcompte: "支付定金",
  salleReserveeJusqua: (echeance) =>
    `这个空间为您保留至 ${echeance}。超过这个时间，它会重新开放预订。`,
  salleReservee: "在您办理期间，这个空间为您保留。",

  rappelSujet: (maison, quand) => `明天 —— ${maison}，${quand}`,
  petitRappel: (maison) => `温馨提醒：${maison}等着您。`,
  empechementRappel:
    "临时有事？回复这封邮件——餐厅宁愿今晚知道，也不愿明天在餐桌前才知道。",
};

export const COURRIELS: Record<Langue, ClesCourriels> = { fr, en, zh };
