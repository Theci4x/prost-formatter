import type { Traductions } from "@/lib/i18n/t";

/**
 * Les pages Campagnes e-mail. Le message lui-même part en français, tel
 * que le restaurateur l'écrit : l'aperçu garde donc le pied de l'e-mail
 * réel, et seules les consignes autour se traduisent.
 */
export const CAMPAGNES: Traductions = {
  "Campagnes e-mail — {nom}": {
    en: "Email campaigns — {nom}",
    zh: "邮件营销 — {nom}",
  },
  "Un message à ceux qui ont accepté d'en recevoir. Écris-le quand tu as le temps, choisis le jour, Klarr l'envoie le matin venu. Chaque message porte un lien de désinscription — c'est la loi, et c'est ce qui t'évite d'atterrir en indésirable.":
    {
      en: "A message to those who agreed to receive one. Write it when you have time, choose the day, and Klarr sends it that morning. Every message carries an unsubscribe link — it's the law, and it keeps you out of spam folders.",
      zh: "发给同意接收邮件的顾客。有空时写好，选好日期，Klarr 会在当天上午发送。每封邮件都带退订链接——这是法律要求，也能避免被归为垃圾邮件。",
    },
  "Fichier client": { en: "Customer list", zh: "顾客档案" },
  "personne joignable": { en: "person reachable", zh: "位可联系的顾客" },
  "personnes joignables": { en: "people reachable", zh: "位可联系的顾客" },
  "campagne envoyée": { en: "campaign sent", zh: "次营销已发送" },
  "campagnes envoyées": { en: "campaigns sent", zh: "次营销已发送" },
  "e-mail parti": { en: "email sent", zh: "封邮件已发出" },
  "e-mails partis": { en: "emails sent", zh: "封邮件已发出" },
  "Nouvelle campagne": { en: "New campaign", zh: "新营销活动" },
  "Envoi {moment}, pas à l'heure près.": {
    en: "Sent {moment}, not to the hour.",
    zh: "发送时间为{moment}，不精确到小时。",
  },
  "le matin du jour choisi": {
    en: "on the morning of the chosen day",
    zh: "所选日期的上午",
  },
  "Tes campagnes": { en: "Your campaigns", zh: "您的营销活动" },
  "Aucune campagne pour l'instant.": {
    en: "No campaigns yet.",
    zh: "暂时没有营销活动。",
  },
  "Écris la première au-dessus : elle reste en brouillon tant que tu ne choisis pas de jour d'envoi.":
    {
      en: "Write the first one above: it stays a draft until you choose a sending day.",
      zh: "在上方写第一封：在选择发送日期之前，它会一直保存为草稿。",
    },
  "Créée le {date}": { en: "Created {date}", zh: "创建于 {date}" },
  "{n} envoi le {date}": { en: "{n} sent on {date}", zh: "{date} 发送 {n} 封" },
  "{n} envois le {date}": {
    en: "{n} sent on {date}",
    zh: "{date} 发送 {n} 封",
  },
  "Part {date}": { en: "Goes out {date}", zh: "{date} 发送" },

  // Statuts et segments
  Brouillon: { en: "Draft", zh: "草稿" },
  Programmée: { en: "Scheduled", zh: "已安排" },
  "Envoi en cours": { en: "Sending", zh: "发送中" },
  Envoyée: { en: "Sent", zh: "已发送" },
  Échec: { en: "Failed", zh: "失败" },
  "Tout le fichier": { en: "Whole list", zh: "全部顾客" },
  "Venus depuis moins de 6 mois": {
    en: "Visited in the last 6 months",
    zh: "近 6 个月内到访过",
  },
  "Pas revus depuis plus de 6 mois": {
    en: "Not seen for over 6 months",
    zh: "超过 6 个月未到访",
  },
  "Habitués (3 venues ou plus)": {
    en: "Regulars (3 visits or more)",
    zh: "常客（到访 3 次及以上）",
  },
  "Tous ceux qui ont accepté vos e-mails.": {
    en: "Everyone who accepted your emails.",
    zh: "所有同意接收邮件的顾客。",
  },
  "Ils ont votre maison en tête. Une nouveauté, un événement.": {
    en: "You're fresh in their minds. Something new, an event.",
    zh: "他们对您的餐厅印象还很深。适合宣传新品或活动。",
  },
  "Ils sont venus, puis plus rien. C'est le segment qui rapporte le plus — et celui qu'on oublie.":
    {
      en: "They came, then nothing. It's the segment that pays off most — and the one people forget.",
      zh: "来过之后就再没出现。这是回报最高、却最容易被忽视的群体。",
    },
  "Ceux qui reviennent. À traiter comme tels : une avant-première, pas une promotion.":
    {
      en: "The ones who keep coming back. Treat them as such: a preview, not a discount.",
      zh: "经常光顾的顾客。要区别对待：给他们抢先体验，而不是打折。",
    },

  // Une campagne
  "Relis le message, envoie-toi un essai, puis choisis le jour : la campagne part le matin venu, et seuls les clients qui ont accepté de recevoir tes nouvelles la reçoivent.":
    {
      en: "Read the message over, send yourself a test, then choose the day: the campaign goes out that morning, and only customers who agreed to hear from you receive it.",
      zh: "再读一遍内容，给自己发一封测试邮件，然后选择日期：营销邮件会在当天上午发出，只有同意接收的顾客才会收到。",
    },
  "Cette campagne est partie : le texte reste tel qu'il a été envoyé, pour que le journal corresponde à ce que tes clients ont reçu.":
    {
      en: "This campaign has gone out: the text stays as it was sent, so the log matches what your customers received.",
      zh: "此营销邮件已发出：内容保持发送时的样子，以便记录与顾客收到的一致。",
    },
  "part le {date}": { en: "goes out {date}", zh: "{date} 发送" },
  "le {date}": { en: "on {date}", zh: "{date}" },
  "état de la campagne": { en: "campaign status", zh: "营销状态" },
  "destinataire · {segment}": {
    en: "recipient · {segment}",
    zh: "位收件人 · {segment}",
  },
  "destinataires · {segment}": {
    en: "recipients · {segment}",
    zh: "位收件人 · {segment}",
  },
  "partis, {n} en attente — la suite au prochain passage": {
    en: "sent, {n} waiting — the rest on the next run",
    zh: "封已发出，{n} 封等待中——下次任务继续",
  },
  "envoyés · {n} en échec": {
    en: "sent · {n} failed",
    zh: "封已发送 · {n} 封失败",
  },
  "e-mail envoyé": { en: "email sent", zh: "封邮件已发送" },
  "e-mails envoyés": { en: "emails sent", zh: "封邮件已发送" },
  "1. S'envoyer un essai": {
    en: "1. Send yourself a test",
    zh: "1. 发送测试邮件",
  },
  "2. Programmer l'envoi": { en: "2. Schedule sending", zh: "2. 安排发送" },
  "Programmée pour le {date}": {
    en: "Scheduled for {date}",
    zh: "已安排于 {date}",
  },
  "Choisis le jour : elle part le matin venu.": {
    en: "Choose the day: it goes out that morning.",
    zh: "选择日期：当天上午发送。",
  },
  "Le jour": { en: "The day", zh: "日期" },
  "Changer la date": { en: "Change the date", zh: "更改日期" },
  Programmer: { en: "Schedule", zh: "安排发送" },
  "Annuler la programmation": {
    en: "Cancel scheduling",
    zh: "取消安排",
  },
  "L'envoi s'est arrêté. Ceux qui ont déjà reçu ne recevront pas deux fois : la relance ne reprend que les {n} destinataire restant.":
    {
      en: "Sending stopped. Those who already received it won't get it twice: the retry only picks up the {n} remaining recipient.",
      zh: "发送已中断。已收到的顾客不会重复收到：重新发送只针对剩余的 {n} 位收件人。",
    },
  "L'envoi s'est arrêté. Ceux qui ont déjà reçu ne recevront pas deux fois : la relance ne reprend que les {n} destinataires restants.":
    {
      en: "Sending stopped. Those who already received it won't get it twice: the retry only picks up the {n} remaining recipients.",
      zh: "发送已中断。已收到的顾客不会重复收到：重新发送只针对剩余的 {n} 位收件人。",
    },
  Relancer: { en: "Retry", zh: "重新发送" },

  // Le formulaire
  "L'objet": { en: "Subject", zh: "邮件主题" },
  "Notre carte d'automne arrive lundi": {
    en: "Our autumn menu arrives on Monday",
    zh: "我们的秋季菜单周一上线",
  },
  "{n} / {max} caractères — c'est la seule phrase que tout le monde lira.": {
    en: "{n} / {max} characters — it's the only sentence everyone will read.",
    zh: "{n} / {max} 字符——这是每个人都会读到的唯一一句话。",
  },
  "Le message": { en: "The message", zh: "邮件内容" },
  "Bonjour,\n\nNotre carte d'automne arrive lundi : gibier, champignons, et la tarte aux quetsches de la maison.\n\nÀ très vite,":
    {
      en: "Hello,\n\nOur autumn menu arrives on Monday: game, mushrooms, and our house plum tart.\n\nSee you soon,",
      zh: "您好，\n\n我们的秋季菜单周一上线：野味、蘑菇，还有自家的李子挞。\n\n期待您的光临，",
    },
  "{n} / {max} caractères. Une ligne vide sépare deux paragraphes. Votre nom signe le message, inutile de le répéter.":
    {
      en: "{n} / {max} characters. A blank line separates two paragraphs. Your name signs the message, no need to repeat it.",
      zh: "{n} / {max} 字符。空一行即分段。邮件会自动署上您的名称，无需重复。",
    },
  "À qui": { en: "To whom", zh: "发给谁" },
  personne: { en: "person", zh: "人" },
  personnes: { en: "people", zh: "人" },
  "Personne n'a encore accepté tes e-mails. Tu peux écrire la campagne, elle partira quand le fichier se remplira — la case est proposée à chaque réservation.":
    {
      en: "Nobody has accepted your emails yet. You can write the campaign; it'll go out as the list fills up — the box is offered with every booking.",
      zh: "还没有人同意接收您的邮件。您可以先写好营销邮件，等名单增加后再发送——每次订位时都会提供同意选项。",
    },
  "Un bouton": { en: "A button", zh: "按钮" },
  "(facultatif)": { en: "(optional)", zh: "（选填）" },
  "Réserver une table": { en: "Book a table", zh: "预订餐桌" },
  "Vers quelle adresse": { en: "To which address", zh: "跳转网址" },
  "Créer le brouillon": { en: "Create the draft", zh: "创建草稿" },
  Aperçu: { en: "Preview", zh: "预览" },
  "Votre restaurant": { en: "Your restaurant", zh: "您的餐厅" },
  "L'objet de ton message": {
    en: "Your message's subject",
    zh: "邮件主题",
  },
  "Votre message apparaîtra ici.": {
    en: "Your message will appear here.",
    zh: "您的邮件内容会显示在这里。",
  },

  // L'essai
  "S'envoyer un essai": { en: "Send yourself a test", zh: "发送测试邮件" },
  "À quelle adresse": { en: "To which address", zh: "发送到哪个邮箱" },
  "vous@votre-restaurant.fr": {
    en: "you@your-restaurant.com",
    zh: "you@your-restaurant.com",
  },
  "Envoi…": { en: "Sending…", zh: "正在发送…" },
  "Envoyer l'essai": { en: "Send the test", zh: "发送测试" },
  "Le message est composé exactement comme le vrai, pied de désinscription compris. Le lien de cet essai ne désinscrit personne.":
    {
      en: "The message is built exactly like the real one, unsubscribe footer included. The link in this test doesn't unsubscribe anyone.",
      zh: "测试邮件与正式邮件完全相同，包括退订页脚。测试邮件中的链接不会让任何人退订。",
    },
  "Essai envoyé à {email}.": {
    en: "Test sent to {email}.",
    zh: "测试邮件已发送至 {email}。",
  },

  // Les messages des actions
  "L'enregistrement a échoué.": { en: "Saving failed.", zh: "保存失败。" },
  "Cette campagne est partie : elle ne se modifie plus.": {
    en: "This campaign has gone out: it can no longer be edited.",
    zh: "此营销邮件已发出：无法再修改。",
  },
  "Indiquez une adresse.": { en: "Enter an address.", zh: "请填写邮箱地址。" },
  "Campagne introuvable.": {
    en: "Campaign not found.",
    zh: "找不到该营销活动。",
  },
  "L'envoi a échoué.": { en: "Sending failed.", zh: "发送失败。" },
  "Il manque l'objet du message.": {
    en: "The message subject is missing.",
    zh: "缺少邮件主题。",
  },
  "Le message est vide.": { en: "The message is empty.", zh: "邮件内容为空。" },
  "Le bouton n'a pas d'adresse.": {
    en: "The button has no address.",
    zh: "按钮缺少网址。",
  },
  "Le bouton n'a pas de libellé.": {
    en: "The button has no label.",
    zh: "按钮缺少文字。",
  },
  "L'adresse du bouton doit commencer par https://": {
    en: "The button address must start with https://",
    zh: "按钮网址必须以 https:// 开头",
  },
  "Choisissez une date d'envoi.": {
    en: "Choose a sending date.",
    zh: "请选择发送日期。",
  },
  "Cette date est passée.": {
    en: "This date has passed.",
    zh: "该日期已过。",
  },
};
