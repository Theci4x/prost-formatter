import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { AnnulationClient } from "@/components/reservations/AnnulationClient";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { heureLisible } from "@/lib/site/horaires";

// Un lien personnel, envoyé par e-mail : il n'a rien à faire dans un
// moteur de recherche.
export const metadata: Metadata = {
  title: "Annuler ma réservation",
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
    .select("restaurant_id, date_reservation, heure_arrivee, couverts, statut")
    .eq("annulation_token", token)
    .maybeSingle();

  const reservation = data as {
    restaurant_id: string;
    date_reservation: string;
    heure_arrivee: string | null;
    couverts: number;
    statut: string;
  } | null;

  const { data: restaurantData } = reservation
    ? await supabase
        .from("restaurants")
        .select("nom")
        .eq("id", reservation.restaurant_id)
        .maybeSingle()
    : { data: null };
  const nom = (restaurantData as { nom: string } | null)?.nom;

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
        <h1 className="text-xl font-semibold text-zinc-900">
          Annuler ma réservation
        </h1>

        {reservation ? (
          <AnnulationClient token={token} resume={resume} />
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
