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
 * Le code est stable et sans accent : il est écrit en base et voyagera
 * dans des URL et des exports. Le libellé, lui, peut être réécrit sans
 * migration.
 */

export const ALLERGENES = [
  {
    code: "gluten",
    fr: "Gluten",
    en: "Gluten",
    // Les précisions de l'annexe : elles évitent la question « le seigle,
    // ça compte ? » au moment de cocher.
    detailFr: "blé, seigle, orge, avoine, épeautre, kamut",
    detailEn: "wheat, rye, barley, oats, spelt, kamut",
  },
  {
    code: "crustaces",
    fr: "Crustacés",
    en: "Crustaceans",
    detailFr: "crevette, homard, crabe, langoustine",
    detailEn: "prawn, lobster, crab, langoustine",
  },
  { code: "oeufs", fr: "Œufs", en: "Eggs", detailFr: null, detailEn: null },
  {
    code: "poissons",
    fr: "Poissons",
    en: "Fish",
    detailFr: null,
    detailEn: null,
  },
  {
    code: "arachides",
    fr: "Arachides",
    en: "Peanuts",
    detailFr: "cacahuète",
    detailEn: "groundnuts",
  },
  { code: "soja", fr: "Soja", en: "Soybeans", detailFr: null, detailEn: null },
  {
    code: "lait",
    fr: "Lait",
    en: "Milk",
    detailFr: "y compris le lactose",
    detailEn: "including lactose",
  },
  {
    code: "fruits-a-coque",
    fr: "Fruits à coque",
    en: "Nuts",
    detailFr: "amande, noisette, noix, cajou, pécan, pistache, macadamia",
    detailEn: "almond, hazelnut, walnut, cashew, pecan, pistachio, macadamia",
  },
  {
    code: "celeri",
    fr: "Céleri",
    en: "Celery",
    detailFr: null,
    detailEn: null,
  },
  {
    code: "moutarde",
    fr: "Moutarde",
    en: "Mustard",
    detailFr: null,
    detailEn: null,
  },
  {
    code: "sesame",
    fr: "Sésame",
    en: "Sesame",
    detailFr: "graines de sésame",
    detailEn: "sesame seeds",
  },
  {
    code: "sulfites",
    fr: "Sulfites",
    en: "Sulphites",
    detailFr: "au-delà de 10 mg/kg — vin, fruits secs, certaines charcuteries",
    detailEn: "above 10 mg/kg — wine, dried fruit, some cured meats",
  },
  { code: "lupin", fr: "Lupin", en: "Lupin", detailFr: null, detailEn: null },
  {
    code: "mollusques",
    fr: "Mollusques",
    en: "Molluscs",
    detailFr: "moule, huître, calamar, escargot",
    detailEn: "mussel, oyster, squid, snail",
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

export function libelleAllergene(code: string, anglais: boolean): string {
  const trouve = ALLERGENES.find((a) => a.code === code);
  if (!trouve) return code;
  return anglais ? trouve.en : trouve.fr;
}

/**
 * Ce qu'on imprime sous un plat : « gluten, lait, œufs ».
 *
 * En toutes lettres, pas en numéros. Un chiffre renvoie à une légende, et
 * une légende se lit mal sur un téléphone, debout, à deux minutes de
 * commander — précisément quand la question se pose.
 */
export function listeAllergenes(codes: string[], anglais: boolean): string {
  return codes
    .map((code) =>
      libelleAllergene(code, anglais).toLocaleLowerCase(anglais ? "en" : "fr"),
    )
    .join(", ");
}
