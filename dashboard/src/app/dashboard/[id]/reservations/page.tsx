import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { DecisionDemande } from "@/components/reservations/DecisionDemande";
import { SaisieReservation } from "@/components/reservations/SaisieReservation";
import {
  CalendrierMois,
  type JourCharge,
} from "@/components/reservations/CalendrierMois";
import { Statistiques } from "@/components/reservations/Statistiques";
import {
  computeStatistiques,
  periode,
  type LigneStat,
} from "@/lib/reservations/statistiques";
import { annulerReservation, enregistrerNote } from "./actions";
import { formatHeure, type Espace, type Service } from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";

type Demande = {
  id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  client_nom: string;
  client_email: string;
  client_telephone: string | null;
  occasion: string | null;
  message: string | null;
  option_expire_le: string | null;
  note_interne: string | null;
  origine: "client" | "restaurateur";
  accepte_communications: boolean;
  created_at: string;
};

const STATUT_STYLES: Record<Demande["statut"], string> = {
  demande: "bg-brand-orange-soft text-brand-navy",
  confirmee: "bg-emerald-50 text-emerald-700",
  refusee: "bg-zinc-100 text-zinc-500",
  annulee: "bg-zinc-100 text-zinc-500",
  expiree: "bg-zinc-100 text-zinc-500",
};

