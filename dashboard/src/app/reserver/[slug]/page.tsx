import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { GalerieRestaurant } from "@/components/reservations/GalerieRestaurant";
import { SectionExperiences } from "@/components/experiences/SectionExperiences";
import { prochainesSeances } from "@/lib/experiences/seances";
import type { Experience, PlaceReservee } from "@/types/experience";
import { ResumeEtablissement } from "@/components/reservations/ResumeEtablissement";
import { resumeEtablissement } from "@/lib/reservations/resume";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import {
  creneauxDuJour,
  parService,
  type Creneau,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import { offrePrivatisation, propositions } from "@/lib/reservations/choix";
import { conditionsPrivatisation } from "@/lib/reservations/conditions";
import Image from "next/image";
import { DemandeForm } from "@/components/reservations/DemandeForm";
import { BandePhotos } from "@/components/reservations/BandePhotos";
import { formatCreneau, type Espace, type Service } from "@/types/reservation";
import { heureLisible } from "@/lib/site/horaires";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import type { RestaurantPhoto } from "@/types/photo";
import { Carte } from "@/components/menu/Carte";
import { cartePubliee } from "@/lib/menu/publication";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { restaurantSchema } from "@/lib/seo/donnees-structurees";
import { reseauxPublics } from "@/lib/seo/reseaux";
import { siteUrl } from "@/lib/site-url";
import { chargerAcces } from "@/lib/abonnement/acces";

type Params = { slug: string };
type Query = {
  date?: string;
  couverts?: string;
  espace?: string;
  /** L'heure d'arrivée retenue, « 19:30 ». */
  heure?: string;
};

async function chargerRestaurant(slug: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurants")
    // Page publique : on ne lit que ce qui doit s'y afficher. Et surtout
    // rien de récent — une colonne ajoutée par une migration pas encore
    // passée ferait échouer toute la requête, donc toute la page.
    .select(
      "id, nom, adresse, description, logo_url, mentions_legales, site_web",
    )
    .eq("slug_reservation", slug)
    .maybeSingle();

  // Sans cette trace, une page publique injoignable rend un 404 muet : rien
  // ne distingue un slug inconnu d'une base hors d'atteinte, et le
  // restaurateur appelle en disant « ma page a disparu ».
  if (error) {
    console.error(`Page de réservation « ${slug} » illisible :`, error.message);
  }
  return data as {
    id: string;
    nom: string;
    adresse: string | null;
    description: string | null;
    logo_url: string | null;
    mentions_legales: string | null;
    site_web: string | null;
    /** Ce que sert la maison. Colonne récente, donc facultative. */
    type_cuisine?: string | null;
  } | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) return { title: "Réservation" };

  // La photo de l'établissement, pas celle de Klarr : le lien est partagé
  // par le restaurateur sur son Instagram et sa fiche Google, il doit
  // montrer sa salle.
  const supabase = createServiceClient();
  const { data: photo } = await supabase
    .from("restaurant_photos")
    .select("url")
    .eq("restaurant_id", restaurant.id)
    .is("espace_id", null)
    .order("ordre")
    .limit(1)
    .maybeSingle();

  const titre = `Réserver — ${restaurant.nom}`;
  const description = restaurant.adresse
    ? `Réservez une table ou privatisez un espace chez ${restaurant.nom}, ${restaurant.adresse}.`
    : `Réservez une table ou privatisez un espace chez ${restaurant.nom}.`;
  const image = (photo as { url: string } | null)?.url;

  return {
    title: titre,
    description,
    openGraph: {
      type: "website",
      title: titre,
      description,
      siteName: restaurant.nom,
      locale: "fr_FR",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: titre,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Ce que le client s'engage à accepter, avant d'envoyer sa demande.
 *
 * Il n'existait nulle part : la demande partait, la salle était tenue, et
 * l'acompte se découvrait plusieurs jours plus tard, à l'acceptation. On
 * perdait le client à l'étape du paiement, après lui avoir bloqué une
 * salle pour rien.
 */
function Conditions({
  espace,
  couverts,
}: {
  espace: Espace;
  couverts: number;
}) {
  const conditions = conditionsPrivatisation(espace, couverts);
  if (conditions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-4">
      {conditions.map((condition) => (
        <div key={condition.libelle} className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-emerald-900">
            {condition.libelle}
          </span>
          {condition.precision && (
            <span className="text-xs leading-relaxed text-emerald-800">
              {condition.precision}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function dateDuJour(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLongue(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ReserverPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Query>;
}) {
  const { slug } = await params;
  const query = await searchParams;

  const restaurant = await chargerRestaurant(slug);
  if (!restaurant) notFound();

  // Sans le module Réservations, la page se ferme. La laisser ouverte
  // serait pire que de la fermer : les demandes arriveraient dans un
  // carnet auquel le restaurateur n'a plus accès, et les clients se
  // présenteraient un soir où personne ne les attend.
  const acces = await chargerAcces(restaurant.id, createServiceClient());
  if (!acces.ouvert.reservations) notFound();

  const date =
    query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date)
      ? query.date
      : dateDuJour();
  const couvertsBrut = Number(query.couverts);
  const couverts =
    Number.isInteger(couvertsBrut) && couvertsBrut > 0 ? couvertsBrut : 2;

  const supabase = createServiceClient();
  const [
    espacesResult,
    servicesResult,
    reservationsResult,
    photosResult,
    fermetures,
    experiencesResult,
    placesResult,
    reputationResult,
    carteResult,
    reseaux,
  ] = await Promise.all([
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("ordre"),
    supabase
      .from("restaurant_services")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("heure_debut"),
    supabase
      .from("restaurant_reservations")
      .select(
        "id, espace_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, option_expire_le",
      )
      .eq("restaurant_id", restaurant.id)
      .eq("date_reservation", date),
    // Toutes les photos d'un coup : celles des espaces pour les créneaux,
    // celles sans espace pour le bandeau d'en-tête.
    supabase
      .from("restaurant_photos")
      // « * » plutôt qu'une liste : nommer une colonne que la base n'a pas
      // encore fait échouer la requête entière, donc la page. Une colonne
      // en trop, elle, ne dérange personne.
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .order("ordre")
      .order("created_at"),
    chargerFermetures(supabase, restaurant.id, date),
    supabase
      .from("restaurant_experiences")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("actif", true)
      .order("ordre"),
    // Les places déjà prises sur la fenêtre affichée.
    supabase
      .from("restaurant_experience_reservations")
      .select("id, experience_id, date_seance, places, statut")
      .eq("restaurant_id", restaurant.id)
      .gte("date_seance", date),
    // Le dernier relevé Google, s'il existe : une note affichée vaut mieux
    // qu'une case vide, mais on n'en fabrique pas une.
    supabase
      .from("restaurant_reputation_snapshots")
      .select("note, nombre_avis")
      .eq("restaurant_id", restaurant.id)
      .eq("plateforme", "google")
      .order("releve_le", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // La carte, seulement si le restaurateur l'a publiée. Cette page est
    // servie avec la clé de service, qui passe outre les règles d'accès :
    // c'est donc ici, dans le code, que se fait la vérification. Et jamais
    // au prix de la page : sans carte lisible, on affiche la page sans elle.
    cartePubliee(supabase, restaurant.id),
    // Les comptes du restaurant, pour le « sameAs » du balisage. Lecture
    // sans jetons et sans exception : c'est du bonus, jamais du contenu.
    reseauxPublics(supabase, restaurant.id, restaurant.site_web),
  ]);

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const reservations = (reservationsResult.data ?? []) as Reservation[];

  const reputation = reputationResult.data as {
    note: number | null;
    nombre_avis: number | null;
  } | null;

  const experiences = (experiencesResult.data ?? []) as Experience[];
  const placesPrises = (placesResult.data ?? []) as PlaceReservee[];

  const carte = carteResult.items;

  const toutesPhotos = (photosResult.data ?? []) as RestaurantPhoto[];
  const photosEtablissement = toutesPhotos.filter((photo) => !photo.espace_id);

  const nomEspace = new Map(espaces.map((espace) => [espace.id, espace.nom]));

  const photosParEspace = new Map<string, RestaurantPhoto[]>();
  for (const photo of toutesPhotos) {
    if (!photo.espace_id) continue;
    const liste = photosParEspace.get(photo.espace_id) ?? [];
    liste.push(photo);
    photosParEspace.set(photo.espace_id, liste);
  }

  // Ce que l'établissement privatise, quel que soit le jour cherché : c'est
  // ce qui peuple le menu déroulant, et donc ce qui fait qu'un client venu
  // réserver à deux apprend que la salle du bas se loue.
  const offre = offrePrivatisation(espaces);
  // L'espace demandé dans le menu, vérifié contre la liste réelle : un
  // identifiant bricolé dans l'URL ne doit rien ouvrir.
  const espaceDemande =
    offre?.espaces.find((espace) => espace.id === query.espace) ?? null;

  const creneaux = creneauxDuJour({
    date,
    couverts,
    espaces,
    services,
    reservations,
    fermetures,
    maintenant: new Date(),
  });

  // Le moteur raisonne par heure d'arrivée ; la page montre un bloc par
  // service avec ses heures en dessous. Dix-sept cartes pour une soirée
  // seraient illisibles.
  const groupes = parService(creneaux);

  // L'heure retenue pour chaque service : celle de l'URL si elle existe
  // encore, sinon la première qui a de la place — et à défaut la première
  // tout court, pour que le motif du refus s'affiche quelque part.
  const heureChoisie = (heures: Creneau[]): Creneau =>
    heures.find((creneau) => creneau.heure === query.heure) ??
    heures.find((creneau) => creneau.ouvert) ??
    heures[0];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F0]">
      <header className="border-b border-zinc-200/70 bg-white/90 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <span className="flex items-center gap-3">
            {restaurant.logo_url && (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={restaurant.logo_url}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </span>
            )}
            <span className="text-lg font-semibold text-zinc-900">
              {restaurant.nom}
            </span>
          </span>
          {restaurant.adresse && (
            <span className="text-sm text-zinc-500">{restaurant.adresse}</span>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        {/* Ce que Google lit pour afficher la note, les horaires, la
            fourchette de prix et un bouton « Réserver » plutôt qu'un lien
            bleu. On n'y déclare que ce que la page montre réellement. */}
        <DonneesStructurees
          donnees={restaurantSchema({
            etablissement: {
              nom: restaurant.nom,
              adresse: restaurant.adresse,
              description: restaurant.description,
              logoUrl: restaurant.logo_url,
              typeCuisine: restaurant.type_cuisine,
            },
            // On n'atteint cette page que par le slug de réservation :
            // la page est donc ouverte, et la table se retient en ligne.
            accepteReservations: true,
            services,
            espaces,
            carte,
            url: `${siteUrl()}/reserver/${slug}`,
            urlCarte: carteResult.publiee ? `${siteUrl()}/carte/${slug}` : null,
            note: reputation?.note ? Number(reputation.note) : null,
            nombreAvis: reputation?.nombre_avis ?? null,
            reseaux,
          })}
        />
        {/* Les photos des salles ne s'affichent plus que sous les
            privatisations, là où le client choisit vraiment une pièce. Un
            établissement qui n'a photographié que ses salles n'en montrerait
            donc aucune : on les reprend alors en bandeau, faute de mieux que
            rien. */}
        <GalerieRestaurant
          photos={
            photosEtablissement.length > 0
              ? photosEtablissement
              : // Faute de légende, une photo de salle prend le nom de sa
                // salle : « laquelle est la cave ? » est la première
                // question du client qui ouvre la visionneuse.
                toutesPhotos.map((photo) => ({
                  ...photo,
                  legende:
                    photo.legende ??
                    (photo.espace_id ? nomEspace.get(photo.espace_id) : null) ??
                    null,
                }))
          }
          nom={restaurant.nom}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {restaurant.nom}
          </h1>
          {restaurant.adresse && (
            <p className="text-sm text-zinc-500">{restaurant.adresse}</p>
          )}
          <p className="text-sm text-zinc-500">
            Choisis une date et un nombre de convives : nous n&apos;affichons
            que ce qui est réellement disponible. Ta demande est confirmée par
            l&apos;établissement.
          </p>
        </div>

        <ResumeEtablissement
          resume={resumeEtablissement(espaces, services)}
          note={reputation?.note ? Number(reputation.note) : null}
          nombreAvis={reputation?.nombre_avis ?? null}
        />

        {/* Formulaire de recherche : une simple navigation, pour que la page
            fonctionne même sans JavaScript. */}
        <form
          method="get"
          className="flex flex-wrap items-end gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Date
            <input
              type="date"
              name="date"
              defaultValue={date}
              min={dateDuJour()}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Convives
            <input
              type="number"
              name="couverts"
              min="1"
              defaultValue={couverts}
              className="w-28 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
          </label>
          {/* La privatisation ne se propose qu'au-delà d'un certain nombre de
              convives : un couple qui réserve pour deux ne la verrait jamais,
              et repartirait sans savoir que la salle se loue. Ici elle est
              écrite avant même la recherche, sans rien demander — la
              réservation ordinaire reste le choix par défaut. */}
          {offre && (
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
              Je souhaite
              <select
                name="espace"
                defaultValue={espaceDemande?.id ?? ""}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-navy"
              >
                <option value="">Réserver une table</option>
                {offre.espaces.map((espace) => (
                  <option key={espace.id} value={espace.id}>
                    Privatiser {espace.nom} — jusqu&apos;à {espace.capacite}{" "}
                    couverts
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Voir les disponibilités
          </button>
        </form>

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900 first-letter:capitalize">
            {formatDateLongue(date)} — {couverts} convive
            {couverts > 1 ? "s" : ""}
          </h2>

          {creneaux.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              L&apos;établissement ne prend pas de réservation ce jour-là.
              Essaie une autre date.
            </p>
          ) : (
            groupes.map((groupe) => {
              const retenu = heureChoisie(groupe.heures);
              const [proposition] = propositions([retenu]);
              const { creneau, table, privatisations, placesMax, raison } =
                proposition;
              // Une salle demandée dans le menu : c'est elle qu'on montre,
              // libre ou non. Lui répondre par le catalogue reviendrait à
              // ignorer ce qu'il vient de choisir.
              const demandee = espaceDemande
                ? (creneau.espaces.find(
                    (dispo) => dispo.espace.id === espaceDemande.id,
                  ) ?? null)
                : null;

              return (
                <div
                  key={creneau.service.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-zinc-900">
                      {creneau.service.nom}{" "}
                      <span className="font-normal text-zinc-500">
                        {formatCreneau(
                          creneau.service.heure_debut,
                          creneau.service.heure_fin,
                        )}
                      </span>
                    </span>
                  </div>

                  {/* Les heures d'arrivée. Un service n'a plus une jauge
                      unique : chaque heure a la sienne, et celles qui sont
                      complètes restent visibles plutôt que de disparaître —
                      une liste qui se raccourcit sans explication donne
                      l'impression que le site a bugué. */}
                  {groupe.heures.length > 1 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-sm text-zinc-500">
                        À quelle heure ?
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {groupe.heures.map((h) => {
                          const actif = h.heure === retenu.heure;
                          return h.ouvert ? (
                            <a
                              key={h.heure}
                              href={`?date=${date}&couverts=${couverts}&heure=${h.heure}${
                                query.espace ? `&espace=${query.espace}` : ""
                              }`}
                              aria-current={actif ? "true" : undefined}
                              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                actif
                                  ? "border-brand-navy bg-brand-navy text-white"
                                  : "border-zinc-200 text-zinc-700 hover:border-brand-navy"
                              }`}
                            >
                              {heureLisible(h.heure)}
                            </a>
                          ) : (
                            <span
                              key={h.heure}
                              title="Complet à cette heure"
                              className="rounded-lg border border-zinc-100 px-3 py-1.5 text-sm text-zinc-300 line-through"
                            >
                              {heureLisible(h.heure)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {espaceDemande ? (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                      <p className="font-medium text-zinc-900">
                        Privatiser {espaceDemande.nom}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {espaceDemande.description ??
                          "L'espace est à vous seuls pendant tout le service."}
                      </p>
                      <BandePhotos
                        photos={photosParEspace.get(espaceDemande.id) ?? []}
                        espaceNom={espaceDemande.nom}
                        restaurantNom={restaurant.nom}
                      />
                      {/* Les conditions se lisent avant le bouton, pas
                          après l'envoi. */}
                      <Conditions espace={espaceDemande} couverts={couverts} />

                      {demandee?.peutEtrePrivatise ? (
                        <DemandeForm
                          slug={slug}
                          espaceId={espaceDemande.id}
                          serviceId={creneau.service.id}
                          heure={creneau.heure}
                          date={date}
                          couverts={couverts}
                          type="privatisation"
                          libelle={`Privatiser ${espaceDemande.nom}`}
                          restaurantNom={restaurant.nom}
                          principal
                        />
                      ) : (
                        <div className="mt-3 flex flex-col gap-1">
                          <p className="text-sm text-zinc-500">
                            {demandee?.raison ??
                              creneau.raison ??
                              "Cet espace ne se privatise pas sur ce service."}
                          </p>
                          {/* Le client est venu pour deux et découvre un
                              minimum : lui faire retaper le nombre serait
                              le perdre à la dernière marche. */}
                          {espaceDemande.privatisation_minimum !== null &&
                            couverts < espaceDemande.privatisation_minimum && (
                              <a
                                href={`?date=${date}&couverts=${espaceDemande.privatisation_minimum}&espace=${espaceDemande.id}`}
                                className="w-fit text-sm font-medium text-brand-orange hover:underline"
                              >
                                Voir pour {espaceDemande.privatisation_minimum}{" "}
                                convives
                              </a>
                            )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Réserver une table : l'action ordinaire, celle que
                      quatre-vingt-dix-neuf clients sur cent viennent
                      faire. Aucune salle à choisir — le client n'a aucun
                      moyen de savoir laquelle lui convient, c'est
                      l'établissement qui place, comme au téléphone. */}
                      {table ? (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                          <p className="font-medium text-zinc-900">
                            Une table pour {couverts} convive
                            {couverts > 1 ? "s" : ""}
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            Placée par l&apos;établissement, comme au téléphone.
                            {placesMax > couverts &&
                              ` Il reste de la place jusqu'à ${placesMax} convives.`}
                          </p>
                          <DemandeForm
                            slug={slug}
                            espaceId={table.espace.id}
                            serviceId={creneau.service.id}
                            heure={creneau.heure}
                            date={date}
                            couverts={couverts}
                            type="table"
                            libelle="Réserver une table"
                            restaurantNom={restaurant.nom}
                            principal
                          />
                        </div>
                      ) : (
                        // Sans motif, rien : un cadre vide inquiète plus qu'il
                        // n'informe, et la privatisation en dessous parle.
                        raison && (
                          <p className="rounded-xl border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                            {raison}
                          </p>
                        )
                      )}

                      {/* Privatiser : un autre métier, donc une autre section.
                      Ici la salle EST le sujet : le client la choisit, et
                      il a besoin de la voir. */}
                      {privatisations.length > 0 && (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                          <p className="font-medium text-zinc-900">
                            Privatiser un espace
                          </p>
                          <p className="mt-1 text-sm text-zinc-500">
                            L&apos;espace est à vous seuls pendant tout le
                            service.
                          </p>

                          <ul className="mt-3 flex flex-col gap-3">
                            {privatisations.map((dispo) => (
                              <li
                                key={dispo.espace.id}
                                className="rounded-lg border border-zinc-200 bg-white p-4"
                              >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <span className="font-medium text-zinc-900">
                                    {dispo.espace.nom}
                                  </span>
                                  <span className="text-sm text-zinc-500">
                                    Jusqu&apos;à {dispo.espace.capacite}{" "}
                                    couverts
                                  </span>
                                </div>
                                {dispo.espace.description && (
                                  <p className="mt-1 text-sm text-zinc-500">
                                    {dispo.espace.description}
                                  </p>
                                )}

                                <BandePhotos
                                  photos={
                                    photosParEspace.get(dispo.espace.id) ?? []
                                  }
                                  espaceNom={dispo.espace.nom}
                                  restaurantNom={restaurant.nom}
                                />

                                <Conditions
                                  espace={dispo.espace}
                                  couverts={couverts}
                                />

                                <DemandeForm
                                  slug={slug}
                                  espaceId={dispo.espace.id}
                                  serviceId={creneau.service.id}
                                  heure={creneau.heure}
                                  date={date}
                                  couverts={couverts}
                                  type="privatisation"
                                  libelle={`Privatiser ${dispo.espace.nom}`}
                                  restaurantNom={restaurant.nom}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}

          {/* Le client qui a ouvert le menu peut vouloir en ressortir : sans
              ce retour, il lui faudrait comprendre que c'est le menu qu'il
              doit remettre sur « Réserver une table ». */}
          {espaceDemande && (
            <a
              href={`?date=${date}&couverts=${couverts}`}
              className="w-fit text-sm font-medium text-brand-orange hover:underline"
            >
              Ou réserver simplement une table
            </a>
          )}
        </section>

        <SectionExperiences
          slug={slug}
          experiences={experiences}
          seancesParExperience={
            new Map(
              experiences.map((experience) => [
                experience.id,
                prochainesSeances({
                  experience,
                  depuis: date,
                  jours: 28,
                  places: 1,
                  reservations: placesPrises,
                  fermetures,
                  maintenant: new Date(),
                }).slice(0, 6),
              ]),
            )
          }
        />

        <Carte items={carte} slug={carteResult.publiee ? slug : undefined} />
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        {restaurant.mentions_legales && (
          <div className="mx-auto mb-5 max-w-3xl">
            {/* Mentions du restaurant, pas de Klarr : c'est lui qui contracte
                avec le client. whitespace-pre-line respecte ses retours à la
                ligne sans lui demander d'écrire du HTML. */}
            <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-500">
              {restaurant.mentions_legales}
            </p>
          </div>
        )}
        <SignatureKlarr
          texte="Réservations propulsées par"
          className="mx-auto max-w-3xl"
        />
      </footer>
    </div>
  );
}
