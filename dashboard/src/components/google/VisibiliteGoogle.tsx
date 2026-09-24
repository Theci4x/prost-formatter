import Link from "next/link";
import {
  ACTIONS,
  evolution,
  type Action,
  type Pas,
  type Point,
  type Totaux,
} from "@/lib/google/performance";
import { plafond } from "@/lib/seo/synthese";
import type { ClesVisibiliteGoogle } from "@/lib/i18n/visibiliteGoogle";

/**
 * Ce que Google compte sur la fiche, en deux graphiques et trois chiffres.
 *
 * À gauche, les apparitions — Maps et la recherche, deux courbes, avec la
 * période précédente en pointillés pour dire si ça monte. À droite, ce que
 * les gens en font, en barres empilées : la hauteur est le total, les
 * tranches disent quoi. Les couleurs suivent un ordre fixe, validé pour
 * les daltoniens ; trois d'entre elles sont pâles sur blanc, d'où les
 * totaux écrits en toutes lettres sous le graphique.
 *
 * Tout est en HTML, sauf les courbes : un SVG étiré dont le trait garde
 * son épaisseur (`non-scaling-stroke`), et aucun texte dedans — un texte
 * dans un SVG étiré se déforme.
 */

export const PERIODES = ["28", "90", "365"] as const;
export type Periode = (typeof PERIODES)[number];

const COULEUR_ACTION: Record<Action, string> = {
  site: "#2a78d6",
  appel: "#eb6834",
  itineraire: "#1baf7a",
  reservation: "#eda100",
  menu: "#e87ba4",
};
const COULEUR_MAPS = "#eb6834";
const COULEUR_RECHERCHE = "#2a78d6";

