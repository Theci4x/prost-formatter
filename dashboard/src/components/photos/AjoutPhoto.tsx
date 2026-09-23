"use client";

import { useRef, useState, useTransition } from "react";
import { uploadPhoto } from "@/app/dashboard/[id]/photos/actions";
import { GALERIE, messageJuste, messageTropPetite } from "@/lib/images/formats";
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
  // Le nom du fichier choisi, affiché dans la zone : sans lui, rien ne
  // dit que le choix a été pris en compte.
  const [choisi, setChoisi] = useState<string | null>(null);

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
        setNote(
          prete.juste
            ? messageJuste(prete.largeur, prete.hauteur, GALERIE.conseilCote)
            : prete.retravaillee
              ? `Réduite à ${prete.largeur} × ${prete.hauteur} px (${poidsLisible(prete.fichier.size)}).`
              : null,
        );
        if (champ.current) champ.current.value = "";
        setChoisi(null);
      }
    });
  }

  return (
    <form
      action={envoyer}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-6"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {/* Toute la zone est le champ : on y clique, ou on y dépose une
          photo depuis le bureau — le champ transparent posé dessus reçoit
          le dépôt nativement, sans une ligne de glisser-déposer à tenir. */}
      <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-brand-cream/60 px-6 py-10 text-center transition-colors hover:border-brand-orange hover:bg-brand-orange-soft/60">
        <input
          ref={champ}
          type="file"
          name="photo"
          accept="image/*"
          required
          onChange={(e) => setChoisi(e.target.files?.[0]?.name ?? null)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-orange-dark shadow-sm">
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 16V4m0 0-4 4m4-4 4 4" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-ink">
          {choisi ?? "Choisir une photo, ou la déposer ici"}
        </span>
        <span className="text-xs text-zinc-500">
          {choisi
            ? "Ajoute une légende si tu veux, puis « Ajouter la photo »."
            : "Une photo de téléphone est réduite toute seule avant l'envoi."}
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        {/* La légende s'écrit pendant qu'on regarde la photo qu'on envoie :
            la réclamer plus tard, c'est ne jamais l'obtenir. */}
        <label className="sr-only" htmlFor="legende-etablissement">
          Légende de la photo
        </label>
        <input
          id="legende-etablissement"
          name="legende"
          maxLength={80}
          placeholder="Légende (facultatif) — « La terrasse, l'été »"
          className="min-w-0 flex-1 basis-64 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
        />
        <button
          type="submit"
          disabled={enCours}
          className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {enCours ? "Envoi…" : "Ajouter la photo"}
        </button>
      </div>

      {erreur && (
        <p className="text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}
      {!erreur && note && <p className="text-sm text-zinc-500">{note}</p>}
    </form>
  );
}
