import type { Traductions } from "@/lib/i18n/t";

/** La page Notifications et le bouton d'activation, appareil par appareil. */
export const NOTIFICATIONS: Traductions = {
  "Notifications — {nom}": { en: "Notifications — {nom}", zh: "通知 — {nom}" },
  "Une demande de réservation arrive à 19 h 40, en plein coup de feu. L'e-mail attendra la fermeture ; la notification, non. Active-la sur chaque appareil qui doit sonner — ton téléphone, celui de ton gérant.":
    {
      en: "A booking request comes in at 7:40 pm, in the middle of the rush. The email will wait until closing; the notification won't. Turn it on for every device that should ring — your phone, your manager's.",
      zh: "晚上 7:40，正忙的时候来了一个订位请求。邮件要等到打烊才会被看到，通知却不会。请在每台需要提醒的设备上开启——您的手机，还有店长的手机。",
    },
  "Sur cet appareil": { en: "On this device", zh: "本设备" },
  "{n} appareil": { en: "{n} device", zh: "{n} 台设备" },
  "{n} appareils": { en: "{n} devices", zh: "{n} 台设备" },
  "Tes appareils": { en: "Your devices", zh: "您的设备" },
  "Aucun appareil pour l'instant : active les notifications ci-dessus, depuis le téléphone qui doit sonner.":
    {
      en: "No devices yet: turn on notifications above, from the phone that should ring.",
      zh: "暂时没有设备：请在需要提醒的手机上，于上方开启通知。",
    },
  Appareil: { en: "Device", zh: "设备" },
  "depuis le {date}": { en: "since {date}", zh: "自 {date} 起" },
  "Un appareil se retire depuis lui-même, avec le bouton ci-dessus. Un téléphone perdu cesse de recevoir dès que le navigateur est réinstallé.":
    {
      en: "A device is removed from the device itself, with the button above. A lost phone stops receiving as soon as the browser is reinstalled.",
      zh: "设备需要在该设备上用上方按钮移除。丢失的手机在重新安装浏览器后就不会再收到通知。",
    },
  "Ce qui te réveillera": { en: "What will ping you", zh: "会提醒您的事" },
  "Une nouvelle demande de réservation": {
    en: "A new booking request",
    zh: "新的订位请求",
  },
  "Avec le nom, le nombre de couverts et l'heure.": {
    en: "With the name, number of guests and time.",
    zh: "包括姓名、人数和时间。",
  },
  "Une annulation client": {
    en: "A customer cancellation",
    zh: "顾客取消订位",
  },
  "La table se libère : tu peux la revendre.": {
    en: "The table is free again: you can fill it.",
    zh: "餐桌空出来了：您可以重新安排。",
  },
  "Et rien d'autre. Pas de conseil du jour, pas de relance d'abonnement : une notification qui ne sert à rien est une notification qu'on coupe.":
    {
      en: "And nothing else. No tip of the day, no subscription reminders: a useless notification is one that gets switched off.",
      zh: "除此之外没有别的。没有每日小贴士，也没有续费提醒：没用的通知只会被关掉。",
    },
  "Par e-mail": { en: "By email", zh: "邮件" },
  "Le bilan mensuel": { en: "The monthly report", zh: "月度报告" },
  "Le 1er du mois : couverts, note Google, nouveaux clients, et ce qui t'attend. Aperçu, envoi d'essai et désinscription.":
    {
      en: "On the 1st of the month: guests, Google rating, new customers, and what's coming up. Preview, test send and unsubscribe.",
      zh: "每月 1 日：用餐人数、Google 评分、新顾客，以及接下来的安排。可预览、发送测试邮件和退订。",
    },
  "La demande d'avis, le lendemain": {
    en: "The review request, the next day",
    zh: "第二天的评价邀请",
  },
  "À tes clients venus la veille : un merci, un lien vers Google et un lien pour t'écrire. Aperçu et réglage.":
    {
      en: "To customers who came the day before: a thank-you, a link to Google and a link to write to you. Preview and settings.",
      zh: "发给前一天到店的顾客：一句感谢、一个 Google 评价链接和一个给您留言的链接。可预览和设置。",
    },

  // L'activation
  "Cet appareil": { en: "This device", zh: "本设备" },
  "L'activation a échoué sur cet appareil.": {
    en: "Activation failed on this device.",
    zh: "在本设备上开启失败。",
  },
  "La désactivation a échoué.": {
    en: "Deactivation failed.",
    zh: "关闭失败。",
  },
  "L'activation a échoué.": { en: "Activation failed.", zh: "开启失败。" },
  "Abonnement incomplet.": {
    en: "Incomplete subscription.",
    zh: "订阅信息不完整。",
  },
  "Session expirée.": { en: "Session expired.", zh: "会话已过期。" },
  "Aucun appareil n'a reçu la notification. Réactive-la sur cet appareil.": {
    en: "No device received the notification. Turn it on again on this device.",
    zh: "没有设备收到通知。请在本设备上重新开启。",
  },
  "Vérification de cet appareil…": {
    en: "Checking this device…",
    zh: "正在检查本设备…",
  },
  "Sur iPhone, ajoute d'abord Klarr à ton écran d'accueil.": {
    en: "On iPhone, first add Klarr to your home screen.",
    zh: "在 iPhone 上，请先将 Klarr 添加到主屏幕。",
  },
  "Apple n'autorise les notifications que pour les applications installées. Dans Safari, touche le bouton ⎋ Partager en bas de l'écran, puis « Sur l'écran d'accueil ». Rouvre Klarr depuis l'icône et reviens ici : le bouton d'activation apparaîtra.":
    {
      en: "Apple only allows notifications for installed apps. In Safari, tap the ⎋ Share button at the bottom of the screen, then “Add to Home Screen”. Reopen Klarr from the icon and come back here: the activation button will appear.",
      zh: "Apple 只允许已安装的应用发送通知。在 Safari 中，点击屏幕底部的 ⎋ 分享按钮，然后选择「添加到主屏幕」。从图标重新打开 Klarr 并回到这里：开启按钮就会出现。",
    },
  "Ce navigateur ne sait pas recevoir de notifications. Essaie depuis Chrome, Safari ou Firefox à jour.":
    {
      en: "This browser can't receive notifications. Try an up-to-date Chrome, Safari or Firefox.",
      zh: "此浏览器无法接收通知。请使用最新版的 Chrome、Safari 或 Firefox。",
    },
  "Les notifications sont bloquées sur cet appareil.": {
    en: "Notifications are blocked on this device.",
    zh: "本设备已屏蔽通知。",
  },
  "Le blocage vient du navigateur, pas de Klarr : nous ne pouvons plus le demander nous-mêmes. Autorise les notifications pour klarr.net dans les réglages de ton navigateur, puis recharge cette page.":
    {
      en: "The block comes from the browser, not Klarr: we can't ask again ourselves. Allow notifications for klarr.net in your browser settings, then reload this page.",
      zh: "屏蔽来自浏览器，而不是 Klarr：我们无法再次请求权限。请在浏览器设置中允许 klarr.net 发送通知，然后刷新此页面。",
    },
  "{appareil} — activé": { en: "{appareil} — on", zh: "{appareil} — 已开启" },
  "{appareil} — pas encore activé": {
    en: "{appareil} — not on yet",
    zh: "{appareil} — 尚未开启",
  },
  "Envoi…": { en: "Sending…", zh: "正在发送…" },
  "Envoyer une notification d'essai": {
    en: "Send a test notification",
    zh: "发送测试通知",
  },
  "Désactiver sur cet appareil": {
    en: "Turn off on this device",
    zh: "在本设备上关闭",
  },
  "Activation…": { en: "Turning on…", zh: "正在开启…" },
  "Activer sur cet appareil": {
    en: "Turn on for this device",
    zh: "在本设备上开启",
  },
  "Envoyée. Elle doit arriver dans les secondes qui viennent — verrouille l'écran pour la voir comme un vrai soir de service.":
    {
      en: "Sent. It should arrive within seconds — lock the screen to see it as on a real evening service.",
      zh: "已发送，几秒内就会收到——锁定屏幕，看看真实营业时的效果。",
    },
};
