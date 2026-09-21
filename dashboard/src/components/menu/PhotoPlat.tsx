"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import {
  envoyerPhotoPlat,
  retirerPhotoPlat,
} from "@/app/dashboard/[id]/menu/actions";
import { poidsLisible, preparerPhoto } from "@/lib/images/preparer";
import { PLAT, messageJuste, messageTropPetite } from "@/lib/images/formats";

// Même plafond que côté serveur : on refuse avant d'occuper la connexion.
// Il ne sert plus qu'au cas où le navigateur n'a pas su réencoder.
const TAILLE_MAX = 4 * 1024 * 1024;

/**
 * La photo d'un plat. Une seule, remplacée à chaque envoi : sur une carte on
 * montre l'assiette, on ne la fait pas défiler.
 *
 * Le fichier choisi ne part pas tel quel. Il est ouvert et mesuré dans le
 * navigateur : une image trop petite est refusée avec ses dimensions,
 * une image trop grande est réduite avant l'envoi. Les deux échecs
 * existaient, et le second était muet — une vignette de 250 pixels
 * récupérée sur le web passait tous les contrôles et ressortait floue sur
 * la carte, sans que rien ne l'ait dit.
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
  const [note, setNote] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const champ = useRef<HTMLInputElement>(null);

  function envoyer(choisi: File) {
    setErreur(null);
    setNote(null);
    startTransition(async () => {
      const vider = () => {
        if (champ.current) champ.current.value = "";
      };

      const prete = await preparerPhoto(choisi, PLAT);

      if (!prete.ok) {
        // On donne les dimensions trouvées. « Trop petite » sans chiffre
        // fait réessayer trois fois le même fichier.
        setErreur(
          prete.motif === "trop-petite"
            ? messageTropPetite(prete.largeur, prete.hauteur, PLAT.minCote)
            : "Ce fichier ne s'ouvre pas comme une image.",
        );
        vider();
        return;
      }

      if (prete.fichier.size > TAILLE_MAX) {
        setErreur("Photo trop lourde (4 Mo maximum).");
        vider();
        return;
      }

      const donnees = new FormData();
      donnees.set("restaurant_id", restaurantId);
      donnees.set("id", platId);
      donnees.set("photo", prete.fichier);

      const reponse = await envoyerPhotoPlat(donnees);
      setErreur(reponse.error);
      if (!reponse.error) {
        // La photo est enregistrée dans les deux cas. L'avertissement
        // passe avant la note de réduction : savoir qu'elle sera un peu
        // molle est plus utile que savoir qu'elle pesait 3 Mo.
        setNote(
          prete.juste
            ? messageJuste(prete.largeur, prete.hauteur, PLAT.conseilCote)
            : prete.retravaillee
              ? `Réduite à ${prete.largeur} × ${prete.hauteur} px (${poidsLisible(prete.fichier.size)}).`
              : null,
        );
      }
      // Le champ est vidé dans tous les cas : le garder rempli laisse croire
      // qu'il reste quelque chose à envoyer.
      vider();
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
        title={
          photoUrl
            ? `Remplacer la photo de ${nom}`
            : `Ajouter une photo à ${nom}`
        }
        className={`relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-center text-[10px] font-medium leading-tight text-zinc-500 transition-colors hover:border-brand-navy hover:bg-brand-orange-soft hover:text-brand-navy ${
          enCours ? "opacity-50" : ""
        }`}
      >
        <span className="sr-only">
          {photoUrl
            ? `Remplacer la photo de ${nom}`
            : `Ajouter une photo à ${nom}`}
        </span>
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
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
      {!erreur && note && (
        <span className="max-w-[14rem] text-[10px] leading-snug text-zinc-500">
          {note}
        </span>
      )}
    </span>
  );
}
