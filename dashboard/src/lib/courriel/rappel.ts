import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import { rappelReservation, type Contexte } from "@/lib/courriel/messages";
import { estLangue } from "@/lib/i18n/langues";
import type { Genre } from "@/lib/courriel/reservation";
import {
  aRappeler,
  jourDuRappel,
  type ReservationRappelable,
} from "@/lib/courriel/rappel-regles";
import { siteUrl } from "@/lib/site-url";

/**
 * Le rappel de la veille.
 *
 * Deuxième levier sur le no-show, après l'annulation en un clic. Un
 * client prévenu se souvient ; et celui qui ne peut plus venir le dit
 * pendant qu'il reste une soirée pour revendre la table.
 *
 * Un seul rappel par réservation : la trace est posée avant l'envoi, et
 * la contrainte d'unicité en base fait le reste — deux exécutions de la
 * tâche la même nuit n'expédient pas deux messages.
 */

export type BilanRappels = {
  concernees: number;
  envoyes: number;
  echoues: number;
  ignorees: number;
};

export async function rappelerLesReservations({
  supabase,
  maintenant,
  plafond = 200,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
  plafond?: number;
}): Promise<BilanRappels> {
  const jour = jourDuRappel(maintenant);
  const vide: BilanRappels = {
    concernees: 0,
    envoyes: 0,
    echoues: 0,
    ignorees: 0,
  };

  const { data, error } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, client_nom, client_email, annulation_token, langue",
    )
    .eq("date_reservation", jour)
    .eq("statut", "confirmee")
    // Une table reprise d'un autre outil a son propre rappel là-bas : deux
    // messages de deux expéditeurs pour un même dîner sèment le doute.
    .neq("origine", "import")
    .limit(plafond);

  if (error) {
    console.error("[rappels] lecture impossible", error.message);
    return vide;
  }

  const reservations = (data ?? []) as ReservationRappelable[];
  if (reservations.length === 0) return vide;

  // Deux requêtes pour tout le lot : un vendredi soir fait facilement
  // cinquante tables, et deux allers-retours par table coûteraient plus
  // cher que les envois eux-mêmes.
  const { data: restaurantsData } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, email_contact")
    .in("id", [...new Set(reservations.map((r) => r.restaurant_id))]);

  const restaurants = new Map(
    (
      (restaurantsData ?? []) as {
        id: string;
        nom: string;
        adresse: string | null;
        email_contact: string | null;
      }[]
    ).map((r) => [r.id, r]),
  );

  const idsServices = [
    ...new Set(
      reservations
        .map((r) => r.service_id)
        .filter((id): id is string => id !== null),
    ),
  ];
  const { data: servicesData } = idsServices.length
    ? await supabase
        .from("restaurant_services")
        .select("id, nom")
        .in("id", idsServices)
    : { data: [] };
  const services = new Map(
    ((servicesData ?? []) as { id: string; nom: string }[]).map((s) => [
      s.id,
      s.nom,
    ]),
  );

  const bilan: BilanRappels = { ...vide, concernees: reservations.length };
  const genre: Genre = "rappel";

  for (const reservation of reservations) {
    const verdict = aRappeler(reservation, jour);
    if (!verdict.rappeler) {
      bilan.ignorees += 1;
      continue;
    }

    const restaurant = restaurants.get(reservation.restaurant_id);
    if (!restaurant) {
      bilan.ignorees += 1;
      continue;
    }

    const destinataire = (reservation.client_email ?? "").trim();

    // La trace avant l'envoi : c'est elle, et la contrainte d'unicité qui
    // la protège, qui empêchent un second rappel. Un échec d'insertion
    // pour doublon veut dire qu'il est déjà parti.
    const { error: erreurTrace } = await supabase
      .from("reservation_courriels")
      .insert({ reservation_id: reservation.id, genre, destinataire });
    if (erreurTrace) {
      if (erreurTrace.code !== "23505") {
        console.error("[rappels/trace]", erreurTrace.message);
      }
      bilan.ignorees += 1;
      continue;
    }

    const contexte: Contexte = {
      restaurantNom: restaurant.nom,
      restaurantAdresse: restaurant.adresse,
      clientNom: reservation.client_nom ?? "",
      date: reservation.date_reservation,
      heure: reservation.heure_arrivee?.slice(0, 5) ?? null,
      couverts: reservation.couverts,
      serviceNom: reservation.service_id
        ? (services.get(reservation.service_id) ?? null)
        : null,
      type: reservation.type,
      langue: estLangue(reservation.langue) ? reservation.langue : "fr",
      lienAnnulation: reservation.annulation_token
        ? `${siteUrl()}/annuler/${reservation.annulation_token}`
        : null,
    };

    const resultat = await envoyerCourriel({
      destinataire,
      repondreA: restaurant.email_contact ?? undefined,
      ...rappelReservation(contexte),
    });

    if (resultat.envoye) {
      bilan.envoyes += 1;
    } else {
      bilan.echoues += 1;
      // L'échec reste inscrit : le rattrapage des courriels le reprendra
      // cette nuit, tant que le service n'est pas passé.
      await supabase
        .from("reservation_courriels")
        .update({ erreur: resultat.erreur ?? "inconnue" })
        .eq("reservation_id", reservation.id)
        .eq("genre", genre);
    }
  }

  return bilan;
}
