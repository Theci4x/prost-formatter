"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/texte/Markdown";
import { ceQuiABouge } from "@/lib/seo/mots-cles";
import type { Analyse, AnalyzeResult } from "@/app/dashboard/[id]/seo/actions";

/** « le 22 septembre 2026 à 09:36 ». */
function quand(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function KeywordAnalysis({
  analyzeAction,
  precedente,
  motsClesActuels,
}: {
  analyzeAction: () => Promise<AnalyzeResult>;
  /** La dernière analyse rangée en base, s'il y en a une. */
  precedente: Analyse | null;
  /** Les mots-clés ciblés maintenant, pour dire ce qui a bougé. */
  motsClesActuels: string[];
}) {
  const [analyse, setAnalyse] = useState<Analyse | null>(precedente);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const lancer = () =>
    demarrer(async () => {
      setErreur(null);
      const r = await analyzeAction();
      if ("error" in r) setErreur(r.error);
      else setAnalyse(r);
    });

  const bouge = analyse ? ceQuiABouge(analyse.motsCles, motsClesActuels) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={lancer}
          disabled={enCours}
          className="inline-flex items-center gap-2 self-start rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours && (
            <span
              aria-hidden="true"
              className="size-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-brand-orange"
            />
          )}
          {enCours
            ? "Analyse en cours…"
            : analyse
              ? "Relancer l'analyse"
              : "Analyser avec Klarr"}
        </button>

        {analyse && !enCours && (
          <span className="text-xs text-zinc-500">
            Analysée le {quand(analyse.analyseLe)}
          </span>
        )}
      </div>

      {/* Ce qui justifie une relance, quand quelque chose le justifie. */}
      {bouge && !enCours && <p className="text-xs text-amber-800">{bouge}</p>}

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      {enCours ? (
        <Patience aUneAnalyse={Boolean(analyse)} />
      ) : (
        analyse?.analysis && (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 sm:p-6">
            <Markdown texte={analyse.analysis} />
          </div>
        )
      )}
    </div>
  );
}

/**
 * L'attente, pendant que le modèle écrit.
 *
 * Une analyse prend une vingtaine de secondes : un bouton grisé tout seul
 * laisse croire à une panne. On montre la forme du texte à venir — des
 * titres, des paragraphes — plutôt qu'un tourniquet au milieu du vide.
 *
 * Et on dit ce qui advient de l'ancienne. Quelqu'un qui relance a le
 * texte précédent sous les yeux ; le faire disparaître sans un mot donne
 * l'impression de l'avoir perdu.
 */
function Patience({ aUneAnalyse }: { aUneAnalyse: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:p-6">
      <div className="flex animate-pulse flex-col gap-3">
        <div className="h-3.5 w-2/5 rounded bg-zinc-200" />
        <div className="h-2.5 w-full rounded bg-zinc-100" />
        <div className="h-2.5 w-11/12 rounded bg-zinc-100" />
        <div className="h-2.5 w-4/5 rounded bg-zinc-100" />
        <div className="mt-2 h-3.5 w-1/3 rounded bg-zinc-200" />
        <div className="h-2.5 w-full rounded bg-zinc-100" />
        <div className="h-2.5 w-3/4 rounded bg-zinc-100" />
      </div>
      <p className="text-xs text-zinc-500">
        Une analyse prend une vingtaine de secondes.
        {aUneAnalyse ? " La précédente reste affichée si celle-ci échoue." : ""}
      </p>
    </div>
  );
}
