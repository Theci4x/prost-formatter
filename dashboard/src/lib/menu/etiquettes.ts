import type { Langue } from "@/lib/i18n/langues";

/**
 * Les mots de la carte publique qui ne viennent de personne.
 *
 * Trois sources de texte cohabitent sur cette page, et les confondre
 * ferait une carte à moitié traduite. Ce que le **restaurateur** a tapé
 * (noms, descriptions, catégories) part au modèle et revient traduit.
 * Ce que la **loi** impose vit dans `mentions.ts`, à l'identique pour
 * tout le monde. Et puis il y a ces mots-ci : « Allergènes », « La
 * carte », « Réserver une table » — de l'interface, qui n'a ni à être
 * traduite par un modèle ni à être décidée par un établissement.
 *
 * Le chinois n'utilise pas les mêmes signes que nous, et l'espace avant
 * les deux-points est une habitude française qui se voit comme le nez au
 * milieu de la figure dans une phrase chinoise. C'est le genre de détail
 * qui fait qu'une traduction se lit comme une traduction.
 */

export type Etiquette = Record<Langue, string>;

export function t(etiquette: Etiquette, langue: Langue): string {
  return etiquette[langue] ?? etiquette.fr;
}

export const ETIQUETTES = {
  titre: { fr: "La carte", en: "Menu", zh: "菜单" },
  allergenes: { fr: "Allergènes", en: "Allergens", zh: "过敏原" },
  reserver: {
    fr: "Réserver une table",
    en: "Book a table",
    zh: "预订座位",
  },
  indicative: {
    fr: "Carte donnée à titre indicatif : elle peut changer selon l'arrivage et la saison.",
    en: "Menu given for information only: it may change with the season and daily deliveries.",
    zh: "本菜单仅供参考：内容会随当日进货和季节调整。",
  },
  tableauAllergenes: {
    fr: "Voir le tableau des allergènes →",
    en: "See the full allergen table →",
    zh: "查看完整的过敏原对照表 →",
  },
  enMaj: {
    fr: "La carte est en cours de mise à jour.",
    en: "The menu is being updated.",
    zh: "菜单正在更新中。",
  },
  rienSans: {
    fr: "Aucun plat de la carte n'est déclaré sans ce que vous évitez. Demandez-nous.",
    en: "No dish on the menu is declared free of what you avoid. Please ask us.",
    zh: "菜单上没有任何一道菜被申报为不含您所回避的成分。请直接问我们。",
  },
  aDemander: {
    fr: "À nous demander",
    en: "To ask us about",
    zh: "请向我们询问",
  },
  aDemanderTexte: {
    fr: "Nous n'avons pas encore déclaré les allergènes de ces plats. Ils ne sont ni retenus ni écartés : demandez-nous, nous vous répondrons.",
    en: "We have not declared the allergens of these dishes yet. They are neither included nor ruled out — ask us and we will tell you.",
    zh: "这几道菜的过敏原我们还没有申报。它们既没有被保留，也没有被排除：问我们，我们会告诉您。",
  },
  filtreTitre: {
    fr: "Je suis allergique à…",
    en: "I'm allergic to…",
    zh: "我对以下成分过敏……",
  },
  filtreAppliquer: {
    fr: "Filtrer la carte",
    en: "Filter the menu",
    zh: "筛选菜单",
  },
  filtreEffacer: { fr: "Tout effacer", en: "Clear all", zh: "全部清除" },
  categories: { fr: "Catégories", en: "Categories", zh: "分类" },
  filtreLegende: {
    fr: "Allergènes à écarter",
    en: "Allergens to avoid",
    zh: "要回避的过敏原",
  },
  filtreTout: { fr: "Tout afficher", en: "Show everything", zh: "显示全部" },
  filtreReserve: {
    fr: "Ce filtre lit ce que le restaurant a déclaré, ingrédient par ingrédient. Il ne peut pas exclure les traces : notre cuisine manipule les quatorze allergènes. Signalez-nous toujours votre allergie avant de commander.",
    en: "This filter reads what the restaurant has declared, ingredient by ingredient. It cannot rule out traces: our kitchen handles all fourteen regulated allergens. Always tell us before ordering.",
    zh: "本筛选依据餐厅逐项申报的配料。它无法排除交叉接触的痕量——我们的厨房同时处理全部十四类过敏原。点餐前请务必告知我们您的过敏情况。",
  },
  retourCarte: {
    fr: "← Revenir à la carte",
    en: "← Back to the menu",
    zh: "← 返回菜单",
  },
  tableauEnCours: {
    fr: "Ce tableau est en cours de préparation. Signalez-nous toute allergie avant de commander.",
    en: "This table is being prepared. Please ask us about any allergy before ordering.",
    zh: "这份对照表还在整理中。点餐前请告知我们您的任何过敏情况。",
  },
  demandezNous: {
    fr: "Demandez-nous",
    en: "Please ask us",
    zh: "请问我们",
  },
  aucunDesQuatorze: {
    fr: "Aucun des quatorze",
    en: "None of the fourteen",
    zh: "十四类均不含",
  },
  sourceAnnexe: {
    fr: "Les quatorze allergènes listés sont ceux de l'annexe II du règlement (UE) n° 1169/2011.",
    en: "The fourteen allergens listed here are those required by Annex II of Regulation (EU) No 1169/2011.",
    zh: "这里列出的十四类过敏原，依据的是欧盟第 1169/2011 号条例附件二。",
  },
  signature: {
    fr: "Carte propulsée par",
    en: "Menu powered by",
    zh: "菜单技术支持",
  },
} satisfies Record<string, Etiquette>;

/** Les deux-points, dans la ponctuation de chaque langue. */
export function deuxPoints(langue: Langue): string {
  return langue === "zh" ? "：" : langue === "fr" ? " : " : ": ";
}

/**
 * « 3 plats sans gluten, lait » — une phrase par langue plutôt qu'un
 * gabarit, parce que le pluriel ne se gabarite pas et que le chinois n'en
 * a pas du tout.
 */
export function resumeFiltre(
  compatibles: number,
  ecartes: number,
  liste: string,
  langue: Langue,
): { principal: string; reste: string | null } {
  if (langue === "en") {
    return {
      principal: `${compatibles} dish${compatibles > 1 ? "es" : ""} without ${liste}`,
      reste: ecartes > 0 ? ` · ${ecartes} set aside` : null,
    };
  }
  if (langue === "zh") {
    return {
      principal: `${compatibles} 道菜不含 ${liste}`,
      reste: ecartes > 0 ? ` · 另有 ${ecartes} 道已排除` : null,
    };
  }
  return {
    principal: `${compatibles} plat${compatibles > 1 ? "s" : ""} sans ${liste}`,
    reste: ecartes > 0 ? ` · ${ecartes} écarté${ecartes > 1 ? "s" : ""}` : null,
  };
}
