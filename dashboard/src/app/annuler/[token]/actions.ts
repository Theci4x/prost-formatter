"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { peutAnnuler } from "@/lib/reservations/annulation";
import { prevenirAnnulationClient } from "@/lib/courriel/reservation";
import type { Contexte } from "@/lib/courriel/messages";
import type { Service } from "@/types/reservation";
import { notifierEtablissement } from "@/lib/push/envoyer";

export type AnnulationState = { error: string | null; fait: boolean };

/**
 * Annule une réservation depuis le lien reçu par e-mail.
 *
 * Écrit avec la clé de service, donc hors RLS : le client n'a pas de
 * compte, c'est le jeton qui l'autorise. Toute la vérification est donc
 * ici, et le jeton n'est jamais recoupé avec autre chose — le connaître
 * suffit, le perdre ne donne accès à rien d'autre qu'à l'annulation
 * d'une table.
 */
export async function annulerParLeClient(
  _prevState: AnnulationState,
  formData: FormData,
): Promise<AnnulationState> {
  const token = ((formData.get("token") as string | null) ?? "").trim();
  if (!token) return { error: "Lien invalide.", fait: false };

  const supabase = createServiceClient();

  const { data } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, client_nom, client_email, acompte_statut, caution_statut",
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
    client_nom: string | null;
    client_email: string | null;
    acompte_statut: string | null;
    caution_statut: string | null;
  } | null;

  // Un jeton inconnu ne dit pas s'il a existé : la même phrase pour un
  // lien inventé et pour un lien périmé.
  if (!reservation) return { error: "Ce lien n'est plus valide.", fait: false };

  const { data: serviceData } = reservation.service_id
    ? await supabase
        .from("restaurant_services")
        .select("*")
        .eq("id", reservation.service_id)
        .maybeSingle()
    : { data: null };
  const service = serviceData as Service | null;

  const verdict = peutAnnuler(reservation, service, new Date());
  if (!verdict.possible) {
    return { error: verdict.motif, fait: verdict.dejaFait };
  }

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({
      statut: "annulee",
      annulee_par: "client",
      // L'option n'a plus lieu d'être : la table est rendue, elle doit
      // redevenir vendable tout de suite.
      option_expire_le: null,
    })
    .eq("id", reservation.id)
    // La condition rejoue la vérification côté base : deux clics
    // simultanés sur le même lien n'annulent qu'une fois.
    .in("statut", ["demande", "confirmee"]);

  if (error) {
    console.error("[annulerParLeClient]", error);
    return { error: "L'annulation a échoué. Réessaie dans un instant.", fait: false };
  }

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("nom, adresse, email_contact")
    .eq("id", reservation.restaurant_id)
    .maybeSingle();
  const restaurant = restaurantData as {
    nom: string;
    adresse: string | null;
    email_contact: string | null;
  } | null;

  if (restaurant) {
    const contexte: Contexte = {
      restaurantNom: restaurant.nom,
      restaurantAdresse: restaurant.adresse,
      clientNom: reservation.client_nom ?? "",
      date: reservation.date_reservation,
      heure: reservation.heure_arrivee?.slice(0, 5) ?? null,
      couverts: reservation.couverts,
      serviceNom: service?.nom ?? null,
      type: reservation.type,
    };
    await Promise.all([
      prevenirAnnulationClient({
        supabase,
        reservationId: reservation.id,
        contexte,
        destinataire: restaurant.email_contact,
      }),
      // Une table rendue à 18 h se revend encore ; découverte le
      // lendemain dans les e-mails, elle est perdue pour rien.
      notifierEtablissement(supabase, reservation.restaurant_id, {
        titre: `Annulation — ${reservation.client_nom ?? "un client"}`,
        corps: `${reservation.couverts} couvert${
          reservation.couverts > 1 ? "s" : ""
        } le ${new Date(
          `${reservation.date_reservation}T12:00:00`,
        ).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}. La table se libère.`,
        chemin: `/dashboard/${reservation.restaurant_id}/reservations`,
        etiquette: `annulation-${reservation.id}`,
      }),
    ]);
  }

  return { error: null, fait: true };
}
