import type { Langue } from "@/lib/i18n/langues";
import type { Action } from "@/lib/google/performance";

/** Le bloc « Visibilité Google » de la page Fiche Google, en trois langues. */
export type ClesVisibiliteGoogle = {
  titre: string;
  chapo: string;
  periodes: { "28": string; "90": string; "365": string };
  apparitions: string;
  apparitionsTotales: string;
  maps: string;
  recherche: string;
  actions: string;
  actionsTotales: string;
  taux: string;
  tauxAide: string;
  vsAvant: string;
  pasDeComparaison: string;
  periodeActuelle: string;
  periodePrecedente: string;
  noms: Record<Action, string>;
  aucunChiffre: string;
  erreurActiver: string;
  erreur: string;
  note: string;
  graphiqueApparitionsAria: string;
  graphiqueActionsAria: string;
  semaineDu: (jour: string) => string;
};

const fr: ClesVisibiliteGoogle = {
  titre: "Visibilité Google",
  chapo:
    "Combien de fois ta fiche est apparue sur Google, et ce que les gens en ont fait.",
  periodes: { "28": "28 jours", "90": "3 mois", "365": "12 mois" },
  apparitions: "Apparitions",
  apparitionsTotales: "apparitions sur Google",
  maps: "Google Maps",
  recherche: "Recherche Google",
  actions: "Actions",
  actionsTotales: "actions depuis ta fiche",
  taux: "taux d'action",
  tauxAide: "actions pour 100 apparitions",
  vsAvant: "vs période précédente",
  pasDeComparaison: "pas de période précédente",
  periodeActuelle: "Période actuelle",
  periodePrecedente: "Période précédente",
  noms: {
    site: "Visite du site",
    appel: "Appel",
    itineraire: "Itinéraire",
    reservation: "Réservation",
    menu: "Clic sur la carte",
  },
  aucunChiffre:
    "Google n'a encore rien compté sur cette période. Les chiffres arrivent avec deux à trois jours de retard.",
  erreurActiver:
    "Les statistiques de la fiche ne sont pas encore ouvertes : l'API « Business Profile Performance » doit être activée dans le projet Google Cloud de Klarr.",
  erreur:
    "Google n'a pas répondu pour les statistiques. Réessaie dans quelques minutes.",
  note: "Chiffres de Google, publiés avec deux à trois jours de retard. Une apparition = ta fiche affichée dans Maps ou dans la recherche ; une action = un clic mesuré par Google sur ta fiche.",
  graphiqueApparitionsAria:
    "Apparitions sur Google Maps et la recherche Google",
  graphiqueActionsAria: "Actions depuis la fiche Google",
  semaineDu: (jour) => `semaine du ${jour}`,
};

const en: ClesVisibiliteGoogle = {
  titre: "Google visibility",
  chapo:
    "How many times your listing appeared on Google, and what people did with it.",
  periodes: { "28": "28 days", "90": "3 months", "365": "12 months" },
  apparitions: "Views",
  apparitionsTotales: "views on Google",
  maps: "Google Maps",
  recherche: "Google Search",
  actions: "Actions",
  actionsTotales: "actions from your listing",
  taux: "action rate",
  tauxAide: "actions per 100 views",
  vsAvant: "vs previous period",
  pasDeComparaison: "no previous period",
  periodeActuelle: "Current period",
  periodePrecedente: "Previous period",
  noms: {
    site: "Website visit",
    appel: "Call",
    itineraire: "Directions",
    reservation: "Booking",
    menu: "Menu click",
  },
  aucunChiffre:
    "Google hasn't counted anything for this period yet. Figures arrive two to three days late.",
  erreurActiver:
    "Listing statistics aren't open yet: the “Business Profile Performance” API must be enabled in Klarr's Google Cloud project.",
  erreur:
    "Google didn't respond for the statistics. Try again in a few minutes.",
  note: "Google's figures, published two to three days late. A view = your listing shown in Maps or Search; an action = a click Google measured on your listing.",
  graphiqueApparitionsAria: "Views on Google Maps and Google Search",
  graphiqueActionsAria: "Actions from the Google listing",
  semaineDu: (jour) => `week of ${jour}`,
};

const zh: ClesVisibiliteGoogle = {
  titre: "Google 曝光",
  chapo: "您的商家资料在 Google 上出现了多少次，以及大家看到后做了什么。",
  periodes: { "28": "28 天", "90": "3 个月", "365": "12 个月" },
  apparitions: "展示次数",
  apparitionsTotales: "次在 Google 上展示",
  maps: "Google 地图",
  recherche: "Google 搜索",
  actions: "操作",
  actionsTotales: "次来自商家资料的操作",
  taux: "操作率",
  tauxAide: "每 100 次展示带来的操作",
  vsAvant: "对比上一时期",
  pasDeComparaison: "没有上一时期的数据",
  periodeActuelle: "本期",
  periodePrecedente: "上一时期",
  noms: {
    site: "访问网站",
    appel: "拨打电话",
    itineraire: "查询路线",
    reservation: "订位",
    menu: "查看菜单",
  },
  aucunChiffre: "Google 在这段时间还没有统计到数据。数据会延迟两到三天。",
  erreurActiver:
    "商家资料统计尚未开放：需要在 Klarr 的 Google Cloud 项目中启用「Business Profile Performance」API。",
  erreur: "Google 没有返回统计数据，请几分钟后再试。",
  note: "数据来自 Google，延迟两到三天发布。展示 = 您的商家资料出现在地图或搜索中；操作 = Google 统计到的在商家资料上的点击。",
  graphiqueApparitionsAria: "Google 地图和 Google 搜索上的展示次数",
  graphiqueActionsAria: "来自 Google 商家资料的操作",
  semaineDu: (jour) => `${jour} 这一周`,
};

export const VISIBILITE_GOOGLE: Record<Langue, ClesVisibiliteGoogle> = {
  fr,
  en,
  zh,
};
