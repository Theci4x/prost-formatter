"use client";

import { useActionState } from "react";
import {
  ajouterFermeture,
  type FermetureState,
} from "@/app/dashboard/[id]/reservations/actions";
import {
  FERMETURE_VIDE,
  type Espace,
  type FermetureValeurs,
} from "@/types/reservation";

const initialState: FermetureState = {
  error: null,
  rendu: 0,
  valeurs: FERMETURE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  espaces,
  valeurs,
}: {
  restaurantId: string;
  espaces: Espace[];
  valeurs: FermetureValeurs;
}) {
  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="fermeture-debut">
          Du
          <input
            id="fermeture-debut"
            name="date_debut"
            type="date"
            required
            defaultValue={valeurs.dateDebut}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="fermeture-fin">
          Au{" "}
          <span className="font-normal text-zinc-400">
            (vide = un seul jour)
          </span>
          <input
            id="fermeture-fin"
            name="date_fin"
            type="date"
            defaultValue={valeurs.dateFin}
            className={champ}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="fermeture-espace">
          Ce qui ferme
          <select
            id="fermeture-espace"
            name="espace_id"
            defaultValue={valeurs.espaceId}
            className={champ}
          >
            <option value="">Tout l&apos;établissement</option>
            {espaces.map((espace) => (
              <option key={espace.id} value={espace.id}>
                {espace.nom} seulement
              </option>
            ))}
          </select>
        </label>
        <label className={label} htmlFor="fermeture-motif">
          Motif{" "}
          <span className="font-normal text-zinc-400">
            (affiché au client)
          </span>
          <input
            id="fermeture-motif"
            name="motif"
            defaultValue={valeurs.motif}
            placeholder="Congés d'été"
            className={champ}
          />
        </label>
      </div>
    </>
  );
}

export function FermetureForm({
  restaurantId,
  espaces,
}: {
  restaurantId: string;
  espaces: Espace[];
}) {
  const [state, action, pending] = useActionState(
    ajouterFermeture,
    initialState,
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé le
          remonte avec les valeurs renvoyées. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        espaces={espaces}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Fermer cette période"}
      </button>
    </form>
  );
}
