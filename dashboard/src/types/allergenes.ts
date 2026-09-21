import type { Langue } from "@/lib/i18n/langues";

/**
 * Les quatorze allergènes à déclaration obligatoire.
 *
 * La liste n'est pas la nôtre : c'est l'annexe II du règlement (UE)
 * n° 1169/2011, reprise en droit français par le décret n° 2015-447. Elle
 * ne se raccourcit pas, ne se complète pas, et ne se réordonne pas au
 * goût d'un établissement — un restaurateur qui ajouterait « fraise »
 * ferait croire que la liste est indicative, alors qu'elle est fermée.
 *
 * Ce que la loi demande à un restaurant, pour des plats qui ne sont pas
 * préemballés : que l'information soit **écrite**, et consultable **sans
 * que le client ait à la demander**. C'est ce second point qu'on oublie
 * le plus souvent : le classeur sous le comptoir ne suffit pas si rien
 * n'indique qu'il existe. D'où le choix de Klarr — les allergènes
 * déclarés s'impriment sous le plat, sur la carte que le client a déjà
 * sous les yeux.
 *
 * Les libellés existent dans les trois langues du site. Traduire un
 * allergène n'est pas du confort : un client qui lit « 花生 » sous un plat
 * comprend qu'il contient des arachides, là où « arachides » ne lui dit
 * rien — et c'est exactement le cas où se tromper envoie quelqu'un à
 * l'hôpital.
 *
 * Le code est stable et sans accent : il est écrit en base et voyagera
 * dans des URL et des exports. Le libellé, lui, peut être réécrit sans
 * migration.
 */

export const ALLERGENES = [
  {
    code: "gluten",
    fr: "Gluten",
    en: "Gluten",
    zh: "麸质（谷蛋白）",
    // Les précisions de l'annexe : elles évitent la question « le seigle,
    // ça compte ? » au moment de cocher.
    detailFr: "blé, seigle, orge, avoine, épeautre, kamut",
    detailEn: "wheat, rye, barley, oats, spelt, kamut",
    detailZh: "小麦、黑麦、大麦、燕麦、斯佩尔特小麦、卡姆小麦",
  },
  {
    code: "crustaces",
    fr: "Crustacés",
    en: "Crustaceans",
    zh: "甲壳类",
    detailFr: "crevette, homard, crabe, langoustine",
    detailEn: "prawn, lobster, crab, langoustine",
    detailZh: "虾、龙虾、蟹、海螯虾",
  },
  {
    code: "oeufs",
    fr: "Œufs",
    en: "Eggs",
    zh: "蛋类",
    detailFr: null,
    detailEn: null,
    detailZh: null,
  },
  {
    code: "poissons",
    fr: "Poissons",
    en: "Fish",
    zh: "鱼类",
    detailFr: null,
    detailEn: null,
    detailZh: null,
  },
  {
    code: "arachides",
    fr: "Arachides",
    en: "Peanuts",
    zh: "花生",
    detailFr: "cacahuète",
    detailEn: "groundnuts",
    detailZh: "落花生",
  },
  {
    code: "soja",
    fr: "Soja",
    en: "Soybeans",
    zh: "大豆",
    detailFr: null,
    detailEn: null,
    detailZh: null,
  },
  {
    code: "lait",
    fr: "Lait",
    en: "Milk",
    zh: "奶类",
    detailFr: "y compris le lactose",
    detailEn: "including lactose",
    detailZh: "含乳糖",
  },
  {
    code: "fruits-a-coque",
    fr: "Fruits à coque",
    en: "Nuts",
    zh: "坚果",
    detailFr: "amande, noisette, noix, cajou, pécan, pistache, macadamia",
    detailEn: "almond, hazelnut, walnut, cashew, pecan, pistachio, macadamia",
    detailZh: "杏仁、榛子、核桃、腰果、山核桃、开心果、澳洲坚果",
  },
  {
    code: "celeri",
    fr: "Céleri",
    en: "Celery",
    zh: "芹菜",
    detailFr: null,
    detailEn: null,
    detailZh: null,
  },
  {
    code: "moutarde",
    fr: "Moutarde",
    en: "Mustard",
    zh: "芥末",
    detailFr: null,
    detailEn: null,
    detailZh: null,
  },
  {
    code: "sesame",
    fr: "Sésame",
    en: "Sesame",
    zh: "芝麻",
    detailFr: "graines de sésame",
    detailEn: "sesame seeds",
    detailZh: "芝麻籽",
  },
  {
    code: "sulfites",
    fr: "Sulfites",
    en: "Sulphites",
    zh: "亚硫酸盐",
    detailFr: "au-delà de 10 mg/kg — vin, fruits secs, certaines charcuteries",
    detailEn: "above 10 mg/kg — wine, dried fruit, some cured meats",
    detailZh: "含量超过 10 毫克/千克——葡萄酒、干果、部分腌肉制品",
  },
  {
    code: "lupin",
    fr: "Lupin",
    en: "Lupin",
    zh: "羽扇豆",
    detailFr: null,
    detailEn: null,
    detailZh: null,
  },
  {
    code: "mollusques",
    fr: "Mollusques",
    en: "Molluscs",
    zh: "软体动物",
    detailFr: "moule, huître, calamar, escargot",
    detailEn: "mussel, oyster, squid, snail",
    detailZh: "贻贝、牡蛎、鱿鱼、蜗牛",
  },
] as const;

