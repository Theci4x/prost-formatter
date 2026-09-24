import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { TitreSection } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import {
  EncaisserBon,
  OffrirBon,
  ReglagesBons,
} from "@/components/bons/GestionBons";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { siteUrl } from "@/lib/site-url";
import {
  MONTANTS_PAR_DEFAUT,
  etatDuBon,
  normaliserCode,
  prixBon,
  type EtatBon,
} from "@/lib/bons/regles";
import type { Bon } from "@/lib/bons/serveur";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { BONS_CAISSE } from "@/lib/i18n/bonsCaisse";
import { localeDe } from "@/lib/i18n/seo";
import { annulerBon, prolongerBon } from "./actions";

/**
 * Les bons cadeaux, côté maison : la page à partager, les réglages, et
 * surtout la caisse — taper un code, voir ce qu'il reste, déduire.
 */

const COULEUR_ETAT: Record<EtatBon, string> = {
  attente: "border-zinc-200 bg-zinc-50 text-zinc-500",
  valide: "border-emerald-200 bg-emerald-50 text-emerald-800",
  epuise: "border-zinc-200 bg-zinc-100 text-zinc-600",
  expire: "border-brand-orange/30 bg-brand-orange-soft text-ink",
  annule: "border-zinc-200 bg-zinc-100 text-zinc-500",
};

