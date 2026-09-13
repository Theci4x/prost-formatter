"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { RestaurantPhoto } from "@/types/photo";

/**
 * Bandeau de photos en tête de la page publique. Un client qui hésite entre
 * deux adresses regarde les photos avant les créneaux : les lui cacher
 * derrière un lien, c'est le laisser partir chercher ailleurs.
 *
 * La mosaïque s'adapte au nombre de photos plutôt que d'exiger un compte
 * précis — un restaurateur qui n'en a mis qu'une doit obtenir un bandeau
 * correct, pas une grille trouée.
 */
/**
 * Une vignette cliquable. Déclarée hors du composant : définie à
 * l'intérieur, React la recréerait à chaque rendu et remonterait l'image.
 */
function Vignette({
  photo,
  index,
  nom,
  sizes,
  intitule,
  onOuvrir,
  children,
}: {
  photo: RestaurantPhoto;
  index: number;
  nom: string;
  sizes: string;
  /** Ce qu'annonce le bouton : sans lui, il ne dirait que le texte alternatif
   *  de la photo, et rien n'indiquerait qu'il ouvre la galerie. */
  intitule: string;
  onOuvrir: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOuvrir}
      aria-label={intitule}
      className="group relative block h-full w-full overflow-hidden rounded-xl bg-zinc-100"
    >
      <Image
        src={photo.url}
        alt={`${nom} — photo ${index + 1}`}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {children}
    </button>
  );
}

export function GalerieRestaurant({
  photos,
  nom,
}: {
  photos: RestaurantPhoto[];
  nom: string;
}) {
  const [ouverte, setOuverte] = useState(false);

  // Échap ferme la visionneuse, et le fond de page cesse de défiler derrière.
  useEffect(() => {
    if (!ouverte) return;
    const auClavier = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setOuverte(false);
    };
    document.addEventListener("keydown", auClavier);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", auClavier);
      document.body.style.overflow = "";
    };
  }, [ouverte]);

  if (photos.length === 0) return null;

  const [principale, ...autres] = photos;
  const cote = autres.slice(0, 2);
  const reste = photos.length - 1 - cote.length;
  const intituleGalerie =
    photos.length > 1
      ? `Voir les ${photos.length} photos de ${nom}`
      : `Agrandir la photo de ${nom}`;

  return (
    <>
      {/* Hauteur fixée explicitement : les vignettes sont en position
          absolue (next/image `fill`), elles ne poussent donc aucune hauteur
          d'elles-mêmes et la mosaïque s'écraserait en un trait. */}
      <div
        className={`grid h-56 gap-2 sm:h-[400px] ${
          cote.length === 2
            ? "sm:grid-cols-2 sm:grid-rows-2"
            : cote.length === 1
              ? "sm:grid-cols-2"
              : ""
        }`}
      >
        <div className={cote.length === 2 ? "sm:row-span-2" : ""}>
          <Vignette
            photo={principale}
            index={0}
            nom={nom}
            sizes="(max-width: 640px) 100vw, 50vw"
            intitule={intituleGalerie}
            onOuvrir={() => setOuverte(true)}
          />
        </div>

        {cote.map((photo, rang) => (
          // Les vignettes de côté disparaissent sous 640 px : à cette
          // largeur, trois images empilées repoussent les créneaux hors de
          // l'écran, et c'est pour eux qu'on est venu.
          <div key={photo.id} className="hidden sm:block">
            <Vignette
              photo={photo}
              index={rang + 1}
              nom={nom}
              sizes="25vw"
              intitule={intituleGalerie}
              onOuvrir={() => setOuverte(true)}
            >
              {rang === cote.length - 1 && reste > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-medium text-white transition-colors group-hover:bg-black/55">
                  Voir les {photos.length} photos
                </span>
              )}
            </Vignette>
          </div>
        ))}
      </div>

      {/* Sur mobile, le bouton remplace les vignettes masquées. */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={() => setOuverte(true)}
          className="w-fit text-sm font-medium text-brand-navy underline underline-offset-4 sm:hidden"
        >
          Voir les {photos.length} photos
        </button>
      )}

      {ouverte && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photos de ${nom}`}
          onClick={() => setOuverte(false)}
          // Fond opaque : à 85 % la page transparaissait derrière les
          // photos, et c'est les photos qu'on est venu regarder.
          className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950 p-4 sm:p-8"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            <div className="flex items-center justify-between gap-4 pt-1 text-white">
              <span className="font-medium">{nom}</span>
              <button
                type="button"
                onClick={() => setOuverte(false)}
                className="rounded-md border border-white/40 px-3 py-1.5 text-sm hover:bg-white/10"
              >
                Fermer
              </button>
            </div>
            <ul
              className="grid gap-3 sm:grid-cols-2"
              onClick={(evenement) => evenement.stopPropagation()}
            >
              {photos.map((photo, index) => (
                <li
                  key={photo.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-900"
                >
                  <Image
                    src={photo.url}
                    alt={`${nom} — photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
