import type { Serie } from "@/lib/ai-visibility/score";
import type { T } from "@/lib/i18n/t";

/**
 * Une seule ligne compte — la sienne. Les concurrents sont du contexte :
 * ils se lisent en gris, et c'est l'orange qu'on suit des yeux. Cinq
 * courbes de cinq couleurs, comme chez les concurrents, obligent à faire
 * l'aller-retour avec la légende à chaque point.
 *
 * Les trois valeurs ont été vérifiées ensemble (séparation sous
 * daltonisme et contraste sur fond blanc) : l'orange de marque garde ses
 * étiquettes en bout de ligne et son tableau de valeurs, qui compensent
 * son contraste juste en dessous de 3:1.
 */
const COULEUR_TOI = "#e8871e";
const COULEURS_CONTEXTE = ["#3f3f46", "#8e8e98"];

export function couleurDeSerie(serie: Serie, rang: number): string {
  return serie.toi
    ? COULEUR_TOI
    : (COULEURS_CONTEXTE[rang - 1] ?? COULEURS_CONTEXTE.at(-1)!);
}

const enPourcent = (part: number) => `${Math.round(part * 100)} %`;

export function jourCourt(jour: string, locale = "fr-FR"): string {
  // Midi plutôt que minuit : une date lue en UTC puis affichée dans un
  // autre fuseau reculerait d'un jour.
  return new Date(`${jour}T12:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * La courbe, en SVG et sans JavaScript. Deux géométries plutôt qu'une
 * seule redimensionnée : à 390 px de large, un texte prévu pour 760
 * devient illisible.
 */
export function Courbe({
  t,
  locale,
  series,
  largeur,
  hauteur,
  etiquettes,
}: {
  t: T;
  locale: string;
  series: Serie[];
  largeur: number;
  hauteur: number;
  /** Nommer chaque ligne à son extrémité. Faux quand la place manque. */
  etiquettes: boolean;
}) {
  const dates = series[0]?.points.map((p) => p.jour) ?? [];
  if (series.length === 0 || dates.length < 2) return null;

  const marge = {
    haut: 18,
    droite: etiquettes ? 146 : 14,
    bas: 28,
    gauche: 36,
  };
  const largeurTrace = largeur - marge.gauche - marge.droite;
  const hauteurTrace = hauteur - marge.haut - marge.bas;

  const instant = (jour: string) => Date.parse(`${jour}T12:00:00Z`);
  const debut = instant(dates[0]!);
  // Les analyses sont irrégulières : espacer les jours à intervalle égal
  // inventerait un rythme que le restaurateur n'a pas eu.
  const etendue = instant(dates.at(-1)!) - debut || 1;
  const x = (jour: string) =>
    marge.gauche + ((instant(jour) - debut) / etendue) * largeurTrace;
  const y = (part: number) => marge.haut + (1 - part) * hauteurTrace;

  // Premier et dernier toujours ; entre les deux, seulement ce qui tient.
  // Les analyses ne sont pas régulières : deux dates voisines dans le
  // temps se chevauchent sur l'axe même quand elles sont peu nombreuses.
  const placeMin = etiquettes ? 58 : 74;
  const reperes = [0];
  for (let i = 1; i < dates.length - 1; i += 1) {
    const ici = x(dates[i]!);
    if (
      ici - x(dates[reperes.at(-1)!]!) >= placeMin &&
      x(dates.at(-1)!) - ici >= placeMin
    ) {
      reperes.push(i);
    }
  }
  if (dates.length > 1) reperes.push(dates.length - 1);

  const chemin = (serie: Serie) =>
    serie.points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.jour)} ${y(p.part)}`)
      .join(" ");

  // Les étiquettes de fin se chevauchent dès que deux lignes se touchent :
  // on les écarte de proche en proche sans jamais sortir du cadre.
  const ecart = 14;
  const placees = series
    .map((serie, rang) => ({ serie, rang, y: y(serie.derniere) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < placees.length; i += 1) {
    const precedent = placees[i - 1]!;
    if (placees[i]!.y - precedent.y < ecart) {
      placees[i]!.y = precedent.y + ecart;
    }
  }
  const debord = placees.at(-1)!.y - (hauteur - marge.bas + 4);
  if (debord > 0) for (const p of placees) p.y -= debord;

  return (
    <svg
      viewBox={`0 0 ${largeur} ${hauteur}`}
      className="h-auto w-full"
      role="img"
      aria-label={t(
        "Part des réponses citant {nom} et ses concurrents, du {debut} au {fin}.",
        {
          nom: series[0]!.nom,
          debut: jourCourt(dates[0]!, locale),
          fin: jourCourt(dates.at(-1)!, locale),
        },
      )}
    >
      {/* Le repère : des filets pleins, une nuance au-dessus du fond. */}
      {[0, 0.5, 1].map((part) => (
        <g key={part}>
          <line
            x1={marge.gauche}
            x2={marge.gauche + largeurTrace}
            y1={y(part)}
            y2={y(part)}
            className="stroke-line"
            strokeWidth={1}
          />
          <text
            x={marge.gauche - 8}
            y={y(part) + 3.5}
            textAnchor="end"
            fontSize={10}
            className="fill-ink-soft tabular-nums"
          >
            {Math.round(part * 100)}
          </text>
        </g>
      ))}

      {reperes.map((i) => (
        <text
          key={dates[i]}
          x={x(dates[i]!)}
          y={hauteur - 10}
          textAnchor={
            i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"
          }
          fontSize={10}
          className="fill-ink-soft"
        >
          {jourCourt(dates[i]!, locale)}
        </text>
      ))}

      {/* Le contexte d'abord, sa ligne par-dessus. */}
      {series.map((serie, rang) =>
        serie.toi ? null : (
          <path
            key={serie.nom}
            d={chemin(serie)}
            fill="none"
            stroke={couleurDeSerie(serie, rang)}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
      <path
        d={chemin(series[0]!)}
        fill="none"
        stroke={COULEUR_TOI}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {series[0]!.points.map((p) => (
        <circle
          key={p.jour}
          cx={x(p.jour)}
          cy={y(p.part)}
          r={4}
          fill={COULEUR_TOI}
          stroke="#ffffff"
          strokeWidth={2}
        />
      ))}

      {/* De quoi lire une valeur au survol sans une ligne de JavaScript.
          La cible est large : viser un point de 8 px est un supplice. */}
      {series.map((serie, rang) =>
        serie.points
          .map((p) => (
            <circle
              key={`${serie.nom}-${p.jour}`}
              cx={x(p.jour)}
              cy={y(p.part)}
              r={12}
              fill="transparent"
            >
              <title>{`${serie.nom} — ${jourCourt(p.jour, locale)} : ${enPourcent(p.part)}`}</title>
            </circle>
          ))
          .concat(
            etiquettes
              ? [
                  <text
                    key={`${serie.nom}-fin`}
                    x={marge.gauche + largeurTrace + 10}
                    y={placees.find((e) => e.rang === rang)!.y + 3.5}
                    fontSize={11}
                    fontWeight={serie.toi ? 600 : 400}
                    fill={couleurDeSerie(serie, rang)}
                  >
                    {serie.nom.length > 14
                      ? `${serie.nom.slice(0, 13)}…`
                      : serie.nom}
                    <tspan className="tabular-nums" dx={6} opacity={0.75}>
                      {enPourcent(serie.derniere)}
                    </tspan>
                  </text>,
                ]
              : [],
          ),
      )}
    </svg>
  );
}
