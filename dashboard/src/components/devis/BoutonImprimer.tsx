"use client";

/**
 * « Imprimer / Enregistrer en PDF ».
 *
 * Pas de fabrication de PDF côté serveur, et c'est un choix. Le document
 * existe déjà, en HTML, avec sa feuille d'impression : le dialogue du
 * navigateur sait l'enregistrer en PDF, et il en sort exactement ce que le
 * client a sous les yeux. Redessiner le devis une seconde fois dans une
 * bibliothèque de PDF, ce serait deux documents à tenir d'accord — et le
 * jour où ils divergent, c'est celui qui est signé qui a tort.
 *
 * Le libellé dit les deux, parce que c'est le même geste : dans le
 * dialogue d'impression, « Destination » propose « Enregistrer au format
 * PDF ».
 */

export function BoutonImprimer({
  className,
  libelle = "Imprimer / Enregistrer en PDF",
}: {
  className?: string;
  /**
   * Par défaut en français, comme le devis qui l'a vu naître. Le rapport
   * d'audit, lui, se lit en trois langues et passe le sien.
   */
  libelle?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink print:hidden"
      }
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9V2h12v7" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v8H6z" />
      </svg>
      {libelle}
    </button>
  );
}