const STATUT_LABELS: Record<Demande["statut"], string> = {
  demande: "En attente",
  confirmee: "Confirmée",
  refusee: "Refusée",
  annulee: "Annulée",
  expiree: "Option expirée",
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function delaiRestant(expiration: string | null): string | null {
  if (!expiration) return null;
  const heures = Math.round(
    (new Date(expiration).getTime() - Date.now()) / 3_600_000,
  );
  if (heures <= 0) return "Option expirée";
  if (heures < 24) return `Option : ${heures} h restantes`;
  return `Option : ${Math.round(heures / 24)} j restants`;
}

function Ligne({
  demande,
  restaurantId,
  espace,
  service,
}: {
  demande: Demande;
  restaurantId: string;
  espace: Espace | undefined;
  service: Service | undefined;
}) {
  const restant = delaiRestant(demande.option_expire_le);
  // Une option échue reste décidable : le restaurateur rappelle le client
  // plutôt que de le perdre, et l'acceptation revérifie la disponibilité.
  const enCours =
    demande.statut === "demande" || demande.statut === "expiree";

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-medium text-zinc-900">
            {demande.client_nom}
            <span className="ml-2 font-normal text-zinc-500">
              {demande.couverts} couvert{demande.couverts > 1 ? "s" : ""}
            </span>
          </span>
          <span className="text-sm text-zinc-500 first-letter:capitalize">
            {formatDate(demande.date_reservation)}
            {service && ` · ${service.nom} ${formatHeure(service.heure_debut)}`}
            {espace && ` · ${espace.nom}`}
            {demande.type === "privatisation" && " · privatisation"}
            {demande.origine === "restaurateur" && " · prise au téléphone"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUT_STYLES[demande.statut]}`}
          >
            {STATUT_LABELS[demande.statut]}
          </span>
          {enCours && restant && (
            <span className="text-xs text-zinc-400">{restant}</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600">
        <a
          href={`mailto:${demande.client_email}`}
          className="text-brand-orange hover:underline"
        >
          {demande.client_email}
        </a>
        {demande.client_telephone && (
          <a
            href={`tel:${demande.client_telephone}`}
            className="hover:underline"
          >
            {demande.client_telephone}
          </a>
        )}
        {demande.occasion && <span>{demande.occasion}</span>}
        {demande.accepte_communications && (
          <span className="text-emerald-700">
            Accepte d&apos;être recontacté
          </span>
        )}
      </div>

      {demande.message && (
        <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {demande.message}
        </p>
      )}

      {enCours ? (
        <DecisionDemande
          reservationId={demande.id}
          restaurantId={restaurantId}
        />
      ) : (
        demande.statut === "confirmee" && (
          <form action={annulerReservation} className="w-fit">
            <input type="hidden" name="reservation_id" value={demande.id} />
            <input type="hidden" name="restaurant_id" value={restaurantId} />
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Annuler cette réservation
            </button>
          </form>
        )
      )}

      <form
        action={enregistrerNote}
        className="flex flex-wrap items-end gap-3 border-t border-zinc-100 pt-4"
      >
        <input type="hidden" name="reservation_id" value={demande.id} />
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <label
          className="flex min-w-60 flex-1 flex-col gap-1 text-sm font-medium text-zinc-700"
          htmlFor={`note-${demande.id}`}
        >
          Note interne{" "}
          <span className="font-normal text-zinc-400">
            (jamais visible du client)
          </span>
          <input
            id={`note-${demande.id}`}
            name="note_interne"
            defaultValue={demande.note_interne ?? ""}
            placeholder="Allergie aux fruits de mer, arrive à 19h30…"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          Enregistrer
        </button>
      </form>
    </li>
  );
}

export default async function ReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mois?: string; jour?: string; jours?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const [restaurantResult, espacesResult, servicesResult, reservationsResult] =
    await Promise.all([
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase.from("restaurant_espaces").select("*").eq("restaurant_id", id),
      supabase.from("restaurant_services").select("*").eq("restaurant_id", id),
      supabase
        .from("restaurant_reservations")
        .select("*")
        .eq("restaurant_id", id)
        .order("date_reservation"),
    ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const reservations = (reservationsResult.data ?? []) as Demande[];

  const parEspace = new Map(espaces.map((espace) => [espace.id, espace]));
  const parService = new Map(services.map((service) => [service.id, service]));

  const mois =
    query.mois && /^\d{4}-\d{2}$/.test(query.mois)
      ? query.mois
      : (query.jour ?? new Date().toISOString().slice(0, 10)).slice(0, 7);
  const jour =
    query.jour && /^\d{4}-\d{2}-\d{2}$/.test(query.jour) ? query.jour : null;

  // Périodes proposées par le sélecteur ; toute autre valeur retombe sur 30
  // jours plutôt que d'inventer une fenêtre que personne n'a demandée.
  const jours = [30, 90, 365].includes(Number(query.jours))
    ? Number(query.jours)
    : 30;
  const bornes = periode(jours);
  const stats = computeStatistiques(
    reservations as LigneStat[],
    bornes.depuis,
    bornes.jusqua,
  );
  const lienPeriode = (option: number) => {
    const params = new URLSearchParams();
    if (query.mois) params.set("mois", mois);
    if (jour) params.set("jour", jour);
    params.set("jours", String(option));
    return `/dashboard/${id}/reservations?${params}#statistiques`;
  };

  const charges = new Map<string, JourCharge>();
  for (const reservation of reservations) {
    if (reservation.statut === "refusee" || reservation.statut === "annulee") {
      continue;
    }
    const charge = charges.get(reservation.date_reservation) ?? {
      date: reservation.date_reservation,
      demandes: 0,
      confirmees: 0,
    };
    if (reservation.statut === "confirmee") charge.confirmees += 1;
    else charge.demandes += 1;
    charges.set(reservation.date_reservation, charge);
  }

  const aujourdhui = new Date().toISOString().slice(0, 10);
  // À traiter : ce sur quoi le restaurateur doit se prononcer, les créneaux
  // passés exclus — les trancher n'aurait plus d'objet.
  const aTraiter = reservations.filter(
    (reservation) =>
      reservation.statut === "demande" &&
      reservation.date_reservation >= aujourdhui,
  );
  const duJour = jour
    ? reservations.filter(
        (reservation) => reservation.date_reservation === jour,
      )
    : [];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.reservations}
        title={`Réservations — ${restaurant.nom}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-zinc-500">
          Les demandes arrivent ici. Tant qu&apos;elles ne sont pas tranchées,
          elles bloquent le créneau — jusqu&apos;à l&apos;expiration de leur
          option.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/${id}/service`}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Écran de service
          </Link>
          <Link
            href={`/dashboard/${id}/reservations/configuration`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Espaces, services et page publique
          </Link>
        </div>
      </div>

      <SaisieReservation
        restaurantId={id}
        espaces={espaces}
        services={services}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-zinc-900">
          À traiter
          {aTraiter.length > 0 && (
            <span className="ml-2 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
              {aTraiter.length}
            </span>
          )}
        </h2>

        {aTraiter.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            Aucune demande en attente.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {aTraiter.map((demande) => (
              <Ligne
                key={demande.id}
                demande={demande}
                restaurantId={id}
                espace={parEspace.get(demande.espace_id)}
                service={
                  demande.service_id
                    ? parService.get(demande.service_id)
                    : undefined
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900">Calendrier</h2>
          <CalendrierMois
            mois={mois}
            jourSelectionne={jour}
            charges={[...charges.values()]}
            lienBase={`/dashboard/${id}/reservations`}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900 first-letter:capitalize">
            {jour ? formatDate(jour) : "Choisis un jour"}
          </h2>

          {!jour ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              Clique sur une date du calendrier pour voir ce qui est prévu ce
              jour-là.
            </p>
          ) : duJour.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              Rien de prévu ce jour-là.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {duJour.map((demande) => (
                <Ligne
                  key={demande.id}
                  demande={demande}
                  restaurantId={id}
                  espace={parEspace.get(demande.espace_id)}
                  service={
                    demande.service_id
                      ? parService.get(demande.service_id)
                      : undefined
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      <Statistiques
        stats={stats}
        espaces={espaces}
        jours={jours}
        lienPeriode={lienPeriode}
      />
    </div>
  );
}
