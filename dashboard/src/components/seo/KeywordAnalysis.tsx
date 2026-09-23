"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/texte/Markdown";
import { Patience } from "@/components/seo/Patience";
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
    <section className="flex flex-col gap-4" aria-labelledby="analyse-titre">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="analyse-titre" className="font-serif text-2xl text-ink">
            Analyse SEO par Klarr Tool
          </h2>
          <p className="text-xs text-ink-soft">
            {analyse && !enCours
              ? `Analysée le ${quand(analyse.analyseLe)}`
              : "Un audit local complet, écrit pour ton établissement."}
          </p>
        </div>

        <button
          type="button"
          onClick={lancer}
          disabled={enCours}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours ? (
            <span
              aria-hidden="true"
              className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
          ) : (
            <Etincelle />
          )}
          {enCours
            ? "Analyse en cours…"
            : analyse
              ? "Relancer l'analyse"
              : "Lancer l'analyse"}
        </button>
      </div>

      {/* Ce qui justifie une relance, quand quelque chose le justifie. */}
      {bouge && !enCours && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {bouge}
        </p>
      )}

      {erreur && (
        <p className="text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}

      {enCours ? (
        <Patience aUneAnalyse={Boolean(analyse)} />
      ) : analyse?.analysis ? (
        <div className="rounded-2xl border border-line bg-paper shadow-sm p-5 text-sm text-zinc-700 sm:p-7">
          <Markdown texte={analyse.analysis} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-paper/60 px-6 py-8 text-sm leading-relaxed text-ink-soft">
          Aucune analyse pour le moment. Elle s&apos;appuie sur ton nom, ton
          adresse, tes mots-clés ciblés et — quand Search Console est relié —
          sur ce que les gens tapent vraiment. Ajoute tes mots-clés d&apos;abord
          : l&apos;analyse en sera meilleure.
        </div>
      )}
    </section>
  );
}

function Etincelle() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </svg>
  );
}
