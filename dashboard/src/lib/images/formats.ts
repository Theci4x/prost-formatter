import type { Options } from "@/lib/images/preparer";

/**
 * Les seuils d'image, par usage — et chacun est déduit de la taille à
 * laquelle la photo s'affiche vraiment, pas choisi au jugé.
 *
 * Le calcul est le même partout : on prend la plus grande taille
 * d'affichage en pixels CSS, on multiplie par trois (un téléphone récent
 * affiche trois points par pixel CSS), et on garde un peu de marge pour
 * le jour où l'écran change. En dessous, le navigateur agrandit, et une
 * image agrandie est floue — sans que rien ne l'annonce, puisqu'elle
 * s'enregistre très bien.
 *
 * **Le logo n'est pas ici, et c'est volontaire.** Il porte souvent de la
 * transparence, et le réencodage en JPEG lui collerait un fond noir.
 * Une image de marque se remplace à la main quand elle ne va pas ; une
 * photo de plat, non.
 */

/**
 * La photo d'un plat. Elle occupait 96 px de côté ; depuis que la carte
 * publique est une grille de cartes, elle fait toute la largeur d'une
 * colonne en 4/3 — donc jusqu'à environ 1200 pixels réels sur un
 * téléphone. Le plancher monte en conséquence : une photo tout juste
 * acceptable en vignette est franchement floue en grand.
 */
export const PLAT: Options = { minCote: 800, maxCote: 1600 };

/** Une photo d'espace : 240 px CSS dans la bande de la page publique. */
export const ESPACE: Options = { minCote: 500, maxCote: 1600 };

/**
 * La galerie de l'établissement : la plus exigeante des trois. La photo
 * de tête occupe toute la largeur sur téléphone et 400 px de haut, et
 * s'ouvre en plein écran au clic. C'est ici qu'une image trop petite se
 * voit le plus, et ici qu'on refuse le plus tôt.
 */
export const GALERIE: Options = { minCote: 800, maxCote: 2000 };

/** Le message de refus, qui dit toujours les dimensions trouvées. */
export function messageTropPetite(
  largeur: number | undefined,
  hauteur: number | undefined,
  minCote: number,
): string {
  const mesure = largeur && hauteur ? ` : ${largeur} × ${hauteur} px` : "";
  return `Image trop petite${mesure}. Il en faut au moins ${minCote} px sur le plus petit côté, sinon elle sort floue une fois affichée.`;
}
