"use client";

import { useRef, useState } from "react";

/**
 * Un texte à envoyer tel quel ou presque : on le retouche dans la case,
 * puis on le copie d'un geste.
 */
export function TexteACopier({
  titre,
  texte,
  lignes = 6,
}: {
  titre: string;
  texte: string;
  lignes?: number;
}) {
  const champ = useRef<HTMLTextAreaElement>(null);
  const [copie, setCopie] = useState(false);

  async function copier() {
    const valeur = champ.current?.value;
    if (!valeur) return;
    try {
      await navigator.clipboard.writeText(valeur);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papiers refusé : le texte reste sélectionnable à la main.
      champ.current?.select();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-zinc-700">{titre}</span>
        <button
          type="button"
          onClick={copier}
          className="rounded-lg bg-brand-navy px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-navy-hover"
        >
          {copie ? "Copié ✓" : "Copier"}
        </button>
      </div>
      <textarea
        ref={champ}
        defaultValue={texte}
        rows={lignes}
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-brand-navy focus:bg-white"
      />
    </div>
  );
}
