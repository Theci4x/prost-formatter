import type { Langue } from "@/lib/i18n/langue";

/**
 * Le site vitrine, dans les trois langues.
 *
 * C'est la page que Google lit. Elle ne suit donc pas « Accept-Language »
 * mais `langueIndexable` : un robot tombe toujours sur le français, et
 * une autre langue ne s'affiche que pour qui l'a demandée en cliquant.
 * Le balisage structuré, lui, reste sur les données de l'établissement —
 * un nom, une adresse et des horaires ne se traduisent pas.
 *
 * Les montants passent par `montantLisible` : le séparateur de milliers
 * n'est pas le même d'une langue à l'autre, et le symbole « € » ne se
 * place pas au même endroit — d'où les fonctions plutôt que des phrases
 * à trous.
 */

export type ClesVitrine = {
  /** L'en-tête, et les ancres de la page. */
  laCarte: string;
  reserver: string;
  photos: string;
  infos: string;
  /** Le mot court de la barre ; la section garde son titre long. */
  privatiser: string;
  /** L'intitulé au-dessus du texte de présentation. */
  aPropos: string;

  /**
   * La note Google. Une seule chaîne, et pas un bout de phrase autour
   * d'un nombre en gras : le chinois met « Google 评分 » devant la note,
   * l'anglais la met en tête — l'ordre change, donc le gras aussi, et un
   * gras mal placé se remarque plus qu'il ne sert.
   */
  noteSurGoogle(note: string, avis: number): string;
  reserverUneTable: string;
  voirLaCarte: string;

  /** L'aperçu de la carte. */
  apercuDeLaCarte: string;
  voirTouteLaCarte: string;

  /** Les infos pratiques. */
  infosPratiques: string;
  nousTrouver: string;
  itineraire: string;
  adresseNonRenseignee: string;
  horaires: string;
  horairesNonRenseignes: string;
  ferme: string;

  /** La privatisation. */
  privatiserUnEspace: string;
  privatisationChapo: string;
  deAJusqua(minimum: number, capacite: number): string;
  jusqua(capacite: number): string;
  demander(nom: string): string;
  acompte(montant: string, parPersonne: boolean, seuil: number | null): string;
  caution(montant: string, parPersonne: boolean, seuil: number | null): string;

  /** Les blocs de bas de page. */
  questionsFrequentes: string;
  enCeMomentSurInstagram: string;
  publicationInstagram(pseudo: string): string;

  propulseePar: string;

  /** Ce que lisent Google et les réseaux sociaux. */
  restaurant: string;
  titreLieu(nom: string, lieu: string): string;
  titreSeul(nom: string): string;
  descriptionAvecAdresse(nom: string, adresse: string): string;
  descriptionSeule(nom: string): string;
  localeOg: string;
};

const fr: ClesVitrine = {
  laCarte: "La carte",
  reserver: "Réserver",
  photos: "Photos",
  infos: "Infos",
  privatiser: "Privatiser",
  aPropos: "La maison",

  noteSurGoogle: (note, avis) => `${note} sur Google · ${avis} avis`,
  reserverUneTable: "Réserver une table",
  voirLaCarte: "Voir la carte",

  apercuDeLaCarte: "Un aperçu de la carte",
  voirTouteLaCarte: "Voir toute la carte",

  infosPratiques: "Infos pratiques",
  nousTrouver: "Nous trouver",
  itineraire: "Itinéraire",
  adresseNonRenseignee: "Adresse non renseignée",
  horaires: "Horaires",
  horairesNonRenseignes: "Horaires non renseignés",
  ferme: "Fermé",

  privatiserUnEspace: "Privatiser un espace",
  privatisationChapo:
    "Anniversaire, repas d’équipe, séminaire : l’espace est à vous seuls pendant tout le service.",
  deAJusqua: (minimum, capacite) => `De ${minimum} à ${capacite} couverts`,
  jusqua: (capacite) => `Jusqu’à ${capacite} couverts`,
  demander: (nom) => `Demander ${nom}`,
  acompte: (montant, parPersonne, seuil) =>
    `Acompte de ${montant} €${parPersonne ? " par personne" : ""}${
      seuil ? ` à partir de ${seuil} convives` : ""
    }, à verser pour confirmer.`,
  caution: (montant, parPersonne, seuil) =>
    `Empreinte de carte de ${montant} €${parPersonne ? " par personne" : ""}${
      seuil ? ` à partir de ${seuil} convives` : ""
    } — rien n’est prélevé, sauf si le groupe ne vient pas.`,

  questionsFrequentes: "Questions fréquentes",
  enCeMomentSurInstagram: "En ce moment sur Instagram",
  publicationInstagram: (pseudo) => `Publication Instagram de ${pseudo}`,

  propulseePar: "Site et réservations propulsés par",

  restaurant: "Restaurant",
  titreLieu: (nom, lieu) => `${nom} — restaurant à ${lieu}`,
  titreSeul: (nom) => `${nom} — restaurant`,
  descriptionAvecAdresse: (nom, adresse) =>
    `${nom}, ${adresse}. Carte, horaires et réservation en ligne.`,
  descriptionSeule: (nom) => `${nom}. Carte, horaires et réservation en ligne.`,
  localeOg: "fr_FR",
};

