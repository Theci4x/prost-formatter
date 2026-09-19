import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { AnnulationClient } from "@/components/reservations/AnnulationClient";
import { ModificationClient } from "@/components/reservations/ModificationClient";
import { heuresDArrivee } from "@/lib/reservations/disponibilite";
import { peutModifier } from "@/lib/reservations/modification";
import type { Service } from "@/types/reservation";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { heureLisible } from "@/lib/site/horaires";

// Un lien personnel, envoyé par e-mail : il n'a rien à faire dans un
// moteur de recherche.
export const metadata: Metadata = {
  title: "Ma réservation",
  robots: { index: false, follow: false },
};

function dateLisible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function AnnulerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Lecture avec la clé de service : le client n'a pas de compte, le
  // jeton est ce qui l'autorise. On ne lit que de quoi lui rappeler ce
  // qu'il s'apprête à annuler.
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, acompte_statut, caution_statut",
    )
    .eq("annulation_token", token)
    .maybeSingle();

  const reservation = data as {
    id: string;
    restaurant_id: string;
    service_id: string | null;
    date_reservation: string;
    heure_arrivee: string | null;
    couverts: number;
    type: "table" | "privatisation";
    statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
    acompte_statut: string | null;
    caution_statut: string | null;
  } | null;

  const { data: restaurantData } = reservation
    ? await supabase
        .from("restaurants")
        .select("nom")
        .eq("id", reservation.restaurant_id)
        .maybeSingle()
    : { data: null };
  const nom = (restaurantData as { nom: string } | null)?.nom;

  // De quoi proposer un changement : les heures du service, et le droit
  // de le faire. Un devis accepté ou un acompte réglé ferment la porte —
  // c'est un prix convenu, il se renégocie de vive voix.
  const { data: serviceData } =
    reservation?.service_id
      ? await supabase
          .from("restaurant_services")
          .select("*")
          .eq("id", reservation.service_id)
          .maybeSingle()
      : { data: null };
  const service = serviceData as Service | null;

  const { data: devisData } = reservation
    ? await supabase
        .from("devis")
        .select("statut")
        .eq("reservation_id", reservation.id)
        .maybeSingle()
    : { data: null };
  const devisAccepte =
    (devisData as { statut: string } | null)?.statut === "accepte";

  const modifiable =
    reservation && service
      ? peutModifier(reservation, service, devisAccepte, new Date()).possible
      : false;
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const resume = reservation
    ? `${nom ?? "L'établissement"} — ${dateLisible(reservation.date_reservation)}` +
      (reservation.heure_arrivee
        ? ` à ${heureLisible(reservation.heure_arrivee.slice(0, 5))}`
        : "") +
      `, ${reservation.couverts} couvert${reservation.couverts > 1 ? "s" : ""}.`
    : "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-cream px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-3xl text-ink">Ma réservation</h1>

        {reservation ? (
          <>
            {/* Changer plutôt qu'annuler : c'est presque toujours ce que
                le client veut vraiment quand il ouvre ce lien une semaine
                avant. Proposé d'abord, l'annulation reste en dessous. */}
            {/* Le rappel de ce qui est réservé, une seule fois et en
                tête : les deux gestes qui suivent portent dessus. */}
            <p className="text-sm leading-relaxed text-zinc-600">{resume}</p>

            {modifiable && service && (
              <ModificationClient
                token={token}
                date={reservation.date_reservation}
                heure={reservation.heure_arrivee?.slice(0, 5) ?? null}
                couverts={reservation.couverts}
                heures={heuresDArrivee(service)}
                dateMin={aujourdhui}
              />
            )}
            <AnnulationClient
              token={token}
              resume={resume}
              discret={modifiable}
            />
          </>
        ) : (
          // Le même message pour un lien inventé et pour un lien périmé :
          // rien ne doit permettre de deviner qu'une réservation existe.
          <p className="text-sm leading-relaxed text-zinc-600">
            Ce lien n&apos;est plus valide. Si tu dois annuler une
            réservation, contacte directement l&apos;établissement.
          </p>
        )}
      </div>

      <SignatureKlarr texte="Réservations propulsées par" />
    </div>
  );
}
