"use client";

import { useState, useTransition } from "react";
import { legenderPhoto } from "@/app/dashboard/[id]/photos/actions";
import type { Langue } from "@/lib/i18n/langues";
import { traducteur } from "@/lib/i18n/t";
import { PHOTOS } from "@/lib/i18n/pages/photos";

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
  placeholder,
  langue = "fr",
}: {
  photoId: string;
  restaurantId: string;
  legende: string | null;
  placeholder?: string;
  langue?: Langue;
}) {
  const t = traducteur(langue, PHOTOS);
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
    <form action={envoyer} className="flex w-full min-w-0 items-center gap-2">
      <input type="hidden" name="id" value={photoId} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <label className="sr-only" htmlFor={`legende-${photoId}`}>
        {t("Légende de cette photo")}
      </label>
      <input
        id={`legende-${photoId}`}
        name="legende"
        defaultValue={legende ?? ""}
        placeholder={placeholder ?? t("Salle speakeasy, au sous-sol")}
        maxLength={80}
        onChange={() => setEnregistre(false)}
        className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
      />
      <button
        type="submit"
        disabled={enCours}
        className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
          enregistre
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-zinc-200 text-zinc-600 hover:border-brand-navy hover:text-brand-navy"
        }`}
      >
        {enCours ? "…" : enregistre ? t("Enregistré") : "OK"}
      </button>
    </form>
  );
}
