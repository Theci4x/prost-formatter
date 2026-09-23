"use client";

import { useActionState } from "react";
import {
  envoyerTest,
  type CampagneState,
} from "@/app/dashboard/[id]/campagnes/actions";

const initial: CampagneState = { error: null, message: null };

/**
 * L'essai vers sa propre boîte.
 *
 * Ce n'est pas un confort. Un message se lit autrement dans une
 * messagerie que dans un champ de saisie : c'est là qu'on voit que
 * l'objet est coupé, que le bouton tombe mal, ou que le pied de
 * désinscription dit le nom d'un autre établissement. Et c'est la seule
 * façon de vérifier que l'expéditeur arrive bien au nom du restaurant.
 */
export function EssaiCampagne({
  restaurantId,
  campagneId,
}: {
  restaurantId: string;
  campagneId: string;
}) {
  const [state, action, pending] = useActionState(envoyerTest, initial);

  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="campagne_id" value={campagneId} />
      <span className="text-sm font-medium text-zinc-700">
        S&apos;envoyer un essai
      </span>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm text-zinc-600">
          À quelle adresse
          <input
            name="destinataire"
            type="email"
            required
            placeholder="vous@votre-restaurant.fr"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Envoyer l'essai"}
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Le message est composé exactement comme le vrai, pied de désinscription
        compris. Le lien de cet essai ne désinscrit personne.
      </p>
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : (
        state.message && (
          <p className="text-sm text-emerald-700">{state.message}</p>
        )
      )}
    </form>
  );
}
