import type { Langue } from "@/lib/i18n/langue";

/**
 * Le tunnel d'entrée : connexion, inscription, mot de passe oublié.
 *
 * C'est le maillon qui rendait le reste inutile. Traduire le tableau de
 * bord sans traduire l'inscription revient à parler chinois à quelqu'un
 * derrière une porte fermée en français.
 */

export type ClesAuth = {
  titreConnexion: string;
  titreInscription: string;
  sousTitre: string;
  email: string;
  motDePasse: string;
  oublie: string;
  seConnecter: string;
  connexionEnCours: string;
  creerCompte: string;
  inscriptionEnCours: string;
  nouveauMotDePasse: string;
  recevoirLien: string;
  lienEnvoye: string;
  lienExpire: string;
  langue: string;
  accroche: string;
  retourSite: string;
};

const fr: ClesAuth = {
  titreConnexion: "Se connecter",
  titreInscription: "Créer un compte",
  sousTitre:
    "Connectez-vous, ou créez un compte : essai gratuit, sans carte bancaire.",
  email: "Email",
  motDePasse: "Mot de passe",
  oublie: "Mot de passe oublié ?",
  seConnecter: "Se connecter",
  connexionEnCours: "Connexion...",
  creerCompte: "Créer un compte",
  inscriptionEnCours: "Inscription...",
  nouveauMotDePasse: "Nouveau mot de passe",
  recevoirLien: "Recevoir un lien",
  lienEnvoye: "Si un compte existe, un lien vient de partir.",
  lienExpire: "Lien expiré. Redemande un e-mail de réinitialisation.",
  langue: "Langue",
  accroche:
    "La clarté pour vos restaurants — votre présence en ligne, réunie dans un seul tableau de bord.",
  retourSite: "Retour au site",
};

const en: ClesAuth = {
  titreConnexion: "Sign in",
  titreInscription: "Create an account",
  sousTitre: "Sign in, or create an account: free trial, no card needed.",
  email: "Email",
  motDePasse: "Password",
  oublie: "Forgot your password?",
  seConnecter: "Sign in",
  connexionEnCours: "Signing in...",
  creerCompte: "Create an account",
  inscriptionEnCours: "Creating...",
  nouveauMotDePasse: "New password",
  recevoirLien: "Send me a link",
  lienEnvoye: "If an account exists, a link has just been sent.",
  lienExpire: "That link has expired. Ask for a new one.",
  langue: "Language",
  accroche:
    "Clarity for your restaurants — your online presence, gathered in a single dashboard.",
  retourSite: "Back to the site",
};

const zh: ClesAuth = {
  titreConnexion: "登录",
  titreInscription: "注册账号",
  sousTitre: "登录或注册账号：免费试用，无需银行卡。",
  email: "邮箱",
  motDePasse: "密码",
  oublie: "忘记密码？",
  seConnecter: "登录",
  connexionEnCours: "正在登录…",
  creerCompte: "注册账号",
  inscriptionEnCours: "正在注册…",
  nouveauMotDePasse: "新密码",
  recevoirLien: "发送重置链接",
  lienEnvoye: "如该账号存在，链接已发送。",
  lienExpire: "链接已失效，请重新申请。",
  langue: "语言",
  accroche: "让餐厅一目了然——您的线上门面，集中在一个后台。",
  retourSite: "返回网站",
};

export const AUTH: Record<Langue, ClesAuth> = { fr, en, zh };
