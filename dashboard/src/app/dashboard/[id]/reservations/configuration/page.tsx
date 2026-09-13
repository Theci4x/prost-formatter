import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { EspaceForm } from "@/components/reservations/EspaceForm";
import { PhotosEspace } from "@/components/reservations/PhotosEspace";
import { IdentitePublique } from "@/components/reservations/IdentitePublique";
import { ServiceForm } from "@/components/reservations/ServiceForm";
import { FermetureForm } from "@/components/reservations/FermetureForm";
import {
  activerPageReservation,
  removeEspace,
  removeService,
  supprimerFermeture,
} from "../actions";
import {
  formatCreneau,
  formatJours,
  type Espace,
  type Fermeture,
  type Service,
} from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";
import { siteUrl } from "@/lib/site-url";

function Supprimer({
  id,
  restaurantId,
  action,
}: {
  id: string;
  restaurantId: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-800"
      >
        Supprimer
      </button>
    </form>
  );
}

function Puce({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
      {children}
    </span>
  );
}

function jourLisible(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Un seul jour se dit « le 14 juillet », pas « du 14 au 14 ». */
function formatPeriode(debut: string, fin: string): string {
  return debut === fin
    ? `Le ${jourLisible(debut)}`
    : `Du ${jourLisible(debut)} au ${jourLisible(fin)}`;
}

export default async function ConfigurationReservationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    restaurantResult,
    espacesResult,
    servicesResult,
    photosResult,
    fermeturesResult,
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("created_at"),
    supabase
      .from("restaurant_services")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("heure_debut"),
    supabase
      .from("restaurant_photos")
      .select("*")
      .eq("restaurant_id", id)
      .not("espace_id", "is", null)
      .order("created_at"),
    // Les fermetures passées ne servent plus à rien : on ne garde à l'écran
    // que ce qui bloque encore quelque chose.
    supabase
      .from("restaurant_fermetures")
      .select("*")
      .eq("restaurant_id", id)
      .gte("date_fin", new Date().toISOString().slice(0, 10))
      .order("date_debut"),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const fermetures = (fermeturesResult.data ?? []) as Fermeture[];
  const nomEspace = new Map(espaces.map((espace) => [espace.id, espace.nom]));

  const photosParEspace = new Map<string, RestaurantPhoto[]>();
  for (const photo of (photosResult.data ?? []) as RestaurantPhoto[]) {
    if (!photo.espace_id) continue;
    const liste = photosParEspace.get(photo.espace_id) ?? [];
    liste.push(photo);
    photosParEspace.set(photo.espace_id, liste);
  }
  const publique = restaurant as Restaurant & {
    slug_reservation?: string | null;
    logo_url?: string | null;
    mentions_legales?: string | null;
  };
  const slug = publique.slug_reservation;
  const site = siteUrl();

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.reservations}
        title={`Réglages des réservations — ${restaurant.nom}`}
        backHref={`/dashboard/${id}/reservations`}
      />

      <p className="max-w-2xl text-sm text-zinc-500">
        Décris tes espaces et tes services : Klarr s&apos;en sert pour calculer
        ce qui reste disponible et pour empêcher qu&apos;une salle soit promise
        deux fois. Un espace peut accueillir des tables classiques, se
        privatiser en entier, ou les deux.
      </p>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">Tes espaces</h2>
          <p className="text-sm text-zinc-500">
            La salle principale, la terrasse, la cave — tout ce qui peut
            accueillir un groupe.
          </p>
        </div>

        {espaces.length > 0 && (
          <ul className="flex flex-col gap-3">
            {espaces.map((espace) => (
              <li
                key={espace.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="font-medium text-zinc-900">
                    {espace.nom}
                  </span>
                  {espace.description && (
                    <span className="text-sm text-zinc-500">
                      {espace.description}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Puce>{espace.capacite} couverts</Puce>
                    {espace.accepte_table && <Puce>Réservations individuelles</Puce>}
                    {espace.privatisation_minimum !== null && (
                      <Puce>
                        Privatisation dès {espace.privatisation_minimum}
                      </Puce>
                    )}
                  </div>
                </div>
                <Supprimer
                  id={espace.id}
                  restaurantId={id}
                  action={removeEspace}
                />

                <div className="w-full border-t border-zinc-100 pt-4">
                  <p className="mb-3 text-sm font-medium text-zinc-700">
                    Photos de cet espace{" "}
                    <span className="font-normal text-zinc-400">
                      — ce que verra le client avant de réserver
                    </span>
                  </p>
                  <PhotosEspace
                    restaurantId={id}
                    espaceId={espace.id}
                    photos={photosParEspace.get(espace.id) ?? []}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <EspaceForm restaurantId={id} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">
            Tes services
          </h2>
          <p className="text-sm text-zinc-500">
            Les créneaux pendant lesquels tu prends des réservations. Un
            déjeuner et un dîner comptent séparément : une salle privatisée à
            midi reste libre le soir.
          </p>
        </div>

        {services.length > 0 && (
          <ul className="flex flex-col gap-3">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="font-medium text-zinc-900">
                    {service.nom}{" "}
                    <span className="font-normal text-zinc-500">
                      {formatCreneau(service.heure_debut, service.heure_fin)}
                    </span>
                  </span>
                  <span className="text-sm text-zinc-500 first-letter:capitalize">
                    {formatJours(service.jours)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Puce>
                      {service.delai_heures === 0
                        ? "Dernière minute acceptée"
                        : `Prévenance ${service.delai_heures} h`}
                    </Puce>
                  </div>
                </div>
                <Supprimer
                  id={service.id}
                  restaurantId={id}
                  action={removeService}
                />
              </li>
            ))}
          </ul>
        )}

        <ServiceForm restaurantId={id} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">
            Fermetures
          </h2>
          <p className="text-sm text-zinc-500">
            Congés, jour férié, salle déjà prise : ferme la période et plus
            rien ne s&apos;y réserve, ni en ligne ni au téléphone. Tes services
            restent configurés, tu n&apos;as rien à défaire.
          </p>
        </div>

        {fermetures.length > 0 && (
          <ul className="flex flex-col gap-3">
            {fermetures.map((fermeture) => (
              <li
                key={fermeture.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
              >
                <span className="flex flex-col">
                  <span className="font-medium text-zinc-900">
                    {formatPeriode(fermeture.date_debut, fermeture.date_fin)}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {fermeture.espace_id
                      ? `${nomEspace.get(fermeture.espace_id) ?? "Espace supprimé"} seulement`
                      : "Tout l'établissement"}
                    {fermeture.motif && ` · ${fermeture.motif}`}
                  </span>
                </span>
                <form action={supprimerFermeture}>
                  <input type="hidden" name="id" value={fermeture.id} />
                  <input type="hidden" name="restaurant_id" value={id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-zinc-500 hover:text-red-600"
                  >
                    Rouvrir
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <FermetureForm restaurantId={id} espaces={espaces} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">
            Ta page de réservation
          </h2>
          <p className="text-sm text-zinc-500">
            L&apos;adresse à partager sur ta fiche Google, ton Instagram et ta
            page Facebook. Tes clients y voient uniquement ce qui est
            réellement disponible.
          </p>
        </div>

        <IdentitePublique
          restaurantId={id}
          logoUrl={publique.logo_url ?? null}
          mentions={publique.mentions_legales ?? null}
        />

        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          {espaces.length === 0 || services.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Ajoute au moins un espace et un service : sans eux, la page
              n&apos;aurait rien à proposer.
            </p>
          ) : slug ? (
            <>
              <a
                href={`/reserver/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit break-all font-medium text-brand-orange hover:underline"
              >
                {site}/reserver/{slug}
              </a>
              <p className="text-sm text-zinc-500">
                Elle est en ligne. Ouvre-la pour vérifier ce que voient tes
                clients.
              </p>
            </>
          ) : (
            <form action={activerPageReservation} className="flex flex-col gap-3">
              <input type="hidden" name="restaurant_id" value={id} />
              <p className="text-sm text-zinc-500">
                Ta page n&apos;est pas encore ouverte. Elle recevra une adresse
                dérivée du nom de ton établissement.
              </p>
              <button
                type="submit"
                className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
              >
                Ouvrir ma page de réservation
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
