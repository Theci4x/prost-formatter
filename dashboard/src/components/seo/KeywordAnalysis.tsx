"use client";

import { useState, useTransition } from "react";
import type { AnalyzeResult } from "@/app/dashboard/[id]/seo/actions";

export function KeywordAnalysis({
  analyzeAction,
}: {
  analyzeAction: () => Promise<AnalyzeResult>;
}) {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex max-w-lg flex-col gap-3">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => setResult(await analyzeAction()))
        }
        disabled={isPending}
        className="self-start rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50"
      >
        {isPending ? "Analyse en cours..." : "Analyser avec Claude"}
      </button>

      {result && "error" in result && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
      {result && "analysis" in result && (
        <div className="whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          {result.analysis}
        </div>
      )}
    </div>
  );
}
