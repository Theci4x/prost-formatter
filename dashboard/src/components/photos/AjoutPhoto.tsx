"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPhoto } from "@/app/dashboard/[id]/photos/actions";
import { GALERIE, messageTropPetite } from "@/lib/images/formats";
import { poidsLisible, preparerPhoto } from "@/lib/images/preparer";

// Même plafond que côté serveur : on refuse avant d'occuper la connexion.
// Il ne sert plus qu'au cas où le navigateur n'a pas su réencoder.
const TAILLE_MAX = 4 * 1024 * 1024;

/**
 * L'ajout d'une photo d'établissement. Le formulaire dit ce qui ne va pas :
 * un envoi qui échoue en silence se lit comme un bouton cassé.
 *
 * C'est la galerie qui exige le plus : la photo de tête occupe toute la
 * largeur d'un téléphone et s'ouvre en plein écran au clic. Une image
 * trop petite y est refusée avec ses dimensions plutôt qu'acceptée puis
 * affichée floue ; une photo de téléphone est réduite avant l'envoi, ce
 * qui supprime au passage le refus à 4 Mo qui obligeait le restaurateur
 * à aller la redimensionner ailleurs.
 */
export function AjoutPhoto({ restaurantId }: { restaurantId: string }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const champ = useRef<HTMLInputElement>(null);

  function envoyer(donnees: FormData) {
    const choisi = donnees.get("photo") as File | null;
    setErreur(null);
    setNote(null);
    startTransition(async () => {
      if (!choisi || choisi.size === 0) {
        setErreur("Choisis une photo.");
        return;
      }

      const prete = await preparerPhoto(choisi, GALERIE);
      if (!prete.ok) {
        setErreur(
          prete.motif === "trop-petite"
            ? messageTropPetite(prete.largeur, prete.hauteur, GALERIE.minCote)
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

      // La légende saisie à côté voyage avec : on remplace la photo dans
      // le formulaire plutôt que d'en refabriquer un.
      donnees.set("photo", prete.fichier);
      const reponse = await uploadPhoto(donnees);
      setErreur(reponse.error);
      if (!reponse.error) {
        if (prete.retravaillee) {
          setNote(
            `Réduite à ${prete.largeur} × ${prete.hauteur} px (${poidsLisible(prete.fichier.size)}).`,
          );
        }
        if (champ.current) champ.current.value = "";
      }
    });
  }

  return (
    <form
      action={envoyer}
      className="flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input
        ref={champ}
        type="file"
        name="photo"
        accept="image/*"
        required
        className="flex-1 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
      />
      {/* La légende s'écrit pendant qu'on regarde la photo qu'on envoie :
          la réclamer plus tard, c'est ne jamais l'obtenir. */}
      <label className="sr-only" htmlFor="legende-etablissement">
        Légende de la photo
      </label>
      <input
        id="legende-etablissement"
        name="legende"
        maxLength={80}
        placeholder="Légende (facultatif)"
        className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
      />
      <button
        type="submit"
        disabled={enCours}
        className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {enCours ? "Envoi…" : "Ajouter"}
      </button>

      {erreur && (
        <p className="w-full text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}
      {!erreur && note && (
        <p className="w-full text-sm text-zinc-500">{note}</p>
      )}
    </form>
  );
}