export function VisibiliteGoogle({
  t,
  locale,
  periode,
  lienPeriode,
  pas,
  actuel,
  precedent,
  totalActuel,
  totalAvant,
  erreur,
}: {
  t: ClesVisibiliteGoogle;
  locale: string;
  periode: Periode;
  lienPeriode: (p: Periode) => string;
  pas: Pas;
  actuel: Point[];
  precedent: Point[];
  totalActuel: Totaux | null;
  totalAvant: Totaux | null;
  erreur: string | null;
}) {
  // L'espace fine des milliers n'existe pas dans la fonte des grands
  // chiffres : une espace insécable ordinaire la remplace.
  const nombre = (n: number) =>
    new Intl.NumberFormat(locale).format(n).replace(/\u202f/g, "\u00a0");
  const court = (n: number) =>
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  const date = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      ...(pas === "mois" ? { day: undefined, year: "2-digit" } : {}),
      timeZone: "UTC",
    });
  const etiquette = (p: Point) =>
    pas === "semaine" ? t.semaineDu(date(p.debut)) : date(p.debut);

  const vide =
    !totalActuel || totalActuel.apparitions + totalActuel.actions === 0;

  return (
    <section className="flex flex-col gap-5" aria-labelledby="visibilite-titre">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="visibilite-titre" className="font-serif text-2xl text-ink">
            {t.titre}
          </h2>
          <p className="text-sm text-zinc-600">{t.chapo}</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {PERIODES.map((p) => (
            <Link
              key={p}
              href={lienPeriode(p)}
              scroll={false}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                p === periode
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
              }`}
            >
              {t.periodes[p]}
            </Link>
          ))}
        </nav>
      </div>

      {erreur ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          {erreur}
        </p>
      ) : vide ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-5 py-6 text-sm text-zinc-600">
          {t.aucunChiffre}
        </p>
      ) : (
        <>
          <Chiffres
            t={t}
            locale={locale}
            nombre={nombre}
            actuel={totalActuel!}
            avant={totalAvant}
          />
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
              <Courbes
                t={t}
                locale={locale}
                court={court}
                nombre={nombre}
                etiquette={etiquette}
                dateAxe={(p) => date(p.debut)}
                actuel={actuel}
                precedent={precedent}
                totalActuel={totalActuel!}
                totalAvant={totalAvant}
              />
            </div>
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
              <Barres
                t={t}
                locale={locale}
                court={court}
                nombre={nombre}
                etiquette={etiquette}
                dateAxe={(p) => date(p.debut)}
                actuel={actuel}
                totalActuel={totalActuel!}
                totalAvant={totalAvant}
              />
            </div>
          </div>
          <p className="max-w-4xl text-xs leading-relaxed text-zinc-500">
            {t.note}
          </p>
        </>
      )}
    </section>
  );
}

function Variation({
  valeur,
  t,
  locale,
}: {
  valeur: number | null;
  t: ClesVisibiliteGoogle;
  locale: string;
}) {
  if (valeur == null) {
    return <span className="text-xs text-zinc-400">{t.pasDeComparaison}</span>;
  }
  const hausse = valeur >= 0;
  return (
    <span
      className={`text-sm font-semibold ${hausse ? "text-emerald-700" : "text-red-600"}`}
    >
      {hausse ? "↗ +" : "↘ "}
      {valeur.toLocaleString(locale)} %
    </span>
  );
}

function Chiffres({
  t,
  nombre,
  actuel,
  avant,
  locale,
}: {
  t: ClesVisibiliteGoogle;
  locale: string;
  nombre: (n: number) => string;
  actuel: Totaux;
  avant: Totaux | null;
}) {
  const taux = actuel.apparitions
    ? Math.round((actuel.actions / actuel.apparitions) * 1000) / 10
    : 0;
  const tauxAvant =
    avant && avant.apparitions
      ? Math.round((avant.actions / avant.apparitions) * 1000) / 10
      : null;
  const tuiles = [
    {
      valeur: nombre(actuel.apparitions),
      libelle: t.apparitionsTotales,
      variation: avant
        ? evolution(actuel.apparitions, avant.apparitions)
        : null,
    },
    {
      valeur: nombre(actuel.actions),
      libelle: t.actionsTotales,
      variation: avant ? evolution(actuel.actions, avant.actions) : null,
    },
    {
      valeur: `${taux.toLocaleString(locale)} %`,
      libelle: `${t.taux} · ${t.tauxAide}`,
      variation: tauxAvant != null ? evolution(taux, tauxAvant) : null,
    },
  ];
  return (
    <dl className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      {tuiles.map((tuile) => (
        <div
          key={tuile.libelle}
          className="flex flex-col gap-1.5 rounded-2xl border border-zinc-200/70 bg-white px-5 py-4 shadow-sm"
        >
          <dd className="order-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-4xl leading-none text-ink">
              {tuile.valeur}
            </span>
            <Variation valeur={tuile.variation} t={t} locale={locale} />
          </dd>
          <dt className="order-2 text-sm text-zinc-600">{tuile.libelle}</dt>
          <dd className="order-3 text-xs text-zinc-400">{t.vsAvant}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Des graduations rondes : un plafond en 1 ou 5 se coupe en cinq
 * (0, 1 000, 2 000…), un plafond en 2 en quatre (0, 500, 1 000…).
 */
function graduations(max: number): number[] {
  const tete = max / 10 ** Math.floor(Math.log10(max));
  return tete === 2 ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.2, 0.4, 0.6, 0.8, 1];
}

/** Quelques dates sous l'axe, pas toutes : au-delà de six, elles se chevauchent. */
function indicesAffiches(n: number): number[] {
  if (n <= 6) return [...Array(n).keys()];
  const pas = Math.ceil((n - 1) / 5);
  const indices: number[] = [];
  for (let i = 0; i < n; i += pas) indices.push(i);
  // La dernière date compte : elle remplace sa voisine si elle la touche.
  if (indices[indices.length - 1] !== n - 1) {
    if (n - 1 - indices[indices.length - 1] < pas / 2 + 1) indices.pop();
    indices.push(n - 1);
  }
  return indices;
}

function Axe({ max, court }: { max: number; court: (n: number) => string }) {
  return (
    <>
      {graduations(max).map((f) => (
        <div
          key={f}
          aria-hidden="true"
          className="absolute inset-x-0 border-t border-zinc-100"
          style={{ bottom: `${f * 100}%` }}
        >
          <span className="absolute -top-2 left-0 w-9 -translate-x-full pr-2 text-right text-[11px] tabular-nums text-zinc-400">
            {court(max * f)}
          </span>
        </div>
      ))}
    </>
  );
}

function Dates({
  points,
  dateAxe,
}: {
  points: Point[];
  dateAxe: (p: Point) => string;
}) {
  const indices = indicesAffiches(points.length);
  return (
    <div className="relative ml-10 h-4 text-[11px] text-zinc-400">
      {indices.map((i) => (
        <span
          key={i}
          className={`absolute whitespace-nowrap ${
            i === 0
              ? ""
              : i === points.length - 1
                ? "-translate-x-full"
                : "-translate-x-1/2"
          }`}
          style={{
            left: `${points.length > 1 ? (i / (points.length - 1)) * 100 : 0}%`,
          }}
        >
          {dateAxe(points[i])}
        </span>
      ))}
    </div>
  );
}

function Legende({
  elements,
}: {
  elements: { couleur: string; libelle: string; pointille?: boolean }[];
}) {
  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
      {elements.map((e) => (
        <span key={e.libelle} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-0 w-4 border-t-2"
            style={{
              borderColor: e.couleur,
              borderStyle: e.pointille ? "dashed" : "solid",
            }}
          />
          {e.libelle}
        </span>
      ))}
    </span>
  );
}

function Courbes({
  t,
  court,
  nombre,
  etiquette,
  dateAxe,
  actuel,
  precedent,
  totalActuel,
  totalAvant,
  locale,
}: {
  t: ClesVisibiliteGoogle;
  locale: string;
  court: (n: number) => string;
  nombre: (n: number) => string;
  etiquette: (p: Point) => string;
  dateAxe: (p: Point) => string;
  actuel: Point[];
  precedent: Point[];
  totalActuel: Totaux;
  totalAvant: Totaux | null;
}) {
  const n = actuel.length;
  const max = plafond(
    Math.max(
      1,
      ...actuel.flatMap((p) => [p.maps, p.recherche]),
      ...precedent.flatMap((p) => [p.maps, p.recherche]),
    ),
  );
  const x = (i: number) => (n > 1 ? (i / (n - 1)) * 100 : 50);
  const y = (v: number) => 100 - (v / max) * 100;
  const ligne = (points: Point[], cle: "maps" | "recherche") =>
    points
      .slice(0, n)
      .map((p, i) => `${x(i)},${y(p[cle])}`)
      .join(" ");

  return (
    <figure
      className="flex flex-col gap-3"
      aria-label={t.graphiqueApparitionsAria}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-ink">{t.apparitions}</span>
        <Legende
          elements={[
            { couleur: COULEUR_MAPS, libelle: t.maps },
            { couleur: COULEUR_RECHERCHE, libelle: t.recherche },
            {
              couleur: "#a1a1aa",
              libelle: t.periodePrecedente,
              pointille: true,
            },
          ]}
        />
      </figcaption>
      <div className="relative ml-10 mt-2 h-56">
        <Axe max={max} court={court} />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          {precedent.length > 1 && (
            <>
              <polyline
                points={ligne(precedent, "maps")}
                fill="none"
                stroke={COULEUR_MAPS}
                strokeOpacity={0.45}
                strokeWidth={2}
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={ligne(precedent, "recherche")}
                fill="none"
                stroke={COULEUR_RECHERCHE}
                strokeOpacity={0.45}
                strokeWidth={2}
                strokeDasharray="5 4"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
          <polyline
            points={ligne(actuel, "maps")}
            fill="none"
            stroke={COULEUR_MAPS}
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={ligne(actuel, "recherche")}
            fill="none"
            stroke={COULEUR_RECHERCHE}
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Le survol : une bande par point, plus large que la courbe. */}
        <div className="absolute inset-0 flex">
          {actuel.map((p, i) => {
            const avant = precedent[i];
            return (
              <span
                key={p.debut}
                title={`${etiquette(p)}\n${t.maps} : ${nombre(p.maps)}\n${t.recherche} : ${nombre(p.recherche)}${
                  avant
                    ? `\n${t.periodePrecedente} : ${nombre(avant.maps + avant.recherche)}`
                    : ""
                }`}
                className="h-full flex-1 hover:bg-zinc-900/[0.03]"
              />
            );
          })}
        </div>
      </div>
      <Dates points={actuel} dateAxe={dateAxe} />

      <ul className="mt-2 grid gap-x-6 gap-y-2 border-t border-zinc-100 pt-3 sm:grid-cols-2">
        {(
          [
            ["maps", t.maps, COULEUR_MAPS],
            ["recherche", t.recherche, COULEUR_RECHERCHE],
          ] as const
        ).map(([cle, libelle, couleur]) => {
          const variation = totalAvant
            ? evolution(totalActuel[cle], totalAvant[cle])
            : null;
          return (
            <li key={cle} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: couleur }}
              />
              <span className="flex-1 text-zinc-700">{libelle}</span>
              <span className="font-semibold tabular-nums text-ink">
                {nombre(totalActuel[cle])}
              </span>
              {variation != null && (
                <span
                  className={`w-14 text-right text-xs tabular-nums ${variation >= 0 ? "text-emerald-700" : "text-red-600"}`}
                >
                  {variation >= 0 ? "+" : ""}
                  {variation.toLocaleString(locale)} %
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

function Barres({
  t,
  court,
  nombre,
  etiquette,
  dateAxe,
  actuel,
  totalActuel,
  totalAvant,
  locale,
}: {
  t: ClesVisibiliteGoogle;
  locale: string;
  court: (n: number) => string;
  nombre: (n: number) => string;
  etiquette: (p: Point) => string;
  dateAxe: (p: Point) => string;
  actuel: Point[];
  totalActuel: Totaux;
  totalAvant: Totaux | null;
}) {
  const total = (p: Point) => ACTIONS.reduce((s, a) => s + p.actions[a], 0);
  const max = plafond(Math.max(1, ...actuel.map(total)));
  // Les actions que Google n'a jamais comptées ici (pas de bouton de
  // réservation, pas de carte en ligne) ne prennent pas de place.
  const presentes = ACTIONS.filter((a) => totalActuel.parAction[a] > 0);

  return (
    <figure className="flex flex-col gap-3" aria-label={t.graphiqueActionsAria}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span className="text-sm font-semibold text-ink">{t.actions}</span>
      </figcaption>
      <div className="relative ml-10 mt-2 h-56">
        <Axe max={max} court={court} />
        <div className="absolute inset-0 flex items-end gap-[3px]">
          {actuel.map((p) => {
            const somme = total(p);
            return (
              <div
                key={p.debut}
                title={`${etiquette(p)} — ${nombre(somme)}\n${presentes
                  .map((a) => `${t.noms[a]} : ${nombre(p.actions[a])}`)
                  .join("\n")}`}
                className="group flex h-full flex-1 flex-col justify-end"
              >
                <div
                  className="flex flex-col-reverse gap-[2px] overflow-hidden rounded-t-[4px] transition group-hover:brightness-110"
                  style={{ height: `${(somme / max) * 100}%` }}
                >
                  {presentes.map((a) =>
                    p.actions[a] > 0 ? (
                      <span
                        key={a}
                        style={{
                          flexGrow: p.actions[a],
                          flexBasis: 0,
                          background: COULEUR_ACTION[a],
                        }}
                      />
                    ) : null,
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Dates points={actuel} dateAxe={dateAxe} />

      {/* La légende porte les totaux : trois couleurs sont pâles sur blanc,
          les chiffres écrits disent ce que la couleur seule dirait mal. */}
      <ul className="mt-2 grid gap-x-6 gap-y-2 border-t border-zinc-100 pt-3 sm:grid-cols-2">
        {presentes.map((a) => {
          const variation = totalAvant
            ? evolution(totalActuel.parAction[a], totalAvant.parAction[a])
            : null;
          return (
            <li key={a} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: COULEUR_ACTION[a] }}
              />
              <span className="flex-1 text-zinc-700">{t.noms[a]}</span>
              <span className="font-semibold tabular-nums text-ink">
                {nombre(totalActuel.parAction[a])}
              </span>
              {variation != null && (
                <span
                  className={`w-14 text-right text-xs tabular-nums ${variation >= 0 ? "text-emerald-700" : "text-red-600"}`}
                >
                  {variation >= 0 ? "+" : ""}
                  {variation.toLocaleString(locale)} %
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
