import type { Traductions } from "@/lib/i18n/t";

/** La page Expériences (ateliers, dégustations) et son formulaire. */
export const EXPERIENCES: Traductions = {
  "Expériences — {nom}": { en: "Experiences — {nom}", zh: "体验活动 — {nom}" },
  "Un cours, un atelier, une dégustation : une séance à places limitées qui revient selon le rythme que tu choisis. Elle apparaît sur ta page de réservation, et le client paie sur ton compte Stripe — sans commission.":
    {
      en: "A class, a workshop, a tasting: a session with limited seats that repeats on the schedule you choose. It appears on your booking page, and the customer pays into your Stripe account — with no commission.",
      zh: "课程、工作坊、品鉴会：名额有限、按您设定的频率举办的活动。它会出现在您的订位页面上，顾客通过您的 Stripe 账户付款——不收佣金。",
    },
  "Voir sur ma page de réservation ↗": {
    en: "View on my booking page ↗",
    zh: "在我的订位页面查看 ↗",
  },
  "expérience en cours": { en: "active experience", zh: "个活动进行中" },
  "expériences en cours": { en: "active experiences", zh: "个活动进行中" },
  "place réservée": { en: "seat booked", zh: "个名额已预订" },
  "places réservées": { en: "seats booked", zh: "个名额已预订" },
  "déjà payés pour les séances à venir": {
    en: "already paid for upcoming sessions",
    zh: "即将举办的场次已收款",
  },
  "place encore libre sur 4 semaines": {
    en: "seat still free over 4 weeks",
    zh: "个名额未来 4 周仍空余",
  },
  "places encore libres sur 4 semaines": {
    en: "seats still free over 4 weeks",
    zh: "个名额未来 4 周仍空余",
  },
  "Tes expériences": { en: "Your experiences", zh: "您的体验活动" },
  "Aucune expérience pour l'instant. Crée la première à côté : une dégustation, un atelier, une soirée à thème.":
    {
      en: "No experiences yet. Create the first one alongside: a tasting, a workshop, a themed evening.",
      zh: "暂时没有体验活动。在旁边创建第一个吧：品鉴会、工作坊或主题晚会。",
    },
  arrêtée: { en: "stopped", zh: "已停止" },
  "{prix} par personne": { en: "{prix} per person", zh: "每人 {prix}" },
  "{n} places": { en: "{n} seats", zh: "{n} 个名额" },
  " · paiement sur place": { en: " · pay on site", zh: " · 现场付款" },
  Arrêter: { en: "Stop", zh: "停止" },
  Relancer: { en: "Restart", zh: "重新开启" },
  complet: { en: "full", zh: "已满" },
  "{n} place libre": { en: "{n} seat free", zh: "剩余 {n} 个名额" },
  "{n} places libres": { en: "{n} seats free", zh: "剩余 {n} 个名额" },
  "Aucune séance dans les quatre prochaines semaines.": {
    en: "No sessions in the next four weeks.",
    zh: "未来四周没有场次。",
  },
  "{n} place": { en: "{n} seat", zh: "{n} 个名额" },
  "{montant} encaissés": { en: "{montant} collected", zh: "已收 {montant}" },
  "en attente de paiement": { en: "awaiting payment", zh: "等待付款" },
  "Nouvelle expérience": { en: "New experience", zh: "新体验活动" },

  // Le formulaire
  Nom: { en: "Name", zh: "名称" },
  "Cours de cocktails": { en: "Cocktail class", zh: "鸡尾酒课程" },
  "Prix par personne": { en: "Price per person", zh: "每人价格" },
  Description: { en: "Description", zh: "介绍" },
  "(facultatif)": { en: "(optional)", zh: "（选填）" },
  "Deux heures derrière le bar avec notre chef barman, trois cocktails à emporter dans les jambes.":
    {
      en: "Two hours behind the bar with our head bartender, three cocktails under your belt.",
      zh: "和我们的首席调酒师在吧台后度过两小时，亲手调制并品尝三杯鸡尾酒。",
    },
  "Places par séance": { en: "Seats per session", zh: "每场名额" },
  Heure: { en: "Time", zh: "时间" },
  Durée: { en: "Duration", zh: "时长" },
  "(min, facultatif)": { en: "(min, optional)", zh: "（分钟，选填）" },
  "Jours de la semaine": { en: "Days of the week", zh: "每周举办日" },
  "À partir du": { en: "From", zh: "开始日期" },
  "Jusqu'au": { en: "Until", zh: "结束日期" },
  "Inscriptions closes": { en: "Sign-ups close", zh: "报名截止" },
  "h avant": { en: "h before", zh: "小时前" },
  "Paiement à l'inscription": { en: "Pay when signing up", zh: "报名时付款" },
  "Le client paie en réservant, sur ton compte Stripe. Sa place n'est retenue qu'une fois payée.":
    {
      en: "The customer pays when booking, into your Stripe account. Their seat is only held once paid.",
      zh: "顾客在预订时通过您的 Stripe 账户付款。付款后才会保留名额。",
    },
  "Le client réserve sans payer et règle sur place. Utile pour un atelier gratuit ou une découverte.":
    {
      en: "The customer books without paying and pays on site. Useful for a free workshop or a taster.",
      zh: "顾客预订时无需付款，到场后再付。适合免费工作坊或体验活动。",
    },
  "Créer cette expérience": {
    en: "Create this experience",
    zh: "创建此体验活动",
  },
  "Seul le gérant ou le propriétaire peut créer une expérience.": {
    en: "Only the manager or owner can create an experience.",
    zh: "只有店长或店主可以创建体验活动。",
  },
  "Donne un nom à cette expérience.": {
    en: "Give this experience a name.",
    zh: "请为体验活动命名。",
  },
  "Indique un prix par personne, en euros — par exemple 38.": {
    en: "Enter a price per person, in euros — for example 38.",
    zh: "请填写每人价格（欧元），例如 38。",
  },
  "Indique le nombre de places par séance.": {
    en: "Enter the number of seats per session.",
    zh: "请填写每场名额。",
  },
  "Choisis au moins un jour de la semaine.": {
    en: "Choose at least one day of the week.",
    zh: "请至少选择一天。",
  },
  "Indique l'heure de la séance.": {
    en: "Enter the session time.",
    zh: "请填写活动时间。",
  },
  "La date de fin est antérieure à la date de début.": {
    en: "The end date is before the start date.",
    zh: "结束日期早于开始日期。",
  },
  "La durée doit être un nombre de minutes.": {
    en: "The duration must be a number of minutes.",
    zh: "时长必须是分钟数。",
  },
  "Le délai doit être un nombre d'heures, 0 compris.": {
    en: "The deadline must be a number of hours, 0 included.",
    zh: "截止时间必须是小时数（可为 0）。",
  },
  "L'enregistrement a échoué. Réessaie dans un instant.": {
    en: "Saving failed. Try again in a moment.",
    zh: "保存失败，请稍后再试。",
  },
};
