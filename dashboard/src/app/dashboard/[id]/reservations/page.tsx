import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { DecisionDemande } from "@/components/reservations/DecisionDemande";
import { aTrancher, attendLaGarantie } from "@/lib/reservations/garantie";
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
import { LienAcompte } from "@/components/reservations/LienAcompte";
import { GestionCaution } from "@/components/reservations/GestionCaution";
import { libelleAcompte } from "@/lib/reservations/acompte";
import { libelleCaution } from "@/lib/reservations/caution";
import { absencesDuClient, libelleAbsences } from "@/lib/reservations/absence";
import { siteUrl } from "@/lib/site-url";
import { annulerReservation, constaterAbsence } from "./actions";
import { BoutonAction } from "@/components/reservations/BoutonAction";
import { NoteInterne } from "@/components/reservations/NoteInterne";
import { formatHeure, type Espace, type Service } from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";
import { exigerModule } from "@/lib/abonnement/acces";

type Demande = {
  id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  heure_arrivee: string | null;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  /** « client » quand c'est lui qui a rendu la table, « restaurant » sinon. */
  annulee_par: string | null;
  /** Renseignée quand la table est restée vide. */
  absence_constatee_le: string | null;
  client_nom: string;
  client_email: string;
  client_telephone: string | null;
  occasion: string | null;
  message: string | null;
  option_expire_le: string | null;
  acompte_centimes: number | null;
  acompte_statut: "non_requis" | "attendu" | "paye" | "rembourse";
  caution_centimes: number | null;
  caution_statut:
    | "non_requise"
    | "attendue"
    | "enregistree"
    | "debitee"
    | "liberee";
  caution_debitee_centimes: number | null;
  paiement_token: string | null;
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
  site,
  absencesPassees = 0,
  constatable = false,
}: {
  demande: Demande;
  restaurantId: string;
  espace: Espace | undefined;
  service: Service | undefined;
  site: string;
  /** Absences déjà constatées pour ce client, celle-ci exceptée. */
  absencesPassees?: number;
  /** Le service a eu lieu : on peut dire si la table est restée vide. */
  constatable?: boolean;
}) {
  const restant = delaiRestant(demande.option_expire_le);
  // Une option échue reste décidable : le restaurateur rappelle le client
  // plutôt que de le perdre, et l'acceptation revérifie la disponibilité.
  const enCours = aTrancher(demande);
  // Acceptée, mais la salle n'est tenue que par une option : c'est l'argent
  // qui l'engagera.
  const enAttente = attendLaGarantie(demande);

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-medium text-zinc-900">
            {demande.client_nom}
            <span className="ml-2 font-normal text-zinc-500">
              {demande.couverts} couvert{demande.couverts > 1 ? "s" : ""}
            </span>
            {/* L'historique se lit à côté du nom, au moment où le
                restaurateur décide. Placé ailleurs, il arriverait après
                la décision — donc trop tard pour servir à quelque
                chose. */}
            {libelleAbsences(absencesPassees) && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                {libelleAbsences(absencesPassees)}
              </span>
            )}
          </span>
          <span className="text-sm text-zinc-500 first-letter:capitalize">
            {formatDate(demande.date_reservation)}
            {/* L'heure de la table, pas celle du service : c'est ce que
                le restaurateur cherche quand il parcourt sa journée. Les
                réservations antérieures aux créneaux n'en ont pas, on
                retombe alors sur l'ouverture. */}
            {service &&
              ` · ${service.nom} ${formatHeure(
                demande.heure_arrivee ?? service.heure_debut,
              )}`}
            {espace && ` · ${espace.nom}`}
            {demande.type === "privatisation" && " · privatisation"}
            {demande.origine === "restaurateur" && " · prise au téléphone"}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUT_STYLES[demande.statut]}`}
          >
            {/* Une table rendue par le client et une table qu'on a
                refusée soi-même n'ont pas le même sens : la première se
                revend, et il faut le voir sans ouvrir la fiche. */}
            {demande.statut === "annulee" && demande.annulee_par === "client"
              ? "Annulée par le client"
              : STATUT_LABELS[demande.statut]}
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

      {/* Le constat d'absence n'apparaît qu'une fois le service passé :
          proposé la veille, il ne voudrait rien dire. */}
      {(constatable || demande.absence_constatee_le) && (
        <div className="flex flex-wrap items-center gap-3">
          {demande.absence_constatee_le && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
              Table restée vide
            </span>
          )}
          <BoutonAction
            action={constaterAbsence}
            champs={{
              reservation_id: demande.id,
              restaurant_id: restaurantId,
              retirer: demande.absence_constatee_le ? "1" : "0",
            }}
            libelle={
              demande.absence_constatee_le
                ? "Retirer ce constat"
                : "Ils ne sont pas venus"
            }
            enCours="Enregistrement…"
            className={
              demande.absence_constatee_le
                ? "text-xs text-zinc-500 hover:text-zinc-900"
                : "text-xs font-medium text-zinc-500 hover:text-amber-800"
            }
          />
        </div>
      )}

      {(() => {
        const libelle =
          libelleAcompte(demande.acompte_statut, demande.acompte_centimes) ??
          libelleCaution(
            demande.caution_statut,
            demande.caution_centimes,
            demande.caution_debitee_centimes,
          );
        if (!libelle) return null;
        // « Réglé » au sens large : plus rien n'est attendu du client.
        const paye =
          demande.acompte_statut === "paye" ||
          ["enregistree", "debitee", "liberee"].includes(
            demande.caution_statut,
          );
        const attendLeClient =
          demande.acompte_statut === "attendu" ||
          demande.caution_statut === "attendue";
        return (
          <div
            className={`flex flex-col gap-2 rounded-xl p-4 ${
              paye ? "bg-emerald-50" : "bg-brand-orange-soft"
            }`}
          >
            <span
              className={`text-sm font-medium ${
                paye ? "text-emerald-700" : "text-brand-navy"
              }`}
            >
              {libelle}
            </span>
            {enAttente && (
              <span className="text-xs font-medium text-brand-navy">
                Acceptée — la salle est tenue{restant ? ` ${restant}` : ""}, et
                ne sera ferme qu&apos;une fois la carte enregistrée.
              </span>
            )}
            {attendLeClient && demande.paiement_token && (
              <>
                <span className="text-xs text-zinc-600">
                  {demande.caution_statut === "attendue"
                    ? "Envoie ce lien à ton client : il enregistrera sa carte, rien ne sera prélevé."
                    : "Envoie ce lien à ton client : il paiera sur ton compte Stripe, sans commission."}
                </span>
                <LienAcompte
                  lien={`${site}/paiement/${demande.paiement_token}`}
                />
              </>
            )}

            {demande.caution_statut === "enregistree" &&
              demande.caution_centimes && (
                <GestionCaution
                  reservationId={demande.id}
                  restaurantId={restaurantId}
                  plafond={demande.caution_centimes}
                />
              )}
          </div>
        );
      })()}

      {enCours ? (
        <DecisionDemande
          reservationId={demande.id}
          restaurantId={restaurantId}
        />
      ) : (
        demande.statut === "confirmee" && (
          <BoutonAction
            action={annulerReservation}
            champs={{
              reservation_id: demande.id,
              restaurant_id: restaurantId,
            }}
            libelle="Annuler cette réservation"
            enCours="Annulation…"
            className="w-fit text-sm font-medium text-red-600 hover:text-red-800"
          />
        )
      )}

      <NoteInterne
        reservationId={demande.id}
        restaurantId={restaurantId}
        note={demande.note_interne ?? null}
      />
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
  await exigerModule(id, "reservations");
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

  const site = siteUrl();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  // À traiter : ce sur quoi le restaurateur doit se prononcer, les créneaux
  // passés exclus — les trancher n'aurait plus d'objet.
  const aTraiter = reservations.filter(
    (reservation) =>
      // Une privatisation acceptée mais pas encore garantie reste au statut
      // « demande » : elle ne doit pas réapparaître comme à trancher.
      aTrancher(reservation) &&
      reservation.statut !== "expiree" &&
      reservation.date_reservation >= aujourdhui,
  );
  // Une privatisation acceptée quitte « à traiter » : sans cette liste, le
  // restaurateur n'aurait plus aucun endroit où retrouver le lien de paiement
  // qu'il doit envoyer, sinon en devinant la date dans le calendrier.
  // Toutes les réservations à venir qui portent une garantie, quel que soit
  // son état. Les faire disparaître une fois réglées priverait le
  // restaurateur de la seule confirmation qu'il obtient après avoir débité la
  // carte de quelqu'un — et l'acompte encaissé mérite d'être vu, lui aussi.
  const garanties = reservations.filter(
    (reservation) =>
      (reservation.acompte_statut !== "non_requis" ||
        reservation.caution_statut !== "non_requise") &&
      // Les réservations en attente de garantie entrent ici aussi : c'est là
      // que le restaurateur retrouve le lien de paiement à renvoyer, et
      // qu'il voit combien de temps il tient encore sa salle.
      (reservation.statut === "confirmee" || attendLaGarantie(reservation)) &&
      reservation.date_reservation >= aujourdhui,
  );
  const garantiesARegler = garanties.filter(
    (reservation) =>
      reservation.acompte_statut === "attendu" ||
      reservation.caution_statut === "attendue" ||
      // Une carte enregistrée reste à trancher tant que le service n'a pas eu
      // lieu : débiter ou libérer.
      reservation.caution_statut === "enregistree",
  ).length;
  const duJour = jour
    ? reservations.filter(
        (reservation) => reservation.date_reservation === jour,
      )
    : [];
  // Un service passé se constate ; un service à venir, non. La date du
  // jour suffit : inutile d'attendre minuit pour saisir un service du
  // soir qu'on vient de terminer.
  const journeePassee = Boolean(jour && jour <= aujourdhui);

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
            href={`/dashboard/${id}/reservations/plan`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Plan de salle
          </Link>
          <Link
            href={`/dashboard/${id}/experiences`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            Expériences
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
                site={site}
                espace={parEspace.get(demande.espace_id)}
                service={
                  demande.service_id
                    ? parService.get(demande.service_id)
                    : undefined
                }
                absencesPassees={absencesDuClient(
                  demande.client_email,
                  demande.id,
                  reservations,
                )}
              />
            ))}
          </ul>
        )}
      </section>

      {garanties.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-zinc-900">
              Acomptes et cautions
              {garantiesARegler > 0 && (
                <span className="ml-2 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                  {garantiesARegler}
                </span>
              )}
            </h2>
            <p className="text-sm text-zinc-500">
              Les réservations à venir qui engagent de l&apos;argent, et où
              elles en sont. Elles quittent cette liste une fois le service
              passé.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {garanties.map((demande) => (
              <Ligne
                key={demande.id}
                demande={demande}
                restaurantId={id}
                site={site}
                espace={parEspace.get(demande.espace_id)}
                service={
                  demande.service_id
                    ? parService.get(demande.service_id)
                    : undefined
                }
                absencesPassees={absencesDuClient(
                  demande.client_email,
                  demande.id,
                  reservations,
                )}
              />
            ))}
          </ul>
        </section>
      )}

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
                  site={site}
                  espace={parEspace.get(demande.espace_id)}
                  service={
                    demande.service_id
                      ? parService.get(demande.service_id)
                      : undefined
                  }
                  absencesPassees={absencesDuClient(
                    demande.client_email,
                    demande.id,
                    reservations,
                  )}
                  constatable={
                    journeePassee && demande.statut === "confirmee"
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
