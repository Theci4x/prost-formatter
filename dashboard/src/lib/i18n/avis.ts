import type { Langue } from "@/lib/i18n/langues";

/**
 * Le totem d'avis et la roue de la fortune, dans les trois langues.
 *
 * Ces deux pages sont scannées à table, par un client qui a fini de
 * manger. Elles portent « noindex » — rien à faire dans un moteur de
 * recherche : elles ne s'adressent qu'à qui est déjà venu — et peuvent
 * donc suivre la langue du navigateur sans conséquence.
 *
 * Deux choses ne se traduisent pas parce qu'elles ne s'écrivent pas ici :
 * les libellés des lots et le titre de la roue, tapés par le restaurateur.
 * S'il veut une roue en anglais, il l'écrit en anglais — c'est sa voix, on
 * ne la double pas.
 *
 * Le tutoiement du français est celui du reste du jeu : on s'adresse à
 * quelqu'un qui vient de dîner, pas à un dossier.
 */

export type ClesAvis = {
  /** Le totem. */
  votreAvis: string;
  votreAvisChez(maison: string): string;
  mercidEtreVenu: string;
  avisBientotDisponible: string;
  signatureAvis: string;

  laisserUnAvisGoogle: string;
  direEnPrive: string;
  messageTransmis: string;
  messageLu(maison: string): string;
  ceQueVousAvezADire: string;
  exemplesRetour: string;
  emailOuTelephone: string;
  facultatif: string;
  seulementSiReponse: string;
  envoi: string;
  envoyer: string;
  retour: string;

  /** Ce que refuse l'envoi d'un retour. */
  ditNousQuoi: string;
  messageTropLong: string;
  envoiImpossible: string;

  /** Le jeu. */
  tentezVotreChance: string;
  tentezVotreChanceChez(maison: string): string;
  jeuFerme: string;
  jeuFermeDetail: string;
  signatureJeu: string;

  roueACases(cases: number): string;
  codeParEmail: string;
  laisserUnAvisSurGoogle: string;
  tonEmail: string;
  exempleEmail: string;
  consentementLot: string;
  laRoueTourne: string;
  tournerLaRoue: string;

  /** Ce que refuse un tirage. */
  emailValidePourLot: string;
  consentementRequis: string;
  jeuInexistant: string;
  jeuPasOuvert: string;
  dejaJoueAujourdhui: string;
  dejaTenteRecemment: string;
  lotsEpuises: string;
  jeuRate: string;

  /** La lettre qui porte le lot. */
  lettreSujet(maison: string, lot: string): string;
  lettreGagne(lot: string): string;
  lettreVotreCode: string;
  /**
   * La ligne du code dans la version texte. À part du libellé parce que
   * le deux-points ne s'écrit pas pareil : le français pose une espace
   * insécable devant, l'anglais rien, et le chinois a son propre signe
   * « ： ». Coller « : » à la main donnait « Your code : » et
   * « 您的兑换码 : », qui se lisent comme une traduction bâclée.
   */
  lettreCodeLigne(code: string): string;
  lettrePresentez(maison: string, limite: string): string;
  lettrePresentezHtml(limite: string): string;
  lettreMontrerSuffit: string;
};

