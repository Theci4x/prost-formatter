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
  ETAPES_MISE_A_JOUR,
  LIBELLE_GROUPE,
  LIBELLE_STATUT,
  PLATEFORMES,
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
import { majPresence } from "./actions";

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

function jourCourt(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Paris",
  });
}

type Filtre = "toutes" | "a-traiter" | "a-verifier" | "en-ordre";

const FILTRES: { cle: Filtre; libelle: string }[] = [
  { cle: "toutes", libelle: "Toutes" },
  { cle: "a-traiter", libelle: "À traiter" },
  { cle: "a-verifier", libelle: "Pas vérifiées" },
  { cle: "en-ordre", libelle: "En ordre" },
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
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { id } = await params;
  const { filtre: filtreDemande } = await searchParams;
  const filtre: Filtre = FILTRES.some((f) => f.cle === filtreDemande)
    ? (filtreDemande as Filtre)
    : "toutes";
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const etat = await chargerPresence(supabase, id);
  if (!etat) notFound();
  const { restaurant, relies, constats, champs, tableAbsente } = etat;

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
  const file = fileGuidee(etat);
  const minutesRestantes = file.reduce((total, p) => total + p.minutes, 0);

  const adresseRecherche = restaurant.adresse ?? "";
  const groupes = Object.keys(LIBELLE_GROUPE) as GroupePresence[];
  const guide = `/dashboard/${id}/presence/guide`;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.presence}
          title={`Présence en ligne — ${restaurant.nom}`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          Les plateformes où tes clients — et les assistants IA qui répondent à
          leur place — vont chercher où manger. Recopie partout la même fiche,
          au caractère près : un nom ou un téléphone qui diffère d&apos;un site
          à l&apos;autre fait douter Google comme les IA.
        </p>
      </div>

      {tableAbsente && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          <strong>Migration à passer :</strong> la table de cet écran
          n&apos;existe pas encore (supabase/migrations/0079_presence.sql). Tu
          peux déjà vérifier tes fiches et copier la tienne ; les statuts
          s&apos;enregistreront une fois la migration passée.
        </p>
      )}

      {/* Ce qui est devenu faux passe avant tout le reste : une fiche
          fausse coûte plus qu'une fiche absente. */}
      {aRevoir.length > 0 && restaurant.fiche_modifiee_le && (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand-orange/60 bg-brand-orange-soft p-6">
          <p className="text-base font-semibold text-ink">
            Tu as modifié ta fiche le {jourCourt(restaurant.fiche_modifiee_le)}{" "}
            : {aRevoir.length} plateforme{aRevoir.length > 1 ? "s" : ""} à
            mettre à jour.
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">
            {aRevoir.map((p) => p.nom).join(", ")}. Klarr ne peut pas encore les
            modifier à ta place : reporte-y les changements, puis coche «
            C&apos;est à jour ».
          </p>
          <Link
            href={guide}
            className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            Mettre à jour en mode guidé
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
              <span className="text-sm text-zinc-600">
                plateformes en ordre
              </span>
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
                essentielles
              </span>
              <span>
                <strong className="text-brand-orange-dark">{aReprendre}</strong>{" "}
                à traiter
              </span>
              <span>
                <strong className="text-ink">{pasVerifiees}</strong> pas
                vérifiée{pasVerifiees > 1 ? "s" : ""}
              </span>
              <a href="#fiche" className="hover:underline">
                fiche{" "}
                <strong className="text-ink">
                  {remplis}/{champs.length}
                </strong>{" "}
                champs
              </a>
            </span>
          </div>

          {/* L'entrée du mode guidé : sans elle, vingt plateformes disent
              tout et n'indiquent pas par où commencer. */}
          <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-5 lg:max-w-sm">
            <span className="font-semibold text-ink">
              {file.length === 0
                ? "Tout est en ordre"
                : "Une plateforme à la fois"}
            </span>
            <span className="text-sm leading-relaxed text-zinc-600">
              {file.length === 0
                ? "Reviens ici quand tu modifies ta fiche : Klarr te dira quoi reprendre."
                : `De la plus utile à la moins utile, ta fiche sous les yeux. Il en reste ${file.length}, environ ${minutesRestantes} min.`}
            </span>
            {file.length > 0 && (
              <Link
                href={guide}
                className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                {file.length === PLATEFORMES.length
                  ? "Commencer le mode guidé"
                  : "Continuer le mode guidé"}
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
                  title={`${p.nom} — ${libelleEtat(e)}`}
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
                    {p.nom} : {libelleEtat(e)}
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
                <TitreSection aside={`${reglees}/${duGroupe.length} en ordre`}>
                  {LIBELLE_GROUPE[groupe]}
                </TitreSection>
                {groupe === "annuaires" && filtre === "toutes" && (
                  <p className="max-w-3xl text-sm text-zinc-600">
                    Moins consultés directement, mais GPS, assistants vocaux et
                    applications puisent dans leurs données. Fais d&apos;abord
                    les essentielles.
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
              Aucune plateforme dans ce filtre.
            </p>
          )}
        </div>

        {/* ── La fiche, toujours sous la main ─────────────────────── */}
        <aside
          id="fiche"
          className="flex scroll-mt-8 flex-col gap-3 lg:sticky lg:top-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">Ta fiche à copier</h2>
            <BoutonCopier
              texte={texteFiche(champs)}
              libelle="Tout copier"
              copie="Copiée ✓"
            />
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">
            Les mêmes mots partout, au caractère près.
          </p>
          <FicheACopier restaurantId={id} champs={champs} compact />
        </aside>
      </div>

      <p className="max-w-4xl text-xs leading-relaxed text-zinc-400">
        Klarr ne lit pas lui-même ces plateformes : Apple, Bing ou PagesJaunes
        n&apos;ouvrent leurs données qu&apos;aux logiciels qui ont obtenu un
        accès. Les statuts disent donc ce que tu as constaté en vérifiant, à la
        date indiquée. Google, Facebook, Instagram, TripAdvisor et ta vitrine
        apparaissent reliés d&apos;eux-mêmes quand ils le sont dans Klarr ;
        seule la vitrine suit tes modifications toute seule.
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

function libelleEtat(etat: EtatPlateforme): string {
  if (etat === "relie") return "Reliée à Klarr";
  if (etat === "a_revoir") return "À revoir";
  if (etat) return LIBELLE_STATUT[etat];
  return "Pas vérifiée";
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
}) {
  const aFaire =
    etat === "a_revoir" || etat === "a_corriger" || etat === "absente";
  const etapes =
    etat === "a_revoir" ? ETAPES_MISE_A_JOUR : (plateforme.etapes ?? []);
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
              {libelleEtat(etat)}
            </span>
          </span>
          <span
            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${
              etat ? TON_ETAT[etat] : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {libelleEtat(etat)}
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
              Ta fiche a changé le {jourCourt(ficheModifieeLe)} dans Klarr :
              reporte les changements ici.
            </p>
          )}

          {!relie && plateforme.conseil && (
            <p className="rounded-lg bg-white px-3 py-2 text-sm leading-relaxed text-ink">
              {plateforme.conseil}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {plateforme.verifier && (
              <a
                href={plateforme.verifier(nom, adresse)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                Vérifier ma fiche ↗
              </a>
            )}
            {plateforme.creer && (!relie || etat === "a_revoir") && (
              <a
                href={plateforme.creer}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                {relie ? "Modifier ma fiche ↗" : "Créer ou revendiquer ↗"}
              </a>
            )}
            {plateforme.ecranKlarr && (
              <Link
                href={`/dashboard/${restaurantId}/${relie?.ecran ?? plateforme.ecranKlarr}`}
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                {relie ? "Gérer dans Klarr →" : "Relier dans Klarr →"}
              </Link>
            )}
          </div>

          {avecEtapes && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Pas à pas · {etapes.length} étapes
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
                  ? `Vérifié le ${jourCourt(constat.verifieLe)} — ce que tu as trouvé :`
                  : "Après vérification, ce que tu as trouvé :"}
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
                      ? "C'est à jour"
                      : LIBELLE_STATUT[valeur]}
                  </button>
                ))}
                {constat && !relie && (
                  <button
                    type="submit"
                    name="statut"
                    value="effacer"
                    className="px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-700"
                  >
                    Effacer
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
