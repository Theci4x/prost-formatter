"use client";

import { useActionState } from "react";
import type { AnalyseState } from "@/app/dashboard/[id]/visibilite-ia/actions";

const initial: AnalyseState = { error: null };

/**
 * Un bouton pour une action qui prend du temps, et qui le montre.
 *
 * Interroger un assistant puis en extraire les noms cités demande une
 * bonne demi-minute. Sans retour visible, la page reste identique pendant
 * tout ce temps : le restaurateur conclut que le bouton est cassé, clique
 * encore, et lance une deuxième analyse par-dessus la première.
 *
 * Le même piège que « Établir un devis » avait tendu, au même endroit —
 * une action serveur branchée en direct sur un formulaire, sans état.
 */
export function BoutonLent({
  action,
  champs,
  libelle,
  enCours,
  className,
}: {
  action: (
    prevState: AnalyseState,
    formData: FormData,
  ) => Promise<AnalyseState>;
  /** Les champs cachés à transmettre, par nom. */
  champs: Record<string, string>;
  libelle: string;
  /** Le texte du bouton pendant le travail. */
  enCours: string;
  className: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      {Object.entries(champs).map(([nom, valeur]) => (
        <input key={nom} type="hidden" name={nom} value={valeur} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className={`${className} disabled:cursor-wait disabled:opacity-50`}
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
