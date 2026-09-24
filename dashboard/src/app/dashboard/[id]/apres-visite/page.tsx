import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { GENRE_AVIS, liensAvis, messageAvis } from "@/lib/courriel/apresVisite";
import { estLangue, type Langue } from "@/lib/i18n/langues";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { APRES_VISITE } from "@/lib/i18n/apresVisite";
import { localeDe } from "@/lib/i18n/seo";
import { basculerAvisApresVisite } from "./actions";

/**
 * La demande d'avis du lendemain.
 *
 * Elle part toute seule ; cette page sert à la voir telle qu'elle arrive,
 * dans les trois langues, et à la couper. Le réglage vit ici plutôt que
 * sur la page des avis : c'est le carnet qui fournit les adresses, et une
 * maison abonnée aux seules réservations doit pouvoir y toucher.
 */

/** L'instant d'il y a `jours` jours : lu hors du rendu, comme toute horloge. */
function ilYA(jours: number): string {
  return new Date(Date.now() - jours * 24 * 3600 * 1000).toISOString();
}

/** Les `n` derniers jours à Paris, du plus ancien à aujourd'hui. */
function derniersJours(n: number): string[] {
  const jours: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    jours.push(jourParis(new Date(Date.now() - i * 24 * 3600 * 1000)));
  }
  return jours;
}

function jourParis(d: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const jourCourt = (iso: string, locale: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });

const LANGUES: Langue[] = ["fr", "en", "zh"];

