import type { Langue } from "@/lib/i18n/langues";

/**
 * La page de paiement, dans les trois langues.
 *
 * C'est la dernière page avant l'argent, et la seule qu'on atteint par un
 * lien reçu par courriel. Le visiteur n'a donc pas forcément cliqué sur un
 * sélecteur : `langueVisiteur` lit son témoin s'il en a un, sinon son
 * navigateur. La page porte « noindex » — le jeton de paiement est dans
 * l'adresse —, elle peut donc deviner sans risque pour le référencement.
 *
 * Les sommes passent par `sommeEuros` : le français écrit « 12,00 € »,
 * l'anglais et le chinois « €12.00 ».
 */

export type ClesPaiement = {
  titreOnglet: string;

  /** Ce qui est déjà réglé. */
  carteEnregistreeBadge: string;
  reservationConfirmee(maison: string): string;
  cautionDejaPosee(plafond: string, maison: string, date: string): string;
  acompteRecuBadge: string;
  acompteRecuTexte(somme: string, maison: string, date: string): string;

  /** Ce qui n'a plus lieu d'être payé. */
  plusActiveTitre: string;
  plusActiveTexte(maison: string): string;
  inscriptionAnnuleeTitre: string;
  inscriptionAnnuleeTexte(maison: string): string;

  /** L'établissement n'a pas fini de brancher ses paiements. */
  pasOuvertTitre: string;
  pasOuvertReservation(maison: string): string;
  pasOuvertSeance(maison: string): string;

  /** La demande elle-même. */
  carteEnGarantie: string;
  acompteDe(somme: string): string;
  auNomDe: string;
  dateLabel: string;
  serviceLabel: string;
  espacePrivatise: string;
  convivesLabel: string;
  convivesValeur(couverts: number): string;
  heureLabel: string;
  placesLabel: string;
  placesValeur(places: number): string;
  totalLabel: string;

  interrompuReservation: string;
  interrompuSeance: string;
  indisponible(maison: string): string;
  enregistrerMaCarte: string;
  payer(somme: string): string;
  piedCaution(maison: string): string;
  piedAcompte(maison: string): string;

  /** Les séances d'atelier. */
  inscriptionConfirmeeBadge: string;
  seanceReglee(somme: string, maison: string, date: string, heure: string): string;

  /** Ce que le client lira sur la page de Stripe. */
  intitulePrivatisation(espace: string, couverts: number, somme: string): string;
  intituleSeance(nom: string, places: number, date: string): string;
  /** Ce qu'on promet au client avant qu'il enregistre sa carte. */
  engagement(maison: string, plafond: string): string;
};

const s = (n: number) => (n > 1 ? "s" : "");

