"use client";

/**
 * Le bouton d'impression.
 *
 * Il ne fait qu'appeler le navigateur — mais il évite au restaurateur de
 * chercher le menu, et il disparaît de la feuille imprimée.
 */
export function BoutonImprimer({ libelle }: { libelle: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="sans-impression w-fit rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover"
    >
      {libelle}
    </button>
  );
}
