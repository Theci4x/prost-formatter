"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { etatSeance, montantSeance } from "@/lib/experiences/seances";
import { OCTETS_JETON } from "@/lib/reservations/acompte";
import type { Experience, PlaceReservee } from "@/types/experience";

export type InscriptionState = { error: string | null };

/**
 * Inscription à une séance, depuis la page publique.
 *
 * La disponibilité est recalculée ici, jamais reprise du formulaire : entre
 * l'affichage de la page et le clic, quelqu'un d'autre a pu prendre la
 * dernière place.
 */
export async function inscrire(
  _prevState: InscriptionState,
  formData: FormData,
): Promise<InscriptionState> {
  const slug = (formData.get("slug") as string) ?? "";
  const experienceId = (formData.get("experience_id") as string) ?? "";
  const date = (formData.get("date") as string) ?? "";
  const places = Number(formData.get("places"));
  const nom = ((formData.get("client_nom") as string) ?? "").trim();
  const email = ((formData.get("client_email") as string) ?? "").trim();
  const telephone = ((formData.get("client_telephone") as string) ?? "").trim();
  const communications = formData.get("accepte_communications") === "on";

  if (!nom || !email) return { error: "Indiquez votre nom et votre e-mail." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Date invalide." };
  if (!Number.isInteger(places) || places <= 0) {
    return { error: "Indiquez un nombre de places." };
  }

  const supabase = createServiceClient();
  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug_reservation", slug)
    .maybeSingle();
  const restaurant = restaurantData as { id: string } | null;
  if (!restaurant) return { error: "Établissement introuvable." };

  const [experienceResult, placesResult, fermetures] = await Promise.all([
    // Filtrée sur le restaurant : un identifiant emprunté à un autre
    // établissement ne passe pas.
    supabase
      .from("restaurant_experiences")
      .select("*")
      .eq("id", experienceId)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle(),
    supabase
      .from("restaurant_experience_reservations")
      .select("id, experience_id, date_seance, places, statut")
      .eq("experience_id", experienceId)
      .eq("date_seance", date),
    chargerFermetures(supabase, restaurant.id, date),
  ]);

  const experience = experienceResult.data as Experience | null;
  if (!experience) return { error: "Cette expérience n'est plus proposée." };

  const etat = etatSeance({
    experience,
    date,
    places,
    reservations: (placesResult.data ?? []) as PlaceReservee[],
    fermetures,
    maintenant: new Date(),
  });
  if (!etat) return { error: "Aucune séance n'a lieu ce jour-là." };
  if (etat.raison) return { error: etat.raison };

  const montant = montantSeance(experience, places);
  const token = randomBytes(OCTETS_JETON).toString("base64url");

  const { error } = await supabase
    .from("restaurant_experience_reservations")
    .insert({
      experience_id: experience.id,
      restaurant_id: restaurant.id,
      date_seance: date,
      places,
      montant_centimes: montant,
      client_nom: nom,
      client_email: email,
      client_telephone: telephone || null,
      accepte_communications: communications,
      // Sans prépaiement, la place est acquise tout de suite : le client
      // règlera sur place, il n'y a rien à attendre.
      statut: experience.prepaiement ? "attendue" : "confirmee",
      paiement_token: experience.prepaiement ? token : null,
    });

  if (error) {
    console.error("[inscrire]", error);
    return { error: "L'inscription a échoué. Réessayez dans un instant." };
  }

  redirect(
    experience.prepaiement
      ? `/paiement/${token}`
      : `/reserver/${slug}/merci?experience=1`,
  );
}
