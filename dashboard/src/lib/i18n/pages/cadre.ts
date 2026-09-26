import type { Traductions } from "@/lib/i18n/t";

/** Le cadre du tableau de bord : en-tête, alertes, carte d'établissement. */
export const CADRE: Traductions = {
  Aide: { en: "Help", zh: "帮助" },
  "Se déconnecter": { en: "Sign out", zh: "退出登录" },
  "Supprimer ce restaurant ?": { en: "Delete this restaurant?", zh: "删除这家餐厅？" },
  "Ce qui a changé": { en: "What changed", zh: "近期变化" },
  "sur {n} jours": { en: "over {n} days", zh: "近 {n} 天" },
  "La surveillance démarre dès le premier relevé, la nuit prochaine. Elle compare chaque jour ta note et ton nombre d'avis à ceux de la semaine précédente.":
    {
      en: "Monitoring starts with the first reading, tonight. Every day it compares your rating and review count with the previous week's.",
      zh: "监测将在今晚首次记录后开始，每天将您的评分和评价数与上一周进行对比。",
    },
  "Rien de neuf : ni nouvel avis, ni variation de note cette semaine.": {
    en: "Nothing new: no new reviews and no rating change this week.",
    zh: "暂无变化：本周没有新评价，评分也没有变动。",
  },
  Établissement: { en: "Venue", zh: "餐厅" },
  "Voir les avis": { en: "See reviews", zh: "查看评价" },
};
