"use client";

import { useState } from "react";

/**
 * Le lien de paiement, à copier. Klarr ne sait pas encore envoyer d'e-mail :
 * c'est le restaurateur qui transmet le lien, par le canal où il parle déjà à
 * son client — SMS, WhatsApp, sa propre messagerie. Rien ne l'attend, rien ne
 * se perd dans des indésirables, et il voit ce qu'il envoie.
 */
export function LienAcompte({ lien }: { lien: string }) {
  const [copie, setCopie] = useState(false);

  return (
    <span className="flex flex-wrap items-center gap-2">
      <input
        readOnly
        value={lien}
        aria-label="Lien de paiement de l'acompte"
        onFocus={(evenement) => evenement.currentTarget.select()}
        className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-xs text-zinc-600"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(lien);
            setCopie(true);
            setTimeout(() => setCopie(false), 2000);
          } catch {
            // Presse-papiers refusé (navigateur ancien, page non sécurisée) :
            // le champ reste sélectionnable à la main, on ne ment pas en
            // affichant « copié ».
            setCopie(false);
          }
        }}
        className="shrink-0 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        {copie ? "Copié" : "Copier"}
      </button>
    </span>
  );
}
