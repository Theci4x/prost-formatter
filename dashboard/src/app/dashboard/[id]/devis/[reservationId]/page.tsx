import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EditeurDevis } from "@/components/devis/EditeurDevis";
import { LienAcompte } from "@/components/reservations/LienAcompte";
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
};

type Reservation = {
  id: string;
  restaurant_id: string;
  client_nom: string | null;
  client_email: string | null;
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
  await exiger(id, "gerant");

  const supabase = await createClient();
  const [resaResult, devisResult] = await Promise.all([
    supabase
      .from("restaurant_reservations")
      .select(
        "id, restaurant_id, client_nom, client_email, couverts, date_reservation, type",
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
    .select("libelle, quantite, prix_unitaire_centimes")
    .eq("devis_id", devis.id)
    .order("ordre");
  const lignes = (lignesData ?? []) as DevisLigne[];

  const lien = `${siteUrl()}/devis/${devis.jeton}`;
  const fige = devis.statut === "accepte";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={<Facture />}
        title={`Devis ${devis.numero}`}
        backHref={`/dashboard/${id}/reservations`}
      />

      <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[15px] font-semibold text-ink">
            {reservation.client_nom ?? "Client"} —{" "}
            {reservation.couverts} couvert
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
            <LienAcompte lien={lien} />
          </div>
        )}
      </div>

      {fige && (
        <p className="rounded-2xl border border-line bg-brand-orange-soft p-4 text-sm leading-relaxed text-ink">
          Ce devis a été accepté : son contenu est figé. Ce que le client a
          accepté ne doit plus pouvoir changer — établissez-en un nouveau si
          la prestation évolue.
        </p>
      )}

      <EditeurDevis
        devisId={devis.id}
        restaurantId={id}
        lignesInitiales={lignes.map((ligne) => ({
          libelle: ligne.libelle,
          quantite: String(ligne.quantite).replace(/\.00$/, ""),
          prix: (ligne.prix_unitaire_centimes / 100).toFixed(2).replace(".", ","),
        }))}
        tvaInitiale={Number(devis.tva_taux)}
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

      <Link
        href={`/dashboard/${id}/reservations`}
        className="w-fit text-sm text-ink-soft hover:text-ink"
      >
        ← Retour au carnet
      </Link>
    </div>
  );
}
