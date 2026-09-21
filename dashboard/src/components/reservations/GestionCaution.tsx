"use client";

import { useActionState, useState } from "react";
import type { Langue } from "@/lib/i18n/langues";
import { RESERVATIONS } from "@/lib/i18n/reservations";
import {
  debiter,
  libererCaution,
  type DebitState,
} from "@/app/dashboard/[id]/reservations/actions";
import { formatEuros } from "@/lib/reservations/acompte";

const initialState: DebitState = { error: null };

/**
 * Débiter ou libérer une caution. Le débit est volontairement un peu lent à
 * atteindre : prélever la carte de quelqu'un qui n'est pas devant son écran
 * ne doit pas se faire d'un clic distrait en plein service.
 */
export function GestionCaution({
  reservationId,
  restaurantId,
  plafond,
  langue,
}: {
  reservationId: string;
  restaurantId: string;
  plafond: number;
  langue: Langue;
}) {
  const r = RESERVATIONS[langue];
  const [state, action, pending] = useActionState(debiter, initialState);
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {!ouvert ? (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-red-500 hover:text-red-600"
          >
            {r.debiterCaution}
          </button>
          <form action={libererCaution}>
            <input type="hidden" name="reservation_id" value={reservationId} />
            <input type="hidden" name="restaurant_id" value={restaurantId} />
            <button
              type="submit"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900"
            >
              {r.libererGroupeVenu}
            </button>
          </form>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-2">
          <input type="hidden" name="reservation_id" value={reservationId} />
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <label
            className="text-sm font-medium text-zinc-700"
            htmlFor={`debit-${reservationId}`}
          >
            {r.combienPrelever}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id={`debit-${reservationId}`}
              name="montant"
              inputMode="decimal"
              defaultValue={(plafond / 100).toFixed(2).replace(".", ",")}
              className="w-32 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
            <span className="text-sm text-zinc-500">
              {r.auMaximum(formatEuros(plafond))}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? r.prelevementEnCours : r.preleverMaintenant}
            </button>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              {r.annuler}
            </button>
          </div>
        </form>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
