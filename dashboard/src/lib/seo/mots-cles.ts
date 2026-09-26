import { SEO } from "@/lib/i18n/seo";
import type { Langue } from "@/lib/i18n/langues";

/**
 * Ce qui a changé dans les mots-clés depuis la dernière analyse.
 *
 * C'est la seule raison honnête de proposer une relance. Chaque analyse
 * est un appel payé à un modèle : « relancer parce que c'est possible »
 * fait dépenser, « deux mots-clés ajoutés depuis » fait décider.
 *
 * Rien n'a bougé, on ne dit rien — une phrase affichée à chaque visite
 * cesse d'être lue au bout de trois.
 *
 * L'ordre ne compte pas : ce sont des mots-clés, pas une liste ordonnée.
 * Les doublons non plus, et la base n'en produit pas.
 */
export function ceQuiABouge(
  avant: string[],
  maintenant: string[],
  langue: Langue = "fr",
): string | null {
  const ajoutes = maintenant.filter((m) => !avant.includes(m)).length;
  const retires = avant.filter((m) => !maintenant.includes(m)).length;
  if (!ajoutes && !retires) return null;
  return SEO[langue].bouge(ajoutes, retires);
}
