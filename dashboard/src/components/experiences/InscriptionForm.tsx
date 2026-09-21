"use client";

import { useActionState, useState } from "react";
import {
  inscrire,
  type InscriptionState,
} from "@/app/reserver/[slug]/experiences";
import { sommeEuros } from "@/lib/i18n/nombres";
import type { Langue } from "@/lib/i18n/langues";
import { RESERVER } from "@/lib/i18n/reserver";

const initialState: InscriptionState = { error: null };

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

export function InscriptionForm({
  slug,
  experienceId,
  date,
  prixCentimes,
  placesRestantes,
  prepaiement,
  langue,
  nomMaison,
}: {
  slug: string;
  experienceId: string;
  date: string;
  prixCentimes: number;
  placesRestantes: number;
  prepaiement: boolean;
  langue: Langue;
  /** Le nom de l'établissement : c'est lui qui écrira, pas Klarr. */
  nomMaison: string;
}) {
  const r = RESERVER[langue];
  const [state, action, pending] = useActionState(inscrire, initialState);
  const [ouvert, setOuvert] = useState(false);
  // Le total se met à jour pendant la saisie : découvrir la somme à l'écran
  // suivant est la meilleure façon de perdre quelqu'un.
  const [places, setPlaces] = useState(1);
  const total = sommeEuros(prixCentimes * Math.max(places, 1), langue);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mt-2 w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
      >
        {r.reserverMaPlace}
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="experience_id" value={experienceId} />
      <input type="hidden" name="date" value={date} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`nom-${experienceId}-${date}`}>
          {r.tonNom}
          <input
            id={`nom-${experienceId}-${date}`}
            name="client_nom"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`email-${experienceId}-${date}`}>
          {r.email}
          <input
            id={`email-${experienceId}-${date}`}
            name="client_email"
            type="email"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`tel-${experienceId}-${date}`}>
          {r.telephone}{" "}
          <span className="font-normal text-zinc-400">{r.facultatif}</span>
          <input
            id={`tel-${experienceId}-${date}`}
            name="client_telephone"
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`places-${experienceId}-${date}`}>
          {r.nombreDePlaces}
          <input
            id={`places-${experienceId}-${date}`}
            name="places"
            type="number"
            min="1"
            max={placesRestantes}
            value={places}
            onChange={(event) => setPlaces(Number(event.target.value) || 1)}
            className={`${champ} max-w-28`}
          />
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-sm text-zinc-600">
        <input
          type="checkbox"
          name="accepte_communications"
          className="mt-0.5"
        />
        <span>{r.accepteActualites(nomMaison)}</span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending
            ? r.envoi
            : prepaiement
              ? r.payerSomme(total)
              : r.confirmerInscription}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {r.annuler}
        </button>
      </div>

      {!prepaiement && (
        <p className="text-xs text-zinc-500">{r.reglerSurPlace(total)}</p>
      )}
    </form>
  );
}
