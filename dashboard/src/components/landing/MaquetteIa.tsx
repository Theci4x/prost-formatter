import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";
import { CITATIONS, MAISON, VERDICTS } from "@/lib/demo/maison";

/**
 * Ce qu'un assistant répond quand un client demande où manger.
 *
 * C'est l'écran qui fait réagir : le restaurateur y lit le nom de son
 * voisin là où il attendait le sien. Sombre, parce que c'est la nuit de
 * la machine qu'on montre — et parce que sur une page claire, c'est ce
 * cadre-là que l'œil trouve en premier.
 *
 * Trois choses, dans l'ordre où on les lit : la question, telle qu'un
 * client la tape ; le verdict de chaque assistant ; les maisons citées à
 * la place de la nôtre, avec la part de réponses où elles apparaissent.
 */
export function MaquetteIa({
  t,
  exemple,
}: {
  t: ClesAccueilPublic["vitrine"]["ia"];
  exemple: string;
}) {
  const total = VERDICTS.length;
  const plusCitee = Math.max(...CITATIONS.map((c) => c.fois));

  return (
    <div
      aria-label={`${exemple} — ${t.surtitre}`}
      className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-brand-navy p-5 text-white shadow-[0_40px_90px_-40px_oklch(20%_0.02_60/60%)] sm:p-6"
    >
      {/* Une grille fine, comme un fond d'écran d'instrument : elle donne
          la profondeur sans rien dire. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at 30% 0%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-orange/25 blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-orange">
          {t.surtitre}
        </span>
        <Etiquette>{exemple}</Etiquette>
      </div>

      <div className="relative flex flex-col gap-1.5">
        <span className="text-[11px] uppercase tracking-wider text-white/45">
          {t.questionLabel}
        </span>
        {/* Les guillemets viennent avec la question : ils changent avec
            la langue, et « » autour d'une phrase chinoise se voit. */}
        <p className="font-serif text-xl leading-snug sm:text-2xl">
          {t.question}
        </p>
      </div>

      {/* Le verdict par assistant : trois pastilles, la seule qui cite
          allumée. */}
      <div className="relative flex flex-wrap gap-2">
        {VERDICTS.map((v) => {
          const cite = v.rang !== null;
          return (
            <span
              key={v.modele}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                cite
                  ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-200"
                  : "border-white/15 bg-white/5 text-white/70"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${cite ? "bg-emerald-300" : "bg-white/30"}`}
              />
              <span className="font-medium">{v.modele}</span>
              <span className="font-mono tabular-nums">
                {cite ? t.cite.replace("{rang}", String(v.rang)) : t.nonCite}
              </span>
            </span>
          );
        })}
      </div>

      {/* Les maisons citées, la nôtre en dernier et en couleur : c'est le
          rang qui fait mal, pas le chiffre. */}
      <div className="relative flex flex-col gap-2.5 border-t border-white/10 pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wider text-white/45">
            {t.aVotrePlace}
          </span>
          <span className="font-mono text-[11px] text-white/40">
            {t.surReponses}
          </span>
        </div>
        <ol className="flex flex-col gap-2">
          {CITATIONS.map((c, i) => (
            <li
              key={c.nom}
              className="grid grid-cols-[1.25rem_1fr_2.5rem] items-center gap-3 text-sm"
            >
              <span className="font-mono text-xs text-white/40">#{i + 1}</span>
              <div className="flex flex-col gap-1">
                <span
                  className={
                    c.nous ? "font-semibold text-brand-orange" : "text-white/90"
                  }
                >
                  {c.nom}
                </span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${c.nous ? "bg-brand-orange" : "bg-white/50"}`}
                    style={{ width: `${(c.fois / plusCitee) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-right font-mono text-xs tabular-nums text-white/60">
                {c.fois}/{total}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function Etiquette({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-current/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
      {children}
    </span>
  );
}

/** Ce que la maquette ne dit pas : le nom de la maison, pour l'accessibilité. */
export const MAISON_NOM = MAISON.nom;