function aujourdhuiParis(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Le jour ISO dans `n` jours : lu hors du rendu, comme toute horloge. */
function dansJours(n: number): string {
  return new Date(Date.now() + n * 24 * 3600 * 1000).toISOString().slice(0, 10);
}

const jourEn = (iso: string, locale: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString(
    locale,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Paris",
    },
  );

const enEuros = (centimes: number) =>
  (centimes / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: centimes % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

export default async function BonsCadeauxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string; filtre?: string }>;
}) {
  const { id } = await params;
  const { code: codeCherche, filtre: filtreDemande } = await searchParams;
  const filtre: EtatBon | "tous" = (
    ["valide", "epuise", "expire", "annule"] as string[]
  ).includes(filtreDemande ?? "")
    ? (filtreDemande as EtatBon)
    : "tous";
  await exiger(id, "gerant");
  await exigerModule(id, "reservations");
  const ui = await langueUtilisateur();
  const t = BONS_CAISSE[ui];
  const LIBELLE_ETAT = t.etats;
  const jour = (iso: string) => jourEn(iso, localeDe(ui));

  const supabase = await createClient();
  const [{ data: restaurantData }, { data: connexion }, bonsResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_stripe_connexions")
        .select("stripe_account_id, paiements_actifs")
        .eq("restaurant_id", id)
        .maybeSingle(),
      supabase
        .from("restaurant_bons_cadeaux")
        .select("*")
        .eq("restaurant_id", id)
        .neq("statut", "attente")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

  const restaurant = restaurantData as {
    id: string;
    nom: string;
    slug_reservation: string | null;
    bons_cadeaux_actifs?: boolean | null;
    bons_cadeaux_montants?: number[] | null;
    bons_cadeaux_validite_mois?: number | null;
    bons_cadeaux_texte?: string | null;
  } | null;
  if (!restaurant) notFound();

  const migrationManquante =
    bonsResult.error?.code === "42P01" ||
    bonsResult.error?.code === "PGRST205" ||
    restaurant.bons_cadeaux_actifs === undefined;
  const stripe = connexion as {
    stripe_account_id: string;
    paiements_actifs: boolean;
  } | null;
  const stripePret = Boolean(
    stripe?.stripe_account_id && stripe.paiements_actifs,
  );

  const aujourdhui = aujourdhuiParis();
  const bons = (bonsResult.data ?? []) as Bon[];
  const avecEtat = bons.map((bon) => ({
    bon,
    etat: etatDuBon(bon, aujourdhui),
  }));
  const vendus = bons.filter((b) => b.origine === "vente");
  const encaisse = vendus.reduce((t, b) => t + b.montant_centimes, 0);
  const aHonorer = avecEtat
    .filter((x) => x.etat === "valide")
    .reduce((t, x) => t + x.bon.solde_centimes, 0);
  const dansUnMois = dansJours(30);
  const bientotExpires = avecEtat.filter(
    (x) =>
      x.etat === "valide" && x.bon.expire_le && x.bon.expire_le <= dansUnMois,
  ).length;

  // La caisse : un code tapé, retrouvé parmi les bons de cette maison
  // seulement — la politique d'accès le garantit, le filtre le redit.
  const code = codeCherche ? normaliserCode(codeCherche) : null;
  let trouve: { bon: Bon; etat: EtatBon } | null = null;
  let utilisations: { montant_centimes: number; utilise_le: string }[] = [];
  if (code) {
    const { data } = await supabase
      .from("restaurant_bons_cadeaux")
      .select("*")
      .eq("restaurant_id", id)
      .eq("code", code)
      .maybeSingle();
    if (data) {
      const bon = data as Bon;
      trouve = { bon, etat: etatDuBon(bon, aujourdhui) };
      const { data: passages } = await supabase
        .from("restaurant_bons_utilisations")
        .select("montant_centimes, utilise_le")
        .eq("bon_id", bon.id)
        .order("utilise_le", { ascending: false });
      utilisations = (passages ?? []) as typeof utilisations;
    }
  }

  const lienPublic = restaurant.slug_reservation
    ? `${siteUrl()}/cadeau/${restaurant.slug_reservation}`
    : null;
  const enVente = Boolean(restaurant.bons_cadeaux_actifs) && stripePret;

  const valables = avecEtat.filter((x) => x.etat === "valide").length;
  const compte = (etat: EtatBon) =>
    avecEtat.filter((x) => x.etat === etat).length;
  const chiffres = [
    { libelle: t.aServir, valeur: prixBon(aHonorer) },
    { libelle: t.valables, valeur: valables },
    { libelle: t.utilises, valeur: compte("epuise") },
    {
      libelle: t.offertsParToi,
      valeur: bons.filter((b) => b.origine === "offert").length,
    },
  ];
  const affiches =
    filtre === "tous" ? avecEtat : avecEtat.filter((x) => x.etat === filtre);
  const FILTRES: { cle: EtatBon | "tous"; libelle: string }[] = (
    ["tous", "valide", "epuise", "expire", "annule"] as const
  ).map((cle) => ({ cle, libelle: t.filtres[cle] }));
  const lienFiltre = (cle: EtatBon | "tous") =>
    cle === "tous"
      ? `/dashboard/${id}/bons-cadeaux#bons`
      : `/dashboard/${id}/bons-cadeaux?filtre=${cle}#bons`;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.cadeau}
          title={t.titre(restaurant.nom)}
        />
        <p className="max-w-4xl text-sm text-zinc-600">{t.chapo}</p>
      </div>

      {migrationManquante && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          {t.migration}
        </p>
      )}

      {!migrationManquante && !stripePret && (
        <p className="max-w-4xl rounded-2xl border border-brand-orange/30 bg-brand-orange-soft px-5 py-4 text-sm text-ink">
          {t.sansStripe}{" "}
          <Link
            href={`/dashboard/${id}/paiements`}
            className="font-semibold underline"
          >
            {t.relierStripe}
          </Link>
        </p>
      )}

      {/* ── L'essentiel : l'argent, et ce qu'il reste à servir ────────── */}
      <section className="relative grid gap-6 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-orange/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-3">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-serif text-6xl leading-none text-ink">
              {prixBon(encaisse)}
            </span>
            <span className="text-sm text-zinc-600">
              {t.encaisses(vendus.length)}
            </span>
          </span>
          <p className="max-w-xl text-base leading-relaxed text-zinc-700">
            {valables > 0
              ? t.reste(prixBon(aHonorer), valables)
              : t.aucunEnCours}
            {bientotExpires > 0 && t.expirent(bientotExpires)}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {chiffres.map((c) => (
              <div
                key={c.libelle}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200/70 px-4 py-3"
              >
                <dt className="text-xs text-zinc-500">{c.libelle}</dt>
                <dd className="font-serif text-2xl leading-none text-ink">
                  {c.valeur}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* La vente : ouverte ou non, et l'adresse à partager. */}
        <div className="relative flex min-w-0 flex-col gap-3 rounded-xl bg-zinc-50 p-5 lg:w-[22rem]">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${enVente ? "bg-emerald-500" : "bg-zinc-300"}`}
            />
            <span className="font-semibold text-ink">
              {enVente ? t.enVente : t.pasEnVente}
            </span>
          </span>
          {lienPublic ? (
            <>
              <code
                title={lienPublic}
                className="truncate rounded-lg bg-white px-3 py-2 text-xs text-ink"
              >
                {lienPublic}
              </code>
              <div className="flex flex-wrap items-center gap-3">
                <BoutonCopier
                  texte={lienPublic}
                  libelle={t.copierAdresse}
                  copie={t.adresseCopiee}
                />
                <a
                  href={lienPublic}
                  target="_blank"
                  rel="noopener"
                  className="text-sm font-semibold text-brand-navy hover:underline"
                >
                  {t.voirPage}
                </a>
              </div>
              <span className="text-xs leading-relaxed text-zinc-500">
                {t.aPartager}
              </span>
            </>
          ) : (
            <span className="text-sm text-zinc-600">{t.sansAdresse}</span>
          )}
        </div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          {/* ── La caisse ─────────────────────────────────────────────── */}
          <section
            id="encaisser"
            className="flex scroll-mt-8 flex-col gap-4 rounded-2xl border border-brand-navy/15 bg-brand-navy p-6 text-white shadow-sm"
          >
            <span className="flex items-center gap-2 font-serif text-2xl">
              {t.caisse}
            </span>
            <form
              action={`/dashboard/${id}/bons-cadeaux#encaisser`}
              className="flex flex-wrap items-center gap-3"
            >
              <input
                name="code"
                defaultValue={code ?? ""}
                placeholder="ABCD-EFGH"
                autoComplete="off"
                aria-label={t.codeAria}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 font-mono text-xl uppercase tracking-[0.2em] text-white outline-none transition-colors placeholder:text-white/40 focus:border-white/60 focus:bg-white/15 sm:w-72"
              />
              <button
                type="submit"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-zinc-100"
              >
                {t.chercher}
              </button>
            </form>

            {code && !trouve && (
              <p className="text-sm text-white/80">
                {t.introuvableAvant} <span className="font-mono">{code}</span>{" "}
                {t.introuvableApres}
              </p>
            )}

            {trouve && (
              <div className="flex flex-col gap-4 rounded-xl bg-white p-5 text-ink">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-lg font-bold tracking-[0.14em] text-brand-navy">
                      {trouve.bon.code}
                    </span>
                    <span className="text-sm text-zinc-600">
                      {trouve.bon.beneficiaire_nom
                        ? t.pour(trouve.bon.beneficiaire_nom)
                        : t.sansNom}
                      {trouve.bon.origine === "vente"
                        ? t.offertPar(trouve.bon.acheteur_nom)
                        : t.offertParMaison}
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${COULEUR_ETAT[trouve.etat]}`}
                  >
                    {LIBELLE_ETAT[trouve.etat]}
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-zinc-500">{t.valeur}</dt>
                    <dd className="font-semibold">
                      {prixBon(trouve.bon.montant_centimes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">{t.resteCol}</dt>
                    <dd className="font-serif text-2xl leading-none text-ink">
                      {prixBon(trouve.bon.solde_centimes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">{t.jusquau}</dt>
                    <dd className="font-semibold">
                      {trouve.bon.expire_le ? jour(trouve.bon.expire_le) : "—"}
                    </dd>
                  </div>
                </dl>
                {trouve.etat === "valide" ? (
                  <EncaisserBon
                    restaurantId={id}
                    bonId={trouve.bon.id}
                    soldeEuros={enEuros(trouve.bon.solde_centimes)}
                    langue={ui}
                  />
                ) : trouve.etat === "expire" ? (
                  <form
                    action={prolongerBon}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input type="hidden" name="bon_id" value={trouve.bon.id} />
                    <span className="text-sm text-zinc-600">
                      {t.expireProlonger}
                    </span>
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                    >
                      {t.prolonger}
                    </button>
                  </form>
                ) : null}
                {utilisations.length > 0 && (
                  <ul className="flex flex-col gap-1 border-t border-zinc-100 pt-3 text-sm text-zinc-600">
                    {utilisations.map((u) => (
                      <li key={u.utilise_le}>
                        {t.deduitLe(
                          prixBon(u.montant_centimes),
                          jour(u.utilise_le),
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* ── Tous les bons ─────────────────────────────────────────── */}
          <section id="bons" className="flex scroll-mt-8 flex-col gap-4">
            <TitreSection
              aside={bons.length > 0 ? t.nbBons(bons.length) : undefined}
            >
              {t.tousTitre}
            </TitreSection>
            {bons.length > 0 && (
              <nav className="flex flex-wrap gap-2">
                {FILTRES.map((f) => {
                  const nombre =
                    f.cle === "tous"
                      ? bons.length
                      : avecEtat.filter((x) => x.etat === f.cle).length;
                  return (
                    <Link
                      key={f.cle}
                      href={lienFiltre(f.cle)}
                      scroll={false}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        filtre === f.cle
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                      }`}
                    >
                      {f.libelle}{" "}
                      <span
                        className={
                          filtre === f.cle ? "text-white/70" : "text-zinc-400"
                        }
                      >
                        {nombre}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            )}
            {affiches.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 shadow-sm">
                {bons.length === 0 ? t.aucunBon : t.aucunFiltre}
              </p>
            ) : (
              <ul className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
                {affiches.map(({ bon, etat }, rang) => {
                  const part =
                    bon.montant_centimes > 0
                      ? (bon.solde_centimes / bon.montant_centimes) * 100
                      : 0;
                  return (
                    <li
                      key={bon.id}
                      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-5 ${
                        rang > 0 ? "border-t border-zinc-100" : ""
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          etat === "valide"
                            ? "bg-brand-orange-soft text-brand-orange-dark"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {dashboardIcons.cadeau}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/dashboard/${id}/bons-cadeaux?code=${bon.code}#encaisser`}
                            className="font-mono font-bold tracking-[0.1em] text-brand-navy hover:underline"
                          >
                            {bon.code}
                          </Link>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${COULEUR_ETAT[etat]}`}
                          >
                            {LIBELLE_ETAT[etat]}
                          </span>
                        </span>
                        <span className="truncate text-sm text-zinc-600">
                          {bon.origine === "vente"
                            ? bon.acheteur_nom
                            : t.laMaison}
                          {bon.beneficiaire_nom
                            ? ` → ${bon.beneficiaire_nom}`
                            : ""}
                          {" · "}
                          {jour(bon.paye_le ?? bon.created_at)}
                        </span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="flex w-28 flex-col items-end gap-1">
                          <span className="text-sm font-semibold tabular-nums text-ink">
                            {prixBon(bon.solde_centimes)}
                            <span className="font-normal text-zinc-400">
                              {" "}
                              / {prixBon(bon.montant_centimes)}
                            </span>
                          </span>
                          {/* Ce qu'il reste sur le bon, d'un coup d'œil. */}
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100"
                          >
                            <span
                              className={`block h-full rounded-full ${etat === "valide" ? "bg-brand-orange" : "bg-zinc-300"}`}
                              style={{ width: `${part}%` }}
                            />
                          </span>
                          {bon.expire_le && (
                            <span className="whitespace-nowrap text-[11px] text-zinc-500">
                              {t.jusquauDate(jour(bon.expire_le))}
                            </span>
                          )}
                        </span>
                        <span className="hidden flex-col items-end gap-1 sm:flex">
                          <a
                            href={`/bon/${bon.paiement_token}`}
                            target="_blank"
                            rel="noopener"
                            className="text-sm font-semibold text-brand-navy hover:underline"
                          >
                            {t.voir}
                          </a>
                          {etat === "valide" && (
                            // Deux gestes, pas un : un bon annulé par
                            // erreur est un client refusé en caisse.
                            <details className="relative">
                              <summary className="cursor-pointer list-none text-xs text-zinc-400 hover:text-red-600">
                                {t.annuler}
                              </summary>
                              <form
                                action={annulerBon}
                                className="absolute right-0 z-10 mt-2 flex w-64 flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-lg"
                              >
                                <input
                                  type="hidden"
                                  name="restaurant_id"
                                  value={id}
                                />
                                <input
                                  type="hidden"
                                  name="bon_id"
                                  value={bon.id}
                                />
                                <span className="text-xs text-zinc-600">
                                  {t.annulerAvertissement}
                                </span>
                                <button
                                  type="submit"
                                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                >
                                  {t.annulerCe}
                                </button>
                              </form>
                            </details>
                          )}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="max-w-3xl text-xs text-zinc-500">{t.piedTva}</p>
          </section>
        </div>

        {/* ── Réglages et bons offerts, à côté ───────────────────────── */}
        {!migrationManquante && (
          <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
            <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
              <span className="font-serif text-2xl text-ink">{t.reglages}</span>
              <ReglagesBons
                restaurantId={id}
                actifs={Boolean(restaurant.bons_cadeaux_actifs)}
                montants={(restaurant.bons_cadeaux_montants?.length
                  ? restaurant.bons_cadeaux_montants
                  : MONTANTS_PAR_DEFAUT
                )
                  .map(enEuros)
                  .join(", ")}
                validite={restaurant.bons_cadeaux_validite_mois ?? 12}
                texte={restaurant.bons_cadeaux_texte ?? ""}
                langue={ui}
              />
            </section>
            <details className="group rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                <span className="flex flex-col gap-0.5">
                  <span className="font-serif text-2xl text-ink">
                    {t.offrir}
                  </span>
                  <span className="text-xs text-zinc-500">{t.offrirChapo}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="text-zinc-400 transition-transform group-open:rotate-180"
                >
                  ⌄
                </span>
              </summary>
              <div className="border-t border-zinc-100 p-5">
                <OffrirBon restaurantId={id} langue={ui} />
              </div>
            </details>
          </aside>
        )}
      </div>
    </div>
  );
}