export type Allergene = (typeof ALLERGENES)[number]["code"];

export const CODES_ALLERGENES: readonly string[] = ALLERGENES.map(
  (a) => a.code,
);

/** Écarte ce qui n'est pas un des quatorze, et ne garde qu'une occurrence. */
export function allergenesValides(bruts: unknown): Allergene[] {
  if (!Array.isArray(bruts)) return [];
  const gardes = new Set<string>();
  for (const brut of bruts) {
    if (typeof brut === "string" && CODES_ALLERGENES.includes(brut)) {
      gardes.add(brut);
    }
  }
  // Dans l'ordre de l'annexe, jamais dans l'ordre où l'on a coché : deux
  // plats aux mêmes allergènes doivent se lire pareil.
  return ALLERGENES.filter((a) => gardes.has(a.code)).map((a) => a.code);
}

export function libelleAllergene(code: string, langue: Langue): string {
  const trouve = ALLERGENES.find((a) => a.code === code);
  if (!trouve) return code;
  return langue === "en" ? trouve.en : langue === "zh" ? trouve.zh : trouve.fr;
}

/** La précision de l'annexe, dans la langue lue. Souvent absente. */
export function detailAllergene(code: string, langue: Langue): string | null {
  const trouve = ALLERGENES.find((a) => a.code === code);
  if (!trouve) return null;
  return langue === "en"
    ? trouve.detailEn
    : langue === "zh"
      ? trouve.detailZh
      : trouve.detailFr;
}

/**
 * Ce qu'on imprime sous un plat : « gluten, lait, œufs ».
 *
 * En toutes lettres, pas en numéros. Un chiffre renvoie à une légende, et
 * une légende se lit mal sur un téléphone, debout, à deux minutes de
 * commander — précisément quand la question se pose.
 */
const LOCALE: Record<Langue, string> = { fr: "fr", en: "en", zh: "zh" };

/** Le chinois n'a pas de casse, et sépare ses énumérations autrement. */
const SEPARATEUR: Record<Langue, string> = { fr: ", ", en: ", ", zh: "、" };

export function listeAllergenes(codes: string[], langue: Langue): string {
  return codes
    .map((code) =>
      libelleAllergene(code, langue).toLocaleLowerCase(LOCALE[langue]),
    )
    .join(SEPARATEUR[langue]);
}
