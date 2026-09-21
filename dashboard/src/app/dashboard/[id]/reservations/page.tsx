import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { DecisionDemande } from "@/components/reservations/DecisionDemande";
import { ouvrirDevis } from "@/app/dashboard/[id]/devis/actions";
import {
  calculer,
  formatEuros,
  LIBELLE_STATUT,
  type StatutDevis,
} from "@/lib/devis/calcul";
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
import {
  annulerReservation,
  constaterAbsence,
  constaterAcompteHorsLigne,
  leverCaution,
  relancerPaiement,
} from "./actions";
import { BoutonAction } from "@/components/reservations/BoutonAction";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { NoteInterne } from "@/components/reservations/NoteInterne";
import { CoordonneesClient } from "@/components/reservations/CoordonneesClient";
import { formatHeure, type Espace, type Service } from "@/types/reservation";
import type { Restaurant } from "@/types/restaurant";
import { exigerModule } from "@/lib/abonnement/acces";
import { langueUtilisateur, type Langue } from "@/lib/i18n/langue";
import { RESERVATIONS, type ClesReservations } from "@/lib/i18n/reservations";
import { dateHeure, dateJour } from "@/lib/i18n/dates";

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
  /** Engagement de consommation, figé à la réservation. */
  minimum_consommation_centimes: number | null;
  minimum_consommation_ht: boolean | null;
  /** Dernière relance envoyée au client pour son paiement. */
  derniere_relance_le: string | null;
  client_nom: string;
  client_email: string;
  client_telephone: string | null;
  occasion: string | null;
  message: string | null;
  option_expire_le: string | null;
  acompte_centimes: number | null;
  acompte_statut: "non_requis" | "attendu" | "paye" | "rembourse";
  /** Constaté par le restaurateur : aucun paiement Stripe ne lui répond. */
  acompte_hors_ligne?: boolean;
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

/**
 * Ce que le carnet doit savoir d'un devis, sans ouvrir sa page.
 *
 * En plein service, la question n'est pas « où en est la rédaction » mais
 * « est-ce que cette salle est vendue, et pour combien ». D'où le total et
 * le statut sur la carte, et rien d'autre.
 */
type DevisResume = {
  numero: string;
  statut: StatutDevis;
  totalTtcCentimes: number;
  acompteCentimes: number | null;
};

const DEVIS_STYLES: Record<StatutDevis, string> = {
  brouillon: "bg-brand-sand text-ink-soft",
  envoye: "bg-blue-50 text-blue-700",
  accepte: "bg-emerald-50 text-emerald-700",
  refuse: "bg-zinc-100 text-zinc-500",
};

const STATUT_STYLES: Record<Demande["statut"], string> = {
  demande: "bg-brand-orange-soft text-brand-navy",
  confirmee: "bg-emerald-50 text-emerald-700",
  refusee: "bg-zinc-100 text-zinc-500",
  annulee: "bg-zinc-100 text-zinc-500",
  expiree: "bg-zinc-100 text-zinc-500",
};

function delaiRestant(
  expiration: string | null,
  r: ClesReservations,
): string | null {
  if (!expiration) return null;
  const heures = Math.round(
    (new Date(expiration).getTime() - Date.now()) / 3_600_000,
  );
  if (heures <= 0) return r.optionExpiree;
  if (heures < 24) return r.optionHeures(heures);
  return r.optionJours(Math.round(heures / 24));
}

