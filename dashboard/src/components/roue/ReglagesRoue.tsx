"use client";

import { useActionState } from "react";
import {
  enregistrerReglages,
  type ReglagesState,
} from "@/app/dashboard/[id]/roue/actions";
import type { Roue } from "@/types/roue";

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

/**
 * Ce que le client lit, et combien de temps son lot vaut.
 *
 * L'allumage n'est pas ici : c'est le seul geste qui change ce que voient
 * les clients, et on ne l'actionne pas par mégarde en corrigeant une faute
 * de frappe dans le titre.
 */
export function ReglagesRoue({
  restaurantId,
  roue,
}: {
  restaurantId: string;
  roue: Roue;
}) {
  const [state, action, pending] = useActionState(enregistrerReglages, {
    error: null,
    ok: false,
  } as ReglagesState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <label className={label} htmlFor="roue-titre">
        Titre affiché au client
        <input
          id="roue-titre"
          name="titre"
          required
          maxLength={60}
          defaultValue={roue.titre}
          className={`${champ} max-w-md`}
        />
      </label>

      <label className={label} htmlFor="roue-sous-titre">
        Sous-titre{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <input
          id="roue-sous-titre"
          name="sous_titre"
          maxLength={140}
          defaultValue={roue.sous_titre ?? ""}
          placeholder="Un lot à retirer lors de votre prochaine visite"
          className={`${champ} max-w-md`}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="roue-validite">
          Validité du lot (jours)
          <input
            id="roue-validite"
            name="validite_jours"
            inputMode="numeric"
            required
            defaultValue={String(roue.validite_jours)}
            className={`${champ} max-w-28`}
          />
          <span className="text-xs font-normal text-zinc-500">
            Le lot part par e-mail et se présente à la visite suivante. Trop
            court, personne ne revient à temps ; trop long, tu oublies ce que tu
            dois.
          </span>
        </label>

        <label className={label} htmlFor="roue-rejeu">
          Avant de rejouer (jours)
          <input
            id="roue-rejeu"
            name="delai_rejeu_jours"
            inputMode="numeric"
            required
            defaultValue={String(roue.delai_rejeu_jours)}
            className={`${champ} max-w-28`}
          />
          <span className="text-xs font-normal text-zinc-500">
            Une même adresse ne rejoue pas avant ce délai — sans quoi une table
            vide ton stock depuis son téléphone. Mets 0 pour une soirée
            particulière, jamais pour un totem posé à l&apos;année.
          </span>
        </label>
      </div>

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
