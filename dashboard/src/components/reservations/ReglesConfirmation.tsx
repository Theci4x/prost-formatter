"use client";

import { useActionState } from "react";
import { enregistrerConfirmation } from "@/app/dashboard/[id]/reservations/actions";
import type { Langue } from "@/lib/i18n/langues";
import { CONFIGURATION } from "@/lib/i18n/configuration";

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
  langue,
}: {
  restaurantId: string;
  auto: boolean;
  delaiHeures: number;
  emailContact: string | null;
  langue: Langue;
}) {
  const cfg = CONFIGURATION[langue];
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
          <span className="font-medium text-zinc-900">{cfg.confirmerAuto}</span>
          <span className="mt-1 block text-zinc-500">
            {cfg.confirmerAutoAide}
          </span>
        </span>
      </label>

      <label className={label} htmlFor="conf-delai">
        {cfg.saufAMoinsDe}
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
          {cfg.saufAide}
        </span>
      </label>

      <label className={label} htmlFor="conf-email">
        {cfg.adresseQuiRecoit}
        <input
          id="conf-email"
          name="email_contact"
          type="email"
          defaultValue={emailContact ?? ""}
          placeholder={cfg.adressePlaceholder}
          className={`${champ} max-w-md`}
        />
        <span className="text-xs font-normal text-zinc-500">
          {cfg.adresseAide}
        </span>
      </label>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="text-sm text-emerald-700">{cfg.enregistre}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? cfg.enregistrement : cfg.enregistrer}
      </button>
    </form>
  );
}
