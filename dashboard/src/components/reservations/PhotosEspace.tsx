"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { removePhoto, uploadPhoto } from "@/app/dashboard/[id]/photos/actions";
import type { RestaurantPhoto } from "@/types/photo";
import { LegendePhoto } from "@/components/photos/LegendePhoto";
import { ESPACE, messageTropPetite } from "@/lib/images/formats";
import { preparerPhoto } from "@/lib/images/preparer";

// Même plafond que côté serveur : on refuse avant d'occuper la connexion.
// Il ne sert plus qu'au cas où le navigateur n'a pas su réencoder.
const TAILLE_MAX = 4 * 1024 * 1024;

/**
 * Galerie d'un espace réservable, côté restaurateur. Réutilise le stockage
 * et les règles de sécurité déjà en place pour les photos d'établissement :
 * seul le chemin change, la photo portant en plus l'identifiant de l'espace.
 *
 * Le plancher y est plus bas que dans la galerie de l'établissement :
 * une photo de salle s'affiche dans une bande de 240 px, pas en pleine
 * largeur. Il reste nettement au-dessus de la vignette récupérée sur le
 * web, qui est le cas qu'on veut arrêter.
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
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const champ = useRef<HTMLInputElement>(null);

  function envoyer(donnees: FormData) {
    const choisi = donnees.get("photo") as File | null;
    setErreur(null);
    startTransition(async () => {
      if (!choisi || choisi.size === 0) {
        setErreur("Choisis une photo.");
        return;
      }

      const prete = await preparerPhoto(choisi, ESPACE);
      if (!prete.ok) {
        setErreur(
          prete.motif === "trop-petite"
            ? messageTropPetite(prete.largeur, prete.hauteur, ESPACE.minCote)
            : "Ce fichier ne s'ouvre pas comme une image.",
        );
        return;
      }
      if (prete.fichier.size > TAILLE_MAX) {
        setErreur(
          "Photo trop lourde (4 Mo maximum). Réduis-la avant de l'envoyer.",
        );
        return;
      }

      donnees.set("photo", prete.fichier);
      const reponse = await uploadPhoto(donnees);
      setErreur(reponse.error);
      if (!reponse.error && champ.current) champ.current.value = "";
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="flex w-32 flex-col items-center gap-1"
            >
              <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-zinc-200">
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <LegendePhoto
                photoId={photo.id}
                restaurantId={restaurantId}
                legende={photo.legende ?? null}
              />
              <form action={removePhoto}>
                <input type="hidden" name="id" value={photo.id} />
                <input
                  type="hidden"
                  name="restaurant_id"
                  value={restaurantId}
                />
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

      <form action={envoyer} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="espace_id" value={espaceId} />
        <label className="text-sm text-zinc-600" htmlFor={`photo-${espaceId}`}>
          <span className="sr-only">Photo de cet espace</span>
          <input
            ref={champ}
            id={`photo-${espaceId}`}
            type="file"
            name="photo"
            accept="image/*"
            required
            className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </label>
        {/* La légende s'écrit au moment où l'on choisit la photo : c'est
            là qu'on sait ce qu'elle montre. Facultative, et modifiable
            ensuite sous la vignette. */}
        <label
          className="text-sm text-zinc-600"
          htmlFor={`legende-ajout-${espaceId}`}
        >
          <span className="sr-only">Légende de la photo</span>
          <input
            id={`legende-ajout-${espaceId}`}
            name="legende"
            maxLength={80}
            placeholder="Légende (facultatif)"
            className="w-56 rounded-md border border-zinc-300 px-3 py-1.5 text-sm outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          disabled={enCours}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
        >
          {enCours ? "Envoi…" : "Ajouter la photo"}
        </button>

        {erreur && (
          <p className="w-full text-sm text-red-600" role="alert">
            {erreur}
          </p>
        )}
      </form>
    </div>
  );
}
