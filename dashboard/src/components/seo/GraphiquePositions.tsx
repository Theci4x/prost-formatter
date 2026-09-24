import type { RequeteMesuree } from "@/lib/google/search-console";
import {
  DEUXIEME_PAGE,
  POSITION_MAX,
  PREMIERE_PAGE,
  pageDe,
} from "@/lib/seo/synthese";
import type { ClesSeo } from "@/lib/i18n/seo";

/**
 * À quelle place on sort, requête par requête.
 *
 * Un point par requête sur une échelle de 1 à 30, dans le même ordre que
 * le graphique voisin : les deux se lisent comme un seul tableau. La
 * première page est une bande claire ; ce qui est dedans est foncé, ce
 * qui la frôle — la deuxième page — porte l'accent, parce que c'est là
 * qu'un effort paie le plus vite. Le reste est gris : il existe, il n'est
 * pas le sujet.
 *
 * Une seule teinte à trois pas plus un gris. Pas de vert ni de rouge :
 * une position n'est pas un verdict, c'est une distance.
 *
 * En HTML : chaque point est une boîte à `left: n %`, et l'échelle garde
 * une marge de deux pour cent de chaque côté pour que le point de la
 * position 1 ne soit pas coupé par le bord.
 */

const MARGE = 2;

const COULEUR = {
  premiere: "var(--color-brand-orange-dark)",
  deuxieme: "var(--color-brand-orange)",
  loin: "oklch(72% 0.01 60)",
} as const;

/** La position sur l'échelle, en pourcentage de la largeur. */
function pct(position: number): number {
  const p = Math.min(position, POSITION_MAX);
  return MARGE + ((p - 1) / (POSITION_MAX - 1)) * (100 - 2 * MARGE);
}

export function GraphiquePositions({
  requetes,
  t,
  id = "graphique-positions",
}: {
  requetes: RequeteMesuree[];
  t: ClesSeo;
  id?: string;
}) {
  const LIBELLE = t.positions;
  return (
    <figure className="flex flex-col gap-3" aria-labelledby={`${id}-titre`}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span id={`${id}-titre`} className="text-sm font-medium text-ink">
          {t.positionsTitre}
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          {(["premiere", "deuxieme", "loin"] as const).map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: COULEUR[p] }}
              />
              {LIBELLE[p]}
            </span>
          ))}
        </span>
      </figcaption>

      <div className="flex flex-col gap-1">
        <div className="relative">
          {/* La première page : une bande, pas une ligne. On ne « passe »
              pas la position 10, on y est ou on n'y est pas. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded-md bg-brand-orange-soft"
            style={{ width: `${pct(PREMIERE_PAGE) + 1}%` }}
          />
          {/* Deux repères, hairline : la fin de la première page, la fin
              de la deuxième. */}
          {[PREMIERE_PAGE, DEUXIEME_PAGE].map((p) => (
            <div
              key={p}
              aria-hidden="true"
              className="absolute inset-y-0 w-px bg-line"
              style={{ left: `${pct(p) + 1}%` }}
            />
          ))}

          <ol className="relative m-0 flex list-none flex-col p-0">
            {requetes.map((r) => {
              const page = pageDe(r.position);
              const horsEchelle = r.position > POSITION_MAX;
              const x = pct(r.position);
              return (
                <li
                  key={r.requete}
                  title={`${r.requete}\n${t.infobullePosition(r.position, LIBELLE[page])}`}
                  className="group relative h-[34px]"
                >
                  {/* Un filet gris de la marge au point : l'œil retrouve
                      la ligne du graphique voisin sans avoir à compter. */}
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 h-px bg-line"
                    style={{ left: `${MARGE}%`, width: `${x - MARGE}%` }}
                  />
                  {/* L'anneau blanc de 2 px, puis le point. */}
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 flex h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper"
                    style={{ left: `${x}%` }}
                  >
                    <span
                      className="block h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                      style={{ background: COULEUR[page] }}
                    />
                  </span>
                  {/* La valeur, pour la deuxième page seulement : c'est la
                      ligne dont on veut qu'on se souvienne. Les autres
                      sont dans l'infobulle et le tableau. */}
                  {(page === "deuxieme" || horsEchelle) && (
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-xs tabular-nums text-ink-soft ${
                        horsEchelle ? "-translate-x-full" : ""
                      }`}
                      style={{
                        left: horsEchelle
                          ? `calc(${x}% - 12px)`
                          : `calc(${x}% + 12px)`,
                      }}
                    >
                      {horsEchelle ? `> ${POSITION_MAX}` : r.position}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* L'axe : trois repères qui se lisent, pas une règle. */}
        <div className="relative h-4 text-[11px] text-zinc-400">
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${pct(1)}%` }}
          >
            1
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${pct(PREMIERE_PAGE)}%` }}
          >
            10
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${pct(DEUXIEME_PAGE)}%` }}
          >
            20
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${pct(POSITION_MAX)}%` }}
          >
            30+
          </span>
        </div>
      </div>
    </figure>
  );
}
