"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/texte/Markdown";
import type { AnalyzeResult } from "@/app/dashboard/[id]/seo/actions";

export function KeywordAnalysis({
  analyzeAction,
}: {
  analyzeAction: () => Promise<AnalyzeResult>;
}) {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => setResult(await analyzeAction()))
        }
        disabled={isPending}
        className="self-start rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50"
      >
        {isPending ? "Analyse en cours…" : "Analyser avec Claude"}
      </button>

      {result && "error" in result && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
      {result && "analysis" in result && (
        // Une analyse, ce sont des titres, des listes et des tableaux :
        // elle a besoin de la largeur d'une page, pas de celle d'un
        // formulaire. Elle s'arrête quand même à 65 caractères par ligne
        // environ — au-delà, l'œil perd le début de la ligne suivante.
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 sm:p-6">
          <Markdown texte={result.analysis} />
        </div>
      )}
    </div>
  );
}
