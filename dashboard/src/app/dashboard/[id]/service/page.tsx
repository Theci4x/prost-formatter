import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SaisieReservation } from "@/components/reservations/SaisieReservation";
import { DecisionDemande } from "@/components/reservations/DecisionDemande";
import {
  disponibiliteEspace,
  fermetureApplicable,
  motifFermeture,
  serviceOuvertCeJour,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import {
  formatCreneau,
  formatHeure,
  type Espace,
  type Service,
} from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";

type Ligne = Reservation & {
  client_nom: string;
  client_telephone: string | null;
  occasion: string | null;
  note_interne: string | null;
  origine: "client" | "restaurateur";
};

function decalerJour(date: string, jours: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

function formatLong(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jour?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const jour =
    query.jour && /^\d{4}-\d{2}-\d{2}$/.test(query.jour)
      ? query.jour
      : new Date().toISOString().slice(0, 10);

  const [
    restaurantResult,
    espacesResult,
    servicesResult,
    reservationsResult,
    fermetures,
  ] = await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_espaces")
        .select("*")
        .eq("restaurant_id", id)
        .order("ordre"),
      supabase
        .from("restaurant_services")
        .select("*")
        .eq("restaurant_id", id)
        .order("heure_debut"),
      supabase
        .from("restaurant_reservations")
        .select("*")
        .eq("restaurant_id", id)
        .eq("date_reservation", jour),
      chargerFermetures(supabase, id, jour),
    ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const lignes = (reservationsResult.data ?? []) as Ligne[];

  const confirmees = lignes.filter((l) => l.statut === "confirmee");
  const enAttente = lignes.filter(
    (l) => l.statut === "demande" || l.statut === "expiree",
  );
  const couvertsAttendus = confirmees.reduce((t, l) => t + l.couverts, 0);
  const servicesDuJour = services.filter((s) => serviceOuvertCeJour(jour, s));
  // Une fermeture posée après coup laisse des convives déjà attendus : le
  // bandeau le dit, et la liste reste affichée pour qu'on sache qui rappeler.
  const fermeture = fermetureApplicable(jour, null, fermetures);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href={`/dashboard/${id}/reservations`}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            ← Réservations
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900 first-letter:capitalize">
            {formatLong(jour)}
          </h1>
          <p className="text-sm text-zinc-500">{restaurant.nom}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${id}/service?jour=${decalerJour(jour, -1)}`}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:border-brand-navy hover:text-brand-navy"
          >
            ← Veille
          </Link>
          <Link
            href={`/dashboard/${id}/service`}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:border-brand-navy hover:text-brand-navy"
          >
            Aujourd&apos;hui
          </Link>
          <Link
            href={`/dashboard/${id}/service?jour=${decalerJour(jour, 1)}`}
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 hover:border-brand-navy hover:text-brand-navy"
          >
            Lendemain →
          </Link>
        </div>
      </div>

      {fermeture && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm font-medium text-amber-900">
          {motifFermeture(fermeture)} Aucune réservation ne peut être prise ce
          jour-là.
          {confirmees.length > 0 &&
            " Les convives ci-dessous étaient attendus : pense à les prévenir."}
        </p>
      )}

      {/* Le chiffre que le chef veut en arrivant : combien de couverts. */}
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <span className="flex flex-col">
          <span className="text-5xl font-semibold tabular-nums text-brand-navy">
            {couvertsAttendus}
          </span>
          <span className="text-sm text-zinc-600">couverts attendus</span>
        </span>
        <span className="flex flex-col">
          <span className="text-2xl font-semibold tabular-nums text-zinc-700">
            {confirmees.length}
          </span>
          <span className="text-sm text-zinc-600">réservations</span>
        </span>
        {enAttente.length > 0 && (
          <span className="flex flex-col">
            <span className="text-2xl font-semibold tabular-nums text-brand-orange">
              {enAttente.length}
            </span>
            <span className="text-sm text-zinc-600">à trancher</span>
          </span>
        )}
      </div>

      <SaisieReservation
        restaurantId={id}
        espaces={espaces}
        services={services}
      />

      {enAttente.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-900">
            En attente de ta réponse
          </h2>
          <ul className="flex flex-col gap-3">
            {enAttente.map((ligne) => (
              <li
                key={ligne.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-orange/40 bg-brand-orange-soft/40 p-4"
              >
                <span className="text-sm">
                  <span className="font-medium text-zinc-900">
                    {ligne.client_nom}
                  </span>{" "}
                  <span className="text-zinc-600">
                    · {ligne.couverts} couverts
                    {ligne.type === "privatisation" && " · privatisation"}
                  </span>
                </span>
                <DecisionDemande reservationId={ligne.id} restaurantId={id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {servicesDuJour.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
          Aucun service ce jour-là.
        </p>
      ) : (
        servicesDuJour.map((service) => (
          <section key={service.id} className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-zinc-900">
              {service.nom}{" "}
              <span className="font-normal text-zinc-500">
                {formatCreneau(service.heure_debut, service.heure_fin)}
              </span>
            </h2>

            <div className="grid gap-4 lg:grid-cols-2">
              {espaces.map((espace) => {
                const dispo = disponibiliteEspace({
                  espace,
                  service,
                  date: jour,
                  couverts: 1,
                  reservations: lignes,
                  fermetures,
                  maintenant: new Date(),
                });
                const duService = confirmees.filter(
                  (l) =>
                    l.espace_id === espace.id && l.service_id === service.id,
                );

                return (
                  <div
                    key={espace.id}
                    className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium text-zinc-900">
                        {espace.nom}
                      </span>
                      <span className="text-sm tabular-nums text-zinc-600">
                        {dispo.occupes} / {espace.capacite} couverts
                      </span>
                    </div>

                    {/* Jauge du créneau : pleine en rouge, pour qu'un coup
                        d'œil suffise en plein service. */}
                    <span className="flex h-2 w-full overflow-hidden rounded-[4px] bg-zinc-100">
                      <span
                        className={`h-2 rounded-[4px] ${
                          dispo.restants === 0 ? "bg-red-500" : "bg-brand-navy"
                        }`}
                        style={{
                          width: `${Math.min((dispo.occupes / espace.capacite) * 100, 100)}%`,
                        }}
                      />
                    </span>

                    {duService.length === 0 ? (
                      <p className="text-sm text-zinc-400">
                        Personne pour l&apos;instant.
                      </p>
                    ) : (
                      <ul className="flex flex-col divide-y divide-zinc-100">
                        {duService.map((ligne) => (
                          <li
                            key={ligne.id}
                            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0"
                          >
                            <span className="flex flex-col">
                              <span className="font-medium text-zinc-900">
                                {ligne.client_nom}
                                {ligne.type === "privatisation" && (
                                  <span className="ml-2 rounded-full bg-brand-orange-soft px-2 py-0.5 text-xs font-medium text-brand-navy">
                                    privatisé
                                  </span>
                                )}
                              </span>
                              {(ligne.occasion || ligne.note_interne) && (
                                <span className="text-sm text-zinc-500">
                                  {[ligne.occasion, ligne.note_interne]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              )}
                            </span>
                            <span className="flex items-baseline gap-4 text-sm">
                              {ligne.client_telephone && (
                                <a
                                  href={`tel:${ligne.client_telephone}`}
                                  className="text-zinc-500 hover:text-zinc-900"
                                >
                                  {ligne.client_telephone}
                                </a>
                              )}
                              {/* L'unité est répétée : à côté d'un numéro de
                                  téléphone, un nombre nu se lit mal. */}
                              <span className="font-medium tabular-nums text-zinc-900">
                                {ligne.couverts}{" "}
                                <span className="font-normal text-zinc-500">
                                  couv.
                                </span>
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      {servicesDuJour.length > 0 && (
        <p className="text-xs text-zinc-400">
          Heures indicatives : Klarr retient le service, pas l&apos;heure
          d&apos;arrivée de chaque table.{" "}
          {formatHeure(servicesDuJour[0].heure_debut)} est le début du premier
          service.
        </p>
      )}
    </div>
  );
}
