import type { AuditResult } from "@/app/test-presence-google/actions";
import type { translations } from "@/lib/i18n/testPresence";

const LABEL_COLORS: Record<AuditResult["label"], string> = {
  excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  bon: "bg-amber-50 text-amber-700 border-amber-200",
  moyen: "bg-orange-50 text-orange-700 border-orange-200",
  critique: "bg-red-50 text-red-700 border-red-200",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">{label}</span>
        <span className="text-stone-500">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-amber-600"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AuditResultCard({
  audit,
  t,
}: {
  audit: AuditResult;
  t: (typeof translations)[keyof typeof translations]["audit"];
}) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">{t.title}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${LABEL_COLORS[audit.label]}`}
        >
          {t.labels[audit.label]}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl font-bold text-stone-900">
          {audit.score}
        </span>
        <span className="text-sm text-stone-500">{t.globalLabel} /100</span>
      </div>

      <div className="flex flex-col gap-4">
        <ScoreBar label={t.localSeo} score={audit.pillars.localSeo} />
        <ScoreBar label={t.eReputation} score={audit.pillars.eReputation} />
        <ScoreBar label={t.geo} score={audit.pillars.geo} />
      </div>

      {audit.summary && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
          {audit.summary}
        </p>
      )}

      <p className="text-sm font-medium text-amber-700">{t.recontacted}</p>
    </div>
  );
}
