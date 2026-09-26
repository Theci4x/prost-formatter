"use client";

import { useState } from "react";

/**
 * Copier une adresse d'un geste.
 *
 * L'adresse du site se colle ailleurs — fiche Google, bio Instagram,
 * page Facebook. La sélectionner à la main sur un téléphone, c'est en
 * rater la moitié une fois sur deux.
 */
export function BoutonCopier({
  texte,
  libelle = "Copier l'adresse",
  copie = "Adresse copiée ✓",
}: {
  texte: string;
  libelle?: string;
  copie?: string;
}) {
  const [fait, setFait] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setFait(true);
          window.setTimeout(() => setFait(false), 2500);
        } catch {
          // Presse-papiers refusé (navigateur ancien, page non sécurisée) :
          // l'adresse reste affichée juste à côté, à sélectionner à la main.
        }
      }}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
    >
      {fait ? copie : libelle}
    </button>
  );
}
