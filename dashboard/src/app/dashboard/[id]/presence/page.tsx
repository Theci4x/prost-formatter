import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { TitreSection } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { FicheACopier, texteFiche } from "@/components/presence/FicheACopier";
import { Etapes } from "@/components/presence/Etapes";
import { LogoPlateforme } from "@/components/presence/LogoPlateforme";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import {
  PLATEFORMES as PLATEFORMES_FR,
  STATUTS,
  type GroupePresence,
  type Plateforme,
} from "@/lib/presence/plateformes";
import {
  chargerPresence,
  estReglee,
  etatDe,
  fileGuidee,
  type Constat,
  type EtatPlateforme,
  type Relie,
} from "@/lib/presence/etat";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { PRESENCE, plateformeEn, type ClesPresence } from "@/lib/i18n/presence";
import { localeDe } from "@/lib/i18n/seo";
import { majPresence, enregistrerUrlPresence } from "./actions";

/**
 * La présence du restaurant hors de Klarr.
 *
 * Deux moitiés. En haut, la fiche à recopier : les mêmes mots, au
 * caractère près, sur chaque plateforme — un nom écrit de trois façons
 * ou un téléphone qui diffère d'un annuaire à l'autre, et Google comme
 * les assistants IA doutent de tous. En bas, les plateformes, avec pour
 * chacune où vérifier, où revendiquer, et ce que le restaurateur y a
 * trouvé. Le mode guidé reprend les mêmes, une à la fois.
 */

function jourCourt(iso: string, locale = "fr-FR"): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

type Filtre = "toutes" | "a-traiter" | "a-verifier" | "en-ordre";

const CLES_FILTRES: Filtre[] = [
  "toutes",
  "a-traiter",
  "a-verifier",
  "en-ordre",
];

function dansLeFiltre(filtre: Filtre, etat: EtatPlateforme): boolean {
  if (filtre === "a-traiter") {
    return etat === "a_revoir" || etat === "a_corriger" || etat === "absente";
  }
  if (filtre === "a-verifier") return etat === null;
  if (filtre === "en-ordre") return estReglee(etat);
  return true;
}

/** La pastille d'état posée sur un logo du mur. */
const POINT_ETAT: Record<Exclude<EtatPlateforme, null>, string> = {
  relie: "bg-emerald-500",
  a_jour: "bg-emerald-500",
  a_revoir: "bg-brand-orange",
  a_corriger: "bg-brand-orange",
  absente: "bg-brand-orange",
};

