import type { Metadata } from "next";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { RESERVATIONS } from "@/lib/i18n/reservations";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EditeurDevis } from "@/components/devis/EditeurDevis";
import { FeuilleDevis } from "@/components/devis/FeuilleDevis";
import { BoutonImprimer } from "@/components/devis/BoutonImprimer";
import { LienAcompte } from "@/components/reservations/LienAcompte";
import { BoutonAction } from "@/components/reservations/BoutonAction";
import {
  constaterAcompteHorsLigne,
  leverCaution,
  relancerPaiement,
} from "@/app/dashboard/[id]/reservations/actions";
import { libelleAcompte, type StatutAcompte } from "@/lib/reservations/acompte";
import { libelleCaution, type StatutCaution } from "@/lib/reservations/caution";
import { exiger } from "@/lib/equipe/roles";
import {
  LIBELLE_STATUT,
  formatEuros,
  type StatutDevis,
} from "@/lib/devis/calcul";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Devis",
  robots: { index: false, follow: false },
};

type DevisLigne = {
  libelle: string;
  quantite: number;
  prix_unitaire_centimes: number;
  tva_taux: number;
};

/** Une prestation du catalogue, telle qu'on la repropose. */
type Prestation = {
  id: string;
  libelle: string;
  prix_unitaire_centimes: number;
  tva_taux: number;
};

type Devis = {
  id: string;
  numero: string;
  jeton: string;
  statut: StatutDevis;
  message: string | null;
  tva_taux: number;
  acompte_centimes: number | null;
  valide_jusquau: string;
  envoye_le: string | null;
  accepte_le: string | null;
  refuse_le: string | null;
  refus_motif: string | null;
  mentions: string | null;
};

type Reservation = {
  id: string;
  restaurant_id: string;
  client_nom: string | null;
  client_email: string | null;
  /** L'état du règlement, pour proposer le lien là où on compose le devis. */
  acompte_statut: StatutAcompte;
  acompte_hors_ligne?: boolean;
  acompte_centimes: number | null;
  caution_statut: StatutCaution;
  caution_centimes: number | null;
  caution_debitee_centimes: number | null;
  paiement_token: string | null;
  derniere_relance_le: string | null;
  couverts: number;
  date_reservation: string;
  type: string;
};

function Facture() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </svg>
  );
}

