import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { EspaceForm } from "@/components/reservations/EspaceForm";
import { ServiceForm } from "@/components/reservations/ServiceForm";
import {
  activerPageReservation,
  removeEspace,
  removeService,
} from "./actions";
import {
  formatHeure,
  formatJours,
  type Espace,
  type Service,
} from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";

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

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [restaurantResult, espacesResult, servicesResult] = await Promise.all([
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
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const slug = (restaurant as Restaurant & { slug_reservation?: string | null })
    .slug_reservation;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.reservations}
        title={`Réservations — ${restaurant.nom}`}
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
                    {espace.accepte_table && <Puce>Tables classiques</Puce>}
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
                      {formatHeure(service.heure_debut)} –{" "}
                      {formatHeure(service.heure_fin)}
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
            Ta page de réservation
          </h2>
          <p className="text-sm text-zinc-500">
            L&apos;adresse à partager sur ta fiche Google, ton Instagram et ta
            page Facebook. Tes clients y voient uniquement ce qui est
            réellement disponible.
          </p>
        </div>

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
                {siteUrl}/reserver/{slug}
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
