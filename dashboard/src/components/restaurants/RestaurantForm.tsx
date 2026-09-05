"use client";

import { useActionState } from "react";
import type { RestaurantFormState } from "@/app/dashboard/actions";
import type { Restaurant } from "@/types/restaurant";

const initialState: RestaurantFormState = { error: null };

export function RestaurantForm({
  action,
  restaurant,
  submitLabel,
}: {
  action: (
    prevState: RestaurantFormState,
    formData: FormData,
  ) => Promise<RestaurantFormState>;
  restaurant?: Restaurant;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {restaurant && <input type="hidden" name="id" value={restaurant.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nom" className="text-sm font-medium text-zinc-700">
          Nom
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          defaultValue={restaurant?.nom}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="adresse" className="text-sm font-medium text-zinc-700">
          Adresse
        </label>
        <input
          id="adresse"
          name="adresse"
          type="text"
          defaultValue={restaurant?.adresse ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