export default async function DevisPage({
  params,
}: {
  params: Promise<{ id: string; reservationId: string }>;
}) {
  const { id, reservationId } = await params;
  // Le dictionnaire du carnet : ces composants sont les siens.
  const langue = await langueUtilisateur();
  const r = RESERVATIONS[langue];
  await exiger(id, "gerant");

  const supabase = await createClient();
  const [resaResult, devisResult] = await Promise.all([
    supabase
      .from("restaurant_reservations")
      .select(
        "id, restaurant_id, client_nom, client_email, couverts, date_reservation, type, acompte_statut, acompte_hors_ligne, acompte_centimes, caution_statut, caution_centimes, caution_debitee_centimes, paiement_token, derniere_relance_le",
      )
      .eq("id", reservationId)
      .maybeSingle(),
    supabase
      .from("devis")
      .select("*")
      .eq("reservation_id", reservationId)
      .maybeSingle(),
  ]);

  const reservation = resaResult.data as Reservation | null;
  const devis = devisResult.data as Devis | null;
  // Le devis se crée depuis le carnet : arriver ici sans lui, c'est une
  // adresse tapée à la main ou un devis supprimé.
  if (!reservation || reservation.restaurant_id !== id || !devis) notFound();

  const { data: lignesData } = await supabase
    .from("devis_lignes")
    .select("libelle, quantite, prix_unitaire_centimes, tva_taux")
    .eq("devis_id", devis.id)
    .order("ordre");
  const lignes = (lignesData ?? []) as DevisLigne[];

  // Le catalogue et le pied de devis appartiennent à la maison : ils
  // servent ce devis-ci comme tous les suivants.
  const [prestationsResult, maisonResult] = await Promise.all([
    supabase
      .from("devis_prestations")
      .select("id, libelle, prix_unitaire_centimes, tva_taux")
      .eq("restaurant_id", id)
      .order("derniere_utilisation", { ascending: false, nullsFirst: false })
      .limit(24),
    supabase
      .from("restaurants")
      .select(
        "nom, adresse, telephone, logo_url, mentions_legales, devis_mentions",
      )
      .eq("id", id)
      .maybeSingle(),
  ]);
  // Une colonne absente refuse toute la requête et ressemble à un
  // catalogue vide : on veut savoir lequel des deux c'est.
  if (prestationsResult.error) {
    console.error("[devis/catalogue]", prestationsResult.error.message);
  }
  const prestations = (prestationsResult.data ?? []) as Prestation[];
  const maison = maisonResult.data as {
    nom: string;
    adresse: string | null;
    telephone: string | null;
    logo_url: string | null;
    mentions_legales: string | null;
    devis_mentions: string | null;
  } | null;

  // Tant que la maison n'a rien écrit de propre au devis, on reprend les
  // mentions de la page de réservation : mieux vaut un pied imparfait
  // qu'un document contractuel sans aucune mention.
  const mentions = maison?.devis_mentions ?? maison?.mentions_legales ?? "";

  const lien = `${siteUrl()}/devis/${devis.jeton}`;

  // Un règlement attendu du client : acompte non payé, ou empreinte non
  // encore déposée. Le reste — réglé, libéré, non requis — n'appelle
  // aucun lien.
  const attendLeClient =
    reservation.acompte_statut === "attendu" ||
    reservation.caution_statut === "attendue";
  const libelleReglement =
    libelleAcompte(
      reservation.acompte_statut,
      reservation.acompte_centimes,
      reservation.acompte_hors_ligne,
    ) ??
    libelleCaution(
      reservation.caution_statut,
      reservation.caution_centimes,
      reservation.caution_debitee_centimes,
    );
  const fige = devis.statut === "accepte";

  return (
    <div className="flex w-full flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={<Facture />}
        title={`Devis ${devis.numero}`}
        backHref={`/dashboard/${id}/reservations`}
      />

      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[15px] font-semibold text-ink">
            {reservation.client_nom ?? "Client"} — {reservation.couverts}{" "}
            couvert
            {reservation.couverts > 1 ? "s" : ""} le{" "}
            {new Date(
              `${reservation.date_reservation}T12:00:00`,
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              devis.statut === "accepte"
                ? "bg-green-50 text-green-700"
                : devis.statut === "refuse"
                  ? "bg-zinc-100 text-ink-soft"
                  : devis.statut === "envoye"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-brand-sand text-ink-soft"
            }`}
          >
            {LIBELLE_STATUT[devis.statut]}
          </span>
        </div>

        <p className="text-sm text-ink-soft">
          {reservation.client_email ?? "Aucune adresse e-mail"}
        </p>

        {devis.statut === "accepte" && devis.accepte_le && (
          <p className="text-sm text-emerald-700">
            Accepté le{" "}
            {new Date(devis.accepte_le).toLocaleString("fr-FR", {
              day: "2-digit",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {devis.acompte_centimes
              ? ` — acompte de ${formatEuros(devis.acompte_centimes)} réclamé.`
              : "."}
          </p>
        )}
        {devis.statut === "refuse" && (
          <p className="text-sm text-ink-soft">
            Refusé{devis.refus_motif ? ` : « ${devis.refus_motif} »` : "."}
          </p>
        )}

        {/* Le lien se copie : un client sans adresse e-mail, ou qui préfère
            WhatsApp, reste joignable par le canal du restaurateur. */}
        {devis.statut !== "brouillon" && (
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
              Lien du devis
            </span>
            <LienAcompte lien={lien} langue={langue} />
          </div>
        )}
      </div>

      {/* Le règlement, là où le devis se compose.
          Le lien existait déjà, mais seulement sur la carte du carnet —
          or c'est ici qu'on est quand un client rappelle pour dire qu'il
          n'a rien reçu, ou qu'on veut le lui passer par WhatsApp. */}
      {attendLeClient && reservation.paiement_token && (
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-orange-soft p-5">
          <span className="text-sm font-medium text-brand-navy">
            {libelleReglement}
          </span>
          <span className="text-xs text-zinc-600">
            {reservation.caution_statut === "attendue"
              ? r.lienCaution
              : r.lienAcompte}
          </span>
          <LienAcompte
            lien={`${siteUrl()}/paiement/${reservation.paiement_token}`}
            langue={langue}
          />
          <div className="flex flex-wrap items-center gap-3">
            <BoutonAction
              action={relancerPaiement}
              champs={{
                reservation_id: reservation.id,
                restaurant_id: id,
              }}
              libelle="Relancer par e-mail"
              enCours="Envoi…"
              className="rounded-md border border-brand-navy/30 bg-white px-3 py-1.5 text-xs font-medium text-brand-navy hover:border-brand-navy"
            />
            {reservation.derniere_relance_le && (
              <span className="text-xs text-zinc-500">
                Relancé le{" "}
                {new Date(reservation.derniere_relance_le).toLocaleDateString(
                  "fr-FR",
                  { day: "numeric", month: "long" },
                )}
              </span>
            )}
            {/* Un virement d'entreprise, des espèces au comptoir : l'argent
                arrive souvent hors de Stripe, et la salle doit être tenue
                quand même. */}
            {reservation.acompte_statut === "attendu" && (
              <BoutonAction
                action={constaterAcompteHorsLigne}
                champs={{
                  reservation_id: reservation.id,
                  restaurant_id: id,
                }}
                libelle="Déjà encaissé (virement, espèces)"
                enCours="Enregistrement…"
                className="text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
              />
            )}
            {reservation.caution_statut === "attendue" && (
              <BoutonAction
                action={leverCaution}
                champs={{
                  reservation_id: reservation.id,
                  restaurant_id: id,
                }}
                libelle="Ne pas demander de caution"
                enCours="Levée…"
                className="text-xs font-medium text-brand-navy underline-offset-2 hover:underline"
              />
            )}
          </div>
        </div>
      )}

      {/* Constaté à la main, donc défaisable à la main. Un acompte réglé
          par carte, lui, se rembourse depuis Stripe. */}
      {reservation.acompte_hors_ligne && (
        <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <span className="font-medium">{libelleReglement}</span>
          <BoutonAction
            action={constaterAcompteHorsLigne}
            champs={{
              reservation_id: reservation.id,
              restaurant_id: id,
              retirer: "1",
            }}
            libelle="Retirer ce constat"
            enCours="Retrait…"
            className="text-xs text-emerald-700 underline-offset-2 hover:underline"
          />
        </p>
      )}

      {fige && (
        <p className="rounded-2xl border border-line bg-brand-orange-soft p-4 text-sm leading-relaxed text-ink">
          Ce devis a été accepté : son contenu est figé. Ce que le client a
          accepté ne doit plus pouvoir changer — établissez-en un nouveau si la
          prestation évolue.
        </p>
      )}

      <EditeurDevis
        devisId={devis.id}
        restaurantId={id}
        lignesInitiales={lignes.map((ligne) => ({
          libelle: ligne.libelle,
          quantite: String(ligne.quantite).replace(/\.00$/, ""),
          prix: (ligne.prix_unitaire_centimes / 100)
            .toFixed(2)
            .replace(".", ","),
          tva: Number(ligne.tva_taux),
        }))}
        tauxParDefaut={Number(devis.tva_taux)}
        prestations={prestations.map((prestation) => ({
          id: prestation.id,
          libelle: prestation.libelle,
          prix: (prestation.prix_unitaire_centimes / 100)
            .toFixed(2)
            .replace(".", ","),
          tva: Number(prestation.tva_taux),
        }))}
        mentionsInitiales={mentions}
        acompteInitial={
          devis.acompte_centimes
            ? (devis.acompte_centimes / 100).toFixed(2).replace(".", ",")
            : ""
        }
        valideJusquauInitial={devis.valide_jusquau}
        messageInitial={devis.message ?? ""}
        couverts={reservation.couverts}
        modifiable={!fige}
      />

      {/* Le document, tel qu'il partira. Il rend ce qui est en base et non
          la saisie en cours : le restaurateur voit donc ce que son client
          verrait s'il ouvrait le lien maintenant — ce qui est justement la
          question qu'on se pose avant d'envoyer. */}
      {lignes.length > 0 && maison && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex flex-col">
              <h2 className="font-serif text-2xl text-ink">Le document</h2>
              <p className="text-sm text-ink-soft">
                Tel que le client le verra, au dernier enregistrement.
              </p>
            </div>
            <BoutonImprimer />
          </div>
          <FeuilleDevis
            numero={devis.numero}
            valideJusquau={devis.valide_jusquau}
            acompteCentimes={devis.acompte_centimes}
            message={devis.message}
            lignes={lignes.map((ligne) => ({
              libelle: ligne.libelle,
              quantite: Number(ligne.quantite),
              prixUnitaireCentimes: ligne.prix_unitaire_centimes,
              tauxTva: Number(ligne.tva_taux),
            }))}
            maison={{
              nom: maison.nom,
              adresse: maison.adresse,
              telephone: maison.telephone,
              logoUrl: maison.logo_url,
              mentionsLegales: devis.mentions ?? mentions ?? null,
            }}
            evenement={{
              clientNom: reservation.client_nom,
              couverts: reservation.couverts,
              date: reservation.date_reservation,
              heure: null,
              espaceNom: null,
            }}
          />
        </section>
      )}

      <Link
        href={`/dashboard/${id}/reservations`}
        className="w-fit text-sm text-ink-soft hover:text-ink print:hidden"
      >
        ← Retour au carnet
      </Link>
    </div>
  );
}
