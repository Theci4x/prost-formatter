"use client";

export function BoutonImprimer({ libelle }: { libelle: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
    >
      {libelle}
    </button>
  );
}