const fr: ClesAvis = {
  votreAvis: "Votre avis",
  votreAvisChez: (maison) => `Votre avis — ${maison}`,
  mercidEtreVenu:
    "Merci d’être venu. Deux minutes pour nous dire comment c’était ?",
  avisBientotDisponible: "L’avis public sera disponible bientôt.",
  signatureAvis: "Avis et retours propulsés par",

  laisserUnAvisGoogle: "Laisser un avis Google",
  direEnPrive: "Nous dire quelque chose en privé",
  messageTransmis: "Message transmis.",
  messageLu: (maison) =>
    `${maison} le lira. Merci d’avoir pris le temps — c’est comme ça qu’on s’améliore.`,
  ceQueVousAvezADire: "Ce que vous avez à nous dire",
  exemplesRetour: "Le service, l’attente, un plat, l’accueil…",
  emailOuTelephone: "Votre e-mail ou téléphone",
  facultatif: "(facultatif)",
  seulementSiReponse: "Seulement si vous acceptez qu’on vous réponde.",
  envoi: "Envoi…",
  envoyer: "Envoyer",
  retour: "Retour",

  ditNousQuoi: "Dis-nous ce qui n’a pas été.",
  messageTropLong: "Message trop long — 4000 caractères au plus.",
  envoiImpossible: "Envoi impossible. Réessaie dans un instant.",

  tentezVotreChance: "Tentez votre chance",
  tentezVotreChanceChez: (maison) => `Tentez votre chance — ${maison}`,
  jeuFerme: "Le jeu est fermé pour le moment.",
  jeuFermeDetail: "Merci d’être passé — revenez tenter votre chance bientôt.",
  signatureJeu: "Jeu propulsé par",

  roueACases: (cases) => `Roue à ${cases} cases`,
  codeParEmail:
    "Le code part aussi par e-mail. Présente-le lors de ta prochaine visite.",
  laisserUnAvisSurGoogle: "Laisser un avis sur Google",
  tonEmail: "Ton e-mail",
  exempleEmail: "prenom@exemple.fr",
  consentementLot:
    "J’accepte de recevoir mon lot par e-mail, et des nouvelles de la maison. Je peux me désinscrire à tout moment.",
  laRoueTourne: "La roue tourne…",
  tournerLaRoue: "Tourner la roue",

  emailValidePourLot: "Une adresse e-mail valide, pour t’envoyer ton lot.",
  consentementRequis:
    "Il faut accepter de recevoir le lot par e-mail — c’est comme ça qu’on te l’envoie.",
  jeuInexistant: "Ce jeu n’existe plus.",
  jeuPasOuvert: "Ce jeu n’est pas ouvert.",
  dejaJoueAujourdhui: "Tu as déjà joué aujourd’hui. À la prochaine visite !",
  dejaTenteRecemment: "Tu as déjà tenté ta chance récemment. Reviens nous voir !",
  lotsEpuises: "Tous les lots sont partis pour cette fois. Merci d’être passé !",
  jeuRate: "Le jeu a eu un raté. Réessaie dans un instant.",

  lettreSujet: (maison, lot) => `Votre lot chez ${maison} : ${lot}`,
  lettreGagne: (lot) => `Vous avez gagné : ${lot}`,
  lettreVotreCode: "Votre code",
  lettreCodeLigne: (code) => `Votre code\u00a0: ${code}`,
  lettrePresentez: (maison, limite) =>
    `Présentez ce code à ${maison} lors de votre prochaine visite, avant le ${limite}.`,
  lettrePresentezHtml: (limite) =>
    `Présentez-le lors de votre prochaine visite, <strong>avant le ${limite}</strong>. Montrer cet e-mail suffit.`,
  lettreMontrerSuffit:
    "Il suffit de montrer cet e-mail : le serveur s’occupe du reste.",
};

const en: ClesAvis = {
  votreAvis: "Your feedback",
  votreAvisChez: (maison) => `Your feedback — ${maison}`,
  mercidEtreVenu: "Thank you for coming. Two minutes to tell us how it went?",
  avisBientotDisponible: "Public reviews will be available soon.",
  signatureAvis: "Reviews and feedback powered by",

  laisserUnAvisGoogle: "Leave a Google review",
  direEnPrive: "Tell us something privately",
  messageTransmis: "Message sent.",
  messageLu: (maison) =>
    `${maison} will read it. Thank you for taking the time — this is how we get better.`,
  ceQueVousAvezADire: "What you have to tell us",
  exemplesRetour: "The service, the wait, a dish, the welcome…",
  emailOuTelephone: "Your e-mail or phone number",
  facultatif: "(optional)",
  seulementSiReponse: "Only if you are happy for us to reply.",
  envoi: "Sending…",
  envoyer: "Send",
  retour: "Back",

  ditNousQuoi: "Tell us what went wrong.",
  messageTropLong: "Message too long — 4000 characters at most.",
  envoiImpossible: "Sending failed. Please try again in a moment.",

  tentezVotreChance: "Try your luck",
  tentezVotreChanceChez: (maison) => `Try your luck — ${maison}`,
  jeuFerme: "The game is closed for now.",
  jeuFermeDetail: "Thank you for coming — come back and try your luck soon.",
  signatureJeu: "Game powered by",

  roueACases: (cases) => `Wheel with ${cases} segments`,
  codeParEmail:
    "The code is also on its way by e-mail. Show it on your next visit.",
  laisserUnAvisSurGoogle: "Leave a review on Google",
  tonEmail: "Your e-mail",
  exempleEmail: "name@example.com",
  consentementLot:
    "I agree to receive my prize by e-mail, along with news from the restaurant. I can unsubscribe at any time.",
  laRoueTourne: "The wheel is spinning…",
  tournerLaRoue: "Spin the wheel",

  emailValidePourLot: "A valid e-mail address, so we can send you your prize.",
  consentementRequis:
    "You need to agree to receive the prize by e-mail — that is how we send it.",
  jeuInexistant: "This game no longer exists.",
  jeuPasOuvert: "This game is not open.",
  dejaJoueAujourdhui: "You have already played today. See you next visit!",
  dejaTenteRecemment: "You tried your luck recently. Come back and see us!",
  lotsEpuises: "All the prizes are gone this time. Thank you for coming!",
  jeuRate: "The game hiccupped. Please try again in a moment.",

  lettreSujet: (maison, lot) => `Your prize at ${maison}: ${lot}`,
  lettreGagne: (lot) => `You have won: ${lot}`,
  lettreVotreCode: "Your code",
  lettreCodeLigne: (code) => `Your code: ${code}`,
  lettrePresentez: (maison, limite) =>
    `Show this code at ${maison} on your next visit, before ${limite}.`,
  lettrePresentezHtml: (limite) =>
    `Show it on your next visit, <strong>before ${limite}</strong>. Showing this e-mail is enough.`,
  lettreMontrerSuffit:
    "Just show this e-mail: the waiter will take care of the rest.",
};

