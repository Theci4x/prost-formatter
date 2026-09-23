"use client";

import { useActionState, useState } from "react";
import {
  programmerPost,
  type PostState,
} from "@/app/dashboard/[id]/posts/actions";
import { LIBELLE_BOUTON, LONGUEUR_MAX } from "@/lib/posts/regles";
import type { RestaurantPhoto } from "@/types/photo";
import type { Suggestion } from "@/lib/posts/suggestions";

const initial: PostState = { error: null, enregistre: false, version: 0 };

/**
 * Rédiger une publication Google.
 *
 * Le compteur de caractères n'est pas un ornement : Google refuse le post
 * entier au-delà de la limite, et le restaurateur ne l'apprendrait qu'une
 * semaine plus tard, en constatant que rien n'est paru.
 */
export function FormulairePost({
  restaurantId,
  photos,
  suggestions,
}: {
  restaurantId: string;
  photos: RestaurantPhoto[];
  /** De quoi partir : un plat de la carte, un espace à privatiser. */
  suggestions: Suggestion[];
}) {
  const [state, action, pending] = useActionState(programmerPost, initial);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {/* La clé remonte les champs à chaque enregistrement, et les vide
          avec eux : on programme cinq publications d'affilée le lundi
          matin, pas une seule — garder le texte de la précédente serait
          un piège à chaque fois. */}
      <Champs
        key={state.version}
        photos={photos}
        suggestions={suggestions}
        pending={pending}
        state={state}
      />
    </form>
  );
}

function Champs({
  photos,
  suggestions,
  pending,
  state,
}: {
  photos: RestaurantPhoto[];
  suggestions: Suggestion[];
  pending: boolean;
  state: PostState;
}) {
  const [texte, setTexte] = useState("");
  const [bouton, setBouton] = useState("");
  const [photoId, setPhotoId] = useState("");

  const trop = texte.trim().length > LONGUEUR_MAX;

  return (
    <>
      <input type="hidden" name="photo_id" value={photoId} />

      {/* La page blanche est ce qui fait abandonner : on part d'un plat de
          sa carte, dont le texte est déjà écrit, et on le retouche. C'est
          ce qu'un outil de planification générique ne peut pas faire — il
          ne connaît ni la carte ni les espaces. */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-700">Partir de…</span>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.cle}
                type="button"
                onClick={() => {
                  setTexte(suggestion.texte);
                  if (suggestion.bouton) setBouton(suggestion.bouton);
                }}
                className="rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                {suggestion.libelle}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        La publication
        <textarea
          name="texte"
          rows={4}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Notre menu d'automne arrive lundi : gibier, champignons, et la tarte aux quetsches de la maison."
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
        />
        <span
          className={`text-xs font-normal ${trop ? "text-red-600" : "text-zinc-500"}`}
        >
          {texte.trim().length} / {LONGUEUR_MAX} caractères
        </span>
      </label>

      {photos.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-700">
            Une photo{" "}
            <span className="font-normal text-zinc-400">(facultatif)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {photos.slice(0, 12).map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setPhotoId(photoId === photo.id ? "" : photo.id)}
                className={`overflow-hidden rounded-lg border-2 transition-colors ${
                  photoId === photo.id
                    ? "border-brand-navy"
                    : "border-transparent hover:border-zinc-300"
                }`}
                aria-pressed={photoId === photo.id}
              >
                {/* eslint-disable-next-line @next/next/no-img-element --
                    vignette de sélection, jamais affichée au public. */}
                <img
                  src={photo.url}
                  alt={photo.legende ?? "Photo de l'établissement"}
                  className="h-16 w-16 object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Un bouton
          <select
            name="bouton"
            value={bouton}
            onChange={(e) => setBouton(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
          >
            <option value="">Aucun</option>
            {Object.entries(LIBELLE_BOUTON).map(([cle, libelle]) => (
              <option key={cle} value={cle}>
                {libelle}
              </option>
            ))}
          </select>
        </label>

        {bouton && bouton !== "appeler" && (
          <label className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium text-zinc-700">
            Vers quelle adresse
            <input
              name="bouton_url"
              type="url"
              placeholder="https://www.klarr.net/reserver/..."
              className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Publier le
          <input
            name="publier_le"
            type="datetime-local"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || trop}
          className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Programmer"}
        </button>
        {state.error ? (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : (
          state.enregistre &&
          !pending && (
            <p className="text-sm text-emerald-700">Publication programmée.</p>
          )
        )}
      </div>
    </>
  );
}