const en: ClesVitrine = {
  laCarte: "Menu",
  reserver: "Book",
  photos: "Photos",
  infos: "Info",
  privatiser: "Private hire",
  aPropos: "The house",

  noteSurGoogle: (note, avis) =>
    `${note} on Google · ${avis} review${avis > 1 ? "s" : ""}`,
  reserverUneTable: "Book a table",
  voirLaCarte: "See the menu",

  apercuDeLaCarte: "A taste of the menu",
  voirTouteLaCarte: "See the whole menu",

  infosPratiques: "Good to know",
  nousTrouver: "Find us",
  itineraire: "Directions",
  adresseNonRenseignee: "No address given",
  horaires: "Opening hours",
  horairesNonRenseignes: "No opening hours given",
  ferme: "Closed",

  privatiserUnEspace: "Book a private space",
  privatisationChapo:
    "Birthday, team dinner, offsite: the space is yours alone for the whole service.",
  deAJusqua: (minimum, capacite) => `From ${minimum} to ${capacite} guests`,
  jusqua: (capacite) => `Up to ${capacite} guests`,
  demander: (nom) => `Enquire about ${nom}`,
  acompte: (montant, parPersonne, seuil) =>
    `Deposit of €${montant}${parPersonne ? " per person" : ""}${
      seuil ? ` from ${seuil} guests` : ""
    }, payable to confirm.`,
  caution: (montant, parPersonne, seuil) =>
    `Card hold of €${montant}${parPersonne ? " per person" : ""}${
      seuil ? ` from ${seuil} guests` : ""
    } — nothing is charged unless the party does not show up.`,

  questionsFrequentes: "Frequently asked questions",
  enCeMomentSurInstagram: "Right now on Instagram",
  publicationInstagram: (pseudo) => `Instagram post by ${pseudo}`,

  propulseePar: "Website and bookings powered by",

  restaurant: "Restaurant",
  titreLieu: (nom, lieu) => `${nom} — restaurant in ${lieu}`,
  titreSeul: (nom) => `${nom} — restaurant`,
  descriptionAvecAdresse: (nom, adresse) =>
    `${nom}, ${adresse}. Menu, opening hours and online booking.`,
  descriptionSeule: (nom) => `${nom}. Menu, opening hours and online booking.`,
  localeOg: "en_GB",
};

const zh: ClesVitrine = {
  laCarte: "菜单",
  reserver: "订座",
  photos: "照片",
  infos: "信息",
  privatiser: "包场",
  aPropos: "关于本店",

  noteSurGoogle: (note, avis) => `Google 评分 ${note} · ${avis} 条评价`,
  reserverUneTable: "订一张桌",
  voirLaCarte: "查看菜单",

  apercuDeLaCarte: "菜单一瞥",
  voirTouteLaCarte: "查看完整菜单",

  infosPratiques: "实用信息",
  nousTrouver: "如何找到我们",
  itineraire: "路线导航",
  adresseNonRenseignee: "未填写地址",
  horaires: "营业时间",
  horairesNonRenseignes: "未填写营业时间",
  ferme: "休息",

  privatiserUnEspace: "包场",
  privatisationChapo:
    "生日聚会、团队聚餐、公司活动：整个餐次期间，这个空间只属于您。",
  deAJusqua: (minimum, capacite) => `${minimum} 至 ${capacite} 位`,
  jusqua: (capacite) => `最多 ${capacite} 位`,
  demander: (nom) => `申请${nom}`,
  acompte: (montant, parPersonne, seuil) =>
    `定金 ${montant} 欧元${parPersonne ? "（每位）" : ""}${
      seuil ? `，${seuil} 位起` : ""
    }，付款后方可确认。`,
  caution: (montant, parPersonne, seuil) =>
    `信用卡预授权 ${montant} 欧元${parPersonne ? "（每位）" : ""}${
      seuil ? `，${seuil} 位起` : ""
    } —— 不会实际扣款，除非当天未到场。`,

  questionsFrequentes: "常见问题",
  enCeMomentSurInstagram: "Instagram 上的最新动态",
  publicationInstagram: (pseudo) => `${pseudo}发布的 Instagram 帖子`,

  propulseePar: "网站与订座服务由以下平台提供",

  restaurant: "餐厅",
  titreLieu: (nom, lieu) => `${nom} —— ${lieu}的餐厅`,
  titreSeul: (nom) => `${nom} —— 餐厅`,
  descriptionAvecAdresse: (nom, adresse) =>
    `${nom}，${adresse}。菜单、营业时间与在线订座。`,
  descriptionSeule: (nom) => `${nom}。菜单、营业时间与在线订座。`,
  localeOg: "zh_CN",
};

export const VITRINE: Record<Langue, ClesVitrine> = { fr, en, zh };
