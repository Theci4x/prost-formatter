"use client";

import { useState, useTransition } from "react";
import { traduireCarte } from "@/app/dashboard/[id]/menu/actions";

/**
 * Traduire la carte en anglais. Ne renvoie au modèle que ce qui n'est pas
 * déjà traduit, ou ce dont le français a changé depuis : retraduire quarante
 * plats parce qu'on a corrigé une virgule n'a pas de sens.
 */
export function TraduireCarte({
  restaurantId,
  aTraduire,
}: {
  restaurantId: string;
  aTraduire: number;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  function traduire() {
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    setMessage(null);
    setErreur(null);
    startTransition(async () => {
      const reponse = await traduireCarte(donnees);
      if (reponse.error) {
        setErreur(reponse.error);
        return;
      }
      setMessage(
        reponse.traduits === 0
          ? "Tout était déjà traduit."
          : `${reponse.traduits} plat${reponse.traduits > 1 ? "s" : ""} traduit${
              reponse.traduits > 1 ? "s" : ""
            } en anglais.`,
      );
    });
  }

  return (
    <span className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={traduire}
        disabled={enCours || aTraduire === 0}
        className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
      >
        {enCours
          ? "Traduction…"
          : aTraduire === 0
            ? "Carte traduite en anglais"
            : `Traduire en anglais (${aTraduire})`}
      </button>
      {message && <span className="text-xs text-zinc-500">{message}</span>}
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </span>
  );
}