function Ligne({
  demande,
  restaurantId,
  espace,
  service,
  site,
  devis,
  absencesPassees = 0,
  constatable = false,
  r,
  langue,
}: {
  demande: Demande;
  restaurantId: string;
  r: ClesReservations;
  langue: Langue;
  espace: Espace | undefined;
  service: Service | undefined;
  site: string;
  /** Le devis de cette demande, s'il en existe un. */
  devis?: DevisResume;
  /** Absences déjà constatées pour ce client, celle-ci exceptée. */
  absencesPassees?: number;
  /** Le service a eu lieu : on peut dire si la table est restée vide. */
  constatable?: boolean;
}) {
  const restant = delaiRestant(demande.option_expire_le, r);
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
              {r.couverts(demande.couverts)}
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
            {dateJour(demande.date_reservation, langue)}
            {/* L'heure de la table, pas celle du service : c'est ce que
                le restaurateur cherche quand il parcourt sa journée. Les
                réservations antérieures aux créneaux n'en ont pas, on
                retombe alors sur l'ouverture. */}
            {service &&
              ` · ${service.nom} ${formatHeure(
                demande.heure_arrivee ?? service.heure_debut,
              )}`}
            {espace && ` · ${espace.nom}`}
            {demande.type === "privatisation" && ` · ${r.privatisation}`}
            {demande.origine === "restaurateur" && ` · ${r.priseAuTelephone}`}
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
              ? r.annuleeParClient
              : r.statuts[demande.statut]}
          </span>
          {enCours && restant && (
            <span className="text-xs text-zinc-400">{restant}</span>
          )}
        </div>
      </div>

      {/* Une adresse fausse rend la réservation muette : la confirmation
          part dans le vide, le devis aussi. Elle se corrige donc là où on
          la lit, sans redemander au client de tout ressaisir. */}
      <div className="flex flex-col gap-2">
        <CoordonneesClient
          reservationId={demande.id}
          restaurantId={restaurantId}
          nom={demande.client_nom}
          email={demande.client_email}
          telephone={demande.client_telephone}
          renvoyable={
            demande.statut === "demande" || demande.statut === "confirmee"
          }
          r={r}
        />
        {(demande.occasion || demande.accepte_communications) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600">
            {demande.occasion && <span>{demande.occasion}</span>}
            {demande.accepte_communications && (
              <span className="text-emerald-700">{r.accepteRecontact}</span>
            )}
          </div>
        )}
      </div>

      {demande.message && (
        <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {demande.message}
        </p>
      )}

      {/* L'engagement pris par le client, tel qu'il l'a lu. C'est ce
          qu'il faudra lui rappeler à table, et il vaut mieux l'avoir
          sous les yeux que dans sa mémoire. */}
      {demande.minimum_consommation_centimes && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {r.minimumConsommation(
            (demande.minimum_consommation_centimes / 100).toLocaleString(
              "fr-FR",
            ),
            demande.minimum_consommation_ht === false ? r.ttc : r.ht,
          )}
        </p>
      )}

      {/* Le constat d'absence n'apparaît qu'une fois le service passé :
          proposé la veille, il ne voudrait rien dire. */}
      {(constatable || demande.absence_constatee_le) && (
        <div className="flex flex-wrap items-center gap-3">
          {demande.absence_constatee_le && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
              {r.tableVide}
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
              demande.absence_constatee_le ? r.retirerConstat : r.pasVenus
            }
            enCours={r.enCours.enregistrement}
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
          libelleAcompte(
            demande.acompte_statut,
            demande.acompte_centimes,
            demande.acompte_hors_ligne,
          ) ??
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
                {r.salleTenue(restant)}
              </span>
            )}
            {attendLeClient && demande.paiement_token && (
              <>
                <span className="text-xs text-zinc-600">
                  {/* Le lien part tout seul à l'acceptation : ce champ
                      n'est plus le seul moyen de le transmettre, mais il
                      sert encore — par SMS, par WhatsApp, ou quand le
                      client jure n'avoir rien reçu. */}
                  {demande.caution_statut === "attendue"
                    ? r.lienCaution
                    : r.lienAcompte}
                </span>
                <LienAcompte
                  lien={`${site}/paiement/${demande.paiement_token}`}
                  r={r}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <BoutonAction
                    action={relancerPaiement}
                    champs={{
                      reservation_id: demande.id,
                      restaurant_id: restaurantId,
                    }}
                    libelle={r.relancer}
                    enCours={r.enCours.envoi}
                    className="rounded-md border border-brand-navy/30 bg-white px-3 py-1.5 text-xs font-medium text-brand-navy hover:border-brand-navy"
                  />
                  {demande.derniere_relance_le && (
                    <span className="text-xs text-zinc-500">
                      {r.relanceLe(
                        dateHeure(demande.derniere_relance_le, langue),
                      )}
                    </span>
                  )}
                  {/* Tout ne passe pas par Stripe : un virement d'entreprise,
                      des espèces au comptoir. Sans ce bouton, la salle est
                      payée et l'option s'éteint quand même. */}
                  {demande.acompte_statut === "attendu" && (
                    <BoutonAction
                      action={constaterAcompteHorsLigne}
                      champs={{
                        reservation_id: demande.id,
                        restaurant_id: restaurantId,
                      }}
                      libelle={r.dejaEncaisse}
                      enCours={r.enCours.enregistrement}
                      className="text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
                    />
                  )}
                  {/* On ne demande pas d'empreinte à un ami ou à un
                      habitué de dix ans. Lever la caution confirme la
                      table : le restaurateur prend le risque sur lui. */}
                  {demande.caution_statut === "attendue" && (
                    <BoutonAction
                      action={leverCaution}
                      champs={{
                        reservation_id: demande.id,
                        restaurant_id: restaurantId,
                      }}
                      libelle={r.pasDeCaution}
                      enCours={r.enCours.levee}
                      className="text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
                    />
                  )}
                </div>
              </>
            )}

            {/* Ce qu'on a constaté soi-même peut se défaire ; un paiement
                par carte, non — il se rembourse depuis Stripe. */}
            {demande.acompte_hors_ligne && (
              <BoutonAction
                action={constaterAcompteHorsLigne}
                champs={{
                  reservation_id: demande.id,
                  restaurant_id: restaurantId,
                  retirer: "1",
                }}
                libelle={r.retirerConstat}
                enCours={r.enCours.retrait}
                className="w-fit text-xs text-zinc-500 hover:text-zinc-900"
              />
            )}

            {demande.caution_statut === "enregistree" &&
              demande.caution_centimes && (
                <GestionCaution
                  reservationId={demande.id}
                  restaurantId={restaurantId}
                  plafond={demande.caution_centimes}
                  r={r}
                />
              )}
          </div>
        );
      })()}

      {/* Une privatisation se chiffre avant de se trancher : trente
          couverts, un menu, une salle, ça ne se règle pas d'un « Accepter ».

          Et une fois le devis établi, il doit se voir d'ici. Un serveur qui
          ouvre le carnet pendant le service a besoin de savoir que la salle
          est vendue, à quel prix et si le client a répondu — pas d'un bouton
          qui propose d'établir un devis qui existe déjà. */}
      {(demande.type === "privatisation" || devis) &&
        demande.statut !== "annulee" &&
        (devis ? (
          // Le devis existe : ce qu'il vaut et où il en est passent avant
          // le bouton, parce que c'est ce qu'on vient chercher.
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-brand-cream px-4 py-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${DEVIS_STYLES[devis.statut]}`}
            >
              {r.devisStatut(LIBELLE_STATUT[devis.statut].toLowerCase())}
            </span>
            <span className="text-sm text-ink-soft">
              {devis.numero} ·{" "}
              <span className="font-semibold tabular-nums text-ink">
                {formatEuros(devis.totalTtcCentimes)} TTC
              </span>
              {devis.acompteCentimes
                ? r.devisAcompte(formatEuros(devis.acompteCentimes))
                : ""}
            </span>
            <form action={ouvrirDevis} className="ml-auto w-fit">
              <input type="hidden" name="restaurant_id" value={restaurantId} />
              <input type="hidden" name="reservation_id" value={demande.id} />
              <BoutonEnvoi
                libelle={
                  devis.statut === "brouillon"
                    ? r.reprendreBrouillon
                    : r.ouvrirDevis
                }
                enCours={r.enCours.ouverture}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
              />
            </form>
          </div>
        ) : (
          // Rien à montrer encore : un cadre vide autour d'un seul bouton
          // ferait croire qu'il manque quelque chose.
          <form action={ouvrirDevis} className="w-fit">
            <input type="hidden" name="restaurant_id" value={restaurantId} />
            <input type="hidden" name="reservation_id" value={demande.id} />
            <BoutonEnvoi
              libelle={r.etablirDevis}
              enCours={r.enCours.ouverture}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
            />
          </form>
        ))}

      {enCours ? (
        <DecisionDemande
          reservationId={demande.id}
          restaurantId={restaurantId}
          r={r}
        />
      ) : (
        demande.statut === "confirmee" && (
          <BoutonAction
            action={annulerReservation}
            champs={{
              reservation_id: demande.id,
              restaurant_id: restaurantId,
            }}
            libelle={r.annulerReservation}
            enCours={r.enCours.annulation}
            className="w-fit text-sm font-medium text-red-600 hover:text-red-800"
          />
        )
      )}

      <NoteInterne
        reservationId={demande.id}
        restaurantId={restaurantId}
        note={demande.note_interne ?? null}
        r={r}
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
  const langue = await langueUtilisateur();
  const r = RESERVATIONS[langue];
  const query = await searchParams;
  const supabase = await createClient();

  const [
    restaurantResult,
    espacesResult,
    servicesResult,
    reservationsResult,
    devisResult,
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase.from("restaurant_espaces").select("*").eq("restaurant_id", id),
    supabase.from("restaurant_services").select("*").eq("restaurant_id", id),
    supabase
      .from("restaurant_reservations")
      .select("*")
      .eq("restaurant_id", id)
      .order("date_reservation"),
    // Les lignes viennent avec, par la clé étrangère : le total se calcule
    // ici plutôt que de se stocker, pour qu'il ne puisse jamais mentir sur
    // ce que le document affiche.
    supabase
      .from("devis")
      .select(
        "reservation_id, numero, statut, acompte_centimes, devis_lignes(quantite, prix_unitaire_centimes, tva_taux)",
      )
      .eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const espaces = (espacesResult.data ?? []) as Espace[];
  const services = (servicesResult.data ?? []) as Service[];
  const reservations = (reservationsResult.data ?? []) as Demande[];

  // Un devis par demande. Une requête refusée — migration en retard,
  // colonne absente — ne doit pas vider le carnet : on la signale et on
  // continue sans les devis.
  if (devisResult.error)
    console.error("[carnet/devis]", devisResult.error.message);
  const parDevis = new Map<string, DevisResume>(
    (
      (devisResult.data ?? []) as {
        reservation_id: string;
        numero: string;
        statut: StatutDevis;
        acompte_centimes: number | null;
        devis_lignes: {
          quantite: number;
          prix_unitaire_centimes: number;
          tva_taux: number;
        }[];
      }[]
    ).map((devis) => [
      devis.reservation_id,
      {
        numero: devis.numero,
        statut: devis.statut,
        acompteCentimes: devis.acompte_centimes,
        totalTtcCentimes: calculer(
          (devis.devis_lignes ?? []).map((ligne) => ({
            libelle: "",
            quantite: Number(ligne.quantite),
            prixUnitaireCentimes: ligne.prix_unitaire_centimes,
            tauxTva: Number(ligne.tva_taux),
          })),
        ).ttcCentimes,
      },
    ]),
  );

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
        title={r.titre(restaurant.nom)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-zinc-500">{r.chapo}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/${id}/service`}
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            {r.liens.service}
          </Link>
          <Link
            href={`/dashboard/${id}/reservations/plan`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {r.liens.plan}
          </Link>
          <Link
            href={`/dashboard/${id}/experiences`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {r.liens.experiences}
          </Link>
          <Link
            href={`/dashboard/${id}/reservations/configuration`}
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {r.liens.configuration}
          </Link>
        </div>
      </div>

      <SaisieReservation
        restaurantId={id}
        espaces={espaces}
        services={services}
        r={r}
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-zinc-900">
          {r.aTraiter}
          {aTraiter.length > 0 && (
            <span className="ml-2 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
              {aTraiter.length}
            </span>
          )}
        </h2>

        {aTraiter.length === 0 ? (
          <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
            {r.aucuneDemande}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {aTraiter.map((demande) => (
              <Ligne
                key={demande.id}
                demande={demande}
                restaurantId={id}
                r={r}
                langue={langue}
                site={site}
                devis={parDevis.get(demande.id)}
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
              {r.garanties}
              {garantiesARegler > 0 && (
                <span className="ml-2 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                  {garantiesARegler}
                </span>
              )}
            </h2>
            <p className="text-sm text-zinc-500">{r.garantiesChapo}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {garanties.map((demande) => (
              <Ligne
                key={demande.id}
                demande={demande}
                restaurantId={id}
                r={r}
                langue={langue}
                site={site}
                devis={parDevis.get(demande.id)}
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
          <h2 className="text-base font-semibold text-zinc-900">
            {r.calendrier}
          </h2>
          <CalendrierMois
            mois={mois}
            jourSelectionne={jour}
            charges={[...charges.values()]}
            lienBase={`/dashboard/${id}/reservations`}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-zinc-900 first-letter:capitalize">
            {jour ? dateJour(jour, langue) : r.choisirJour}
          </h2>

          {!jour ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              {r.cliquerDate}
            </p>
          ) : duJour.length === 0 ? (
            <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
              {r.rienPrevu}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {duJour.map((demande) => (
                <Ligne
                  key={demande.id}
                  demande={demande}
                  restaurantId={id}
                  r={r}
                  langue={langue}
                  site={site}
                  devis={parDevis.get(demande.id)}
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
                  constatable={journeePassee && demande.statut === "confirmee"}
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
        r={r}
      />
    </div>
  );
}
