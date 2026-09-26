import type { RestaurantPhoto } from "@/types/photo";

/**
 * La photo qui ouvre le site d'un restaurant.
 *
 * Celle que le restaurateur a désignée ; sinon la première de
 * l'établissement ; sinon la première tout court, fût-elle celle d'une
 * salle privatisable. Depuis que la page s'ouvre sur une photo en plein
 * écran, un bandeau vide se voit — et une maison qui n'a photographié que
 * ses salles en a pourtant de très bonnes à montrer.
 *
 * `choisie` distingue le choix du défaut : le tableau de bord s'en sert
 * pour dire « c'est la première de tes photos, tu peux en préférer une
 * autre » ; le site public n'en a que faire.
 */
export function couvertureDe(
  photos: RestaurantPhoto[],
  couvertureId: string | null | undefined,
): { photo: RestaurantPhoto | null; choisie: boolean } {
  const choisie = couvertureId
    ? (photos.find((photo) => photo.id === couvertureId) ?? null)
    : null;
  if (choisie) return { photo: choisie, choisie: true };
  const defaut =
    photos.find((photo) => !photo.espace_id) ?? photos[0] ?? null;
  return { photo: defaut, choisie: false };
}
