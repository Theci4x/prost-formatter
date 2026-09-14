"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  envoyerPhotoPlat,
  retirerPhotoPlat,
} from "@/app/dashboard/[id]/menu/actions";

// Même plafond que côté serveur : on refuse avant d'occuper la connexion.
const TAILLE_MAX = 4 * 1024 * 1024;

/**
 * La photo d'un plat. Une seule, remplacée à chaque envoi : sur une carte on
 * montre l'assiette, on ne la fait pas défiler.
 */
export function PhotoPlat({
  restaurantId,
  platId,
  nom,
  photoUrl,
}: {
  restaurantId: string;
  platId: string;
  nom: string;
  photoUrl: string | null;
}) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const champ = useRef<HTMLInputElement>(null);

  function envoyer(fichier: File) {
    if (fichier.size > TAILLE_MAX) {
      setErreur("Photo trop lourde (4 Mo maximum).");
      if (champ.current) champ.current.value = "";
      return;
    }
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    donnees.set("id", platId);
    donnees.set("photo", fichier);
    setErreur(null);
    startTransition(async () => {
      const reponse = await envoyerPhotoPlat(donnees);
      setErreur(reponse.error);
      // Le champ est vidé dans tous les cas : le garder rempli laisse croire
      // qu'il reste quelque chose à envoyer.
      if (champ.current) champ.current.value = "";
    });
  }

  function retirer() {
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    donnees.set("id", platId);
    startTransition(async () => {
      await retirerPhotoPlat(donnees);
    });
  }

  return (
    <span className="flex flex-col items-center gap-1">
      {/* Un pointillé gris pâle portant le mot « Photo » se lit comme un
          emplacement vide, pas comme un bouton : le restaurateur qui avait
          demandé la fonctionnalité ne l'a pas trouvée à l'écran. Le « + » et
          le trait plus marqué disent qu'il y a quelque chose à faire ici. */}
      <label
        title={photoUrl ? `Remplacer la photo de ${nom}` : `Ajouter une photo à ${nom}`}
        className={`relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-center text-[10px] font-medium leading-tight text-zinc-500 transition-colors hover:border-brand-navy hover:bg-brand-orange-soft hover:text-brand-navy ${
          enCours ? "opacity-50" : ""
        }`}
      >
        <span className="sr-only">
          {photoUrl ? `Remplacer la photo de ${nom}` : `Ajouter une photo à ${nom}`}
        </span>
        {photoUrl ? (
          <Image src={photoUrl} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <>
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            <span aria-hidden="true">Photo</span>
          </>
        )}
        <input
          ref={champ}
          type="file"
          accept="image/*"
          disabled={enCours}
          className="sr-only"
          onChange={(event) => {
            const fichier = event.target.files?.[0];
            if (fichier) envoyer(fichier);
          }}
        />
      </label>

      {photoUrl && (
        <button
          type="button"
          onClick={retirer}
          disabled={enCours}
          className="text-[10px] text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-50"
        >
          Retirer
        </button>
      )}
      {erreur && (
        <span className="max-w-[12rem] text-[10px] text-red-600">{erreur}</span>
      )}
    </span>
  );
}
