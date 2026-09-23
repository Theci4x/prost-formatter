import type { Langue } from "@/lib/i18n/langues";

/**
 * Les bons cadeaux, côté client, dans les trois langues : la page
 * d'achat, le bon lui-même, et les deux e-mails (à l'acheteur, au
 * bénéficiaire).
 *
 * Le vouvoiement partout : c'est la maison qui parle à ses clients.
 */

export type ClesBons = {
  /** La page d'achat. */
  titreOnglet(maison: string): string;
  surtitre: string;
  titre(maison: string): string;
  chapo(mois: number): string;
  montantLabel: string;
  autreMontant: string;
  autreMontantAide(min: string, max: string): string;
  vous: string;
  votreNom: string;
  votreEmail: string;
  votreEmailAide: string;
  pourQui: string;
  nomBeneficiaire: string;
  nomBeneficiaireAide: string;
  message: string;
  messageAide: string;
  envoyerDirectement: string;
  emailBeneficiaire: string;
  emailBeneficiaireAide: string;
  payer(somme: string): string;
  enCours: string;
  mention(maison: string): string;
  indisponibleTitre: string;
  indisponibleTexte(maison: string): string;
  /** Le lien posé sur la page de réservation. */
  lienOffrir: string;
  /** Ce qui précède « Klarr », en pied de page. */
  signature: string;

  /** Les refus du formulaire. */
  erreurChamps: string;
  erreurEmail: string;
  erreurEmailBeneficiaire: string;
  erreurMontant(min: string, max: string): string;
  erreurPaiement: string;

  /** Le bon, sur sa page. */
  titreOngletBon: string;
  attenteTitre: string;
  attenteTexte(somme: string, maison: string): string;
  interrompu: string;
  verification: string;
  bonCadeau: string;
  valeur: string;
  code: string;
  pour(nom: string): string;
  dePart(nom: string): string;
  valableJusquau(date: string): string;
  soldeRestant(somme: string): string;
  epuise: string;
  expire(date: string): string;
  annule: string;
  commentUtiliser(maison: string): string;
  imprimer: string;
  reserver: string;
  aussiEnvoye(email: string): string;

  /** Les e-mails. */
  sujetAcheteur(maison: string): string;
  merciAchat(somme: string, maison: string): string;
  aTransmettre: string;
  sujetBeneficiaire(de: string, maison: string): string;
  offertPar(de: string, somme: string, maison: string): string;
  votreCode: string;
  valableMail(date: string): string;
  voirLeBon: string;
};

const fr: ClesBons = {
  titreOnglet: (maison) => `Offrir un bon cadeau — ${maison}`,
  surtitre: "Bon cadeau",
  titre: (maison) => `Offrez un repas chez ${maison}`,
  chapo: (mois) =>
    `Le bénéficiaire choisit sa date et réserve comme d'habitude. Le bon est valable ${mois} mois et s'utilise en une ou plusieurs fois.`,
  montantLabel: "Montant",
  autreMontant: "Autre montant",
  autreMontantAide: (min, max) => `Entre ${min} et ${max}.`,
  vous: "Vous",
  votreNom: "Votre nom",
  votreEmail: "Votre adresse e-mail",
  votreEmailAide: "Le bon vous est envoyé à cette adresse.",
  pourQui: "Pour qui ?",
  nomBeneficiaire: "Son nom",
  nomBeneficiaireAide: "Il figure sur le bon.",
  message: "Un petit mot (facultatif)",
  messageAide: "Il figure sur le bon, tel que vous l'écrivez.",
  envoyerDirectement: "L'envoyer aussi par e-mail au bénéficiaire",
  emailBeneficiaire: "Son adresse e-mail",
  emailBeneficiaireAide: "Il reçoit le bon dès le paiement confirmé.",
  payer: (somme) => `Payer ${somme}`,
  enCours: "Un instant…",
  mention: (maison) =>
    `Paiement sécurisé par Stripe, encaissé directement par ${maison}.`,
  lienOffrir: "Offrir un bon cadeau",
  signature: "Bons cadeaux propulsés par",
  indisponibleTitre: "Bon cadeau indisponible",
  indisponibleTexte: (maison) =>
    `${maison} ne propose pas de bon cadeau en ligne pour le moment. Le plus simple est de l'appeler.`,

  erreurChamps: "Indiquez votre nom, votre e-mail et le nom du bénéficiaire.",
  erreurEmail: "Cette adresse e-mail ne semble pas valide.",
  erreurEmailBeneficiaire:
    "L'adresse e-mail du bénéficiaire ne semble pas valide.",
  erreurMontant: (min, max) => `Choisissez un montant entre ${min} et ${max}.`,
  erreurPaiement:
    "Le paiement n'a pas pu être préparé. Réessayez dans un instant.",

  titreOngletBon: "Votre bon cadeau",
  attenteTitre: "Paiement en attente",
  attenteTexte: (somme, maison) =>
    `Votre bon de ${somme} chez ${maison} sera prêt dès le paiement confirmé.`,
  interrompu: "Paiement interrompu : rien n'a été débité.",
  verification:
    "Nous vérifions votre paiement. Rechargez la page dans un instant.",
  bonCadeau: "Bon cadeau",
  valeur: "Valeur",
  code: "Code",
  pour: (nom) => `Pour ${nom}`,
  dePart: (nom) => `De la part de ${nom}`,
  valableJusquau: (date) => `Valable jusqu'au ${date}`,
  soldeRestant: (somme) => `Il reste ${somme} sur ce bon.`,
  epuise: "Ce bon a été entièrement utilisé.",
  expire: (date) => `Ce bon a expiré le ${date}.`,
  annule: "Ce bon a été annulé.",
  commentUtiliser: (maison) =>
    `Réservez chez ${maison} comme d'habitude, et présentez ce code au moment de régler.`,
  imprimer: "Imprimer le bon",
  reserver: "Réserver une table",
  aussiEnvoye: (email) => `Nous l'avons aussi envoyé à ${email}.`,

  sujetAcheteur: (maison) => `Votre bon cadeau chez ${maison}`,
  merciAchat: (somme, maison) =>
    `Merci ! Votre bon cadeau de ${somme} chez ${maison} est prêt.`,
  aTransmettre:
    "Vous pouvez l'imprimer, ou transférer cet e-mail tel quel : le code suffit.",
  sujetBeneficiaire: (de, maison) => `${de} vous offre un repas chez ${maison}`,
  offertPar: (de, somme, maison) =>
    `${de} vous offre un bon cadeau de ${somme} chez ${maison}.`,
  votreCode: "Votre code",
  valableMail: (date) => `Valable jusqu'au ${date}, en une ou plusieurs fois.`,
  voirLeBon: "Voir le bon",
};

