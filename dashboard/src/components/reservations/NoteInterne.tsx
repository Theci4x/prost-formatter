"use client";

import { useActionState } from "react";
import type { Langue } from "@/lib/i18n/langues";
import { RESERVATIONS } from "@/lib/i18n/reservations";
import {
  enregistrerNote,
  type DecisionState,
} from "@/app/dashboard/[id]/reservations/actions";

const initial: DecisionState = { error: null };

/**
 * La note que le restaurateur garde pour lui.
 *
 * Elle ne se relit pas d'un coup d'œil : une note qui n'a pas été
 * enregistrée ressemble trait pour trait à une note enregistrée, tant
 * que la page n'a pas été rechargée. D'où le mot qui confirme, et celui
 * qui explique quand ça rate.
 */
export function NoteInterne({
  reservationId,
  restaurantId,
  note,
  langue,
}: {
  reservationId: string;
  restaurantId: string;
  note: string | null;
  langue: Langue;
}) {
  const r = RESERVATIONS[langue];
  const [state, action, pending] = useActionState(enregistrerNote, initial);

  return (
    <form
      action={action}
      className="flex flex-col gap-1 border-t border-zinc-100 pt-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="reservation_id" value={reservationId} />
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <label
          className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium text-zinc-700"
          htmlFor={`note-${reservationId}`}
        >
          {r.noteInterne}{" "}
          <span className="font-normal text-zinc-400">{r.jamaisVisible}</span>
          <input
            id={`note-${reservationId}`}
            name="note_interne"
            defaultValue={note ?? ""}
            placeholder={r.placeholderNote}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
        >
          {pending ? r.enCours.enregistrement : r.enregistrer}
        </button>
      </div>

      {state.error ? (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      ) : (
        !pending &&
        state !== initial && (
          <p className="text-xs text-emerald-700">{r.noteEnregistree}</p>
        )
      )}
    </form>
  );
}
