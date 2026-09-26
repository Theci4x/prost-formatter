import type { Options } from "@/lib/images/preparer";
import type { Langue } from "@/lib/i18n/langue";

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

/**
 * Le refus et l'avertissement, dans la langue du lecteur.
 *
 * Ils vivent ici plutôt que dans le dictionnaire d'un écran : les trois
 * envois de photos — la carte, la galerie, les espaces — disent la même
 * chose avec des seuils différents, et trois copies d'une même phrase
 * finiraient par se contredire.
 */
// La mesure est construite par chaque langue, pas passée toute faite :
// « : 275 × 183 px » au milieu d'une phrase chinoise garde une espace et
// un deux-points français, ce qui se voit immédiatement.
const REFUS: Record<
  Langue,
  (
    largeur: number | undefined,
    hauteur: number | undefined,
    min: number,
  ) => string
> = {
  fr: (l, h, min) =>
    `Image vraiment trop petite${l && h ? ` : ${l} × ${h} px` : ""}. Il en faut au moins ${min} px sur le plus petit côté, sinon il n'y a pas d'image.`,
  en: (l, h, min) =>
    `That image is far too small${l && h ? ` (${l} × ${h} px)` : ""}. It needs at least ${min} px on its shorter side, otherwise there is no image.`,
  zh: (l, h, min) =>
    `图片实在太小${l && h ? `（${l} × ${h} 像素）` : ""}。短边至少要有 ${min} 像素，否则根本成不了图。`,
};

const JUSTE: Record<
  Langue,
  (largeur: number, hauteur: number, conseil: number) => string
> = {
  fr: (l, h, conseil) =>
    `Enregistrée (${l} × ${h} px), mais un peu juste : à partir de ${conseil} px de côté elle sera nette sur tous les écrans.`,
  en: (l, h, conseil) =>
    `Saved (${l} × ${h} px), but a little tight: from ${conseil} px a side it will be sharp on every screen.`,
  zh: (l, h, conseil) =>
    `已保存（${l} × ${h} 像素），但略微偏小：短边达到 ${conseil} 像素后，在各种屏幕上都会很清晰。`,
};

/** Le refus, qui dit toujours les dimensions trouvées. */
export function messageTropPetite(
  largeur: number | undefined,
  hauteur: number | undefined,
  minCote: number,
  langue: Langue = "fr",
): string {
  return (REFUS[langue] ?? REFUS.fr)(largeur, hauteur, minCote);
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
  langue: Langue = "fr",
): string {
  return (JUSTE[langue] ?? JUSTE.fr)(largeur, hauteur, conseilCote);
}
