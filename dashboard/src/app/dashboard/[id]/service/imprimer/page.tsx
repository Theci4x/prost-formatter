import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { RESERVATIONS } from "@/lib/i18n/reservations";
import { SERVICE } from "@/lib/i18n/service";
import { dateJour, horodatage } from "@/lib/i18n/dates";
import { createClient } from "@/lib/supabase/server";
import { exigerModule } from "@/lib/abonnement/acces";
import { heureLisible } from "@/lib/site/horaires";
import { serviceOuvertCeJour } from "@/lib/reservations/disponibilite";
import { BoutonImprimer } from "@/components/devis/BoutonImprimer";
import { ImpressionAuto } from "@/components/reservations/ImpressionAuto";
import type { TableSalle } from "@/types/plan";
import { formatCreneau, type Espace, type Service } from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";

/**
 * La feuille de service — à imprimer, ou à enregistrer en PDF.
 *
 * Ce que l'écran de service montre en cartes, la feuille le met à plat :
 * une ligne par table, dans l'ordre d'arrivée, avec ce qu'un serveur
 * doit savoir sans avoir le téléphone en main — le nom, le nombre, la
 * table, le numéro à rappeler et ce que le client a demandé. La case
 * « Arrivé » se coche au stylo.
 *
 * Même choix que pour le devis : pas de bibliothèque de PDF, c'est le
 * dialogue d'impression du navigateur qui l'enregistre.
 */

type Ligne = {
  id: string;
  service_id: string;
  espace_id: string | null;
  table_id: string | null;
  statut: string;
  type: "table" | "privatisation";
  couverts: number;
  heure_arrivee: string | null;
  client_nom: string;
  client_telephone: string | null;
  occasion: string | null;
  message: string | null;
  note_interne: string | null;
  absence_constatee_le: string | null;
};

function parHeure(a: Ligne, b: Ligne): number {
  const ha = a.heure_arrivee ?? "99:99";
  const hb = b.heure_arrivee ?? "99:99";
  return ha === hb
    ? a.client_nom.localeCompare(b.client_nom)
    : ha < hb
      ? -1
      : 1;
}

function jourDemande(jour?: string): string {
  return jour && /^\d{4}-\d{2}-\d{2}$/.test(jour)
    ? jour
    : new Date().toISOString().slice(0, 10);
}

