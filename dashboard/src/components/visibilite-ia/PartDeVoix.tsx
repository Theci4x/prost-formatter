import {
  Courbe,
  couleurDeSerie,
  jourCourt,
} from "@/components/visibilite-ia/Courbe";
import type { Serie } from "@/lib/ai-visibility/score";

/**
 * La part de voix et sa courbe.
 *
 * Le chiffre à gauche, l'évolution à droite : un restaurateur lit le
 * premier en une seconde et cherche la seconde quand il veut savoir si ce
 * qu'il a changé a servi.
 */
export function PartDeVoix({
  series,
  voix,
  reponses,
}: {
  series: Serie[];
  /** Entre 0 et 1. */
  voix: number;
  /** Le nombre de réponses analysées, tous jours confondus. */
  reponses: number;
}) {
  const pourcent = Math.round(voix * 100);
  const joursMesures = series[0]?.points.length ?? 0;

  return (
    <div className="grid gap-6 rounded-2xl border border-line bg-paper p-5 shadow-sm lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-8 lg:p-6">
      {/* Le chiffre d'abord : c'est lui qu'on retient. */}
      <div className="flex flex-col gap-2 lg:border-r lg:border-line lg:pr-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
          Part de voix
        </p>
        <p className="font-sans text-5xl font-semibold leading-none text-brand-navy">
          {pourcent}
          <span className="ml-1 text-2xl font-medium text-ink-soft">%</span>
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          Sur tous les noms d&apos;établissements que les assistants ont cités
          dans tes analyses, {pourcent} % sont le tien. Le taux de citation dit
          si tu figures dans la réponse ; la part de voix dit quelle place tu y
          prends.
        </p>
        {joursMesures > 0 && (
          <p className="font-mono text-xs text-zinc-400">
            {reponses} réponse{reponses > 1 ? "s" : ""} sur {joursMesures} jour
            {joursMesures > 1 ? "s" : ""} d&apos;analyse
          </p>
        )}
      </div>

      {/* La courbe */}
      <div className="flex min-w-0 flex-col gap-3">
        {joursMesures >= 2 ? (
          <>
            {/* Trois géométries : le SVG s'étire avec l'écran, et un
                texte prévu pour 760 px, étiré sur 1 500, devient une
                affiche — les étiquettes doublaient de taille. */}
            <div className="hidden sm:block xl:hidden">
              <Courbe series={series} largeur={760} hauteur={248} etiquettes />
            </div>
            <div className="hidden xl:block">
              <Courbe series={series} largeur={1320} hauteur={300} etiquettes />
            </div>
            <div className="sm:hidden">
              <Courbe
                series={series}
                largeur={360}
                hauteur={220}
                etiquettes={false}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {series.map((serie, rang) => (
                <span
                  key={serie.nom}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-soft"
                >
                  <span
                    aria-hidden
                    className="h-0.5 w-4 rounded-full"
                    style={{
                      backgroundColor: couleurDeSerie(serie, rang),
                    }}
                  />
                  <span
                    className={serie.toi ? "font-semibold text-ink" : undefined}
                  >
                    {serie.nom}
                  </span>
                  <span className="font-mono tabular-nums text-zinc-400">
                    {Math.round(serie.derniere * 100)} %
                  </span>
                </span>
              ))}
            </div>

            <details className="text-xs text-ink-soft">
              <summary className="cursor-pointer select-none hover:text-ink">
                Voir les valeurs
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-96 border-collapse text-left">
                  <caption className="sr-only">
                    Part des réponses citant chaque établissement, jour par
                    jour.
                  </caption>
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="py-1.5 pr-3 font-medium">
                        Jour
                      </th>
                      {series.map((serie) => (
                        <th
                          key={serie.nom}
                          scope="col"
                          className="py-1.5 pr-3 text-right font-medium"
                        >
                          {serie.nom}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {series[0]!.points.map((point, index) => (
                      <tr key={point.jour} className="border-b border-line/60">
                        <th scope="row" className="py-1.5 pr-3 font-normal">
                          {jourCourt(point.jour)}
                        </th>
                        {series.map((serie) => (
                          <td
                            key={serie.nom}
                            className="py-1.5 pr-3 text-right font-mono tabular-nums"
                          >
                            {Math.round(serie.points[index]!.part * 100)} %
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        ) : (
          <div className="flex flex-col justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-8 text-center">
            <p className="text-sm font-medium text-ink">
              La courbe apparaîtra à ta deuxième analyse.
            </p>
            <p className="text-sm text-ink-soft">
              Une part de voix ne vaut que comparée à celle d&apos;avant.
              Relance une analyse dans quelques jours — après avoir travaillé
              ton plan d&apos;action — et tu verras si le travail a payé.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
