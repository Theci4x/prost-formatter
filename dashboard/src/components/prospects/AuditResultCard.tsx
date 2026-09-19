import type { AuditResult } from "@/app/test-presence-google/actions";
import type { translations } from "@/lib/i18n/testPresence";
import { formater, type Impact } from "@/lib/audit/actions";

const LABEL_COLORS: Record<AuditResult["label"], string> = {
  excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  bon: "bg-amber-50 text-amber-700 border-amber-200",
  moyen: "bg-orange-50 text-orange-700 border-orange-200",
  critique: "bg-red-50 text-red-700 border-red-200",
};

const COULEURS_IMPACT: Record<Impact, string> = {
  fort: "bg-red-50 text-red-700 border-red-200",
  moyen: "bg-amber-50 text-amber-700 border-amber-200",
  faible: "bg-brand-sand text-ink-soft border-line",
};

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-ink-soft">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-sand">
        <div
          className="h-full rounded-full bg-brand-orange"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AuditResultCard({
  audit,
  t,
  email,
}: {
  audit: AuditResult;
  t: (typeof translations)[keyof typeof translations]["audit"];
  /** Déjà saisie deux écrans plus tôt : on la transporte, on ne la redemande pas. */
  email?: string;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">{t.title}</h3>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${LABEL_COLORS[audit.label]}`}
        >
          {t.labels[audit.label]}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-5xl font-bold text-ink">{audit.score}</span>
        <span className="text-sm text-ink-soft">{t.globalLabel} /100</span>
      </div>

      <div className="flex flex-col gap-4">
        <ScoreBar label={t.localSeo} score={audit.pillars.localSeo} />
        <ScoreBar label={t.eReputation} score={audit.pillars.eReputation} />
        <ScoreBar label={t.geo} score={audit.pillars.geo} />
      </div>

      {/* Un score sans quoi faire ensuite n'est qu'un reproche. Chaque
          ligne porte le chiffre qui la déclenche : « 8 photos » se discute,
          « votre visibilité est perfectible » ne se discute pas. */}
      <div className="flex flex-col gap-3 border-t border-stone-100 pt-5">
        <h4 className="text-sm font-semibold text-ink">{t.actionsTitre}</h4>

        {audit.actions.length === 0 ? (
          <p className="text-sm text-ink-soft">{t.actionsVide}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {audit.actions.map((action) => {
              const texte = t.actions[action.cle];
              return (
                <li
                  key={action.cle}
                  className="flex flex-col gap-1.5 rounded-lg border border-line p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {texte.titre}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${COULEURS_IMPACT[action.impact]}`}
                    >
                      {t.impacts[action.impact]}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {formater(texte.constat, action.valeurs)}
                  </p>
                  {texte.klarr && (
                    <p className="text-sm leading-relaxed text-amber-800">
                      <span className="font-medium">{t.avecKlarr}</span> —{" "}
                      {texte.klarr}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* La seule mesure de cet audit qui interroge vraiment un assistant.
          Elle vient après les actions parce qu'elle ne se corrige pas d'un
          geste — mais c'est elle qu'on retient, parce qu'elle nomme des
          maisons que le restaurateur connaît. */}
      {audit.presenceIa && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand-navy/20 bg-brand-navy px-5 py-5 text-white">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-brand-orange">
            {t.ia.titre}
          </span>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-white/50">
              {t.ia.question}
            </span>
            <p className="font-serif text-lg leading-snug">
              « {audit.presenceIa.question} »
            </p>
          </div>

          <p
            className={`text-sm font-medium ${
              audit.presenceIa.cite ? "text-emerald-300" : "text-orange-300"
            }`}
          >
            {audit.presenceIa.cite
              ? audit.presenceIa.rang
                ? formater(t.ia.citeRang, {
                    rang: String(audit.presenceIa.rang),
                  })
                : t.ia.cite
              : t.ia.pasCite}
          </p>

          {audit.presenceIa.concurrents.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wider text-white/50">
                {t.ia.concurrents}
              </span>
              <ol className="flex flex-col gap-1">
                {audit.presenceIa.concurrents.map((nom, rang) => (
                  <li key={nom} className="flex items-baseline gap-2 text-sm">
                    <span className="font-mono text-xs text-white/40">
                      #{rang + 1}
                    </span>
                    <span>{nom}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-white/60">{t.ia.aucun}</p>
          )}
        </div>
      )}

      {/* Le moment où il est piqué au vif est le seul où il agira. Lui
          promettre un rappel sous 48 heures, c'est le laisser refroidir :
          l'essai doit pouvoir commencer ici, tout de suite, et le rappel
          devient un complément au lieu d'être la seule suite. */}
      <div className="flex flex-col gap-3 rounded-xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-5">
        <span className="font-serif text-xl text-ink">{t.essai.titre}</span>
        <p className="text-sm leading-relaxed text-ink-soft">{t.essai.corps}</p>
        <a
          href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
          className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
        >
          {t.essai.bouton}
        </a>
      </div>

      <p className="text-sm text-ink-soft">{t.recontacted}</p>
    </div>
  );
}
