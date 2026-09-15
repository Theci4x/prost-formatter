import Image from "next/image";
import type { RestaurantPhoto } from "@/types/photo";

/**
 * Les photos d'un espace, en bande défilante.
 *
 * Horizontale et non empilée : sur un téléphone, une colonne de grandes
 * images repousse le bouton de réservation hors de l'écran, et c'est pour
 * lui qu'on est venu.
 *
 * Partagée par la page de réservation et la vitrine : deux copies de ce
 * bloc finiraient par diverger sur la taille ou le texte alternatif.
 */
export function BandePhotos({
  photos,
  espaceNom,
  restaurantNom,
  hauteur = "h-28 w-40",
}: {
  photos: RestaurantPhoto[];
  espaceNom: string;
  restaurantNom: string;
  /** Les classes de taille, la vitrine montrant de plus grandes vignettes. */
  hauteur?: string;
}) {
  if (photos.length === 0) return null;
  return (
    <ul className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
      {photos.map((photo) => (
        <li key={photo.id} className="shrink-0">
          <div
            className={`relative overflow-hidden rounded-lg border border-zinc-200 ${hauteur}`}
          >
            <Image
              src={photo.url}
              // La légende du restaurateur fait un meilleur texte alternatif
              // que le nom de la salle répété : elle dit ce qu'on voit.
              alt={photo.legende ?? `${espaceNom} — ${restaurantNom}`}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
          {photo.legende && (
            <p className="mt-1 max-w-40 text-xs text-zinc-500">
              {photo.legende}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
