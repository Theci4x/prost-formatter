"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { etatSeance, montantSeance } from "@/lib/experiences/seances";
import { OCTETS_JETON } from "@/lib/reservations/acompte";
import { enregistrerContact } from "@/lib/contacts/fichier";
import type { Experience, PlaceReservee } from "@/types/experience";
import { telephoneAEnregistrer } from "@/lib/contact/telephone";
import { langueVisiteur } from "@/lib/i18n/langue";
import { ERREURS } from "@/lib/i18n/erreurs";

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
  const email = ((formData.get("client_email") as string) ?? "")
    .trim()
    .toLowerCase();
  const telephone = telephoneAEnregistrer(
    formData.get("client_telephone") as string | null,
  );
  const communications = formData.get("accepte_communications") === "on";

  // Comme pour une demande de table : l'action lit le témoin, et refuse
  // dans la langue du formulaire qu'on vient de remplir.
  const langue = await langueVisiteur();
  const e = ERREURS[langue];

  if (!nom || !email) return { error: e.nomEtEmail };
  // La même expression qu'ailleurs. Sans elle, une adresse illisible
  // s'inscrivait quand même : la place était prise, et la personne ne
  // recevait ni confirmation ni rappel.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: e.emailInvalide };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: e.dateInvalide };
  if (!Number.isInteger(places) || places <= 0) {
    return { error: e.nombreDePlaces };
  }

  const supabase = createServiceClient();
  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("id")
    .eq("slug_reservation", slug)
    .maybeSingle();
  const restaurant = restaurantData as { id: string } | null;
  if (!restaurant) return { error: e.etablissementIntrouvable };

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
  if (!experience) return { error: e.experiencePlusProposee };

  const etat = etatSeance({
    experience,
    date,
    places,
    reservations: (placesResult.data ?? []) as PlaceReservee[],
    fermetures,
    maintenant: new Date(),
    langue,
  });
  if (!etat) return { error: e.pasDeSeanceCeJour };
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
      client_telephone: telephone,
      accepte_communications: communications,
      // Sans prépaiement, la place est acquise tout de suite : le client
      // règlera sur place, il n'y a rien à attendre.
      statut: experience.prepaiement ? "attendue" : "confirmee",
      paiement_token: experience.prepaiement ? token : null,
    });

  if (error) {
    console.error("[inscrire]", error);
    return { error: e.inscriptionEchouee };
  }

  await enregistrerContact({
    supabase,
    restaurantId: restaurant.id,
    nom,
    email,
    telephone,
    accepte: communications,
    source: "experience",
  });

  redirect(
    experience.prepaiement
      ? `/paiement/${token}`
      : `/reserver/${slug}/merci?experience=1`,
  );
}
