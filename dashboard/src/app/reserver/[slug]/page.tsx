import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { GalerieRestaurant } from "@/components/reservations/GalerieRestaurant";
import { ResumeEtablissement } from "@/components/reservations/ResumeEtablissement";
import { resumeEtablissement } from "@/lib/reservations/resume";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import {
  creneauxDuJour,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import Image from "next/image";
import { DemandeForm } from "@/components/reservations/DemandeForm";
import { formatCreneau, type Espace, type Service } from "@/types/reservation";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import type { RestaurantPhoto } from "@/types/photo";

type Params = { slug: string };
type Query = { date?: string; couverts?: string };

async function chargerRestaurant(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurants")
    // Page publique : on ne lit que ce qui doit s'y afficher.
    .select("id, nom, adresse, description, logo_url, mentions_legales")
    .eq("slug_reservation", slug)
    .maybeSingle();

  return data as {
    id: string;
    nom: string;
    adresse: string | null;
    description: string | null;
    logo_url: string | null;
    mentions_legales: string | null;
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
    reputationResult,
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
        "id, espace_id, service_id, date_reservation, couverts, type, statut, option_expire_le",
      )
      .eq("restaurant_id", restaurant.id)
      .eq("date_reservation", date),
    // Toutes les photos d'un coup : celles des espaces pour les créneaux,
    // celles sans espace pour le bandeau d'en-tête.
    supabase
      .from("restaurant_photos")
      .select("id, restaurant_id, espace_id, url, storage_path, ordre, created_at")
      .eq("restaurant_id", restaurant.id)
      .order("ordre")
      .order("created_at"),
    chargerFermetures(supabase, restaurant.id, date),
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
  ]);

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const reservations = (reservationsResult.data ?? []) as Reservation[];

  const reputation = reputationResult.data as {
    note: number | null;
    nombre_avis: number | null;
  } | null;

  const toutesPhotos = (photosResult.data ?? []) as RestaurantPhoto[];
  const photosEtablissement = toutesPhotos.filter((photo) => !photo.espace_id);

  const photosParEspace = new Map<string, RestaurantPhoto[]>();
  for (const photo of toutesPhotos) {
    if (!photo.espace_id) continue;
    const liste = photosParEspace.get(photo.espace_id) ?? [];
    liste.push(photo);
    photosParEspace.set(photo.espace_id, liste);
  }

  const creneaux = creneauxDuJour({
    date,
    couverts,
    espaces,
    services,
    reservations,
    fermetures,
    maintenant: new Date(),
  });

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
        <GalerieRestaurant photos={photosEtablissement} nom={restaurant.nom} />

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
            creneaux.map((creneau) => (
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
                  {!creneau.ouvert && creneau.raison && (
                    <span className="text-sm text-zinc-500">
                      {creneau.raison}
                    </span>
                  )}
                </div>

                {/* Les espaces sont listés même quand aucun n'est
                    disponible : le motif du refus (« il ne reste que 12
                    couverts ») aide le client à ajuster sa demande, là où un
                    « complet » sec le fait partir. La liste n'est vide que
                    lorsque le service lui-même est fermé. */}
                {creneau.espaces.length > 0 && (
                  <ul className="flex flex-col gap-3">
                    {creneau.espaces.map((dispo) => {
                      const possible =
                        dispo.peutRecevoirTable || dispo.peutEtrePrivatise;
                      return (
                        <li
                          key={dispo.espace.id}
                          className="rounded-xl border border-zinc-200 p-4"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-medium text-zinc-900">
                              {dispo.espace.nom}
                            </span>
                            <span className="text-sm text-zinc-500">
                              {dispo.privatise
                                ? "Privatisé"
                                : `${dispo.restants} couverts disponibles`}
                            </span>
                          </div>
                          {dispo.espace.description && (
                            <p className="mt-1 text-sm text-zinc-500">
                              {dispo.espace.description}
                            </p>
                          )}

                          {/* Les photos défilent horizontalement plutôt que
                              de s'empiler : sur un téléphone, une colonne de
                              grandes images repousse le bouton de réservation
                              hors de l'écran. */}
                          {(photosParEspace.get(dispo.espace.id) ?? []).length >
                            0 && (
                            <ul className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
                              {(photosParEspace.get(dispo.espace.id) ?? []).map(
                                (photo) => (
                                  <li key={photo.id} className="shrink-0">
                                    <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-zinc-200">
                                      <Image
                                        src={photo.url}
                                        alt={`${dispo.espace.nom} — ${restaurant.nom}`}
                                        fill
                                        sizes="160px"
                                        className="object-cover"
                                      />
                                    </div>
                                  </li>
                                ),
                              )}
                            </ul>
                          )}

                          {possible ? (
                            <DemandeForm
                              slug={slug}
                              espaceId={dispo.espace.id}
                              espaceNom={dispo.espace.nom}
                              serviceId={creneau.service.id}
                              date={date}
                              couverts={couverts}
                              peutRecevoirTable={dispo.peutRecevoirTable}
                              peutEtrePrivatise={dispo.peutEtrePrivatise}
                              restaurantNom={restaurant.nom}
                            />
                          ) : (
                            <p className="mt-2 text-sm text-zinc-400">
                              {dispo.raison}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))
          )}
        </section>
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
        <div className="mx-auto flex max-w-3xl items-center gap-2 text-sm text-zinc-400">
          <KlarrMark size={16} />
          <span>
            Réservations propulsées par{" "}
            <KlarrWordmark className="text-zinc-500" />
          </span>
        </div>
      </footer>
    </div>
  );
}
