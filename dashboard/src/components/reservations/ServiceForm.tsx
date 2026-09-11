"use client";

import { useActionState } from "react";
import {
  addService,
  type ServiceState,
} from "@/app/dashboard/[id]/reservations/actions";
import {
  JOURS_ISO,
  SERVICE_VIDE,
  type ServiceValeurs,
} from "@/types/reservation";

const initialState: ServiceState = {
  error: null,
  rendu: 0,
  valeurs: SERVICE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  valeurs,
}: {
  restaurantId: string;
  valeurs: ServiceValeurs;
}) {
  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label} htmlFor="service-nom">
          Nom du service
          <input
            id="service-nom"
            name="nom"
            required
            defaultValue={valeurs.nom}
            placeholder="Dîner"
            className={champ}
          />
        </label>
        <label className={label} htmlFor="service-debut">
          Début
          <input
            id="service-debut"
            name="heure_debut"
            type="time"
            required
            defaultValue={valeurs.heureDebut}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="service-fin">
          Fin
          <input
            id="service-fin"
            name="heure_fin"
            type="time"
            required
            defaultValue={valeurs.heureFin}
            className={champ}
          />
        </label>
      </div>

      <p className="-mt-2 text-xs text-zinc-500">
        Un service peut finir après minuit : saisis simplement 17h30 – 2h. Il
        restera rattaché au jour où il commence.
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700">
          Jours concernés
        </legend>
        <div className="flex flex-wrap gap-2">
          {JOURS_ISO.map((jour) => (
            <label
              key={jour.valeur}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 has-checked:border-brand-navy has-checked:bg-brand-orange-soft"
            >
              <input
                type="checkbox"
                name="jours"
                value={jour.valeur}
                defaultChecked={valeurs.jours.includes(jour.valeur)}
              />
              <span className="capitalize">{jour.long}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={label} htmlFor="service-delai">
        Délai de prévenance (heures)
        <input
          id="service-delai"
          name="delai_heures"
          type="number"
          min="0"
          defaultValue={valeurs.delai}
          className={`${champ} max-w-32`}
        />
        <span className="text-xs font-normal text-zinc-500">
          Aucune demande ne sera acceptée en deçà de ce délai. Mets 0 pour
          accepter les demandes de dernière minute.
        </span>
      </label>
    </>
  );
}

export function ServiceForm({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(addService, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* Voir EspaceForm : la clé remonte les champs avec les valeurs que
          l'action vient de renvoyer. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Ajouter ce service"}
      </button>
    </form>
  );
}