const fr: ClesPaiement = {
  titreOnglet: "Paiement",

  carteEnregistreeBadge: "Carte enregistrée",
  reservationConfirmee: (maison) =>
    `Votre réservation chez ${maison} est confirmée.`,
  cautionDejaPosee: (plafond, maison, date) =>
    `Rien n'a été prélevé. Votre carte reste en garantie jusqu'à ${plafond}, et ne sera débitée qu'en cas d'annulation tardive ou d'absence. ${maison} vous attend le ${date}.`,
  acompteRecuBadge: "Acompte reçu",
  acompteRecuTexte: (somme, maison, date) =>
    `Nous avons bien reçu votre acompte de ${somme}. Cette page vaut reçu ; ${maison} vous attend le ${date}.`,

  plusActiveTitre: "Cette réservation n'est plus active.",
  plusActiveTexte: (maison) =>
    `Aucun paiement n'est attendu. Contactez ${maison} si vous pensez qu'il s'agit d'une erreur.`,
  inscriptionAnnuleeTitre: "Cette inscription a été annulée.",
  inscriptionAnnuleeTexte: (maison) =>
    `Aucun paiement n'est attendu. Contactez ${maison} si vous pensez qu'il s'agit d'une erreur.`,

  pasOuvertTitre: "Le paiement n'est pas encore ouvert.",
  pasOuvertReservation: (maison) =>
    `${maison} doit terminer la configuration de ses paiements. Reprenez contact avec l'établissement — rien n'est perdu, votre réservation reste enregistrée.`,
  pasOuvertSeance: (maison) =>
    `${maison} doit terminer la configuration de ses paiements. Reprenez contact avec l'établissement — votre place reste enregistrée.`,

  carteEnGarantie: "Carte en garantie",
  acompteDe: (somme) => `Acompte de ${somme}`,
  auNomDe: "Au nom de",
  dateLabel: "Date",
  serviceLabel: "Service",
  espacePrivatise: "Espace privatisé",
  convivesLabel: "Convives",
  convivesValeur: (couverts) => `${couverts} couvert${s(couverts)}`,
  heureLabel: "Heure",
  placesLabel: "Places",
  placesValeur: (places) => `${places} place${s(places)}`,
  totalLabel: "Total",

  interrompuReservation:
    "Paiement interrompu. Vous pouvez reprendre quand vous voulez, votre réservation est toujours là.",
  interrompuSeance:
    "Paiement interrompu. Votre place est retenue le temps que vous reveniez.",
  indisponible: (maison) =>
    `Le paiement est momentanément indisponible. Réessayez dans quelques minutes, ou contactez ${maison}.`,
  enregistrerMaCarte: "Enregistrer ma carte",
  payer: (somme) => `Payer ${somme}`,
  piedCaution: (maison) =>
    `Carte enregistrée par Stripe, chez ${maison}. Aucun montant n'est prélevé aujourd'hui, et Klarr ne perçoit aucune commission.`,
  piedAcompte: (maison) =>
    `Paiement traité par Stripe, directement au bénéfice de ${maison}. Klarr ne perçoit aucune commission.`,

  inscriptionConfirmeeBadge: "Inscription confirmée",
  seanceReglee: (somme, maison, date, heure) =>
    `Nous avons bien reçu votre paiement de ${somme}. ${maison} vous attend le ${date} à ${heure}. Cette page vaut reçu.`,

  intitulePrivatisation: (espace, couverts, somme) =>
    `Acompte pour la privatisation de ${espace} — ${couverts} couverts : ${somme}`,
  intituleSeance: (nom, places, date) =>
    `${nom} — ${places} place${s(places)} le ${date}`,
  engagement: (maison, plafond) =>
    `${maison} n'encaisse rien aujourd'hui. Votre carte est enregistrée en garantie : elle ne sera débitée, jusqu'à ${plafond}, qu'en cas d'annulation tardive ou si vous ne venez pas.`,
};

const en: ClesPaiement = {
  titreOnglet: "Payment",

  carteEnregistreeBadge: "Card saved",
  reservationConfirmee: (maison) =>
    `Your booking at ${maison} is confirmed.`,
  cautionDejaPosee: (plafond, maison, date) =>
    `Nothing has been charged. Your card is held as a guarantee of up to ${plafond}, and would only be charged for a late cancellation or a no-show. ${maison} looks forward to seeing you on ${date}.`,
  acompteRecuBadge: "Deposit received",
  acompteRecuTexte: (somme, maison, date) =>
    `We have received your ${somme} deposit. This page serves as your receipt; ${maison} looks forward to seeing you on ${date}.`,

  plusActiveTitre: "This booking is no longer active.",
  plusActiveTexte: (maison) =>
    `No payment is due. Contact ${maison} if you believe this is a mistake.`,
  inscriptionAnnuleeTitre: "This booking has been cancelled.",
  inscriptionAnnuleeTexte: (maison) =>
    `No payment is due. Contact ${maison} if you believe this is a mistake.`,

  pasOuvertTitre: "Payment is not open yet.",
  pasOuvertReservation: (maison) =>
    `${maison} still has to finish setting up payments. Please get back in touch with them — nothing is lost, your booking is still on file.`,
  pasOuvertSeance: (maison) =>
    `${maison} still has to finish setting up payments. Please get back in touch with them — your place is still on file.`,

  carteEnGarantie: "Card on file",
  acompteDe: (somme) => `${somme} deposit`,
  auNomDe: "In the name of",
  dateLabel: "Date",
  serviceLabel: "Service",
  espacePrivatise: "Private space",
  convivesLabel: "Guests",
  convivesValeur: (couverts) => `${couverts} guest${s(couverts)}`,
  heureLabel: "Time",
  placesLabel: "Places",
  placesValeur: (places) => `${places} place${s(places)}`,
  totalLabel: "Total",

  interrompuReservation:
    "Payment interrupted. You can pick it up whenever you like — your booking is still there.",
  interrompuSeance:
    "Payment interrupted. Your place is held until you come back.",
  indisponible: (maison) =>
    `Payment is momentarily unavailable. Try again in a few minutes, or contact ${maison}.`,
  enregistrerMaCarte: "Save my card",
  payer: (somme) => `Pay ${somme}`,
  piedCaution: (maison) =>
    `Card saved by Stripe, on behalf of ${maison}. Nothing is charged today, and Klarr takes no commission.`,
  piedAcompte: (maison) =>
    `Payment handled by Stripe, straight to ${maison}. Klarr takes no commission.`,

  inscriptionConfirmeeBadge: "Booking confirmed",
  seanceReglee: (somme, maison, date, heure) =>
    `We have received your payment of ${somme}. ${maison} looks forward to seeing you on ${date} at ${heure}. This page serves as your receipt.`,

  intitulePrivatisation: (espace, couverts, somme) =>
    `Deposit for the private hire of ${espace} — ${couverts} guests: ${somme}`,
  intituleSeance: (nom, places, date) =>
    `${nom} — ${places} place${s(places)} on ${date}`,
  engagement: (maison, plafond) =>
    `${maison} is taking nothing today. Your card is stored as a guarantee: it would only be charged, up to ${plafond}, for a late cancellation or if you do not show up.`,
};

