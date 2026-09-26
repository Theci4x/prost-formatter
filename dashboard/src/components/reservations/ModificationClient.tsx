"use client";

import { useActionState, useState } from "react";
import {
  modifierParLeClient,
  type ModificationState,
} from "@/app/annuler/[token]/actions";
import type { Langue } from "@/lib/i18n/langues";
import { ANNULER } from "@/lib/i18n/annuler";
import { heure as heureTraduite } from "@/lib/i18n/jours";

const initial: ModificationState = { error: null, fait: false };

/**
 * Changer d'heure ou de nombre de convives, sans tout refaire.
 *
 * C'est le geste qui manque à la plupart des outils de réservation : on
 * ne sait qu'annuler, alors les clients annulent et recommencent. Le
 * restaurateur voit une table rendue puis reprise, perd sa note interne,
 * et pendant le battement le créneau peut partir ailleurs.
 *
 * Le formulaire reste replié tant qu'on ne le demande pas : la plupart
 * des gens qui ouvrent ce lien viennent pour annuler, et leur imposer
 * trois champs avant d'y arriver serait leur faire perdre leur temps.
 */

export function ModificationClient({
  token,
  date,
  heure,
  couverts,
  heures,
  dateMin,
  langue,
}: {
  token: string;
  date: string;
  heure: string | null;
  couverts: number;
  /** Les heures d'arrivée du service, telles que proposées à la réservation. */
  heures: string[];
  dateMin: string;
  langue: Langue;
}) {
  const a = ANNULER[langue];
  const [ouvert, setOuvert] = useState(false);
  const [state, action, pending] = useActionState(modifierParLeClient, initial);

  if (state.fait && !state.error) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800">
        {a.cestModifie}
      </p>
    );
  }

  // Le bouton plein, et l'annulation en lien discret juste en dessous :
  // c'est l'inverse de ce qu'on avait posé au départ, et l'inverse était
  // un piège. Un client venu décaler d'une demi-heure voyait un gros
  // bouton « Annuler » et un lien qu'on ne remarque pas — il annulait,
  // puis refaisait une réservation. Toute la mécanique de modification
  // ne sert à rien si le chemin le plus visible mène ailleurs.
  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="w-fit rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
      >
        {a.modifierMaReservation}
      </button>
    );
  }

  const champ =
    "min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-wrap gap-3">
        <label className="flex min-w-0 flex-1 basis-36 flex-col gap-1 text-sm font-medium text-ink">
          {a.dateLabel}
          <input
            type="date"
            name="date"
            defaultValue={date}
            min={dateMin}
            className={`${champ} w-full`}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-ink">
          {a.heureLabel}
          <select
            name="heure"
            defaultValue={heure ?? heures[0]}
            className={`${champ} w-28`}
          >
            {heures.map((h) => (
              <option key={h} value={h}>
                {heureTraduite(h, langue)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-ink">
          {a.convivesLabel}
          <input
            type="number"
            name="couverts"
            defaultValue={couverts}
            min={1}
            inputMode="numeric"
            className={`${champ} w-24`}
          />
        </label>
      </div>

      {state.error && (
        <p className="text-sm text-amber-700" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? a.modificationEnCours : a.enregistrerLeChangement}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {a.laisserCommeCa}
        </button>
      </div>
    </form>
  );
}
