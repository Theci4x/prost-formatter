"use client";

import { useActionState } from "react";
import type { DecisionState } from "@/app/dashboard/[id]/reservations/actions";

const initial: DecisionState = { error: null };

/**
 * Un bouton qui agit, et qui dit quand ça rate.
 *
 * Une action serveur qui ne renvoie rien n'a aucun moyen de se
 * plaindre : elle écrit dans le journal du serveur, la page se recharge
 * inchangée, et le restaurateur conclut que le bouton ne marche pas. Il
 * clique trois fois, puis il appelle.
 *
 * D'où ce composant : l'action rend un état, l'état porte un message, et
 * le message s'affiche sous le bouton.
 */
export function BoutonAction({
  action,
  champs,
  libelle,
  enCours,
  className,
}: {
  action: (
    prevState: DecisionState,
    formData: FormData,
  ) => Promise<DecisionState>;
  /** Les champs cachés à transmettre, par nom. */
  champs: Record<string, string>;
  libelle: string;
  /** Le texte du bouton pendant l'envoi. */
  enCours: string;
  className: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      {Object.entries(champs).map(([nom, valeur]) => (
        <input key={nom} type="hidden" name={nom} value={valeur} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={`${className} disabled:opacity-50`}
      >
        {pending ? enCours : libelle}
      </button>
      {state.error && (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
