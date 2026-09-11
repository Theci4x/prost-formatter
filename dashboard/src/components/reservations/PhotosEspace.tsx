import Image from "next/image";
import {
  removePhoto,
  uploadPhoto,
} from "@/app/dashboard/[id]/photos/actions";
import type { RestaurantPhoto } from "@/types/photo";

/**
 * Galerie d'un espace réservable, côté restaurateur. Réutilise le stockage
 * et les règles de sécurité déjà en place pour les photos d'établissement :
 * seul le chemin change, la photo portant en plus l'identifiant de l'espace.
 */
export function PhotosEspace({
  restaurantId,
  espaceId,
  photos,
}: {
  restaurantId: string;
  espaceId: string;
  photos: RestaurantPhoto[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <li key={photo.id} className="flex flex-col items-center gap-1">
              <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-zinc-200">
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <form action={removePhoto}>
                <input type="hidden" name="id" value={photo.id} />
                <input type="hidden" name="restaurant_id" value={restaurantId} />
                <input
                  type="hidden"
                  name="storage_path"
                  value={photo.storage_path}
                />
                <button
                  type="submit"
                  className="text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={uploadPhoto} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="espace_id" value={espaceId} />
        <label
          className="text-sm text-zinc-600"
          htmlFor={`photo-${espaceId}`}
        >
          <span className="sr-only">Photo de cet espace</span>
          <input
            id={`photo-${espaceId}`}
            type="file"
            name="photo"
            accept="image/*"
            required
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          Ajouter la photo
        </button>
      </form>
    </div>
  );
}
