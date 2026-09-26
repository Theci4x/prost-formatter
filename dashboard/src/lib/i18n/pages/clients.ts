import type { Traductions } from "@/lib/i18n/t";

/** La page Fichier client. */
export const CLIENTS: Traductions = {
  "Fichier client — {nom}": {
    en: "Customer list — {nom}",
    zh: "顾客档案 — {nom}",
  },
  "Derniers venus": { en: "Most recent", zh: "最近到访" },
  "Plus fidèles": { en: "Most loyal", zh: "最忠实" },
  "Par nom": { en: "By name", zh: "按姓名" },
  "Reconstitué à partir du carnet : une personne, quel que soit le nombre de fois qu'elle a réservé. Les venues comptent les tables honorées, pas les demandes annulées.":
    {
      en: "Rebuilt from the booking book: one person, however many times they've booked. Visits count tables that were honoured, not cancelled requests.",
      zh: "根据订位簿整理：同一个人无论订位多少次都只算一位。到访次数只统计实际到店的订位，不包括已取消的。",
    },
  "Écrire à mes clients": { en: "Write to my customers", zh: "给顾客发邮件" },
  "Exporter en CSV": { en: "Export as CSV", zh: "导出为 CSV" },
  "Importer depuis TheFork ou Zenchef": {
    en: "Import from TheFork or Zenchef",
    zh: "从 TheFork 或 Zenchef 导入",
  },
  "clients au fichier": { en: "customers on file", zh: "位顾客在档" },
  "acceptent tes e-mails": { en: "accept your emails", zh: "位接受您的邮件" },
  "n'ont pas coché la case": {
    en: "didn't tick the box",
    zh: "位未勾选同意",
  },
  "Personne n'a encore accepté tes e-mails.": {
    en: "Nobody has accepted your emails yet.",
    zh: "还没有人同意接收您的邮件。",
  },
  "La case est proposée, décochée, sur ta page de réservation — c'est la loi : on ne peut pas déduire d'une table réservée l'envie de recevoir une newsletter. Elle se remplit avec les prochaines réservations.":
    {
      en: "The box is offered, unticked, on your booking page — that's the law: booking a table doesn't mean wanting a newsletter. It fills up with the next bookings.",
      zh: "订位页面上提供了这个选项，默认不勾选——这是法律规定：订了座位不代表愿意接收营销邮件。随着新的订位，名单会逐渐增加。",
    },
  "L'historique des venues n'a pas pu être calculé.": {
    en: "Visit history couldn't be calculated.",
    zh: "无法计算到访记录。",
  },
  "Voici tes clients tels qu'ils sont enregistrés ; le nombre de venues et les dates reviendront dès que le calcul répondra.":
    {
      en: "Here are your customers as they're saved; visit counts and dates will come back as soon as the calculation responds.",
      zh: "以下是已保存的顾客信息；计算恢复后，到访次数和日期就会重新显示。",
    },
  Chercher: { en: "Search", zh: "搜索" },
  "Chercher un nom, une adresse": {
    en: "Search a name, an email",
    zh: "搜索姓名或邮箱",
  },
  Effacer: { en: "Clear", zh: "清除" },
  "Personne ne correspond à « {q} ».": {
    en: "Nobody matches “{q}”.",
    zh: "没有与「{q}」匹配的顾客。",
  },
  "La liste n'a pas pu être lue. Recharge la page dans un instant.": {
    en: "The list couldn't be read. Reload the page in a moment.",
    zh: "无法读取列表，请稍后刷新页面。",
  },
  "Le fichier est vide : il se remplira à la première réservation.": {
    en: "The list is empty: it will fill up with the first booking.",
    zh: "档案为空：第一笔订位后就会有数据。",
  },
  Client: { en: "Customer", zh: "顾客" },
  Venues: { en: "Visits", zh: "到访" },
  "Dernière venue": { en: "Last visit", zh: "最近到访" },
  "E-mails": { en: "Emails", zh: "邮件" },
  "Note interne": { en: "Internal note", zh: "内部备注" },
  Écrire: { en: "Write", zh: "写邮件" },
  "{n} fiche": { en: "{n} entry", zh: "{n} 位顾客" },
  "{n} fiches": { en: "{n} entries", zh: "{n} 位顾客" },
  " · page {page} sur {pages}": {
    en: " · page {page} of {pages}",
    zh: " · 第 {page} 页，共 {pages} 页",
  },
  "← Précédentes": { en: "← Previous", zh: "← 上一页" },
  "Suivantes →": { en: "Next →", zh: "下一页 →" },
  "Pas encore venu": { en: "Not visited yet", zh: "尚未到访" },
  "{n} venue": { en: "{n} visit", zh: "{n} 次到访" },
  "{n} venues": { en: "{n} visits", zh: "{n} 次到访" },
  " · {n} couv.": { en: " · {n} guests", zh: " · {n} 位" },
  Désinscrit: { en: "Unsubscribed", zh: "已退订" },
  "le {date}": { en: "on {date}", zh: "{date}" },
  Accepte: { en: "Accepts", zh: "同意" },
  "depuis le {date}": { en: "since {date}", zh: "自 {date} 起" },
  "Allergies, habitudes…": { en: "Allergies, habits…", zh: "过敏、习惯…" },
};
