"use client";

import { useState } from "react";

/**
 * Un formulaire d'ajout replié derrière son bouton.
 *
 * Tant que la liste est vide, il s'ouvre d'office : c'est la seule chose
 * à faire sur l'écran. Une fois qu'elle a des lignes, il se range — on
 * vient surtout relire et corriger ce qui existe, et un formulaire vide
 * toujours déplié prenait plus de place que la liste elle-même.
 */
export function Depliable({
  libelle,
  fermer,
  ouvertParDefaut = false,
  children,
}: {
  libelle: string;
  fermer: string;
  ouvertParDefaut?: boolean;
  children: React.ReactNode;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-5 py-4 text-sm font-semibold text-zinc-700 transition-colors hover:border-ink hover:bg-white hover:text-ink"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        {libelle}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {children}
      {!ouvertParDefaut && (
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="w-fit text-sm text-zinc-500 hover:text-ink"
        >
          {fermer}
        </button>
      )}
    </div>
  );
}
