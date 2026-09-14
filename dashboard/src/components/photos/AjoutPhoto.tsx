"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPhoto } from "@/app/dashboard/[id]/photos/actions";

// Même plafond que côté serveur : on refuse avant d'occuper la connexion.
const TAILLE_MAX = 4 * 1024 * 1024;

/**
 * L'ajout d'une photo d'établissement. Le formulaire dit ce qui ne va pas :
 * un envoi qui échoue en silence se lit comme un bouton cassé.
 */
export function AjoutPhoto({ restaurantId }: { restaurantId: string }) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();
  const champ = useRef<HTMLInputElement>(null);

  function envoyer(donnees: FormData) {
    const fichier = donnees.get("photo") as File | null;
    if (fichier && fichier.size > TAILLE_MAX) {
      setErreur("Photo trop lourde (4 Mo maximum). Réduis-la avant de l'envoyer.");
      return;
    }
    setErreur(null);
    startTransition(async () => {
      const reponse = await uploadPhoto(donnees);
      setErreur(reponse.error);
      if (!reponse.error && champ.current) champ.current.value = "";
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
    </form>
  );
}
