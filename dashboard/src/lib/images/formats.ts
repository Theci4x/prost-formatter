import type { Options } from "@/lib/images/preparer";

/**
 * Les seuils d'image, par usage — et chacun est déduit de la taille à
 * laquelle la photo s'affiche vraiment, pas choisi au jugé.
 *
 * Chacun en porte deux. `conseilCote` est la taille qui rend l'image
 * nette partout : l'affichage en pixels CSS multiplié par trois, pour
 * les écrans qui en mettent trois par pixel. `minCote` est le seuil en
 * dessous duquel il n'y a plus d'image du tout.
 *
 * Les deux existent parce qu'un seuil unique calé sur l'idéal refusait
 * la plupart des photos réelles. Entre les deux, on accepte et on
 * prévient : c'est au restaurateur de juger si sa photo de 600 px fait
 * l'affaire, pas à nous de lui refuser vingt fichiers d'affilée.
 *
 * **Le logo n'est pas ici, et c'est volontaire.** Il porte souvent de la
 * transparence, et le réencodage en JPEG lui collerait un fond noir.
 * Une image de marque se remplace à la main quand elle ne va pas ; une
 * photo de plat, non.
 */

/**
 * La photo d'un plat, sur la carte publique en grille.
 *
 * L'idéal se calcule : une colonne fait toute la largeur d'un téléphone,
 * soit environ 1070 pixels réels à trois points par pixel, et le cadre
 * est en 4/3 — il faudrait donc 800 px sur le petit côté pour n'agrandir
 * jamais. Mais la plupart des écrans sont à deux points par pixel, où
 * 540 suffisent, et un agrandissement d'un tiers ne se voit pas sur un
 * téléphone tenu à bout de bras.
 *
 * D'où le conseil à 700 et le refus à 450 seulement. 700 parce qu'une
 * photo de 768 px de haut — la moitié de ce qui traîne sur le web est en
 * 1024×768 — est agrandie de 5 % au pire, ce que personne ne voit :
 * l'avertir serait crier au loup. En dessous de 450, en revanche, il n'y
 * a plus assez de pixels pour faire une image, quel que soit l'écran.
 */
export const PLAT: Options = { minCote: 450, conseilCote: 700, maxCote: 1600 };

/** Une photo d'espace : 240 px CSS dans la bande de la page publique. */
export const ESPACE: Options = {
  minCote: 400,
  conseilCote: 700,
  maxCote: 1600,
};

/**
 * La galerie de l'établissement : la plus exigeante des trois. La photo
 * de tête occupe toute la largeur sur téléphone et 400 px de haut, et
 * s'ouvre en plein écran au clic. C'est ici qu'une image trop petite se
 * voit le plus — mais on prévient plutôt que de refuser, là aussi.
 */
export const GALERIE: Options = {
  minCote: 500,
  conseilCote: 1000,
  maxCote: 2000,
};

/** Le refus, qui dit toujours les dimensions trouvées. */
export function messageTropPetite(
  largeur: number | undefined,
  hauteur: number | undefined,
  minCote: number,
): string {
  const mesure = largeur && hauteur ? ` : ${largeur} × ${hauteur} px` : "";
  return `Image vraiment trop petite${mesure}. Il en faut au moins ${minCote} px sur le plus petit côté, sinon il n'y a pas d'image.`;
}

/**
 * L'avertissement, qui n'empêche rien.
 *
 * Il dit ce qu'on a accepté et ce qui serait mieux. Le restaurateur
 * décide : sa photo de 600 px fera l'affaire aujourd'hui, et il sait
 * quoi demander à son photographe la prochaine fois.
 */
export function messageJuste(
  largeur: number,
  hauteur: number,
  conseilCote: number,
): string {
  return `Enregistrée (${largeur} × ${hauteur} px), mais un peu juste : à partir de ${conseilCote} px de côté elle sera nette sur tous les écrans.`;
}
