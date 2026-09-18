"use client";

import { useActionState, useState } from "react";
import {
  modifierParLeClient,
  type ModificationState,
} from "@/app/annuler/[token]/actions";

const initial: ModificationState = { error: null, fait: false };

/**
 * Changer d'heure ou de nombre de convives, sans tout refaire.
 *
 * C'est le geste qui manque à la plupart des outils de réservation : on
 * ne sait qu'annuler, alors les clients annulent et recommencent. Le
 * restaurateur voit une table rendue puis reprise, perd sa note interne,
 * et pendant le battement le créneau peut partir ailleurs.
 *
 * Le formulaire reste replié tant qu'on ne le demande pas : la plupart
 * des gens qui ouvrent ce lien viennent pour annuler, et leur imposer
 * trois champs avant d'y arriver serait leur faire perdre leur temps.
 */

export function ModificationClient({
  token,
  date,
  heure,
  couverts,
  heures,
  dateMin,
}: {
  token: string;
  date: string;
  heure: string | null;
  couverts: number;
  /** Les heures d'arrivée du service, telles que proposées à la réservation. */
  heures: string[];
  dateMin: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [state, action, pending] = useActionState(modifierParLeClient, initial);

  if (state.fait && !state.error) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
        C&apos;est modifié. L&apos;établissement est prévenu, et tu reçois
        la confirmation par e-mail.
      </p>
    );
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="w-fit text-sm font-medium text-brand-navy underline-offset-2 hover:underline"
      >
        Modifier l&apos;heure ou le nombre de convives
      </button>
    );
  }

  const champ =
    "min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-wrap gap-3">
        <label className="flex min-w-0 flex-1 basis-36 flex-col gap-1 text-sm font-medium text-ink">
          Date
          <input
            type="date"
            name="date"
            defaultValue={date}
            min={dateMin}
            className={`${champ} w-full`}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-ink">
          Heure
          <select
            name="heure"
            defaultValue={heure ?? heures[0]}
            className={`${champ} w-28`}
          >
            {heures.map((h) => (
              <option key={h} value={h}>
                {h.replace(":", "h")}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-ink">
          Convives
          <input
            type="number"
            name="couverts"
            defaultValue={couverts}
            min={1}
            inputMode="numeric"
            className={`${champ} w-24`}
          />
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-amber-700" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Modification…" : "Enregistrer le changement"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Laisser comme ça
        </button>
      </div>
    </form>
  );
}
