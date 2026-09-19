"use client";

import { useActionState, useState } from "react";
import type { RestaurantFormState } from "@/app/dashboard/actions";
import { JOURS_SEMAINE, type JourSemaine } from "@/types/restaurant";
import type { Restaurant } from "@/types/restaurant";

const initialState: RestaurantFormState = { error: null };

const JOUR_LABELS: Record<JourSemaine, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

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
  const [fermes, setFermes] = useState<Record<JourSemaine, boolean>>(() => {
    const initial = {} as Record<JourSemaine, boolean>;
    for (const jour of JOURS_SEMAINE) {
      initial[jour] = restaurant?.horaires?.[jour]?.ferme ?? false;
    }
    return initial;
  });
  // La coupure se coche par jour : beaucoup de maisons servent midi et
  // soir en semaine, et en continu le samedi.
  const [coupures, setCoupures] = useState<Record<JourSemaine, boolean>>(() => {
    const initial = {} as Record<JourSemaine, boolean>;
    for (const jour of JOURS_SEMAINE) {
      initial[jour] = Boolean(restaurant?.horaires?.[jour]?.seconde);
    }
    return initial;
  });

  return (
    <form action={formAction} className="flex w-full max-w-lg flex-col gap-4">
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

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="telephone"
            className="text-sm font-medium text-zinc-700"
          >
            Téléphone
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            defaultValue={restaurant?.telephone ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="site_web"
            className="text-sm font-medium text-zinc-700"
          >
            Site web
          </label>
          <input
            id="site_web"
            name="site_web"
            type="url"
            placeholder="https://..."
            defaultValue={restaurant?.site_web ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="type_cuisine"
          className="text-sm font-medium text-zinc-700"
        >
          Type de cuisine{" "}
          <span className="font-normal text-zinc-400">
            (ce que cherchent Google et les assistants)
          </span>
        </label>
        <input
          id="type_cuisine"
          name="type_cuisine"
          type="text"
          placeholder="Allemande, brasserie"
          defaultValue={restaurant?.type_cuisine ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
        <p className="text-xs text-zinc-500">
          Sépare par des virgules. C&apos;est ce qui permet d&apos;être proposé
          sur « restaurant allemand près de République ».
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="text-sm font-medium text-zinc-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={restaurant?.description ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700">
          Horaires d&apos;ouverture
        </span>
        <p className="-mt-1 text-xs text-zinc-500">
          Ceux de ta devanture, pas tes créneaux de réservation. Coche
          «&nbsp;Coupure&nbsp;» si tu fermes entre le déjeuner et le dîner.
        </p>
        <div className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3">
          {JOURS_SEMAINE.map((jour) => (
            <div
              key={jour}
              className="flex flex-col gap-1.5 border-b border-zinc-100 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="w-24 shrink-0 text-sm text-zinc-700">
                  {JOUR_LABELS[jour]}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    name={`horaire_${jour}_ferme`}
                    checked={fermes[jour]}
                    onChange={(e) =>
                      setFermes((prev) => ({
                        ...prev,
                        [jour]: e.target.checked,
                      }))
                    }
                  />
                  Fermé
                </label>
                <input
                  type="time"
                  name={`horaire_${jour}_ouverture`}
                  defaultValue={
                    restaurant?.horaires?.[jour]?.ouverture ?? "09:00"
                  }
                  disabled={fermes[jour]}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 disabled:opacity-40"
                />
                <span className="text-sm text-zinc-400">à</span>
                <input
                  type="time"
                  name={`horaire_${jour}_fermeture`}
                  defaultValue={
                    restaurant?.horaires?.[jour]?.fermeture ?? "22:00"
                  }
                  disabled={fermes[jour]}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500 disabled:opacity-40"
                />
                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    name={`horaire_${jour}_coupure`}
                    checked={coupures[jour]}
                    disabled={fermes[jour]}
                    onChange={(e) =>
                      setCoupures((prev) => ({
                        ...prev,
                        [jour]: e.target.checked,
                      }))
                    }
                  />
                  Coupure
                </label>
              </div>

              {/* La seconde plage sur sa propre ligne : six champs alignés
                  débordent d'un téléphone, et c'est là qu'un restaurateur
                  saisit sa fiche. */}
              {coupures[jour] && !fermes[jour] && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-24">
                  <span className="text-xs text-zinc-500">puis</span>
                  <input
                    type="time"
                    name={`horaire_${jour}_ouverture2`}
                    defaultValue={
                      restaurant?.horaires?.[jour]?.seconde?.ouverture ??
                      "19:00"
                    }
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500"
                  />
                  <span className="text-sm text-zinc-400">à</span>
                  <input
                    type="time"
                    name={`horaire_${jour}_fermeture2`}
                    defaultValue={
                      restaurant?.horaires?.[jour]?.seconde?.fermeture ??
                      "23:00"
                    }
                    className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-zinc-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
