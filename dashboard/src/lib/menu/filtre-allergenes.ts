import type { MenuItem } from "@/types/menu";
import { CODES_ALLERGENES } from "@/types/allergenes";

/**
 * Filtrer la carte sur les allergies du client.
 *
 * Une seule décision compte dans ce fichier, et c'est celle du plat dont
 * personne n'a déclaré la composition.
 *
 * Le ranger avec les plats compatibles serait un mensonge : rien ne dit
 * qu'il ne contient pas ce qu'on évite. Le ranger avec les plats écartés
 * en serait un autre, dans l'autre sens — on priverait quelqu'un d'un
 * plat qu'il pouvait manger, et surtout on lui ferait croire que le
 * classement est fiable. Il sort donc **à part**, nommé pour ce qu'il
 * est : une question à poser en salle.
 *
 * C'est moins net que deux colonnes. C'est le prix de l'honnêteté quand
 * la source est incomplète, et une carte en cours de déclaration l'est
 * presque toujours.
 *
 * Rien ici ne promet l'absence de traces. Une cuisine de restaurant n'est
 * pas cloisonnée, les quatorze de l'annexe II ne couvrent que les
 * ingrédients, et la page le dit à côté du résultat — pas en bas, où
 * personne ne lit.
 */

export type CarteFiltree = {
  /** Déclarés, et sans aucun des allergènes écartés. */
  compatibles: MenuItem[];
  /** Déclarés, et contenant au moins un des allergènes écartés. */
  ecartes: MenuItem[];
  /** Rien de déclaré : ni l'un ni l'autre, et il faut demander. */
  indetermines: MenuItem[];
};

/** Ce que le client a coché, nettoyé de ce qui n'est pas un des quatorze. */
export function allergiesDemandees(
  brut: string | string[] | undefined,
): string[] {
  const valeurs = Array.isArray(brut) ? brut : brut ? [brut] : [];
  // Une case par valeur, mais aussi « ?sans=gluten,lait » : l'adresse se
  // partage entre amis, et se tape parfois à la main.
  const tous = valeurs.flatMap((valeur) => valeur.split(","));
  const gardes = new Set<string>();
  for (const code of tous) {
    const propre = code.trim();
    if (CODES_ALLERGENES.includes(propre)) gardes.add(propre);
  }
  return [...gardes];
}

export function filtrerCarte(
  items: MenuItem[],
  allergies: string[],
): CarteFiltree {
  if (allergies.length === 0) {
    return { compatibles: items, ecartes: [], indetermines: [] };
  }

  const compatibles: MenuItem[] = [];
  const ecartes: MenuItem[] = [];
  const indetermines: MenuItem[] = [];

  for (const plat of items) {
    if (plat.allergenes === null) {
      indetermines.push(plat);
      continue;
    }
    const touche = allergies.some((code) => plat.allergenes?.includes(code));
    if (touche) ecartes.push(plat);
    else compatibles.push(plat);
  }

  return { compatibles, ecartes, indetermines };
}
