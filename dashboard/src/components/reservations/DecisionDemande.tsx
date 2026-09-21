"use client";

import { useActionState } from "react";
import type { ClesReservations } from "@/lib/i18n/reservations";
import {
  accepterDemande,
  refuserDemande,
  type DecisionState,
} from "@/app/dashboard/[id]/reservations/actions";

const initialState: DecisionState = { error: null };

export function DecisionDemande({
  reservationId,
  restaurantId,
  r,
}: {
  reservationId: string;
  restaurantId: string;
  r: ClesReservations;
}) {
  const [state, action, pending] = useActionState(
    accepterDemande,
    initialState,
  );
  // Le refus a son propre état : sans lui, une erreur de refus
  // s'afficherait sous le bouton Accepter, ou nulle part.
  const [refus, actionRefus, refusEnCours] = useActionState(
    refuserDemande,
    initialState,
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <form action={action}>
          <input type="hidden" name="reservation_id" value={reservationId} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending ? r.confirmationEnCours : r.accepter}
          </button>
        </form>

        <form action={actionRefus}>
          <input type="hidden" name="reservation_id" value={reservationId} />
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <button
            type="submit"
            disabled={refusEnCours}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
          >
            {refusEnCours ? r.refusEnCours : r.refuser}
          </button>
        </form>
      </div>

      {/* Le créneau a pu être pris entre l'arrivée de la demande et le clic :
          le refus vient du recalcul de disponibilité, pas d'une erreur. */}
      {(state.error || refus.error) && (
        <p className="text-sm text-red-600" role="alert">
          {state.error ?? refus.error}
        </p>
      )}
    </div>
  );
}
