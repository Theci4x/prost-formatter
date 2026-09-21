"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { peutAnnuler } from "@/lib/reservations/annulation";
import { langueVisiteur } from "@/lib/i18n/langue";
import { ANNULER } from "@/lib/i18n/annuler";
import { prevenirAnnulationClient } from "@/lib/courriel/reservation";
import {
  alerteModification,
  reservationModifiee,
  type Contexte,
} from "@/lib/courriel/messages";
import { envoyerCourriel } from "@/lib/courriel/envoyer";
import type { Espace, Service } from "@/types/reservation";
import { notifierEtablissement } from "@/lib/push/envoyer";
import { peutModifier } from "@/lib/reservations/modification";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import {
  disponibiliteEspace,
  heuresDArrivee,
  serviceOuvertCeJour,
  servicePasseOuTropTard,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import { siteUrl } from "@/lib/site-url";

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
  // L'action lit le témoin de langue, comme la page qui l'a affichée.
  const langue = await langueVisiteur();
  const a = ANNULER[langue];

  if (!token) return { error: a.lienInvalide, fait: false };

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
  if (!reservation) return { error: a.lienPlusValide, fait: false };

  const { data: serviceData } = reservation.service_id
    ? await supabase
        .from("restaurant_services")
        .select("*")
        .eq("id", reservation.service_id)
        .maybeSingle()
    : { data: null };
  const service = serviceData as Service | null;

  const verdict = peutAnnuler(reservation, service, new Date(), langue);
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
    return { error: a.annulationEchouee, fait: false };
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

export type ModificationState = { error: string | null; fait: boolean };

/**
 * Modifie une réservation depuis le lien reçu par e-mail.
 *
 * Sans ce geste, un client qui veut décaler d'une demi-heure n'a qu'un
 * recours : annuler et recommencer. Le restaurateur voit alors une table
 * rendue puis reprise, perd la note interne et l'historique du client, et
 * pendant le battement quelqu'un d'autre peut prendre le créneau.
 *
 * La disponibilité est recalculée exactement comme à la réservation, avec
 * une précaution : la réservation qu'on déplace est retirée du calcul,
 * sinon elle se ferait concurrence à elle-même et refuserait un créneau
 * qu'elle occupe déjà.
 *
 * L'espace ne change pas. Si le nouveau nombre de convives n'y tient plus,
 * on renvoie vers l'établissement plutôt que de replacer le client nous-
 * mêmes : décider qui va dans quelle salle est un métier, pas un calcul.
 */
export async function modifierParLeClient(
  _prevState: ModificationState,
  formData: FormData,
): Promise<ModificationState> {
  const token = ((formData.get("token") as string | null) ?? "").trim();
  const date = ((formData.get("date") as string | null) ?? "").trim();
  const heure = ((formData.get("heure") as string | null) ?? "").trim().slice(0, 5);
  const couverts = Number(formData.get("couverts"));
  const langue = await langueVisiteur();
  const a = ANNULER[langue];

  if (!token) return { error: a.lienInvalide, fait: false };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: a.choisisUneDate, fait: false };
  }
  if (!Number.isInteger(couverts) || couverts <= 0) {
    return { error: a.indiqueDesConvives, fait: false };
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, espace_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, client_nom, client_email, acompte_statut, caution_statut",
    )
    .eq("annulation_token", token)
    .maybeSingle();

  const reservation = data as {
    id: string;
    restaurant_id: string;
    espace_id: string;
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
  if (!reservation) return { error: a.lienPlusValide, fait: false };

  const [espaceResult, serviceResult, devisResult] = await Promise.all([
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("id", reservation.espace_id)
      .maybeSingle(),
    reservation.service_id
      ? supabase
          .from("restaurant_services")
          .select("*")
          .eq("id", reservation.service_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("devis")
      .select("statut")
      .eq("reservation_id", reservation.id)
      .maybeSingle(),
  ]);

  const espace = espaceResult.data as Espace | null;
  const service = serviceResult.data as Service | null;
  const devisAccepte =
    (devisResult.data as { statut: string } | null)?.statut === "accepte";

  const verdict = peutModifier(
    reservation,
    service,
    devisAccepte,
    new Date(),
    langue,
  );
  if (!verdict.possible) return { error: verdict.motif, fait: false };

  if (!espace || !service) {
    return {
      error: a.plusModifiableEnLigne,
      fait: false,
    };
  }

  const maintenant = new Date();
  if (!serviceOuvertCeJour(date, service)) {
    return { error: a.servicePasCeJour, fait: false };
  }
  if (servicePasseOuTropTard(date, service, maintenant)) {
    return {
      error:
        service.delai_heures > 0
          ? a.changementsFerment(service.delai_heures)
          : a.servicePasse,
      fait: false,
    };
  }
  if (!heuresDArrivee(service).includes(heure)) {
    return { error: a.heureHorsListe, fait: false };
  }

  const [reservationsResult, fermetures] = await Promise.all([
    supabase
      .from("restaurant_reservations")
      .select(
        "id, espace_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, option_expire_le",
      )
      .eq("restaurant_id", reservation.restaurant_id)
      .eq("date_reservation", date),
    chargerFermetures(supabase, reservation.restaurant_id, date),
  ]);

  // Sans ce filtre, une réservation qu'on déplace de 20h à 20h30 se
  // heurterait à elle-même et se verrait refuser sa propre place.
  const voisines = ((reservationsResult.data ?? []) as Reservation[]).filter(
    (ligne) => ligne.id !== reservation.id,
  );

  const dispo = disponibiliteEspace({
    espace,
    service,
    date,
    heure,
    couverts,
    reservations: voisines,
    fermetures,
    maintenant,
    langue,
  });
  const possible =
    reservation.type === "table" ? dispo.peutRecevoirTable : dispo.peutEtrePrivatise;
  if (!possible) {
    return {
      error: dispo.raison ?? a.creneauPlusLibre,
      fait: false,
    };
  }

  const avant = `${new Date(
    `${reservation.date_reservation}T12:00:00`,
  ).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}${
    reservation.heure_arrivee
      ? ` à ${reservation.heure_arrivee.slice(0, 5).replace(":", "h")}`
      : ""
  }, ${reservation.couverts} couvert${reservation.couverts > 1 ? "s" : ""}`;

  const { data: modifiee, error } = await supabase
    .from("restaurant_reservations")
    .update({
      date_reservation: date,
      heure_arrivee: heure,
      couverts,
    })
    .eq("id", reservation.id)
    // Rejoue la vérification en base : deux envois simultanés ne
    // modifient qu'une fois.
    .in("statut", ["demande", "confirmee"])
    .select("id")
    .maybeSingle();

  if (error || !modifiee) {
    console.error("[modifierParLeClient]", error);
    return {
      error: a.modificationEchouee,
      fait: false,
    };
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
      date,
      heure,
      couverts,
      serviceNom: service.nom,
      type: reservation.type,
      lienAnnulation: `${siteUrl()}/annuler/${token}`,
    };

    await Promise.all([
      reservation.client_email
        ? envoyerCourriel({
            destinataire: reservation.client_email,
            repondreA: restaurant.email_contact ?? undefined,
            ...reservationModifiee(contexte),
          })
        : Promise.resolve(),
      restaurant.email_contact
        ? envoyerCourriel({
            destinataire: restaurant.email_contact,
            ...alerteModification(contexte, avant),
          })
        : Promise.resolve(),
      // Le plan de salle change : c'est une information de service, elle
      // ne peut pas attendre la relève des e-mails.
      notifierEtablissement(supabase, reservation.restaurant_id, {
        titre: `Réservation modifiée — ${reservation.client_nom ?? "un client"}`,
        corps: `Auparavant ${avant}. Désormais ${couverts} couvert${
          couverts > 1 ? "s" : ""
        } à ${heure.replace(":", "h")}.`,
        chemin: `/dashboard/${reservation.restaurant_id}/reservations`,
        etiquette: `modification-${reservation.id}`,
      }),
    ]);
  }

  return { error: null, fait: true };
}
