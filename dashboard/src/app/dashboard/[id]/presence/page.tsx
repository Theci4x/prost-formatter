import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { siteUrl } from "@/lib/site-url";
import {
  heuresPlage,
  intitulePlage,
  plagesHoraires,
} from "@/lib/site/horaires";
import {
  LIBELLE_GROUPE,
  LIBELLE_STATUT,
  PLATEFORMES,
  STATUTS,
  estStatut,
  type GroupePresence,
  type Plateforme,
  type StatutPresence,
} from "@/lib/presence/plateformes";
import { majPresence } from "./actions";
import type { Restaurant } from "@/types/restaurant";

/**
 * La présence du restaurant hors de Klarr.
 *
 * Deux moitiés. En haut, la fiche à recopier : les mêmes mots, au
 * caractère près, sur chaque plateforme — un nom écrit de trois façons
 * ou un téléphone qui diffère d'un annuaire à l'autre, et Google comme
 * les assistants IA doutent de tous. En bas, les plateformes qui
 * comptent, avec pour chacune où vérifier, où revendiquer, et ce que le
 * restaurateur y a trouvé.
 */

/** Ce que Klarr sait déjà sans demander : relié chez nous, donc présent. */
type Relie = { texte: string; ecran: string };

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
  const [restaurantResult, presenceResult, googleResult, socialResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_presence")
        .select("plateforme, statut, verifie_le")
        .eq("restaurant_id", id),
      supabase
        .from("google_business_connections")
        .select("location_title")
        .eq("restaurant_id", id)
        .maybeSingle(),
      supabase
        .from("social_connections")
        .select("facebook_page_name, instagram_username")
        .eq("restaurant_id", id)
        .maybeSingle(),
    ]);

  const restaurant = restaurantResult.data as
    | (Restaurant & {
        site_publie?: boolean;
        tripadvisor_location_id?: string | null;
      })
    | null;
  if (!restaurant) notFound();

  // Sans la migration 0079, la table n'existe pas : l'écran reste lisible,
  // et dit pourquoi les boutons n'enregistrent rien.
  const tableAbsente = ["42P01", "PGRST205"].includes(
    presenceResult.error?.code ?? "",
  );
  const constats = new Map<
    string,
    { statut: StatutPresence; verifieLe: string }
  >();
  for (const ligne of (presenceResult.data ?? []) as {
    plateforme: string;
    statut: string;
    verifie_le: string;
  }[]) {
    if (estStatut(ligne.statut)) {
      constats.set(ligne.plateforme, {
        statut: ligne.statut,
        verifieLe: ligne.verifie_le,
      });
    }
  }

  const google = googleResult.data as { location_title: string | null } | null;
  const social = socialResult.data as {
    facebook_page_name: string | null;
    instagram_username: string | null;
  } | null;
  const slug = restaurant.slug_reservation;
  const site = siteUrl();

  const relies: Record<string, Relie | null> = {
    google: google
      ? {
          texte: google.location_title ?? "Fiche reliée",
          ecran: "google",
        }
      : null,
    facebook: social?.facebook_page_name
      ? { texte: social.facebook_page_name, ecran: "social" }
      : null,
    instagram: social?.instagram_username
      ? { texte: `@${social.instagram_username}`, ecran: "social" }
      : null,
    tripadvisor: restaurant.tripadvisor_location_id
      ? { texte: "Fiche épinglée dans Avis", ecran: "avis" }
      : null,
    vitrine:
      restaurant.site_publie && slug
        ? { texte: `${site}/restaurant/${slug}`, ecran: "vitrine" }
        : null,
  };

  // La fiche à recopier, champ par champ. Le site cité est la vitrine
  // quand elle est publiée : c'est la page que Klarr tient à jour.
  const horaires = plagesHoraires(restaurant.horaires ?? {})
    .map((plage) => `${intitulePlage(plage)} : ${heuresPlage(plage)}`)
    .join("\n");
  const champs: { libelle: string; valeur: string | null; ou: string }[] = [
    { libelle: "Nom", valeur: restaurant.nom, ou: "edit" },
    { libelle: "Adresse", valeur: restaurant.adresse, ou: "edit" },
    { libelle: "Téléphone", valeur: restaurant.telephone, ou: "edit" },
    {
      libelle: "Site web",
      valeur:
        restaurant.site_publie && slug
          ? `${site}/restaurant/${slug}`
          : restaurant.site_web,
      ou: "vitrine",
    },
    {
      libelle: "Réservation",
      valeur: slug ? `${site}/reserver/${slug}` : null,
      ou: "reservations/configuration",
    },
    { libelle: "Cuisine", valeur: restaurant.type_cuisine, ou: "edit" },
    { libelle: "Horaires", valeur: horaires || null, ou: "edit" },
    { libelle: "Description", valeur: restaurant.description, ou: "edit" },
  ];
  const remplis = champs.filter((c) => c.valeur && c.valeur.trim()).length;
  const toutCopier = champs
    .filter((c) => c.valeur && c.valeur.trim())
    .map((c) => `${c.libelle} : ${c.valeur}`)
    .join("\n");

  const etat = (cle: string): StatutPresence | "relie" | null =>
    relies[cle] ? "relie" : (constats.get(cle)?.statut ?? null);
  const aJour = PLATEFORMES.filter((p) =>
    ["relie", "a_jour"].includes(etat(p.cle) ?? ""),
  ).length;
  const aCorriger = PLATEFORMES.filter(
    (p) => etat(p.cle) === "a_corriger",
  ).length;
  const absentes = PLATEFORMES.filter((p) => etat(p.cle) === "absente").length;
  const pasVerifiees = PLATEFORMES.filter((p) => etat(p.cle) === null).length;

  const adresseRecherche = restaurant.adresse ?? "";
  const groupes = Object.keys(LIBELLE_GROUPE) as GroupePresence[];

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={`${aJour}/${PLATEFORMES.length}`}
          libelle="plateformes à jour ou reliées"
        />
        <a href="#plateformes" className="block [&>div]:h-full">
          <Compteur
            valeur={aCorriger + absentes}
            libelle={
              aCorriger + absentes === 0
                ? "rien à corriger"
                : `à corriger ou à créer`
            }
            accent={aCorriger + absentes > 0}
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
                texte={toutCopier}
                libelle="Tout copier"
                copie="Fiche copiée ✓"
              />
            </span>
          }
        >
          Ta fiche à copier
        </TitreSection>
        <ul className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
          {champs.map((champ, index) => (
            <li
              key={champ.libelle}
              className={`grid gap-2 px-5 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4 ${
                index > 0 ? "border-t border-zinc-100" : ""
              }`}
            >
              <span className="text-sm font-medium text-zinc-500">
                {champ.libelle}
              </span>
              {champ.valeur && champ.valeur.trim() ? (
                <>
                  <span className="min-w-0 whitespace-pre-line break-words text-sm leading-relaxed text-ink">
                    {champ.valeur}
                  </span>
                  <span className="w-fit">
                    <BoutonCopier
                      texte={champ.valeur}
                      libelle="Copier"
                      copie="Copié ✓"
                    />
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm text-zinc-400">Pas renseigné</span>
                  <Link
                    href={`/dashboard/${id}/${champ.ou}`}
                    className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
                  >
                    Compléter →
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Les plateformes ──────────────────────────────────────────── */}
      <div id="plateformes" className="flex scroll-mt-8 flex-col gap-8">
        {groupes.map((groupe) => (
          <section
            key={groupe}
            id={groupe}
            className="flex scroll-mt-8 flex-col gap-4"
          >
            <TitreSection>{LIBELLE_GROUPE[groupe]}</TitreSection>
            <ul className="grid gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {PLATEFORMES.filter((p) => p.groupe === groupe).map(
                (plateforme) => (
                  <CartePlateforme
                    key={plateforme.cle}
                    plateforme={plateforme}
                    restaurantId={id}
                    relie={relies[plateforme.cle] ?? null}
                    constat={constats.get(plateforme.cle) ?? null}
                    nom={restaurant.nom}
                    adresse={adresseRecherche}
                  />
                ),
              )}
            </ul>
          </section>
        ))}
      </div>

      <p className="max-w-4xl text-xs leading-relaxed text-zinc-400">
        Klarr ne lit pas lui-même ces plateformes : Apple, Bing ou PagesJaunes
        n&apos;ouvrent leurs données qu&apos;aux logiciels qui ont obtenu un
        accès. Les statuts disent donc ce que tu as constaté en vérifiant, à la
        date indiquée. Google, Facebook, Instagram, TripAdvisor et ta vitrine se
        mettent à jour d&apos;eux-mêmes quand ils sont reliés à Klarr.
      </p>
    </div>
  );
}

