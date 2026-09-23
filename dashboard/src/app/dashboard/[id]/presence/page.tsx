import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { FicheACopier, texteFiche } from "@/components/presence/FicheACopier";
import { Etapes } from "@/components/presence/Etapes";
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

export default async function PresencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={`${regleesEssentielles}/${essentielles.length}`}
          libelle="plateformes essentielles réglées"
        />
        <a href="#plateformes" className="block [&>div]:h-full">
          <Compteur
            valeur={aReprendre}
            libelle={
              aReprendre === 0
                ? "rien à reprendre"
                : "à revoir, corriger ou créer"
            }
            accent={aReprendre > 0}
          />
        </a>
        <a href="#plateformes" className="block [&>div]:h-full">
          <Compteur
            valeur={pasVerifiees}
            libelle={`pas encore vérifiée${pasVerifiees > 1 ? "s" : ""}`}
            accent={pasVerifiees > 0}
          />
        </a>
        <a href="#fiche" className="block [&>div]:h-full">
          <Compteur
            valeur={`${remplis}/${champs.length}`}
            libelle="champs de ta fiche remplis"
            accent={remplis < champs.length}
          />
        </a>
      </div>

      {/* L'entrée du mode guidé : sans elle, vingt cartes disent tout et
          n'indiquent pas par où commencer. */}
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-serif text-2xl text-ink">
            {file.length === 0
              ? "Tout est en ordre"
              : "Une plateforme à la fois"}
          </span>
          <span className="text-sm leading-relaxed text-zinc-600">
            {file.length === 0
              ? "Chaque plateforme est reliée ou vérifiée. Reviens ici quand tu modifies ta fiche."
              : `Le mode guidé t'emmène de la plus utile à la moins utile, avec ta fiche à copier sous les yeux. Il en reste ${file.length}, environ ${minutesRestantes} min hors vérifications.`}
          </span>
        </div>
        {file.length > 0 && (
          <Link
            href={guide}
            className="w-fit shrink-0 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            {file.length === PLATEFORMES.length ? "Commencer" : "Continuer"}
          </Link>
        )}
      </section>

      <nav className="flex flex-wrap gap-2">
        <a
          href="#fiche"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
        >
          Ta fiche à copier
        </a>
        {groupes.map((groupe) => (
          <a
            key={groupe}
            href={`#${groupe}`}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-ink hover:text-ink"
          >
            {LIBELLE_GROUPE[groupe]}
          </a>
        ))}
      </nav>

      {/* ── La fiche ─────────────────────────────────────────────────── */}
      <section id="fiche" className="flex scroll-mt-8 flex-col gap-4">
        <TitreSection
          aside={
            <span className="inline-block">
              <BoutonCopier
                texte={texteFiche(champs)}
                libelle="Tout copier"
                copie="Fiche copiée ✓"
              />
            </span>
          }
        >
          Ta fiche à copier
        </TitreSection>
        <FicheACopier restaurantId={id} champs={champs} />
      </section>

      {/* ── Les plateformes ──────────────────────────────────────────── */}
      <div id="plateformes" className="flex scroll-mt-8 flex-col gap-8">
        {groupes.map((groupe) => {
          const liste = PLATEFORMES.filter((p) => p.groupe === groupe);
          return (
            <section
              key={groupe}
              id={groupe}
              className="flex scroll-mt-8 flex-col gap-4"
            >
              <TitreSection
                aside={
                  groupe === "annuaires"
                    ? `${liste.filter((p) => estReglee(etats.get(p.cle) ?? null)).length} réglée${liste.filter((p) => estReglee(etats.get(p.cle) ?? null)).length > 1 ? "s" : ""} sur ${liste.length}`
                    : undefined
                }
              >
                {LIBELLE_GROUPE[groupe]}
              </TitreSection>
              {groupe === "annuaires" && (
                <p className="max-w-4xl text-sm text-zinc-600">
                  Moins consultés directement, mais d&apos;autres services —
                  GPS, assistants vocaux, applications — puisent dans leurs
                  données. Fais d&apos;abord les essentielles.
                </p>
              )}
              <ul className="grid items-start gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {liste.map((plateforme) => (
                  <CartePlateforme
                    key={plateforme.cle}
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

function CartePlateforme({
  plateforme,
  restaurantId,
  relie,
  constat,
  etat,
  ficheModifieeLe,
  nom,
  adresse,
}: {
  plateforme: Plateforme;
  restaurantId: string;
  relie: Relie | null;
  constat: Constat | null;
  etat: EtatPlateforme;
  ficheModifieeLe: string | null;
  nom: string;
  adresse: string;
}) {
  const aFaire =
    etat === "a_revoir" || etat === "a_corriger" || etat === "absente";
  const etapes =
    etat === "a_revoir" ? ETAPES_MISE_A_JOUR : (plateforme.etapes ?? []);

  return (
    <li
      className={`flex min-w-0 flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm ${
        aFaire
          ? "border-brand-orange/60"
          : etat
            ? "border-emerald-200"
            : "border-zinc-200/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex flex-col gap-0.5">
          <span className="font-serif text-2xl leading-tight text-ink">
            {plateforme.nom}
          </span>
          <span className="text-xs text-zinc-400">
            environ {plateforme.minutes} min
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            etat ? TON_ETAT[etat] : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {libelleEtat(etat)}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600">
        {plateforme.pourquoi}
      </p>

      {etat === "a_revoir" && ficheModifieeLe && (
        <p className="rounded-lg bg-brand-orange-soft px-3 py-2 text-sm leading-relaxed text-ink">
          Ta fiche a changé le {jourCourt(ficheModifieeLe)} dans Klarr : reporte
          les changements ici.
        </p>
      )}

      {relie ? (
        <span className="truncate rounded-lg bg-zinc-50 px-3 py-2 text-sm text-ink">
          {relie.texte}
        </span>
      ) : (
        plateforme.conseil && (
          <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-ink">
            {plateforme.conseil}
          </p>
        )
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {plateforme.verifier && (
          <a
            href={plateforme.verifier(nom, adresse)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-orange-dark hover:underline"
          >
            Vérifier ma fiche ↗
          </a>
        )}
        {plateforme.creer && (!relie || etat === "a_revoir") && (
          <a
            href={plateforme.creer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-orange-dark hover:underline"
          >
            {relie ? "Modifier ma fiche ↗" : "Créer ou revendiquer ↗"}
          </a>
        )}
        {plateforme.ecranKlarr && (
          <Link
            href={`/dashboard/${restaurantId}/${relie?.ecran ?? plateforme.ecranKlarr}`}
            className="text-sm font-semibold text-brand-navy hover:underline"
          >
            {relie ? "Gérer dans Klarr →" : "Relier dans Klarr →"}
          </Link>
        )}
      </div>

      {/* Replié par défaut, et absent quand la plateforme est déjà
          reliée et à jour : la carte se lit d'un coup d'œil, et le
          détail s'ouvre au moment de s'y mettre. */}
      {(etat === "a_revoir" ||
        (!relie && plateforme.etapes && plateforme.etapes.length > 0)) && (
        <details className="group rounded-xl border border-zinc-200 bg-zinc-50/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Pas à pas · {etapes.length} étapes
            <span
              aria-hidden="true"
              className="text-zinc-400 transition-transform group-open:rotate-180"
            >
              ⌄
            </span>
          </summary>
          <div className="border-t border-zinc-200 px-4 py-4">
            <Etapes etapes={etapes} />
          </div>
        </details>
      )}

      {/* Relié et à jour, l'état se lit dans Klarr : rien à déclarer. À
          revoir, un seul bouton suffit — la fiche existe, on confirme. */}
      {(!relie || etat === "a_revoir") && (
        <form
          action={majPresence}
          className="mt-auto flex flex-col gap-2 border-t border-zinc-100 pt-4"
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
                aria-pressed={constat?.statut === valeur && etat !== "a_revoir"}
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
    </li>
  );
}
