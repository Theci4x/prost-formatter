"use client";

import { useActionState } from "react";
import {
  seDesabonner,
  type DesabonnementState,
} from "@/app/desabonnement/[jeton]/actions";
import type { Langue } from "@/lib/i18n/langues";
import { ANNULER } from "@/lib/i18n/annuler";

const initial: DesabonnementState = { error: null, fait: false };

/**
 * Le bouton qui coupe les envois.
 *
 * Une confirmation explicite plutôt qu'une désinscription au chargement
 * du lien, pour la même raison qu'à l'annulation : les messageries et
 * les antivirus visitent les liens qu'ils reçoivent, et une
 * désinscription déclenchée par un robot couperait quelqu'un qui n'a
 * rien demandé.
 *
 * Un seul clic tout de même, et aucune question posée avant. Le RGPD
 * veut un retrait « aussi simple que le consentement » : demander
 * pourquoi on part, ou faire choisir entre trois fréquences, c'est
 * exactement ce qu'il interdit.
 */
export function DesabonnementClient({
  jeton,
  restaurantNom,
  email,
  langue,
}: {
  jeton: string;
  restaurantNom: string;
  email: string;
  langue: Langue;
}) {
  const a = ANNULER[langue];
  const [state, action, pending] = useActionState(seDesabonner, initial);

  if (state.fait) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-zinc-600">
          {a.cestFait(restaurantNom).avant}
          <strong>{email}</strong>
          {a.cestFait(restaurantNom).apres}
        </p>
        <p className="text-sm leading-relaxed text-zinc-500">
          {a.courrielsDeService}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="jeton" value={jeton} />
      <p className="text-sm leading-relaxed text-zinc-600">
        {a.recoitLesActualites(restaurantNom).avant}
        <strong>{email}</strong>
        {a.recoitLesActualites(restaurantNom).apres}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? a.desinscriptionEnCours : a.meDesinscrire}
      </button>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
