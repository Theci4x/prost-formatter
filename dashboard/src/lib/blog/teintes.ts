/**
 * La teinte d'un billet, tirée de son slug.
 *
 * Faute de photothèque, chaque article a une couleur plutôt qu'une photo.
 * Tirée du slug, elle est stable dans le temps — un article ne change pas
 * de couleur au prochain déploiement — et différente d'un article à
 * l'autre sans qu'on ait à la choisir à la main à chaque publication.
 */
export type Teinte = { fond: string; trait: string };

const TEINTES: Teinte[] = [
  { fond: "#0f1e3d", trait: "#E8871E" },
  { fond: "#1c3b2e", trait: "#E8A81E" },
  { fond: "#3d1f2b", trait: "#E8871E" },
  { fond: "#23304a", trait: "#7FB3B8" },
  { fond: "#33281c", trait: "#E8B04B" },
];

export function teinteBillet(slug: string): Teinte {
  let somme = 0;
  for (const caractere of slug) somme += caractere.charCodeAt(0);
  return TEINTES[somme % TEINTES.length];
}
