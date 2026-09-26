"use client";

import { useActionState } from "react";
import {
  envoyerTest,
  type CampagneState,
} from "@/app/dashboard/[id]/campagnes/actions";
import type { Langue } from "@/lib/i18n/langues";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { CAMPAGNES } from "@/lib/i18n/pages/campagnes";

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
  langue,
}: {
  restaurantId: string;
  campagneId: string;
  langue: Langue;
}) {
  const t = traducteur(langue, CAMPAGNES, COMMUN);
  const [state, action, pending] = useActionState(envoyerTest, initial);

  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="campagne_id" value={campagneId} />
      <span className="text-sm font-medium text-zinc-700">
        {t("S'envoyer un essai")}
      </span>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-sm text-zinc-600">
          {t("À quelle adresse")}
          <input
            name="destinataire"
            type="email"
            required
            placeholder={t("vous@votre-restaurant.fr")}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
        >
          {pending ? t("Envoi…") : t("Envoyer l'essai")}
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        {t(
          "Le message est composé exactement comme le vrai, pied de désinscription compris. Le lien de cet essai ne désinscrit personne.",
        )}
      </p>
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {t(state.error)}
        </p>
      ) : (
        state.message && (
          <p className="text-sm text-emerald-700">{state.message}</p>
        )
      )}
    </form>
  );
}