export default async function PresencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filtre?: string; presence?: string }>;
}) {
  const { id } = await params;
  const { filtre: filtreDemande, presence: presenceResultat } = await searchParams;
  const filtre: Filtre = CLES_FILTRES.some((f) => f === filtreDemande)
    ? (filtreDemande as Filtre)
    : "toutes";
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");
  const langue = await langueUtilisateur();
  const t = PRESENCE[langue];
  const locale = localeDe(langue);
  const PLATEFORMES = PLATEFORMES_FR.map((p) => plateformeEn(p, langue));
  const FILTRES = CLES_FILTRES.map((cle) => ({ cle, libelle: t.filtres[cle] }));
  const LIBELLE_GROUPE = t.groupes;

  const supabase = await createClient();
  const etat = await chargerPresence(supabase, id);
  if (!etat) notFound();
  const { restaurant, relies: reliesFr, constats, tableAbsente } = etat;
  const presenceMeta = restaurant as typeof restaurant & {
    presence_urls?: Record<string, string> | null;
    presence_auditee_le?: string | null;
  };
  const { data: auditRows } = await supabase
    .from("restaurant_presence_audits")
    .select("plateforme, statut, ecarts, note, nombre_avis, audite_le")
    .eq("restaurant_id", id)
    .order("audite_le", { ascending: false })
    .limit(100);
  const audits = new Map<string, { statut: string; ecarts: string[]; note: number | null; nombre_avis: number | null; audite_le: string }>();
  for (const row of auditRows ?? []) {
    if (!audits.has(row.plateforme)) audits.set(row.plateforme, {
      statut: row.statut,
      ecarts: Array.isArray(row.ecarts) ? row.ecarts as string[] : [],
      note: row.note,
      nombre_avis: row.nombre_avis,
      audite_le: row.audite_le,
    });
  }
  const auditsListe = Array.from(audits.entries()).map(([cle, audit]) => ({
    cle,
    plateforme: PLATEFORMES.find((p) => p.cle === cle),
    ...audit,
  }));
  const auditsIncoherents = auditsListe.filter((audit) => audit.statut === "incoherence");
  const auditsInaccessibles = auditsListe.filter((audit) => audit.statut === "inaccessible");
  const auditsAvecNote = auditsListe.filter((audit) => audit.note != null);
  const auditsCoherents = auditsListe.filter((audit) => audit.statut === "coherente");
  const auditsInsuffisants = auditsListe.filter((audit) => audit.statut === "donnees_insuffisantes");
  const derniereAnalyse = presenceMeta.presence_auditee_le ?? auditsListe[0]?.audite_le ?? null;
  const prochaineAnalyse = derniereAnalyse
    ? new Date(Date.parse(derniereAnalyse) + 30 * 24 * 60 * 60 * 1000)
    : null;
  const urlsSurveillees = Object.keys(presenceMeta.presence_urls ?? {}).length;
  const dateAnalyse = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(locale, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Paris",
        })
      : "Jamais";
  const dateProchaineAnalyse = prochaineAnalyse
    ? prochaineAnalyse.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Europe/Paris",
      })
    : "Après l’enregistrement d’une fiche";
  const champs = etat.champs.map((c) => ({
    ...c,
    libelle: t.champs[c.libelle] ?? c.libelle,
  }));
  const relies = Object.fromEntries(
    Object.entries(reliesFr).map(([cle, r]) => [
      cle,
      r ? { ...r, texte: t.relies[r.texte] ?? r.texte } : r,
    ]),
  ) as typeof reliesFr;

  const etats = new Map(PLATEFORMES.map((p) => [p.cle, etatDe(p, etat)]));
  const essentielles = PLATEFORMES.filter((p) => p.niveau === 1);
  const regleesEssentielles = essentielles.filter((p) =>
    estReglee(etats.get(p.cle) ?? null),
  ).length;
  const aRevoir = PLATEFORMES.filter((p) => etats.get(p.cle) === "a_revoir");
  const aReprendre = PLATEFORMES.filter((p) =>
    ["a_revoir", "a_corriger", "absente"].includes(etats.get(p.cle) ?? ""),
  ).length;
  const pasVerifiees = PLATEFORMES.filter(
    (p) => etats.get(p.cle) === null,
  ).length;
  const enOrdre = PLATEFORMES.filter((p) =>
    estReglee(etats.get(p.cle) ?? null),
  ).length;
  const remplis = champs.filter((c) => c.valeur && c.valeur.trim()).length;
  const file = fileGuidee(etat).map((p) => plateformeEn(p, langue));
  const minutesRestantes = file.reduce((total, p) => total + p.minutes, 0);

  const adresseRecherche = restaurant.adresse ?? "";
  const groupes = Object.keys(LIBELLE_GROUPE) as GroupePresence[];
  const guide = `/dashboard/${id}/presence/guide`;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.presence}
          title={t.titre(restaurant.nom)}
        />
        <p className="max-w-4xl text-sm text-zinc-600">{t.chapo}</p>
      </div>

      {tableAbsente && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          {t.migration}
        </p>
      )}

      {presenceResultat === "ok" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          URL enregistrée. Elle sera contrôlée lors du prochain relevé mensuel.
        </p>
      )}
      {presenceResultat === "erreur" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800">
          L’URL n’a pas pu être enregistrée. Vérifie que la migration 0090 est bien appliquée dans Supabase.
        </p>
      )}

      <section className="flex flex-col gap-5 rounded-2xl border border-brand-navy/15 bg-brand-navy/[0.03] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl text-ink">Tableau de bord du suivi</h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            Une vue rapide de la santé de tes fiches publiques. La prochaine analyse est prévue environ 30 jours après la dernière analyse complète.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Dernière analyse</div>
            <div className="mt-2 text-base font-semibold text-ink">{dateAnalyse(derniereAnalyse)}</div>
          </div>
          <div className="rounded-xl bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Prochaine analyse</div>
            <div className="mt-2 text-base font-semibold text-ink">{dateProchaineAnalyse}</div>
          </div>
          <div className="rounded-xl bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Fiches surveillées</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{urlsSurveillees}</div>
          </div>
          <div className={`rounded-xl bg-white p-4 ${auditsIncoherents.length || auditsInaccessibles.length ? "ring-1 ring-brand-orange/50" : ""}`}>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">À traiter</div>
            <div className="mt-2 text-2xl font-semibold text-brand-orange-dark">{auditsIncoherents.length + auditsInaccessibles.length}</div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm"><strong className="text-emerald-700">{auditsCoherents.length}</strong> fiche{auditsCoherents.length > 1 ? "s" : ""} cohérente{auditsCoherents.length > 1 ? "s" : ""}</div>
          <div className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm"><strong className="text-brand-orange-dark">{auditsIncoherents.length}</strong> incohérence{auditsIncoherents.length > 1 ? "s" : ""}</div>
          <div className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm"><strong className="text-brand-orange-dark">{auditsInaccessibles.length}</strong> page{auditsInaccessibles.length > 1 ? "s" : ""} inaccessible{auditsInaccessibles.length > 1 ? "s" : ""}</div>
          <div className="rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm"><strong className="text-ink">{auditsAvecNote.length}</strong> note{auditsAvecNote.length > 1 ? "s" : ""} relevée{auditsAvecNote.length > 1 ? "s" : ""}{auditsInsuffisants.length ? ` · ${auditsInsuffisants.length} donnée${auditsInsuffisants.length > 1 ? "s" : ""} insuffisante${auditsInsuffisants.length > 1 ? "s" : ""}` : ""}</div>
        </div>
        {derniereAnalyse && (
          <p className="text-xs text-zinc-500">Dernière analyse enregistrée le {dateAnalyse(derniereAnalyse)}. Les fiches sont contrôlées uniquement à partir des URLs publiques que tu as enregistrées.</p>
        )}
      </section>

      <section className="flex flex-col gap-5 rounded-2xl border border-brand-navy/15 bg-brand-navy/[0.03] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl text-ink">Suivi automatique des fiches</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
            Tu enregistres ici l’URL publique exacte d’une fiche. Klarr la relira environ une fois par mois, relèvera la note et le nombre d’avis quand ils sont visibles, puis comparera le nom et l’adresse avec ta fiche Klarr. Klarr ne se connecte pas et ne modifie jamais les plateformes.
          </p>
        </div>
        {auditsListe.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-4 text-sm leading-relaxed text-zinc-600">
            <strong className="text-ink">Aucun contrôle effectué pour le moment.</strong> Enregistre au moins une URL dans une plateforme. Le prochain passage automatique indiquera ici les incohérences et les notes trouvées.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4"><div className="text-2xl font-semibold text-ink">{auditsListe.length}</div><div className="text-xs text-zinc-500">fiches contrôlées</div></div>
              <div className={`rounded-xl bg-white p-4 ${auditsIncoherents.length ? "ring-1 ring-brand-orange/50" : ""}`}><div className="text-2xl font-semibold text-brand-orange-dark">{auditsIncoherents.length}</div><div className="text-xs text-zinc-500">incohérence{auditsIncoherents.length > 1 ? "s" : ""} à corriger</div></div>
              <div className="rounded-xl bg-white p-4"><div className="text-2xl font-semibold text-ink">{auditsAvecNote.length}</div><div className="text-xs text-zinc-500">note{auditsAvecNote.length > 1 ? "s" : ""} relevée{auditsAvecNote.length > 1 ? "s" : ""}</div></div>
            </div>
            {(auditsIncoherents.length > 0 || auditsInaccessibles.length > 0) && (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                <table className="w-full min-w-[38rem] text-left text-sm">
                  <thead className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-4 py-3">Plateforme</th><th className="px-4 py-3">Résultat</th><th className="px-4 py-3">Note / avis</th><th className="px-4 py-3">Action</th></tr></thead>
                  <tbody>
                    {[...auditsIncoherents, ...auditsInaccessibles].map((audit) => (
                      <tr key={audit.cle} className="border-b border-zinc-100 last:border-0">
                        <td className="px-4 py-3 font-semibold text-ink">{audit.plateforme?.nom ?? audit.cle}</td>
                        <td className="px-4 py-3 text-brand-orange-dark">{audit.statut === "incoherence" ? `À vérifier : ${audit.ecarts.join(", ")}` : "Page inaccessible"}</td>
                        <td className="px-4 py-3 text-zinc-600">{audit.note != null ? `${audit.note}/5` : "—"}{audit.nombre_avis != null ? ` · ${audit.nombre_avis} avis` : ""}</td>
                        <td className="px-4 py-3"><a href={`#${audit.cle}`} className="font-semibold text-brand-navy hover:underline">Ouvrir la fiche</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {/* Ce qui est devenu faux passe avant tout le reste : une fiche
          fausse coûte plus qu'une fiche absente. */}
      {aRevoir.length > 0 && restaurant.fiche_modifiee_le && (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-orange/60 bg-brand-orange-soft p-6">
          <p className="text-base font-semibold text-ink">
            {t.ficheModifiee(
              jourCourt(restaurant.fiche_modifiee_le, locale),
              aRevoir.length,
            )}
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">
            {t.ficheModifieeSuite(aRevoir.map((p) => p.nom).join(", "))}
          </p>
          <Link
            href={guide}
            className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t.majGuidee}
          </Link>
        </div>
      )}

      {/* ── Le tableau d'ensemble : où on en est, et le mur des vingt ── */}
      <section className="flex flex-col gap-6 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3">
            <span className="flex items-baseline gap-3">
              <span className="font-serif text-5xl leading-none text-ink">
                {enOrdre}
                <span className="text-3xl text-zinc-400">
                  /{PLATEFORMES.length}
                </span>
              </span>
              <span className="text-sm text-zinc-600">{t.enOrdre}</span>
            </span>
            {/* Une barre en trois : en ordre, à traiter, pas vérifiée. */}
            <div
              aria-hidden="true"
              className="flex h-2 w-full max-w-md gap-0.5 overflow-hidden rounded-full bg-zinc-100"
            >
              <span
                className="bg-emerald-500"
                style={{ width: `${(enOrdre / PLATEFORMES.length) * 100}%` }}
              />
              <span
                className="bg-brand-orange"
                style={{ width: `${(aReprendre / PLATEFORMES.length) * 100}%` }}
              />
            </div>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
              <span>
                <strong className="text-ink">
                  {regleesEssentielles}/{essentielles.length}
                </strong>{" "}
                {t.essentielles}
              </span>
              <span>
                <strong className="text-brand-orange-dark">{aReprendre}</strong>{" "}
                {t.aTraiter}
              </span>
              <span>
                <strong className="text-ink">{pasVerifiees}</strong>{" "}
                {t.pasVerifiees(pasVerifiees)}
              </span>
              <a href="#fiche" className="hover:underline">
                <strong className="text-ink">
                  {remplis}/{champs.length}
                </strong>{" "}
                {t.ficheChamps}
              </a>
            </span>
          </div>

          {/* L'entrée du mode guidé : sans elle, vingt plateformes disent
              tout et n'indiquent pas par où commencer. */}
          <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-5 lg:max-w-sm">
            <span className="font-semibold text-ink">
              {file.length === 0 ? t.toutEnOrdre : t.uneALaFois}
            </span>
            <span className="text-sm leading-relaxed text-zinc-600">
              {file.length === 0
                ? t.toutEnOrdreTexte
                : t.resteTexte(file.length, minutesRestantes)}
            </span>
            {file.length > 0 && (
              <Link
                href={guide}
                className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                {file.length === PLATEFORMES.length ? t.commencer : t.continuer}
              </Link>
            )}
          </div>
        </div>

        <ul className="flex flex-wrap gap-2.5 border-t border-zinc-100 pt-6">
          {PLATEFORMES.map((p) => {
            const e = etats.get(p.cle) ?? null;
            return (
              <li key={p.cle}>
                <a
                  href={`#${p.cle}`}
                  title={`${p.nom} — ${libelleEtat(e, t)}`}
                  className="relative block transition-transform hover:-translate-y-0.5"
                >
                  <LogoPlateforme cle={p.cle} taille={44} />
                  <span
                    aria-hidden="true"
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      e ? POINT_ETAT[e] : "bg-zinc-300"
                    }`}
                  />
                  <span className="sr-only">
                    {p.nom} : {libelleEtat(e, t)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── Les plateformes ─────────────────────────────────────── */}
        <div
          id="plateformes"
          className="flex min-w-0 scroll-mt-8 flex-col gap-8"
        >
          <nav className="flex flex-wrap gap-2">
            {FILTRES.map((f) => {
              const nombre = PLATEFORMES.filter((p) =>
                dansLeFiltre(f.cle, etats.get(p.cle) ?? null),
              ).length;
              return (
                <Link
                  key={f.cle}
                  href={
                    f.cle === "toutes"
                      ? `/dashboard/${id}/presence`
                      : `/dashboard/${id}/presence?filtre=${f.cle}`
                  }
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

          {groupes.map((groupe) => {
            const duGroupe = PLATEFORMES.filter((p) => p.groupe === groupe);
            const liste = duGroupe.filter((p) =>
              dansLeFiltre(filtre, etats.get(p.cle) ?? null),
            );
            if (liste.length === 0) return null;
            const reglees = duGroupe.filter((p) =>
              estReglee(etats.get(p.cle) ?? null),
            ).length;
            return (
              <section
                key={groupe}
                id={groupe}
                className="flex scroll-mt-8 flex-col gap-3"
              >
                <TitreSection aside={t.enOrdreGroupe(reglees, duGroupe.length)}>
                  {LIBELLE_GROUPE[groupe]}
                </TitreSection>
                {groupe === "annuaires" && filtre === "toutes" && (
                  <p className="max-w-3xl text-sm text-zinc-600">
                    {t.annuairesNote}
                  </p>
                )}
                <ul className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
                  {liste.map((plateforme, rang) => (
                    <LignePlateforme
                      key={plateforme.cle}
                      premier={rang === 0}
                      plateforme={plateforme}
                      restaurantId={id}
                      relie={relies[plateforme.cle] ?? null}
                      constat={constats.get(plateforme.cle) ?? null}
                      etat={etats.get(plateforme.cle) ?? null}
                      ficheModifieeLe={restaurant.fiche_modifiee_le ?? null}
                      nom={restaurant.nom}
                      adresse={adresseRecherche}
                      t={t}
                      locale={locale}
                      url={restaurant.presence_urls?.[plateforme.cle] ?? ""}
                      audit={audits.get(plateforme.cle) ?? null}
                    />
                  ))}
                </ul>
              </section>
            );
          })}

          {groupes.every(
            (g) =>
              PLATEFORMES.filter(
                (p) =>
                  p.groupe === g &&
                  dansLeFiltre(filtre, etats.get(p.cle) ?? null),
              ).length === 0,
          ) && (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-sm text-zinc-600 shadow-sm">
              {t.aucuneFiltre}
            </p>
          )}
        </div>

        {/* ── La fiche, toujours sous la main ─────────────────────── */}
        <aside
          id="fiche"
          className="flex scroll-mt-8 flex-col gap-3 lg:sticky lg:top-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">{t.ficheACopier}</h2>
            <BoutonCopier
              texte={texteFiche(champs)}
              libelle={t.toutCopier}
              copie={t.copiee}
            />
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">{t.memesMots}</p>
          <FicheACopier restaurantId={id} champs={champs} compact t={t} />
        </aside>
      </div>

      <p className="max-w-4xl text-xs leading-relaxed text-zinc-400">
        {t.pied}
      </p>
    </div>
  );
}

const TON_ETAT: Record<Exclude<EtatPlateforme, null>, string> = {
  relie: "bg-emerald-50 text-emerald-700",
  a_jour: "bg-emerald-50 text-emerald-700",
  a_revoir: "bg-brand-orange-soft text-brand-orange-dark",
  a_corriger: "bg-brand-orange-soft text-brand-orange-dark",
  absente: "bg-brand-orange-soft text-brand-orange-dark",
};

function libelleEtat(etat: EtatPlateforme, t: ClesPresence): string {
  if (etat === "relie") return t.etatRelie;
  if (etat === "a_revoir") return t.etatARevoir;
  if (etat) return t.statuts[etat];
  return t.etatPasVerifiee;
}

function LignePlateforme({
  plateforme,
  restaurantId,
  relie,
  constat,
  etat,
  ficheModifieeLe,
  nom,
  adresse,
  premier,
  t,
  locale,
  url,
  audit,
}: {
  plateforme: Plateforme;
  restaurantId: string;
  relie: Relie | null;
  constat: Constat | null;
  etat: EtatPlateforme;
  ficheModifieeLe: string | null;
  nom: string;
  adresse: string;
  premier: boolean;
  t: ClesPresence;
  locale: string;
  url: string;
  audit: { statut: string; ecarts: string[]; note: number | null; nombre_avis: number | null; audite_le: string } | null;
}) {
  const aFaire =
    etat === "a_revoir" || etat === "a_corriger" || etat === "absente";
  const etapes = etat === "a_revoir" ? t.miseAJour : (plateforme.etapes ?? []);
  const avecEtapes =
    etat === "a_revoir" ||
    (!relie && plateforme.etapes && plateforme.etapes.length > 0);

  return (
    <li
      id={plateforme.cle}
      className={`scroll-mt-8 ${premier ? "" : "border-t border-zinc-100"}`}
    >
      {/* Repliée : le logo, le nom, l'état. Dépliée : de quoi agir.
          Tout est replié au départ — le bandeau du haut et le mode guidé
          disent déjà par où commencer. */}
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 transition-colors hover:bg-zinc-50/70 [&::-webkit-details-marker]:hidden">
          <LogoPlateforme cle={plateforme.cle} />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold text-ink">{plateforme.nom}</span>
              <span className="text-xs text-zinc-400">
                ~{plateforme.minutes} min
              </span>
            </span>
            <span className="hidden truncate text-sm text-zinc-500 sm:block">
              {relie ? relie.texte : plateforme.pourquoi}
            </span>
            {/* Sur téléphone, l'état passe sous le nom : à droite, il
                coupait le nom en trois lignes. */}
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold sm:hidden ${
                etat ? TON_ETAT[etat] : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {libelleEtat(etat, t)}
            </span>
          </span>
          <span
            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${
              etat ? TON_ETAT[etat] : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {libelleEtat(etat, t)}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
          >
            ⌄
          </span>
        </summary>

        <div
          className={`flex flex-col gap-4 border-t px-5 py-5 sm:pl-[4.75rem] ${
            aFaire
              ? "border-brand-orange/30 bg-brand-orange-soft/30"
              : "border-zinc-100 bg-zinc-50/40"
          }`}
        >
          <p className="text-sm leading-relaxed text-zinc-600">
            {plateforme.pourquoi}
          </p>

          {etat === "a_revoir" && ficheModifieeLe && (
            <p className="rounded-lg bg-brand-orange-soft px-3 py-2 text-sm leading-relaxed text-ink">
              {t.ficheAChange(jourCourt(ficheModifieeLe, locale))}
            </p>
          )}

          {!relie && plateforme.conseil && (
            <p className="rounded-lg bg-white px-3 py-2 text-sm leading-relaxed text-ink">
              {plateforme.conseil}
            </p>
          )}

          <form action={enregistrerUrlPresence} className="flex flex-wrap items-end gap-2 rounded-lg border border-zinc-200 bg-white p-3">
            <input type="hidden" name="restaurant_id" value={restaurantId} />
            <input type="hidden" name="plateforme" value={plateforme.cle} />
            <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs font-semibold text-zinc-600">
              URL publique de la fiche à contrôler
              <input name="url" type="url" defaultValue={url} placeholder="https://..." className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-normal text-ink outline-none focus:border-brand-navy" />
              <span className="font-normal leading-relaxed text-zinc-500">Colle le lien que tes clients voient, pas un lien de connexion professionnel. Klarr ouvrira cette page publiquement lors du contrôle mensuel.</span>
            </label>
            <button type="submit" className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-brand-navy hover:text-brand-navy">Enregistrer le lien</button>
          </form>

          {audit && (
            <div className={`rounded-lg px-3 py-2 text-sm ${audit.statut === "incoherence" ? "bg-brand-orange-soft text-ink" : "bg-emerald-50 text-emerald-800"}`}>
              <strong>Dernier contrôle :</strong> {audit.statut === "incoherence" ? `incohérence — ${audit.ecarts.join(", ")}` : audit.statut === "coherente" ? "cohérente" : audit.statut}
              {(audit.note != null || audit.nombre_avis != null) && <> · {audit.note ?? "—"}/5 · {audit.nombre_avis ?? "—"} avis</>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {plateforme.verifier && (
              <a
                href={plateforme.verifier(nom, adresse)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                {t.verifier}
              </a>
            )}
            {plateforme.creer && (!relie || etat === "a_revoir") && (
              <a
                href={plateforme.creer}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                {relie ? t.modifier : t.creer}
              </a>
            )}
            {plateforme.ecranKlarr && (
              <Link
                href={`/dashboard/${restaurantId}/${relie?.ecran ?? plateforme.ecranKlarr}`}
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                {relie ? t.gerer : t.relier}
              </Link>
            )}
          </div>

          {avecEtapes && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                {t.pasAPas(etapes.length)}
              </span>
              <Etapes etapes={etapes} />
            </div>
          )}

          {/* Relié et à jour, l'état se lit dans Klarr : rien à déclarer.
              À revoir, un seul bouton suffit. */}
          {(!relie || etat === "a_revoir") && (
            <form
              action={majPresence}
              className="flex flex-col gap-2 border-t border-zinc-200/70 pt-4"
            >
              <input type="hidden" name="restaurant_id" value={restaurantId} />
              <input type="hidden" name="plateforme" value={plateforme.cle} />
              <span className="text-xs text-zinc-500">
                {constat
                  ? t.verifieLe(jourCourt(constat.verifieLe, locale))
                  : t.apresVerif}
              </span>
              <div className="flex flex-wrap gap-2">
                {(relie ? (["a_jour"] as const) : STATUTS).map((valeur) => (
                  <button
                    key={valeur}
                    type="submit"
                    name="statut"
                    value={valeur}
                    aria-pressed={
                      constat?.statut === valeur && etat !== "a_revoir"
                    }
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      constat?.statut === valeur && etat !== "a_revoir"
                        ? "border-brand-navy bg-brand-navy text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                    }`}
                  >
                    {etat === "a_revoir" && valeur === "a_jour"
                      ? t.cestAJour
                      : t.statuts[valeur]}
                  </button>
                ))}
                {constat && !relie && (
                  <button
                    type="submit"
                    name="statut"
                    value="effacer"
                    className="px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-700"
                  >
                    {t.effacer}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </details>
    </li>
  );
}