const en: ClesBons = {
  titreOnglet: (maison) => `Give a gift card — ${maison}`,
  surtitre: "Gift card",
  titre: (maison) => `Give a meal at ${maison}`,
  chapo: (mois) =>
    `The recipient picks their date and books as usual. The card is valid for ${mois} months and can be used in one or several visits.`,
  montantLabel: "Amount",
  autreMontant: "Other amount",
  autreMontantAide: (min, max) => `Between ${min} and ${max}.`,
  vous: "You",
  votreNom: "Your name",
  votreEmail: "Your email address",
  votreEmailAide: "The gift card is sent to this address.",
  pourQui: "Who is it for?",
  nomBeneficiaire: "Their name",
  nomBeneficiaireAide: "It appears on the card.",
  message: "A short note (optional)",
  messageAide: "It appears on the card, just as you write it.",
  envoyerDirectement: "Also email it to the recipient",
  emailBeneficiaire: "Their email address",
  emailBeneficiaireAide:
    "They receive the card as soon as payment is confirmed.",
  payer: (somme) => `Pay ${somme}`,
  enCours: "One moment…",
  mention: (maison) =>
    `Secure payment by Stripe, received directly by ${maison}.`,
  lienOffrir: "Give a gift card",
  signature: "Gift cards powered by",
  indisponibleTitre: "Gift card unavailable",
  indisponibleTexte: (maison) =>
    `${maison} doesn't offer gift cards online at the moment. The simplest is to give them a call.`,

  erreurChamps: "Please enter your name, your email and the recipient's name.",
  erreurEmail: "This email address doesn't look valid.",
  erreurEmailBeneficiaire: "The recipient's email address doesn't look valid.",
  erreurMontant: (min, max) =>
    `Please choose an amount between ${min} and ${max}.`,
  erreurPaiement: "The payment couldn't be prepared. Please try again shortly.",

  titreOngletBon: "Your gift card",
  attenteTitre: "Payment pending",
  attenteTexte: (somme, maison) =>
    `Your ${somme} gift card for ${maison} will be ready as soon as payment is confirmed.`,
  interrompu: "Payment interrupted: nothing was charged.",
  verification: "We're checking your payment. Reload the page in a moment.",
  bonCadeau: "Gift card",
  valeur: "Value",
  code: "Code",
  pour: (nom) => `For ${nom}`,
  dePart: (nom) => `From ${nom}`,
  valableJusquau: (date) => `Valid until ${date}`,
  soldeRestant: (somme) => `${somme} left on this card.`,
  epuise: "This gift card has been fully used.",
  expire: (date) => `This gift card expired on ${date}.`,
  annule: "This gift card has been cancelled.",
  commentUtiliser: (maison) =>
    `Book at ${maison} as usual, and show this code when you pay.`,
  imprimer: "Print the card",
  reserver: "Book a table",
  aussiEnvoye: (email) => `We've also sent it to ${email}.`,

  sujetAcheteur: (maison) => `Your gift card for ${maison}`,
  merciAchat: (somme, maison) =>
    `Thank you! Your ${somme} gift card for ${maison} is ready.`,
  aTransmettre:
    "You can print it, or forward this email as it is: the code is all that's needed.",
  sujetBeneficiaire: (de, maison) =>
    `${de} is treating you to a meal at ${maison}`,
  offertPar: (de, somme, maison) =>
    `${de} is giving you a ${somme} gift card for ${maison}.`,
  votreCode: "Your code",
  valableMail: (date) => `Valid until ${date}, in one or several visits.`,
  voirLeBon: "View the gift card",
};

