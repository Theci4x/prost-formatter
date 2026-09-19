"use client";

import { useActionState } from "react";
import {
  seDesabonner,
  type DesabonnementState,
} from "@/app/desabonnement/[jeton]/actions";

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
}: {
  jeton: string;
  restaurantNom: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(seDesabonner, initial);

  if (state.fait) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed text-zinc-600">
          C&apos;est fait. <strong>{email}</strong> ne recevra plus les
          actualités de {restaurantNom}.
        </p>
        <p className="text-sm leading-relaxed text-zinc-500">
          Les e-mails liés à vos réservations — confirmation, rappel, annulation
          — continuent de partir : ce ne sont pas des messages commerciaux, et
          vous en avez besoin.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="jeton" value={jeton} />
      <p className="text-sm leading-relaxed text-zinc-600">
        <strong>{email}</strong> reçoit les actualités et offres de{" "}
        {restaurantNom}. Un clic suffit pour arrêter.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "En cours…" : "Me désinscrire"}
      </button>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
