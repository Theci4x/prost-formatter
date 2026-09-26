/**
 * La mise en page des outils gratuits sur grand écran.
 *
 * Ils tenaient dans une colonne de 768 px au milieu d'un écran de 1 900 :
 * un formulaire tout en longueur, et deux bandes vides de chaque côté.
 * L'outil occupe maintenant la colonne principale, et ce qui l'accompagne
 * — mises en garde, outil suivant — tient à côté, au lieu d'attendre en
 * bas de page. Sur un téléphone, rien ne change : tout s'empile dans le
 * même ordre qu'avant.
 */

/** La largeur de la page, celle de l'accueil. */
export const PAGE_OUTIL =
  "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-12";

/** Un paragraphe garde une largeur de lecture, même sur un grand écran. */
export const LECTURE = "max-w-3xl";

export const COLONNES =
  "grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start";
export const PRINCIPALE = "flex min-w-0 flex-col gap-8";
export const COTE = "flex min-w-0 flex-col gap-6 lg:sticky lg:top-6";
