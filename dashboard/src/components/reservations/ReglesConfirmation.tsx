"use client";

import { useActionState } from "react";
import { enregistrerConfirmation } from "@/app/dashboard/[id]/reservations/actions";

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

/**
 * Qui confirme les réservations.
 *
 * Valider chaque demande à la main tient à trois par semaine et s'écroule à
 * vingt. Par défaut, Klarr confirme tout seul — sauf la dernière minute et
 * les privatisations, qui se regardent.
 */
export function ReglesConfirmation({
  restaurantId,
  auto,
  delaiHeures,
  emailContact,
}: {
  restaurantId: string;
  auto: boolean;
  delaiHeures: number;
  emailContact: string | null;
}) {
  const [state, action, pending] = useActionState(enregistrerConfirmation, {
    error: null as string | null,
    ok: false,
  });

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="confirmation_auto"
          defaultChecked={auto}
          className="mt-1"
        />
        <span>
          <span className="font-medium text-zinc-900">
            Confirmer les réservations automatiquement
          </span>
          <span className="mt-1 block text-zinc-500">
            Les tables sont confirmées dès leur arrivée, et le client reçoit
            sa confirmation tout de suite. Les privatisations, elles,
            attendent toujours ton accord.
          </span>
        </span>
      </label>

      <label className={label} htmlFor="conf-delai">
        Sauf à moins de (heures avant le service)
        <input
          id="conf-delai"
          name="confirmation_auto_delai_heures"
          type="number"
          min={0}
          max={336}
          defaultValue={String(delaiHeures)}
          className={`${champ} max-w-32`}
        />
        <span className="text-xs font-normal text-zinc-500">
          En deçà, c&apos;est toi qui valides : une table pour ce soir mérite
          un coup d&apos;œil, une table pour samedi prochain non. Mets 0 pour
          tout confirmer, y compris la dernière minute.
        </span>
      </label>

      <label className={label} htmlFor="conf-email">
        Adresse qui reçoit les réservations
        <input
          id="conf-email"
          name="email_contact"
          type="email"
          defaultValue={emailContact ?? ""}
          placeholder="reservations@ton-restaurant.fr"
          className={`${champ} max-w-md`}
        />
        <span className="text-xs font-normal text-zinc-500">
          Chaque réservation t&apos;y est signalée, et c&apos;est à cette
          adresse que le client répond s&apos;il a un empêchement. Laisse
          vide pour ne rien recevoir.
        </span>
      </label>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="text-sm text-emerald-700">Enregistré.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
