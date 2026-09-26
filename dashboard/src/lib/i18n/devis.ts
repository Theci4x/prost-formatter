import type { Langue } from "@/lib/i18n/langues";

/**
 * Ce qui entoure un devis, dans les trois langues.
 *
 * **La feuille elle-même reste en français**, et c'est délibéré. Un devis
 * est une pièce contractuelle : c'est ce document-là qui sera opposé si
 * quelque chose se discute, la loi du 4 août 1994 veut le français pour
 * une prestation offerte en France, et les mentions y sont figées à
 * l'envoi précisément pour que le client relise ce qu'il a accepté. Un
 * document traduit par un modèle de langue n'a pas cette valeur, et deux
 * versions d'un même prix sont exactement ce qu'on ne veut pas le jour où
 * elles divergent.
 *
 * Ce qui se traduit, c'est tout le reste : l'onglet, le bouton
 * d'impression, les deux réponses possibles, les motifs de refus. Un
 * client étranger doit comprendre ce qu'on lui demande de faire, même
 * s'il lit le chiffre dans une langue qu'il ne pratique pas — et un
 * chiffre, ça se lit.
 */

export type ClesDevis = {
  votreDevis: string;
  imprimerOuPdf: string;
  documentEnFrancais: string;

  /** Les deux réponses. */
  accepterCeDevis: string;
  enregistrement: string;
  dirigeVersAcompte(acompte: string): string;
  accordVautConfirmation: string;
  devisAccepte: string;
  neMeConvientPas: string;
  ceQuiNeConvientPas: string;
  facultatif: string;
  exemplesRefus: string;
  confirmerLeRefus: string;
  envoi: string;
  annuler: string;
  reponseTransmise: string;

  /** Ce qui empêche de répondre. */
  dejaAccepte: string;
  dejaRefuse: string;
  pasEncoreEnvoye: string;
  validiteDepassee: string;

  /** Ce que refusent les actions. */
  devisIntrouvable: string;
  acceptationEchouee: string;
  refusEchoue: string;
  dejaRepondu: string;

  signatureDevis: string;
};

const fr: ClesDevis = {
  votreDevis: "Votre devis",
  imprimerOuPdf: "Imprimer / Enregistrer en PDF",
  documentEnFrancais: "",

  accepterCeDevis: "Accepter ce devis",
  enregistrement: "Enregistrement…",
  dirigeVersAcompte: (acompte) =>
    `Vous serez ensuite dirigé vers le règlement de l’acompte de ${acompte}.`,
  accordVautConfirmation: "Votre accord vaut confirmation de la réservation.",
  devisAccepte: "Devis accepté. L’établissement est prévenu et revient vers vous.",
  neMeConvientPas: "Ce devis ne me convient pas",
  ceQuiNeConvientPas: "Ce qui ne convient pas",
  facultatif: "(facultatif)",
  exemplesRefus: "Le budget, la date, le nombre de convives…",
  confirmerLeRefus: "Confirmer le refus",
  envoi: "Envoi…",
  annuler: "Annuler",
  reponseTransmise:
    "Votre réponse est transmise. Merci d’avoir pris le temps de nous le dire.",

  dejaAccepte: "Ce devis a déjà été accepté.",
  dejaRefuse: "Ce devis a été refusé.",
  pasEncoreEnvoye: "Ce devis n’a pas encore été envoyé.",
  validiteDepassee:
    "La validité de ce devis est dépassée. Contactez l’établissement pour en obtenir un nouveau.",

  devisIntrouvable: "Devis introuvable.",
  acceptationEchouee: "L’acceptation a échoué. Réessayez dans un instant.",
  refusEchoue: "Le refus n’a pas pu être enregistré.",
  dejaRepondu: "Ce devis a déjà reçu une réponse.",

  signatureDevis: "Devis propulsé par",
};

const en: ClesDevis = {
  votreDevis: "Your quote",
  imprimerOuPdf: "Print / Save as PDF",
  documentEnFrancais:
    "The quote itself is in French: it is the contractual document, and it is the one that counts if anything is ever disputed. Everything you need to do is below, in English.",

  accepterCeDevis: "Accept this quote",
  enregistrement: "Saving…",
  dirigeVersAcompte: (acompte) =>
    `You will then be taken to pay the ${acompte} deposit.`,
  accordVautConfirmation: "Your agreement confirms the booking.",
  devisAccepte:
    "Quote accepted. The restaurant has been told and will get back to you.",
  neMeConvientPas: "This quote does not work for me",
  ceQuiNeConvientPas: "What does not work",
  facultatif: "(optional)",
  exemplesRefus: "The budget, the date, the number of guests…",
  confirmerLeRefus: "Confirm the refusal",
  envoi: "Sending…",
  annuler: "Cancel",
  reponseTransmise:
    "Your answer has been sent. Thank you for taking the time to tell us.",

  dejaAccepte: "This quote has already been accepted.",
  dejaRefuse: "This quote was declined.",
  pasEncoreEnvoye: "This quote has not been sent yet.",
  validiteDepassee:
    "This quote is past its validity date. Contact the restaurant for a new one.",

  devisIntrouvable: "Quote not found.",
  acceptationEchouee: "Accepting failed. Please try again in a moment.",
  refusEchoue: "The refusal could not be recorded.",
  dejaRepondu: "This quote has already had an answer.",

  signatureDevis: "Quote powered by",
};

const zh: ClesDevis = {
  votreDevis: "您的报价单",
  imprimerOuPdf: "打印 / 存为 PDF",
  documentEnFrancais:
    "报价单本身是法语的：它是合同文件，日后若有争议，以它为准。您需要做的事都在下面，用中文写好了。",

  accepterCeDevis: "接受这份报价",
  enregistrement: "正在保存……",
  dirigeVersAcompte: (acompte) => `随后将引导您支付 ${acompte} 的定金。`,
  accordVautConfirmation: "您的同意即为订位确认。",
  devisAccepte: "报价已接受。餐厅已收到通知，会与您联系。",
  neMeConvientPas: "这份报价不合适",
  ceQuiNeConvientPas: "哪里不合适",
  facultatif: "（选填）",
  exemplesRefus: "预算、日期、人数……",
  confirmerLeRefus: "确认拒绝",
  envoi: "正在发送……",
  annuler: "取消",
  reponseTransmise: "您的回复已送达。谢谢您花时间告诉我们。",

  dejaAccepte: "这份报价已经被接受了。",
  dejaRefuse: "这份报价已被拒绝。",
  pasEncoreEnvoye: "这份报价还没有发出。",
  validiteDepassee: "这份报价已过有效期。请联系餐厅重新出一份。",

  devisIntrouvable: "找不到这份报价单。",
  acceptationEchouee: "接受失败。请稍后再试。",
  refusEchoue: "拒绝未能记录下来。",
  dejaRepondu: "这份报价已经有过回复了。",

  signatureDevis: "报价单技术支持",
};

export const DEVIS: Record<Langue, ClesDevis> = { fr, en, zh };
