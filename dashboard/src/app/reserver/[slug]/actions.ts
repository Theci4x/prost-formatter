"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import {
  disponibiliteEspace,
  serviceOuvertCeJour,
  servicePasseOuTropTard,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import type { Espace, Service } from "@/types/reservation";

// Durée de vie de l'option posée par une demande. Trop court on perd les
// hésitants, trop long on gèle les vendredis soir.
const OPTION_HEURES = 48;

export type DemandeState = { error: string | null };

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

/**
 * Crée une demande de réservation depuis la page publique. Écrit avec la clé
 * de service, donc hors RLS : toutes les vérifications se font ici, et la
 * disponibilité est recalculée au moment de l'écriture plutôt que reprise du
 * formulaire — deux clients peuvent avoir chargé la même page avant que l'un
 * d'eux valide.
 */
export async function demanderReservation(
  _prevState: DemandeState,
  formData: FormData,
): Promise<DemandeState> {
  const slug = texte(formData.get("slug"));
  const espaceId = texte(formData.get("espace_id"));
  const serviceId = texte(formData.get("service_id"));
  const date = texte(formData.get("date"));
  const couverts = Number(texte(formData.get("couverts")));
  const type = texte(formData.get("type"));
  const nom = texte(formData.get("client_nom"));
  const email = texte(formData.get("client_email"));
  const telephone = texte(formData.get("client_telephone"));
  const occasion = texte(formData.get("occasion"));
  const message = texte(formData.get("message"));
  const accepteCommunications = formData.get("accepte_communications") === "on";

  if (!nom || !email) {
    return { error: "Indique ton nom et ton adresse e-mail." };
  }
  if (!email.includes("@")) {
    return { error: "Cette adresse e-mail ne semble pas valide." };
  }
  if (type !== "table" && type !== "privatisation") {
    return { error: "Type de réservation inconnu." };
  }
  if (!Number.isInteger(couverts) || couverts <= 0) {
    return { error: "Nombre de convives invalide." };
  }

  const supabase = createServiceClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug_reservation", slug)
    .maybeSingle();

  const restaurant = restaurantData as { id: string } | null;
  if (!restaurant) return { error: "Établissement introuvable." };

  const [espaceResult, serviceResult, reservationsResult] = await Promise.all([
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("id", espaceId)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("restaurant_services")
      .select("*")
      .eq("id", serviceId)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("restaurant_reservations")
      .select(
        "id, espace_id, service_id, date_reservation, couverts, type, statut, option_expire_le",
      )
      .eq("restaurant_id", restaurant.id)
      .eq("date_reservation", date),
  ]);

  const espace = espaceResult.data as Espace | null;
  const service = serviceResult.data as Service | null;
  // L'espace et le service sont filtrés sur le restaurant : un identifiant
  // emprunté à un autre établissement ne passe pas.
  if (!espace || !service) {
    return { error: "Cet espace n'est plus proposé à la réservation." };
  }

  const maintenant = new Date();
  if (!serviceOuvertCeJour(date, service)) {
    return { error: "Ce service n'est pas assuré ce jour-là." };
  }
  if (servicePasseOuTropTard(date, service, maintenant)) {
    return {
      error:
        service.delai_heures > 0
          ? `Les demandes ferment ${service.delai_heures} h avant le service.`
          : "Ce service est passé.",
    };
  }

  const dispo = disponibiliteEspace({
    espace,
    service,
    date,
    couverts,
    reservations: (reservationsResult.data ?? []) as Reservation[],
    maintenant,
  });

  const possible =
    type === "table" ? dispo.peutRecevoirTable : dispo.peutEtrePrivatise;
  if (!possible) {
    return {
      error:
        dispo.raison ??
        "Ce créneau vient d'être pris. Choisis-en un autre, ou une autre date.",
    };
  }

  const expiration = new Date(
    maintenant.getTime() + OPTION_HEURES * 60 * 60 * 1000,
  );

  const { error } = await supabase.from("restaurant_reservations").insert({
    restaurant_id: restaurant.id,
    espace_id: espace.id,
    service_id: service.id,
    date_reservation: date,
    couverts,
    type,
    statut: "demande",
    // Écrit explicitement plutôt que laissé au défaut de la base : la
    // provenance se lit dans le tableau de bord, elle ne doit pas dépendre
    // d'un réglage de schéma.
    origine: "client",
    client_nom: nom,
    client_email: email,
    client_telephone: telephone || null,
    occasion: occasion || null,
    message: message || null,
    accepte_communications: accepteCommunications,
    option_expire_le: expiration.toISOString(),
  });

  if (error) {
    console.error("[demanderReservation]", error);
    return { error: "L'envoi a échoué. Réessaie dans un instant." };
  }

  redirect(`/reserver/${slug}/merci`);
}