const zh: ClesBons = {
  titreOnglet: (maison) => `赠送礼品卡 —— ${maison}`,
  surtitre: "礼品卡",
  titre: (maison) => `请TA在${maison}吃一顿`,
  chapo: (mois) =>
    `收礼人自选日期，照常订位即可。礼品卡有效期 ${mois} 个月，可一次或分多次使用。`,
  montantLabel: "金额",
  autreMontant: "其他金额",
  autreMontantAide: (min, max) => `${min} 至 ${max} 之间。`,
  vous: "您的信息",
  votreNom: "您的姓名",
  votreEmail: "您的邮箱",
  votreEmailAide: "礼品卡将发送到这个邮箱。",
  pourQui: "送给谁？",
  nomBeneficiaire: "TA 的姓名",
  nomBeneficiaireAide: "会显示在礼品卡上。",
  message: "留一句话（选填）",
  messageAide: "会原样显示在礼品卡上。",
  envoyerDirectement: "同时通过邮件发送给收礼人",
  emailBeneficiaire: "TA 的邮箱",
  emailBeneficiaireAide: "付款确认后，TA 会立即收到礼品卡。",
  payer: (somme) => `支付 ${somme}`,
  enCours: "请稍候……",
  mention: (maison) => `由 Stripe 安全支付，款项直接进入${maison}的账户。`,
  lienOffrir: "赠送礼品卡",
  signature: "礼品卡技术支持",
  indisponibleTitre: "暂无礼品卡",
  indisponibleTexte: (maison) =>
    `${maison}目前不提供在线礼品卡。最简单的办法是直接打电话给餐厅。`,

  erreurChamps: "请填写您的姓名、邮箱以及收礼人的姓名。",
  erreurEmail: "这个邮箱地址似乎无效。",
  erreurEmailBeneficiaire: "收礼人的邮箱地址似乎无效。",
  erreurMontant: (min, max) => `请选择 ${min} 至 ${max} 之间的金额。`,
  erreurPaiement: "暂时无法发起付款，请稍后再试。",

  titreOngletBon: "您的礼品卡",
  attenteTitre: "等待付款",
  attenteTexte: (somme, maison) =>
    `付款确认后，您在${maison}的 ${somme} 礼品卡即可使用。`,
  interrompu: "付款已中断：没有产生任何扣款。",
  verification: "我们正在核实您的付款，请稍后刷新页面。",
  bonCadeau: "礼品卡",
  valeur: "面值",
  code: "兑换码",
  pour: (nom) => `送给 ${nom}`,
  dePart: (nom) => `来自 ${nom}`,
  valableJusquau: (date) => `有效期至 ${date}`,
  soldeRestant: (somme) => `这张礼品卡还剩 ${somme}。`,
  epuise: "这张礼品卡已全部用完。",
  expire: (date) => `这张礼品卡已于 ${date} 过期。`,
  annule: "这张礼品卡已被取消。",
  commentUtiliser: (maison) => `照常在${maison}订位，结账时出示此兑换码即可。`,
  imprimer: "打印礼品卡",
  reserver: "预订餐位",
  aussiEnvoye: (email) => `我们也已发送至 ${email}。`,

  sujetAcheteur: (maison) => `您在${maison}的礼品卡`,
  merciAchat: (somme, maison) =>
    `谢谢！您在${maison}的 ${somme} 礼品卡已经准备好了。`,
  aTransmettre: "您可以打印，或直接转发这封邮件：有兑换码就够了。",
  sujetBeneficiaire: (de, maison) => `${de}请您在${maison}用餐`,
  offertPar: (de, somme, maison) =>
    `${de}送您一张${maison}的 ${somme} 礼品卡。`,
  votreCode: "您的兑换码",
  valableMail: (date) => `有效期至 ${date}，可一次或分多次使用。`,
  voirLeBon: "查看礼品卡",
};

export const BONS: Record<Langue, ClesBons> = { fr, en, zh };
