"use client";

import { useState, useTransition } from "react";
import { legenderPhoto } from "@/app/dashboard/[id]/photos/actions";

/**
 * La légende d'une photo, modifiable sous la vignette.
 *
 * Elle se confirme à l'écran : sans retour, un champ qu'on remplit et qui
 * reste identique se lit comme un champ qui n'a rien enregistré, et le
 * restaurateur réappuie trois fois.
 */
export function LegendePhoto({
  photoId,
  restaurantId,
  legende,
  placeholder = "Salle speakeasy, au sous-sol",
}: {
  photoId: string;
  restaurantId: string;
  legende: string | null;
  placeholder?: string;
}) {
  const [enCours, startTransition] = useTransition();
  const [enregistre, setEnregistre] = useState(false);

  function envoyer(donnees: FormData) {
    setEnregistre(false);
    startTransition(async () => {
      await legenderPhoto(donnees);
      setEnregistre(true);
    });
  }

  return (
    <form action={envoyer} className="flex w-full min-w-0 flex-col gap-1">
      <input type="hidden" name="id" value={photoId} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <label className="sr-only" htmlFor={`legende-${photoId}`}>
        Légende de cette photo
      </label>
      <input
        id={`legende-${photoId}`}
        name="legende"
        defaultValue={legende ?? ""}
        placeholder={placeholder}
        maxLength={80}
        onChange={() => setEnregistre(false)}
        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-brand-navy"
      />
      <button
        type="submit"
        disabled={enCours}
        className="text-xs font-medium text-zinc-500 hover:text-brand-navy disabled:opacity-50"
      >
        {enCours ? "…" : enregistre ? "Enregistré" : "Enregistrer la légende"}
      </button>
    </form>
  );
}
