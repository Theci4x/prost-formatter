import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
  fetchGooglePlatformReviews,
} from "@/lib/reviews/aggregate";
import {
  CarteAvis,
  LIBELLE_PLATEFORME,
  TuilePlateforme,
  type AvisAffiche,
} from "@/components/reviews/PlatformReviewsCard";
import { tripadvisorDuReleve } from "@/lib/reviews/releve";
import { FRAICHEUR_DEMANDE } from "@/lib/reviews/fraicheur";
import { RepondreAvisLibre } from "@/components/reviews/RepondreAvisLibre";
import { chargerReponses, cleAvis } from "@/lib/reviews/reponses";
import { chargerAvisGoogleDirect } from "@/lib/reviews/googleDirect";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { AVIS } from "@/lib/i18n/pages/avis";
import { nombreLisible } from "@/lib/i18n/nombres";

export default async function AvisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tripadvisor?: string; filtre?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  // Les avis Tripadvisor ne se chargent que sur demande : chaque appel
  // est facturé, et la note, elle, vient du relevé de la semaine.
  const chargerTripadvisor = query.tripadvisor === "avis";
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const langue = await langueUtilisateur();
  const t = traducteur(langue, AVIS, COMMUN);
  const location = restaurant.adresse ?? "";
  const suivi = restaurant as Restaurant & {
    yelp_url?: string | null;
    tripadvisor_url?: string | null;
    tripadvisor_location_id?: string | null;
    tripadvisor_location_devine?: string | null;
    reputation_relevee_le?: string | null;
  };
  const epingleTripadvisor = suivi.tripadvisor_location_id;

  const [google, yelp, releveTripadvisor, direct, suiviReponses, ficheGoogle] =
    await Promise.all([
      fetchGooglePlatformReviews(restaurant.nom, location),
      fetchYelpPlatformReviews(restaurant.nom, location, suivi.yelp_url ?? null),
      tripadvisorDuReleve(supabase, suivi),
      chargerTripadvisor
        ? fetchTripadvisorPlatformReviews(restaurant.nom, location, {
            epingle: epingleTripadvisor,
            devine: suivi.tripadvisor_location_devine ?? null,
            fraicheur: FRAICHEUR_DEMANDE,
            sourceUrl: suivi.tripadvisor_url ?? null,
          })
        : Promise.resolve(null),
      chargerReponses(supabase, id),
      chargerAvisGoogleDirect(supabase, id),
    ]);
  const { reponses, tableAbsente } = suiviReponses;
  // Chargé à la demande, l'appel direct l'emporte : il porte les avis, le
  // lien vers la fiche et le nom retenu. Sinon, le relevé suffit.
  const tripadvisor = direct?.found ? direct : releveTripadvisor;

  // Lus sur la fiche du restaurateur, les avis Google sont plus nombreux et
  // se répondent depuis Klarr : ils remplacent ceux de Places, dont on garde
  // le lien vers la fiche publique et l'état d'ouverture.
  const repondDirect = ficheGoogle.etat === "ok";
  const avisGoogle =
    ficheGoogle.etat === "ok"
      ? {
          ...ficheGoogle.donnees,
          businessName: google.businessName,
          businessUrl: google.businessUrl,
          businessStatus: google.businessStatus,
        }
      : google;

  const plateformes = [avisGoogle, yelp, tripadvisor].filter(
    (p) => p.configured,
  );

  // Toutes plateformes confondues, du plus récent au plus ancien : c'est
  // l'ordre dans lequel on répond. Sans date, en dernier.
  const avis: AvisAffiche[] = plateformes
    .filter((p) => p.found)
    .flatMap((p) =>
      p.reviews.map((r) => ({
        ...r,
        platform: p.platform,
        ficheUrl: p.businessUrl ?? null,
      })),
    )
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  // Les chiffres d'ensemble, toutes plateformes : la note moyenne pèse
  // chaque plateforme par son nombre d'avis — 4,8 sur 12 avis ne vaut
  // pas 4,3 sur 900.
  const notees = plateformes.filter(
    (p) => p.found && p.rating != null && (p.reviewCount ?? 0) > 0,
  );
  const totalAvis = notees.reduce((t, p) => t + (p.reviewCount ?? 0), 0);
  const moyenne =
    totalAvis > 0
      ? notees.reduce((t, p) => t + p.rating! * (p.reviewCount ?? 0), 0) /
        totalAvis
      : null;
  // Répondu dans Klarr, ou déjà sur Google : la fiche le dit elle-même,
  // y compris pour les réponses écrites ailleurs que dans Klarr.
  const repondu = (a: AvisAffiche) =>
    reponses.has(cleAvis(a)) || Boolean(a.reponsePubliee);
  const reponseDe = (a: AvisAffiche) =>
    a.reponsePubliee
      ? { reponse: a.reponsePubliee.texte, reponduLe: a.reponsePubliee.le }
      : (reponses.get(cleAvis(a)) ?? null);
  // « À traiter » : les notes basses encore sans réponse. Une fois
  // répondu, l'avis n'a plus à attirer l'œil.
  const bas = avis.filter((a) => a.rating > 0 && a.rating <= 3 && !repondu(a));
  const sansReponse = avis.filter((a) => !repondu(a));

  // Les filtres de la liste : les avis à traiter d'abord, et une entrée
  // par plateforme qui a transmis quelque chose.
  const filtres = [
    { cle: "", libelle: t("Tous · {n}", { n: avis.length }) },
    ...(bas.length > 0
      ? [{ cle: "a-traiter", libelle: t("À traiter · {n}", { n: bas.length }) }]
      : []),
    ...(sansReponse.length > 0 && sansReponse.length < avis.length
      ? [
          {
            cle: "sans-reponse",
            libelle: t("Sans réponse · {n}", { n: sansReponse.length }),
          },
        ]
      : []),
    ...plateformes
      .filter((p) => avis.some((a) => a.platform === p.platform))
      .map((p) => ({
        cle: p.platform,
        libelle: `${LIBELLE_PLATEFORME[p.platform]} · ${avis.filter((a) => a.platform === p.platform).length}`,
      })),
  ];
  const actif = filtres.some((f) => f.cle === query.filtre)
    ? (query.filtre ?? "")
    : "";
  const affiches = avis.filter((a) =>
    actif === "a-traiter"
      ? a.rating > 0 && a.rating <= 3 && !repondu(a)
      : actif === "sans-reponse"
        ? !repondu(a)
        : actif
          ? a.platform === actif
          : true,
  );
  const lienFiltre = (cle: string) => {
    const params = new URLSearchParams();
    if (chargerTripadvisor) params.set("tripadvisor", "avis");
    if (cle) params.set("filtre", cle);
    const chaine = params.toString();
    return `/dashboard/${id}/avis${chaine ? `?${chaine}` : ""}#avis`;
  };

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={t("Avis — {nom}", { nom: restaurant.nom })}
      />

      {tableAbsente && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          <strong>{t("Migration à passer :")}</strong>{" "}
          {t(
            "le suivi des réponses (supabase/migrations/0081_avis_reponses.sql) n'est pas encore en place. Tu peux déjà rédiger et copier tes réponses ; « J'ai publié » s'enregistrera une fois la migration passée.",
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-4xl text-sm text-zinc-600">
          {repondDirect
            ? t(
                "Klarr rédige une réponse pour chaque avis, dans la langue du client. Sur Google, relis-la et publie-la en un clic ; ailleurs, copie-la et colle-la sous l'avis.",
              )
            : t(
                "Klarr rédige une réponse pour chaque avis, dans la langue du client. En attendant que Google ouvre la publication directe, copie-la, colle-la sous l'avis, puis coche « J'ai publié » : l'avis sort de la liste à traiter.",
              )}
        </p>
        {/* L'autre moitié de la réputation : ce que les clients disent en
            privé, avant d'écrire en public. */}
        <div className="flex flex-wrap gap-3">
          {/* Plus d'avis, pas seulement mieux répondus : la demande du
              lendemain, qui vit à côté du carnet. */}
          <Link
            href={`/dashboard/${id}/apres-visite`}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {t("Demander un avis le lendemain")}
          </Link>
          <Link
            href={`/dashboard/${id}/retours`}
            className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {t("Retours clients privés")}
          </Link>
        </div>
      </div>

      {(ficheGoogle.etat === "non-connecte" ||
        ficheGoogle.etat === "sans-fiche" ||
        ficheGoogle.etat === "erreur") && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-orange/40 bg-brand-orange-soft px-5 py-4">
          <p className="max-w-3xl text-sm leading-relaxed text-ink">
            {ficheGoogle.etat === "erreur"
              ? t(
                  "Google n'a pas transmis les avis de ta fiche. Ceux affichés viennent de la fiche publique ; réessaie dans un instant pour répondre depuis Klarr.",
                )
              : ficheGoogle.etat === "sans-fiche"
                ? t(
                    "Choisis ta fiche Google pour lire tous tes avis et y répondre depuis Klarr, sans copier-coller.",
                  )
                : t(
                    "Connecte ta fiche Google pour lire tous tes avis et y répondre depuis Klarr, sans copier-coller.",
                  )}
          </p>
          {ficheGoogle.etat !== "erreur" && (
            <Link
              href={`/dashboard/${id}/google`}
              className="rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            >
              {ficheGoogle.etat === "sans-fiche"
                ? t("Choisir ma fiche")
                : t("Connecter Google")}
            </Link>
          )}
        </div>
      )}

      {plateformes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Compteur
            valeur={
              moyenne != null
                ? nombreLisible(moyenne, langue, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })
                : "—"
            }
            libelle={
              notees.length > 1
                ? t("note moyenne, toutes plateformes")
                : t("note moyenne")
            }
          />
          <Compteur
            valeur={nombreLisible(totalAvis, langue)}
            libelle={t("avis au total")}
          />
          <a href="#avis" className="block [&>div]:h-full">
            <Compteur
              valeur={bas.length}
              libelle={t("avis de 3 étoiles ou moins sans réponse")}
              accent={bas.length > 0}
            />
          </a>
          <a href="#avis" className="block [&>div]:h-full">
            <Compteur
              valeur={`${avis.length - sansReponse.length}/${avis.length}`}
              libelle={t("derniers avis avec une réponse")}
              accent={sansReponse.length > 0}
            />
          </a>
        </div>
      )}

      {/* Une plateforme sans clé API n'est pas montrée : « ajoutez une clé
          Yelp » s'adresse à nous, et le restaurateur n'y peut rien. Elle
          apparaîtra le jour où la clé sera posée. */}
      <div
        className={`grid gap-4 ${
          plateformes.length >= 3
            ? "md:grid-cols-3"
            : plateformes.length === 2
              ? "md:grid-cols-2"
              : ""
        }`}
      >
        {plateformes.map((p) => (
          <TuilePlateforme
            key={p.platform}
            data={p}
            langue={langue}
            pied={
              p.platform === "tripadvisor" ? (
                <div className="flex flex-col gap-3">
                  {!direct && p.releveAttendu && (
                    <Link
                      href={`/dashboard/${id}/edit`}
                      className="w-fit rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
                    >
                      {t("Charger les derniers avis Tripadvisor")}
                    </Link>
                  )}
                  <p className="text-xs text-zinc-500">
                    Note relevée depuis l&apos;URL publique enregistrée dans ta
                    fiche établissement. Pour modifier le lien, ouvre les
                    réglages de la fiche restaurant.
                  </p>
                </div>
              ) : null
            }
          />
        ))}
      </div>

      <section id="avis" className="flex scroll-mt-8 flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-serif text-2xl text-ink">
              {t("Derniers avis")}
            </h2>
            {avis.length > 0 && (
              <p className="text-xs text-zinc-500">
                {t(
                  "Les plateformes n'en transmettent que quelques-uns — les plus récents ou les plus pertinents selon elles.",
                )}
              </p>
            )}
          </div>
          {filtres.length > 2 && (
            <nav className="flex flex-wrap gap-2">
              {filtres.map((f) => (
                <Link
                  key={f.cle || "tous"}
                  href={lienFiltre(f.cle)}
                  scroll={false}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    actif === f.cle
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-ink hover:text-ink"
                  }`}
                >
                  {f.libelle}
                </Link>
              ))}
            </nav>
          )}
        </div>
        {avis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
            {t(
              "Aucun avis à afficher pour l'instant — la raison est indiquée sur chaque plateforme, au-dessus.",
            )}
          </div>
        ) : (
          <ul className="grid items-start gap-4 lg:grid-cols-2">
            {affiches.map((a, i) => (
              <CarteAvis
                key={`${a.platform}-${i}`}
                avis={a}
                restaurantId={id}
                langue={langue}
                cle={cleAvis(a)}
                enregistree={reponseDe(a)}
              />
            ))}
          </ul>
        )}
      </section>

      <section id="autre-avis" className="flex scroll-mt-8 flex-col gap-4">
        <TitreSection>{t("Répondre à un autre avis")}</TitreSection>
        <p className="max-w-4xl text-sm text-zinc-600">
          {repondDirect
            ? t(
                "Pour un avis TheFork, Facebook ou d'ailleurs, colle-le ici : Klarr propose la réponse, tu la copies.",
              )
            : t(
                "Google ne transmet que cinq avis, pas forcément les plus récents. Pour les autres — ou ceux de TheFork et d'ailleurs — colle l'avis ici : Klarr propose la réponse, tu la copies.",
              )}
        </p>
        <RepondreAvisLibre restaurantId={id} langue={langue} />
      </section>
    </div>
  );
}
