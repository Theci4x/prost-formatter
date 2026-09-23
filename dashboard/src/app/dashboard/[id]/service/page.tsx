import Link from "next/link";
import { Compteur } from "@/components/dashboard/Compteur";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { RESERVATIONS } from "@/lib/i18n/reservations";
import { SERVICE } from "@/lib/i18n/service";
import { dateJour } from "@/lib/i18n/dates";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SaisieReservation } from "@/components/reservations/SaisieReservation";
import { DecisionDemande } from "@/components/reservations/DecisionDemande";
import { heureLisible } from "@/lib/site/horaires";
import {
  disponibiliteEspace,
  fermetureApplicable,
  motifFermeture,
  occupeLaJauge,
  serviceOuvertCeJour,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { PlanService } from "@/components/reservations/PlanService";
import { PlacerReservation } from "@/components/reservations/PlacerReservation";
import { LigneService } from "@/components/reservations/LigneService";
import {
  reservationsNonPlacees,
  salleADessiner,
  tablesDeLEspace,
  tablesProposees,
  type ReservationPlacable,
} from "@/lib/reservations/plan";
import type { Repere, TableSalle } from "@/types/plan";
import {
  formatCreneau,
  formatHeure,
  type Espace,
  type Service,
} from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";
import { exigerModule } from "@/lib/abonnement/acces";

type Ligne = Reservation & {
  client_nom: string;
  client_telephone: string | null;
  client_email: string | null;
  message: string | null;
  occasion: string | null;
  note_interne: string | null;
  origine: "client" | "restaurateur";
  table_id: string | null;
  absence_constatee_le: string | null;
};

function decalerJour(date: string, jours: number): string {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

export default async function ServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jour?: string }>;
}) {
  const { id } = await params;
  // Le dictionnaire du carnet : ces composants sont les siens.
  const langue = await langueUtilisateur();
  const r = RESERVATIONS[langue];
  const sv = SERVICE[langue];
  await exigerModule(id, "reservations");
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
    tablesResult,
    reperesResult,
    fermetures,
    roueResult,
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
    supabase.from("restaurant_tables").select("*").eq("restaurant_id", id),
    supabase.from("restaurant_reperes").select("*").eq("restaurant_id", id),
    chargerFermetures(supabase, id, jour),
    supabase
      .from("restaurant_roue")
      .select("active")
      .eq("restaurant_id", id)
      .maybeSingle(),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const lignes = (reservationsResult.data ?? []) as Ligne[];
  const tables = (tablesResult.data ?? []) as TableSalle[];
  const reperes = (reperesResult.data ?? []) as Repere[];
  // Le lien de retrait n'apparaît que si la roue tourne : un bouton qui
  // ne sert à rien en plein service est un bouton de trop.
  const roueActive =
    (roueResult.data as { active: boolean } | null)?.active ?? false;

  const maintenant = new Date();
  const confirmees = lignes.filter((l) => l.statut === "confirmee");
  const enAttente = lignes.filter(
    (l) => l.statut === "demande" || l.statut === "expiree",
  );
  const couvertsAttendus = confirmees.reduce((t, l) => t + l.couverts, 0);
  const servicesDuJour = services.filter((s) => serviceOuvertCeJour(jour, s));
  // Une fermeture posée après coup laisse des convives déjà attendus : le
  // bandeau le dit, et la liste reste affichée pour qu'on sache qui rappeler.
  const fermeture = fermetureApplicable(jour, null, fermetures);
  // Ce qui reste à asseoir sur toute la journée : le compteur n'a de sens
  // que si un plan de salle existe.
  const aPlacerDuJour =
    tables.length > 0
      ? servicesDuJour.reduce(
          (total, service) =>
            total +
            reservationsNonPlacees(
              lignes.filter(
                (l) =>
                  l.service_id === service.id && occupeLaJauge(l, maintenant),
              ) as ReservationPlacable[],
            ).length,
          0,
        )
      : null;
  const lienFeuille = `/dashboard/${id}/service/imprimer?jour=${jour}&auto=1`;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href={`/dashboard/${id}/reservations`}
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              {sv.retourCarnet}
            </Link>
            {/* Le retrait d'un lot se fait ici, pas dans les réglages : le
                serveur est sur cet écran quand le client montre son code. */}
            {roueActive && (
              <Link
                href={`/dashboard/${id}/roue/retirer`}
                className="text-sm font-medium text-brand-orange hover:underline"
              >
                {sv.retirerLot}
              </Link>
            )}
          </span>
          <h1 className="font-serif text-4xl text-ink first-letter:capitalize">
            {dateJour(jour, langue)}
          </h1>
          <p className="text-sm text-zinc-500">{restaurant.nom}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/${id}/service?jour=${decalerJour(jour, -1)}`}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
          >
            {sv.veille}
          </Link>
          <Link
            href={`/dashboard/${id}/service`}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
          >
            {sv.aujourdhui}
          </Link>
          <Link
            href={`/dashboard/${id}/service?jour=${decalerJour(jour, 1)}`}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:border-brand-navy hover:text-brand-navy"
          >
            {sv.lendemain}
          </Link>
          {/* La feuille à imprimer : pour la brigade qui n'a pas l'écran
              sous les yeux, ou pour le classeur du passe. */}
          <Link
            href={lienFeuille}
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <path d="M14 3v5h5" />
              <path d="M12 12v6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
            {sv.exporterPdf}
          </Link>
        </div>
      </div>

      {fermeture && (
        <p className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm font-medium text-amber-900">
          {motifFermeture(fermeture, sv)} {sv.fermeAucuneReservation}
          {confirmees.length > 0 && ` ${sv.fermePrevenir}`}
        </p>
      )}

      {/* Le chiffre que le chef veut en arrivant : combien de couverts. */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          aPlacerDuJour === null ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
        }`}
      >
        <Compteur valeur={couvertsAttendus} libelle={sv.compteurCouverts} />
        <Compteur
          valeur={confirmees.length}
          libelle={sv.compteurReservations(confirmees.length)}
        />
        <Compteur
          valeur={enAttente.length}
          libelle={sv.compteurATrancher}
          accent={enAttente.length > 0}
        />
        {aPlacerDuJour !== null && (
          <Compteur
            valeur={aPlacerDuJour}
            libelle={sv.compteurAPlacer}
            accent={aPlacerDuJour > 0}
          />
        )}
      </div>

      <SaisieReservation
        restaurantId={id}
        espaces={espaces}
        services={services}
        langue={langue}
      />

      <div
        className={`grid items-start gap-8 ${
          enAttente.length > 0 ? "xl:grid-cols-[minmax(0,1fr)_400px]" : ""
        }`}
      >
        {enAttente.length > 0 && (
          <section className="flex flex-col gap-3 xl:sticky xl:top-24 xl:order-2">
            <h2 className="font-serif text-2xl text-ink">{sv.enAttente}</h2>
            <ul className="flex flex-col gap-3">
              {enAttente.map((ligne) => (
                <li
                  key={ligne.id}
                  className="flex flex-col gap-3 rounded-2xl border border-brand-orange/50 bg-brand-orange-soft p-5"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-serif text-xl text-ink">
                      {ligne.client_nom}
                    </span>
                    <span className="text-sm text-zinc-600">
                      {[
                        ligne.heure_arrivee &&
                          heureLisible(ligne.heure_arrivee),
                        r.couverts(ligne.couverts),
                        ligne.type === "privatisation" && r.privatisation,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <DecisionDemande
                    reservationId={ligne.id}
                    restaurantId={id}
                    langue={langue}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex min-w-0 flex-col gap-8 xl:order-1">
          {servicesDuJour.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              {sv.aucunService}
            </p>
          ) : (
            servicesDuJour.map((service) => {
              // Ce qui pèse réellement sur ce service : c'est là-dessus qu'on
              // juge si une table est déjà prise.
              const actifs = lignes.filter(
                (l) =>
                  l.service_id === service.id && occupeLaJauge(l, maintenant),
              ) as ReservationPlacable[];
              const aPlacer = reservationsNonPlacees(actifs);

              return (
                <section key={service.id} className="flex flex-col gap-4">
                  <h2 className="font-serif text-2xl text-ink">
                    {service.nom}{" "}
                    <span className="font-sans text-base font-normal text-zinc-500">
                      {formatCreneau(service.heure_debut, service.heure_fin)}
                    </span>
                    {tables.length > 0 && aPlacer.length > 0 && (
                      <span className="ml-2 rounded-full bg-brand-orange-soft px-2.5 py-0.5 align-middle font-sans text-xs font-medium text-brand-navy">
                        {sv.aPlacerPastille(aPlacer.length)}
                      </span>
                    )}
                  </h2>

                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] gap-4">
                    {espaces.map((espace) => {
                      const dispo = disponibiliteEspace({
                        espace,
                        service,
                        date: jour,
                        couverts: 1,
                        reservations: lignes,
                        fermetures,
                        maintenant,
                        langue,
                      });
                      const duService = confirmees.filter(
                        (l) =>
                          l.espace_id === espace.id &&
                          l.service_id === service.id,
                      );
                      // Une salle qui ne se loue qu'en entier n'a pas de plan :
                      // le groupe qui la privatise la prend toute.
                      const tablesSalle = salleADessiner(espace)
                        ? tablesDeLEspace(tables, espace.id)
                        : [];

                      return (
                        <div
                          key={espace.id}
                          className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-serif text-xl text-ink">
                              {espace.nom}
                            </span>
                            <span className="text-sm tabular-nums text-zinc-600">
                              {sv.couvertsSurCapacite(
                                dispo.occupes,
                                espace.capacite,
                              )}
                            </span>
                          </div>

                          {/* Jauge du créneau : pleine en rouge, pour qu'un coup
                        d'œil suffise en plein service. */}
                          <span className="flex h-2 w-full overflow-hidden rounded-[4px] bg-zinc-100">
                            <span
                              className={`h-2 rounded-[4px] ${
                                dispo.restants === 0
                                  ? "bg-red-500"
                                  : "bg-brand-navy"
                              }`}
                              style={{
                                width: `${Math.min((dispo.occupes / espace.capacite) * 100, 100)}%`,
                              }}
                            />
                          </span>

                          {tablesSalle.length > 0 && (
                            <PlanService
                              sv={sv}
                              tables={tablesSalle}
                              espaceId={espace.id}
                              reservations={actifs}
                              reperes={reperes.filter(
                                (repere) => repere.espace_id === espace.id,
                              )}
                            />
                          )}

                          {duService.length === 0 ? (
                            <p className="text-sm text-zinc-400">
                              {sv.personnePourInstant}
                            </p>
                          ) : (
                            <ul className="flex flex-col divide-y divide-zinc-100">
                              {duService.map((ligne) => (
                                <LigneService
                                  langue={langue}
                                  key={ligne.id}
                                  restaurantId={id}
                                  jour={jour}
                                  detail={{
                                    id: ligne.id,
                                    clientNom: ligne.client_nom,
                                    telephone: ligne.client_telephone,
                                    email: ligne.client_email,
                                    couverts: ligne.couverts,
                                    heure: ligne.heure_arrivee,
                                    occasion: ligne.occasion,
                                    message: ligne.message,
                                    noteInterne: ligne.note_interne,
                                    type: ligne.type,
                                    statut: ligne.statut,
                                    absenceConstatee: Boolean(
                                      ligne.absence_constatee_le,
                                    ),
                                    date: ligne.date_reservation,
                                  }}
                                >
                                  {tablesSalle.length > 0 &&
                                    ligne.type !== "privatisation" && (
                                      <PlacerReservation
                                        langue={langue}
                                        restaurantId={id}
                                        reservationId={ligne.id}
                                        couverts={ligne.couverts}
                                        tableActuelle={
                                          tablesSalle.find(
                                            (table) =>
                                              table.id === ligne.table_id,
                                          ) ?? null
                                        }
                                        tables={tablesProposees({
                                          tables: tablesSalle,
                                          reservation:
                                            ligne as ReservationPlacable,
                                          occupees: actifs,
                                        })}
                                      />
                                    )}
                                </LigneService>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}

          {servicesDuJour.length > 0 && (
            <p className="text-xs text-zinc-400">
              {sv.heuresIndicatives(formatHeure(servicesDuJour[0].heure_debut))}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