const TON_STATUT: Record<StatutPresence | "relie", string> = {
  relie: "bg-emerald-50 text-emerald-700",
  a_jour: "bg-emerald-50 text-emerald-700",
  a_corriger: "bg-brand-orange-soft text-brand-orange-dark",
  absente: "bg-brand-orange-soft text-brand-orange-dark",
};

function CartePlateforme({
  plateforme,
  restaurantId,
  relie,
  constat,
  nom,
  adresse,
}: {
  plateforme: Plateforme;
  restaurantId: string;
  relie: Relie | null;
  constat: { statut: StatutPresence; verifieLe: string } | null;
  nom: string;
  adresse: string;
}) {
  const statut = relie ? "relie" : (constat?.statut ?? null);
  const aFaire = statut === "a_corriger" || statut === "absente";

  return (
    <li
      className={`flex min-w-0 flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm ${
        aFaire
          ? "border-brand-orange/60"
          : statut
            ? "border-emerald-200"
            : "border-zinc-200/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-serif text-2xl leading-tight text-ink">
          {plateforme.nom}
        </span>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            statut ? TON_STATUT[statut] : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {statut === "relie"
            ? "Reliée à Klarr"
            : statut
              ? LIBELLE_STATUT[statut]
              : "Pas vérifiée"}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-zinc-600">
        {plateforme.pourquoi}
      </p>

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
        {plateforme.creer && !relie && (
          <a
            href={plateforme.creer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-brand-orange-dark hover:underline"
          >
            Créer ou revendiquer ↗
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

      {/* Relié, l'état se lit dans Klarr : rien à déclarer à la main. */}
      {!relie && (
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
            {STATUTS.map((valeur) => (
              <button
                key={valeur}
                type="submit"
                name="statut"
                value={valeur}
                aria-pressed={constat?.statut === valeur}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  constat?.statut === valeur
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
                }`}
              >
                {LIBELLE_STATUT[valeur]}
              </button>
            ))}
            {constat && (
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
