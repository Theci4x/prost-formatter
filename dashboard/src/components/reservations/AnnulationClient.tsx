"use client";

import { useActionState } from "react";
import {
  annulerParLeClient,
  type AnnulationState,
} from "@/app/annuler/[token]/actions";

const initial: AnnulationState = { error: null, fait: false };

/**
 * Le bouton qui rend la table.
 *
 * Une confirmation explicite plutôt qu'une annulation au chargement du
 * lien : les messageries et les antivirus visitent les liens qu'ils
 * reçoivent, et une annulation déclenchée par un robot ferait perdre sa
 * table à quelqu'un qui n'a rien demandé.
 */
export function AnnulationClient({
  token,
  resume,
}: {
  token: string;
  resume: string;
}) {
  const [state, action, pending] = useActionState(annulerParLeClient, initial);

  if (state.fait && !state.error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-zinc-600">
          C&apos;est annulé. L&apos;établissement est prévenu et ta table
          est remise à la réservation.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          Merci de l&apos;avoir rendue : c&apos;est ce qui permet à
          quelqu&apos;un d&apos;autre de dîner ce soir-là.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <p className="text-sm leading-relaxed text-zinc-600">{resume}</p>

      {state.error && (
        <p className="text-sm text-amber-700" role="alert">
          {state.error}
        </p>
      )}

      {!state.fait && (
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Annulation…" : "Annuler ma réservation"}
        </button>
      )}
    </form>
  );
}
