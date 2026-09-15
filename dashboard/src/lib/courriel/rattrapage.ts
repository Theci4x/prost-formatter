import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import type { Contexte } from "@/lib/courriel/messages";
import {
  aRetenter,
  FENETRE_JOURS,
  messageDe,
  TENTATIVES_MAX,
  type LigneCourriel,
  type ReservationRattrapee,
} from "@/lib/courriel/rattrapage-regles";
import { siteUrl } from "@/lib/site-url";

export type Bilan = {
  examines: number;
  renvoyes: number;
  echoues: number;
  abandonnes: number;
};

/**
 * Relit les envois en erreur et retente ceux qui ont encore un sens.
 *
 * Écrit avec la clé de service : la table des envois est fermée par RLS,
 * personne n'y accède depuis un compte.
 */
export async function rattraperCourriels({
  supabase,
  maintenant,
  plafond = 50,
}: {
  supabase: SupabaseClient;
  maintenant: Date;
  /** Au-delà, on laisse le reste à la nuit suivante. */
  plafond?: number;
}): Promise<Bilan> {
  const depuis = new Date(
    maintenant.getTime() - FENETRE_JOURS * 24 * 3600 * 1000,
  ).toISOString();

  const { data: lignesData, error } = await supabase
    .from("reservation_courriels")
    .select("id, reservation_id, genre, destinataire, envoye_le, tentatives")
    .not("erreur", "is", null)
    .gte("envoye_le", depuis)
    .lt("tentatives", TENTATIVES_MAX)
    .order("envoye_le")
    .limit(plafond);

  if (error) {
    console.error("[rattrapage] lecture impossible", error.message);
    return { examines: 0, renvoyes: 0, echoues: 0, abandonnes: 0 };
  }

  const lignes = (lignesData ?? []) as LigneCourriel[];
  if (lignes.length === 0) {
    return { examines: 0, renvoyes: 0, echoues: 0, abandonnes: 0 };
  }

  // Trois requêtes pour tout le lot, pas trois par ligne : une nuit de
  // panne fait cinquante lignes, et cent cinquante allers-retours pour ça
  // seraient un gâchis qu'on paierait en délai d'exécution.
  const { data: reservationsData } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, client_nom, client_email, annulation_token",
    )
    .in("id", [...new Set(lignes.map((ligne) => ligne.reservation_id))]);

  const reservations = new Map(
    ((reservationsData ?? []) as ReservationRattrapee[]).map((r) => [r.id, r]),
  );

  const { data: restaurantsData } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, email_contact")
    .in("id", [
      ...new Set([...reservations.values()].map((r) => r.restaurant_id)),
    ]);

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
      [...reservations.values()]
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

  const bilan: Bilan = {
    examines: lignes.length,
    renvoyes: 0,
    echoues: 0,
    abandonnes: 0,
  };

  for (const ligne of lignes) {
    const reservation = reservations.get(ligne.reservation_id) ?? null;
    const verdict = aRetenter(ligne, reservation, maintenant);

    if (!verdict.retenter || !reservation) {
      bilan.abandonnes += 1;
      // On pousse le compteur au plafond : la ligne garde la trace de son
      // échec, mais ne sera plus relue chaque nuit jusqu'à sa péremption.
      await supabase
        .from("reservation_courriels")
        .update({
          tentatives: TENTATIVES_MAX,
          derniere_tentative: maintenant.toISOString(),
          erreur: `abandonné : ${verdict.retenter ? "réservation illisible" : verdict.motif}`,
        })
        .eq("id", ligne.id);
      continue;
    }

    const restaurant = restaurants.get(reservation.restaurant_id);
    if (!restaurant) {
      bilan.abandonnes += 1;
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
      lienAnnulation: reservation.annulation_token
        ? `${siteUrl()}/annuler/${reservation.annulation_token}`
        : null,
    };

    const message = messageDe(ligne.genre, contexte);
    // Un genre qu'on ne sait pas reconstruire ne se renvoie pas : mieux
    // vaut ne rien envoyer qu'envoyer le mauvais message.
    if (!message) {
      bilan.abandonnes += 1;
      continue;
    }

    const resultat = await envoyerCourriel({
      destinataire: ligne.destinataire,
      // L'alerte va au restaurateur : lui faire répondre à sa propre
      // adresse n'aurait pas de sens.
      repondreA:
        ligne.genre === "alerte_restaurateur"
          ? undefined
          : (restaurant.email_contact ?? undefined),
      ...message,
    });

    const tentatives = (ligne.tentatives ?? 1) + 1;
    if (resultat.envoye) {
      bilan.renvoyes += 1;
      await supabase
        .from("reservation_courriels")
        .update({
          erreur: null,
          tentatives,
          derniere_tentative: maintenant.toISOString(),
          envoye_le: maintenant.toISOString(),
        })
        .eq("id", ligne.id);
    } else {
      bilan.echoues += 1;
      await supabase
        .from("reservation_courriels")
        .update({
          erreur: resultat.erreur ?? "inconnue",
          tentatives,
          derniere_tentative: maintenant.toISOString(),
        })
        .eq("id", ligne.id);
    }
  }

  return bilan;
}
