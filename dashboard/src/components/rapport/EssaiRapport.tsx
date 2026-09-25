"use client";

import { useActionState } from "react";
import {
  envoyerRapportEssai,
  type EssaiState,
} from "@/app/dashboard/[id]/rapport/actions";
import type { Langue } from "@/lib/i18n/langues";
import { traducteur } from "@/lib/i18n/t";
import { RAPPORT } from "@/lib/i18n/pages/rapport";

const initial: EssaiState = { message: null, erreur: null };

export function EssaiRapport({
  restaurantId,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
}) {
  const t = traducteur(langue, RAPPORT);
  const [state, action, pending] = useActionState(envoyerRapportEssai, initial);
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
      >
        {pending ? t("Envoi…") : t("M'envoyer ce bilan maintenant")}
      </button>
      {state.message && (
        <p className="text-sm text-emerald-700">{state.message}</p>
      )}
      {state.erreur && (
        <p className="text-sm text-red-600" role="alert">
          {state.erreur}
        </p>
      )}
    </form>
  );
}