const zh: ClesAvis = {
  votreAvis: "您的评价",
  votreAvisChez: (maison) => `您对${maison}的评价`,
  mercidEtreVenu: "感谢光临。花两分钟告诉我们这一餐怎么样？",
  avisBientotDisponible: "公开评价功能即将开放。",
  signatureAvis: "评价与反馈技术支持",

  laisserUnAvisGoogle: "在 Google 上留下评价",
  direEnPrive: "私下跟我们说",
  messageTransmis: "留言已送达。",
  messageLu: (maison) => `${maison}会认真读。谢谢您花时间——我们正是这样改进的。`,
  ceQueVousAvezADire: "您想对我们说的话",
  exemplesRetour: "服务、等位、某道菜、接待……",
  emailOuTelephone: "您的邮箱或电话",
  facultatif: "（选填）",
  seulementSiReponse: "只有您愿意我们回复时才填。",
  envoi: "正在发送……",
  envoyer: "发送",
  retour: "返回",

  ditNousQuoi: "请告诉我们哪里不好。",
  messageTropLong: "留言太长了——最多 4000 个字符。",
  envoiImpossible: "发送失败。请稍后再试。",

  tentezVotreChance: "试试运气",
  tentezVotreChanceChez: (maison) => `${maison} · 试试运气`,
  jeuFerme: "游戏暂时关闭。",
  jeuFermeDetail: "感谢光临——欢迎下次再来试试运气。",
  signatureJeu: "游戏技术支持",

  roueACases: (cases) => `${cases} 格转盘`,
  codeParEmail: "兑换码也会发到您的邮箱。下次光临时出示即可。",
  laisserUnAvisSurGoogle: "在 Google 上留下评价",
  tonEmail: "您的邮箱",
  exempleEmail: "name@example.com",
  consentementLot:
    "我同意通过邮件接收奖品，以及餐厅的消息。我可以随时退订。",
  laRoueTourne: "转盘正在转……",
  tournerLaRoue: "转动转盘",

  emailValidePourLot: "请填写有效的邮箱地址，我们好把奖品发给您。",
  consentementRequis: "需要同意通过邮件接收奖品——我们就是这样发送的。",
  jeuInexistant: "这个游戏已经不存在了。",
  jeuPasOuvert: "这个游戏未开放。",
  dejaJoueAujourdhui: "您今天已经玩过了。下次光临再来！",
  dejaTenteRecemment: "您最近已经试过运气了。欢迎再来！",
  lotsEpuises: "这一轮奖品都送完了。感谢光临！",
  jeuRate: "游戏出了点小问题。请稍后再试。",

  lettreSujet: (maison, lot) => `您在${maison}的奖品：${lot}`,
  lettreGagne: (lot) => `您赢得了：${lot}`,
  lettreVotreCode: "您的兑换码",
  lettreCodeLigne: (code) => `您的兑换码：${code}`,
  lettrePresentez: (maison, limite) =>
    `下次光临${maison}时出示这个兑换码，请在 ${limite}之前使用。`,
  lettrePresentezHtml: (limite) =>
    `下次光临时出示即可，<strong>请在 ${limite}之前使用</strong>。出示这封邮件就够了。`,
  lettreMontrerSuffit: "只需出示这封邮件：其余的由服务员处理。",
};

export const AVIS: Record<Langue, ClesAvis> = { fr, en, zh };