/**
 * Le titre de l'onglet devient le nom proposé pour le PDF : « Feuille de
 * service — mardi 23 septembre » se retrouve dans un dossier, pas
 * « Klarr ».
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ jour?: string }>;
}): Promise<Metadata> {
  const langue = await langueUtilisateur();
  const { jour } = await searchParams;
  return {
    title: `${SERVICE[langue].feuilleTitre} — ${dateJour(jourDemande(jour), langue)}`,
    robots: { index: false },
  };
}

export default async function FeuilleServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ jour?: string; auto?: string }>;
}) {
  const { id } = await params;
  const langue = await langueUtilisateur();
  const r = RESERVATIONS[langue];
  const sv = SERVICE[langue];
  await exigerModule(id, "reservations");
  const query = await searchParams;
  const supabase = await createClient();

  const jour = jourDemande(query.jour);

  const [
    restaurantResult,
    espacesResult,
    servicesResult,
    reservationsResult,
    tablesResult,
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
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const lignes = (reservationsResult.data ?? []) as Ligne[];
  const tables = (tablesResult.data ?? []) as TableSalle[];

  const confirmees = lignes.filter((l) => l.statut === "confirmee");
  const enAttente = lignes.filter((l) => l.statut === "demande").sort(parHeure);
  const couverts = confirmees.reduce((t, l) => t + l.couverts, 0);

  // Les services du jour, plus ceux qui portent une table confirmée sans
  // être ouverts ce jour-là : une réservation ne disparaît pas de la
  // feuille parce qu'on a changé les horaires après coup.
  const servicesAffiches = services.filter(
    (s) =>
      serviceOuvertCeJour(jour, s) ||
      confirmees.some((l) => l.service_id === s.id),
  );
  const nomEspace = new Map(espaces.map((e) => [e.id, e.nom]));
  const nomTable = new Map(tables.map((t) => [t.id, t.nom]));
  const plusieursEspaces = espaces.length > 1;

  const titre = `${sv.feuilleTitre} — ${restaurant.nom}`;

  return (
    <div className="feuille-service flex flex-1 flex-col items-center gap-6 px-4 py-8 sm:px-6 print:block print:p-0">
      {query.auto === "1" && <ImpressionAuto />}

      <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/dashboard/${id}/service?jour=${jour}`}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {sv.retourService}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-500">{sv.astucePdf}</span>
          <BoutonImprimer
            libelle={sv.imprimer}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
          />
        </div>
      </div>

      <article className="flex w-full max-w-5xl flex-col gap-7 rounded-2xl border border-zinc-200/70 bg-white p-6 text-ink shadow-sm sm:p-10 print:max-w-none print:gap-5 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">
              {titre}
            </span>
            <h1 className="font-serif text-4xl leading-tight first-letter:capitalize print:text-3xl">
              {dateJour(jour, langue)}
            </h1>
          </div>
          <div className="flex items-end gap-6 text-right">
            <div className="flex flex-col">
              <span className="font-serif text-4xl leading-none print:text-3xl">
                {couverts}
              </span>
              <span className="text-xs text-zinc-600">
                {sv.compteurCouverts}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-4xl leading-none print:text-3xl">
                {confirmees.length}
              </span>
              <span className="text-xs text-zinc-600">
                {sv.compteurReservations(confirmees.length)}
              </span>
            </div>
          </div>
        </header>

        {servicesAffiches.length === 0 && (
          <p className="text-sm text-zinc-500">{sv.aucunService}</p>
        )}

        {servicesAffiches.map((service) => {
          const duService = confirmees
            .filter((l) => l.service_id === service.id)
            .sort(parHeure);
          const total = duService.reduce((t, l) => t + l.couverts, 0);

          return (
            <section key={service.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2 break-after-avoid">
                <h2 className="font-serif text-2xl">
                  {service.nom}{" "}
                  <span className="font-sans text-sm text-zinc-500">
                    {formatCreneau(service.heure_debut, service.heure_fin)}
                  </span>
                </h2>
                <span className="text-sm font-medium tabular-nums">
                  {sv.totalService(total, duService.length)}
                </span>
              </div>

              {duService.length === 0 ? (
                <p className="border-t border-zinc-200 py-3 text-sm text-zinc-500">
                  {sv.aucuneReservationService}
                </p>
              ) : (
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm print:min-w-0 print:text-[11px]">
                    <thead>
                      <tr className="border-y border-zinc-300 text-xs uppercase tracking-[0.06em] text-zinc-500 print:text-[9px]">
                        <th className="w-[8%] py-2 pr-2 font-semibold">
                          {sv.colArrive}
                        </th>
                        <th className="w-[9%] py-2 pr-3 font-semibold">
                          {sv.colHeure}
                        </th>
                        <th className="w-[19%] py-2 pr-3 font-semibold">
                          {sv.colClient}
                        </th>
                        <th className="w-[8%] py-2 pr-3 text-right font-semibold">
                          {sv.colCouverts}
                        </th>
                        <th className="w-[12%] py-2 pr-3 font-semibold">
                          {sv.colTable}
                        </th>
                        <th className="w-[14%] py-2 pr-3 font-semibold">
                          {sv.colTelephone}
                        </th>
                        <th className="py-2 font-semibold">{sv.colNotes}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duService.map((l) => {
                        const notes = [
                          l.type === "privatisation" && r.privatisation,
                          l.occasion,
                          l.message && `« ${l.message} »`,
                          l.note_interne,
                        ].filter(Boolean) as string[];
                        const place = [
                          plusieursEspaces && l.espace_id
                            ? nomEspace.get(l.espace_id)
                            : null,
                          l.table_id ? nomTable.get(l.table_id) : null,
                        ].filter(Boolean);

                        return (
                          <tr
                            key={l.id}
                            className="break-inside-avoid border-b border-zinc-200 align-top"
                          >
                            <td className="py-2.5 pr-2">
                              <span
                                aria-hidden="true"
                                className="block h-4 w-4 rounded-[3px] border-[1.5px] border-zinc-500"
                              />
                            </td>
                            <td className="py-2.5 pr-3 font-semibold tabular-nums">
                              {l.heure_arrivee
                                ? heureLisible(l.heure_arrivee)
                                : "—"}
                            </td>
                            <td className="py-2.5 pr-3 font-semibold">
                              {l.client_nom}
                              {l.absence_constatee_le && (
                                <span className="ml-2 font-normal text-red-700">
                                  ({sv.absent})
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 pr-3 text-right text-base font-semibold tabular-nums print:text-[12px]">
                              {l.couverts}
                            </td>
                            <td className="py-2.5 pr-3">
                              {place.length > 0 ? place.join(" · ") : "—"}
                            </td>
                            <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums">
                              {l.client_telephone ?? "—"}
                            </td>
                            <td className="py-2.5 text-zinc-700">
                              {notes.length > 0 ? notes.join(" · ") : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}

        {enAttente.length > 0 && (
          <section className="flex flex-col gap-2 break-inside-avoid">
            <h2 className="font-serif text-xl">{sv.demandesNonConfirmees}</h2>
            <ul className="flex flex-col divide-y divide-zinc-200 border-y border-zinc-200 text-sm print:text-[11px]">
              {enAttente.map((l) => (
                <li key={l.id} className="flex flex-wrap gap-x-3 py-2">
                  <span className="w-[9%] min-w-12 tabular-nums">
                    {l.heure_arrivee ? heureLisible(l.heure_arrivee) : "—"}
                  </span>
                  <span className="font-medium">{l.client_nom}</span>
                  <span className="text-zinc-600">
                    {r.couverts(l.couverts)}
                  </span>
                  {l.client_telephone && (
                    <span className="tabular-nums text-zinc-600">
                      {l.client_telephone}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="flex flex-wrap justify-between gap-2 border-t border-zinc-200 pt-3 text-xs text-zinc-500">
          <span>{sv.editeeLe(horodatage(new Date(), langue))}</span>
          <span>Klarr</span>
        </footer>
      </article>
    </div>
  );
}