const zh: ClesPaiement = {
  titreOnglet: "支付",

  carteEnregistreeBadge: "已记录信用卡",
  reservationConfirmee: (maison) => `您在${maison}的订位已确认。`,
  cautionDejaPosee: (plafond, maison, date) =>
    `没有扣款。您的信用卡作为担保，额度为 ${plafond}，只有临时取消或未到场才会扣款。${maison}等您 ${date}光临。`,
  acompteRecuBadge: "已收到定金",
  acompteRecuTexte: (somme, maison, date) =>
    `我们已收到您的定金 ${somme}。本页即为收据；${maison}等您 ${date}光临。`,

  plusActiveTitre: "这个订位已失效。",
  plusActiveTexte: (maison) =>
    `无需付款。如果您认为这是误会，请联系${maison}。`,
  inscriptionAnnuleeTitre: "这个报名已取消。",
  inscriptionAnnuleeTexte: (maison) =>
    `无需付款。如果您认为这是误会，请联系${maison}。`,

  pasOuvertTitre: "支付功能尚未开通。",
  pasOuvertReservation: (maison) =>
    `${maison}还需要完成支付设置。请再与餐厅联系——什么都没丢，您的订位仍然保留。`,
  pasOuvertSeance: (maison) =>
    `${maison}还需要完成支付设置。请再与餐厅联系——您的名额仍然保留。`,

  carteEnGarantie: "信用卡担保",
  acompteDe: (somme) => `定金 ${somme}`,
  auNomDe: "预订人",
  dateLabel: "日期",
  serviceLabel: "餐次",
  espacePrivatise: "包场空间",
  convivesLabel: "人数",
  convivesValeur: (couverts) => `${couverts} 位`,
  heureLabel: "时间",
  placesLabel: "名额",
  placesValeur: (places) => `${places} 个名额`,
  totalLabel: "合计",

  interrompuReservation: "支付中断了。您随时可以继续，订位一直都在。",
  interrompuSeance: "支付中断了。在您回来之前，名额为您保留。",
  indisponible: (maison) =>
    `支付暂时不可用。请几分钟后再试，或联系${maison}。`,
  enregistrerMaCarte: "记录我的信用卡",
  payer: (somme) => `支付 ${somme}`,
  piedCaution: (maison) =>
    `信用卡由 Stripe 代${maison}记录。今天不扣任何款项，Klarr 不收取任何佣金。`,
  piedAcompte: (maison) =>
    `款项由 Stripe 处理，直接付给${maison}。Klarr 不收取任何佣金。`,

  inscriptionConfirmeeBadge: "报名已确认",
  seanceReglee: (somme, maison, date, heure) =>
    `我们已收到您的付款 ${somme}。${maison}等您 ${date} ${heure} 光临。本页即为收据。`,

  intitulePrivatisation: (espace, couverts, somme) =>
    `${espace}包场定金 —— ${couverts} 位：${somme}`,
  intituleSeance: (nom, places, date) =>
    `${nom} —— ${date}，${places} 个名额`,
  engagement: (maison, plafond) =>
    `${maison}今天不收款。您的信用卡作为担保记录下来：只有临时取消或未到场，才会在 ${plafond} 的额度内扣款。`,
};

export const PAIEMENT: Record<Langue, ClesPaiement> = { fr, en, zh };
