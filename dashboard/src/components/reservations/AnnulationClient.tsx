"use client";

import { useActionState } from "react";
import {
  annulerParLeClient,
  type AnnulationState,
} from "@/app/annuler/[token]/actions";
import type { Langue } from "@/lib/i18n/langues";
import { ANNULER } from "@/lib/i18n/annuler";

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
  discret = false,
  langue,
}: {
  token: string;
  resume: string;
  langue: Langue;
  /**
   * Vrai quand la modification est proposée au-dessus : l'annulation
   * devient alors le second choix, et se présente comme tel. Faux quand
   * elle est le seul geste possible — là, elle doit rester trouvable.
   */
  discret?: boolean;
}) {
  const a = ANNULER[langue];
  const [state, action, pending] = useActionState(annulerParLeClient, initial);

  if (state.fait && !state.error) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-zinc-600">{a.cestAnnule}</p>
        <p className="text-sm leading-relaxed text-zinc-600">
          {a.merciDeLAvoirRendue}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      {!discret && (
        <p className="text-sm leading-relaxed text-zinc-600">{resume}</p>
      )}

      {state.error && (
        <p className="text-sm text-amber-700" role="alert">
          {state.error}
        </p>
      )}

      {!state.fait && (
        <button
          type="submit"
          disabled={pending}
          className={
            discret
              ? "w-fit text-sm text-zinc-500 underline-offset-2 transition-colors hover:text-zinc-900 hover:underline disabled:opacity-50"
              : "w-fit rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          }
        >
          {pending ? a.annulationEnCours : a.annulerMaReservation}
        </button>
      )}
    </form>
  );
}
