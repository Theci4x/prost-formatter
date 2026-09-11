"use client";

import { useActionState, useState } from "react";
import {
  addEspace,
  type EspaceState,
} from "@/app/dashboard/[id]/reservations/actions";
import { ESPACE_VIDE, type EspaceValeurs } from "@/types/reservation";

const initialState: EspaceState = {
  error: null,
  rendu: 0,
  valeurs: ESPACE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  valeurs,
}: {
  restaurantId: string;
  valeurs: EspaceValeurs;
}) {
  // Le minimum de privatisation n'a de sens que si l'espace se privatise :
  // afficher le champ en permanence ferait croire qu'il est obligatoire.
  const [privatisable, setPrivatisable] = useState(valeurs.privatisable);

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="espace-nom">
          Nom de l&apos;espace
          <input
            id="espace-nom"
            name="nom"
            required
            defaultValue={valeurs.nom}
            placeholder="Salle du bas"
            className={champ}
          />
        </label>
        <label className={label} htmlFor="espace-capacite">
          Capacité (couverts)
          <input
            id="espace-capacite"
            name="capacite"
            type="number"
            min="1"
            required
            defaultValue={valeurs.capacite}
            placeholder="40"
            className={champ}
          />
        </label>
      </div>

      <label className={label} htmlFor="espace-description">
        Description{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <input
          id="espace-description"
          name="description"
          defaultValue={valeurs.description}
          placeholder="Salle voûtée en sous-sol, accès indépendant"
          className={champ}
        />
      </label>

      <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4">
        <label className="flex items-start gap-2.5 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="accepte_table"
            defaultChecked={valeurs.accepteTable}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Réservations individuelles</span> —
            plusieurs groupes partagent l&apos;espace en même temps, dans la
            limite de la capacité.
          </span>
        </label>

        <label className="flex items-start gap-2.5 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="privatisable"
            checked={privatisable}
            onChange={(event) => setPrivatisable(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">Privatisation</span> — un seul groupe
            occupe l&apos;espace entier sur le créneau.
          </span>
        </label>

        {privatisable && (
          <label className={`${label} pl-7`} htmlFor="espace-minimum">
            À partir de combien de couverts ?
            <input
              id="espace-minimum"
              name="privatisation_minimum"
              type="number"
              min="1"
              defaultValue={valeurs.minimum}
              className={`${champ} max-w-32`}
            />
            <span className="text-xs font-normal text-zinc-500">
              Une demande en dessous de ce nombre sera refusée automatiquement.
            </span>
          </label>
        )}
      </div>
    </>
  );
}

export function EspaceForm({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(addEspace, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* React vide de lui-même le formulaire après une action ; la clé le
          remonte avec les valeurs renvoyées — la saisie à corriger en cas
          d'erreur, un formulaire vierge après un enregistrement. */}
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
        {pending ? "Enregistrement…" : "Ajouter cet espace"}
      </button>
    </form>
  );
}
