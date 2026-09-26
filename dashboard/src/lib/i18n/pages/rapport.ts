import type { Traductions } from "@/lib/i18n/t";

/**
 * La page Bilan mensuel. Le bilan lui-même, l'e-mail, reste en français :
 * c'est un document envoyé, il a sa propre langue.
 */
export const RAPPORT: Traductions = {
  "Bilan mensuel — {nom}": {
    en: "Monthly report — {nom}",
    zh: "月度报告 — {nom}",
  },
  "Le 1er de chaque mois, Klarr t'envoie le bilan du mois écoulé : couverts, note Google, nouveaux clients, et ce qui t'attend. Il part à l'adresse de ton compte Klarr.":
    {
      en: "On the 1st of every month, Klarr sends you the report for the past month: guests, Google rating, new customers, and what's coming up. It goes to your Klarr account's email.",
      zh: "每月 1 日，Klarr 会发送上个月的报告：用餐人数、Google 评分、新顾客，以及接下来的安排。报告会发送到您 Klarr 账户的邮箱。",
    },
  "Tu le reçois chaque mois": {
    en: "You get it every month",
    zh: "您每月都会收到",
  },
  "Tu ne le reçois plus": { en: "You no longer get it", zh: "您已不再接收" },
  "Prochain envoi le 1er du mois prochain, dans la matinée.": {
    en: "Next one on the 1st of next month, in the morning.",
    zh: "下次发送时间：下月 1 日上午。",
  },
  "Tu peux le réactiver quand tu veux.": {
    en: "You can turn it back on whenever you like.",
    zh: "您可以随时重新开启。",
  },
  "Ne plus le recevoir": { en: "Stop receiving it", zh: "不再接收" },
  "Le recevoir à nouveau": { en: "Receive it again", zh: "重新接收" },
  "Le bilan de {mois}": { en: "The {mois} report", zh: "{mois}报告" },
  "Bilan de {mois}": { en: "{mois} report", zh: "{mois}报告" },
  "Déjà envoyés": { en: "Already sent", zh: "已发送" },
  "le {date}": { en: "on {date}", zh: "{date}" },
  " à {email}": { en: " to {email}", zh: "，发送至 {email}" },
  "← Retour à l'accueil": { en: "← Back to home", zh: "← 返回首页" },
  "Envoi…": { en: "Sending…", zh: "正在发送…" },
  "M'envoyer ce bilan maintenant": {
    en: "Send me this report now",
    zh: "立即发送此报告给我",
  },
  "Impossible de trouver ton adresse.": {
    en: "Couldn't find your email address.",
    zh: "找不到您的邮箱地址。",
  },
  "Envoyé à {email}.": { en: "Sent to {email}.", zh: "已发送至 {email}。" },
  "L'envoi a échoué : {raison}.": {
    en: "Sending failed: {raison}.",
    zh: "发送失败：{raison}。",
  },
  "raison inconnue": { en: "unknown reason", zh: "原因未知" },
};