export default async function ApresVisitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ langue?: string }>;
}) {
  const { id } = await params;
  const { langue: langueDemandee } = await searchParams;
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");
  const ui = await langueUtilisateur();
  const t = APRES_VISITE[ui];
  const locale = localeDe(ui);

  const supabase = await createClient();
  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const restaurant = restaurantData as {
    id: string;
    nom: string;
    adresse: string | null;
    google_place_id: string | null;
    slug_reservation: string | null;
    avis_apres_visite?: boolean | null;
  } | null;
  if (!restaurant) notFound();

  const actif = restaurant.avis_apres_visite !== false;
  const liens = liensAvis(restaurant);
  // L'aperçu s'ouvre dans la langue de l'écran ; les puces montrent les autres.
  const langue: Langue = estLangue(langueDemandee) ? langueDemandee : ui;

  // Le journal des envois n'est lisible qu'avec la clé de service : il
  // porte les adresses de tous les clients de toutes les maisons.
  const depuis = ilYA(30);
  const service = createServiceClient();
  const [envoisResult, retoursResult] = await Promise.all([
    service
      .from("reservation_courriels")
      .select("erreur, envoye_le, restaurant_reservations!inner(restaurant_id)")
      .eq("genre", GENRE_AVIS)
      .eq("restaurant_reservations.restaurant_id", id)
      .gte("envoye_le", depuis),
    supabase
      .from("restaurant_retours")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id)
      .gte("created_at", depuis),
  ]);
  const envois = (envoisResult.data ?? []) as {
    erreur: string | null;
    envoye_le: string;
  }[];
  const partis = envois.filter((e) => !e.erreur).length;
  const echecs = envois.length - partis;
  const retours = retoursResult.count ?? 0;

  // Les envois jour par jour : le matin où rien n'est parti se voit.
  const parJour = new Map<string, number>();
  for (const e of envois) {
    if (e.erreur) continue;
    const j = jourParis(new Date(e.envoye_le));
    parJour.set(j, (parJour.get(j) ?? 0) + 1);
  }
  const jours = derniersJours(30).map((j) => ({
    jour: j,
    n: parJour.get(j) ?? 0,
  }));
  const pic = Math.max(1, ...jours.map((j) => j.n));

  const message = liens
    ? messageAvis({
        restaurantNom: restaurant.nom,
        restaurantAdresse: restaurant.adresse,
        langue,
        ...liens,
        lienDesabonnement: "#",
      })
    : null;

  const PARCOURS = t.parcours;
  const EXCLUS = t.exclus;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.avis}
          title={t.titre(restaurant.nom)}
          backHref={`/dashboard/${id}/notifications`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">{t.chapo}</p>
      </div>

      {/* ── L'essentiel : combien sont partis, et l'interrupteur ──────── */}
      <section className="relative grid grid-cols-[minmax(0,1fr)] gap-6 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-orange/10 blur-3xl"
        />
        <div className="relative flex min-w-0 flex-col gap-3">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-6xl leading-none text-ink">
              {partis}
            </span>
            <span className="text-sm text-zinc-600">{t.envoyees(partis)}</span>
          </span>
          <p className="max-w-xl text-base leading-relaxed text-zinc-700">
            {partis === 0
              ? actif
                ? t.rienParti
                : t.coupe
              : t.retours(retours)}
            {echecs > 0 && t.echecs(echecs)}
          </p>

          {/* Les envois jour par jour : le trou d'un matin se voit. */}
          <figure className="mt-2 flex flex-col gap-2">
            <div
              className="flex h-16 items-end gap-[3px]"
              role="img"
              aria-label={t.graphiqueAria(pic)}
            >
              {jours.map((j) => (
                <span
                  key={j.jour}
                  title={t.bulleJour(jourCourt(j.jour, locale), j.n)}
                  className={`flex-1 rounded-t-[3px] ${j.n > 0 ? "bg-brand-orange" : "bg-zinc-100"}`}
                  style={{
                    height:
                      j.n > 0 ? `${Math.max(12, (j.n / pic) * 100)}%` : "4px",
                  }}
                />
              ))}
            </div>
            <figcaption className="flex justify-between text-xs text-zinc-500">
              <span>{jourCourt(jours[0].jour, locale)}</span>
              <span>{t.envoisParJour}</span>
              <span>{t.aujourdhui}</span>
            </figcaption>
          </figure>
        </div>

        {/* L'interrupteur. */}
        <div className="relative flex min-w-0 flex-col gap-3 rounded-xl bg-zinc-50 p-5 lg:w-[22rem]">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${actif ? "bg-emerald-500" : "bg-zinc-300"}`}
            />
            <span className="font-semibold text-ink">
              {actif ? t.actifTitre : t.coupeTitre}
            </span>
          </span>
          <span className="text-sm leading-relaxed text-zinc-600">
            {actif ? t.actifTexte : t.coupeTexte}
          </span>
          <form action={basculerAvisApresVisite}>
            <input type="hidden" name="restaurant_id" value={id} />
            <input type="hidden" name="actif" value={actif ? "0" : "1"} />
            <button
              type="submit"
              className={
                actif
                  ? "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                  : "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              }
            >
              {actif ? t.couper : t.remettre}
            </button>
          </form>
          <Link
            href={`/dashboard/${id}/retours`}
            className="text-sm font-semibold text-brand-navy hover:underline"
          >
            {t.lireMessages}
          </Link>
        </div>
      </section>

      {!restaurant.google_place_id && liens && (
        <p className="max-w-4xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-ink">
          {t.pasDeFicheAvant}
          <Link
            href={`/dashboard/${id}/google`}
            className="font-semibold underline"
          >
            {t.pasDeFicheLien}
          </Link>
          .
        </p>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── L'e-mail, tel qu'il arrive ───────────────────────────────── */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">{t.recoitTitre}</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUES.map((l) => (
                <Link
                  key={l}
                  href={`/dashboard/${id}/apres-visite?langue=${l}`}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    l === langue
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                  }`}
                >
                  {t.langues[l]}
                </Link>
              ))}
            </div>
          </div>

          {message ? (
            <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-zinc-100 bg-zinc-50/70 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy font-serif text-base text-white"
                  >
                    {restaurant.nom.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-ink">
                      {restaurant.nom}
                    </span>
                    <span className="truncate text-xs text-zinc-500">
                      {t.envoyePar}
                    </span>
                  </div>
                  <span className="ml-auto shrink-0 text-xs text-zinc-500">
                    11:00
                  </span>
                </div>
                <p className="text-sm font-semibold text-ink">
                  {message.sujet}
                </p>
              </div>
              <iframe
                title={t.apercuTitre}
                srcDoc={message.html}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                className="block h-[560px] w-full bg-white"
              />
            </div>
          ) : (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 shadow-sm">
              {t.sansAdresse}
            </p>
          )}
        </section>

        {/* ── Le parcours, et qui n'est pas concerné ───────────────────── */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
          <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-ink">{t.parcoursTitre}</h2>
            <ol className="flex flex-col">
              {PARCOURS.map((etape, i) => (
                <li
                  key={etape.quand}
                  className="relative flex gap-4 pb-5 last:pb-0"
                >
                  {i < PARCOURS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[11px] top-7 bottom-1 w-px bg-zinc-200"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      i === 1
                        ? "bg-brand-orange text-white"
                        : "border border-zinc-200 bg-white text-zinc-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink">
                      {etape.quand}
                    </span>
                    <span className="text-sm leading-relaxed text-zinc-600">
                      {etape.quoi}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-2xl text-ink">{t.exclusTitre}</h2>
            <ul className="flex flex-col gap-3">
              {EXCLUS.map((e) => (
                <li key={e.titre} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-500"
                  >
                    ✕
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">
                      {e.titre}
                    </span>
                    <span className="text-xs text-zinc-500">{e.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
