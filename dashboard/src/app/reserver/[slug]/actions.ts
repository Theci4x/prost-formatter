"use server";

import { headers } from "next/headers";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import {
  adresseIp,
  consommer,
  DEMANDES_PAR_JOUR,
  DEMANDES_PAR_RESTAURANT,
  empreinte,
  secretEmpreinte,
} from "@/lib/limites/publiques";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { decisionAutomatique } from "@/lib/reservations/confirmation";
import { garantieRequise } from "@/lib/reservations/garantie";
import { jetonAnnulation } from "@/lib/reservations/annulation";
import {
  prevenirClient,
  prevenirRestaurateur,
} from "@/lib/courriel/reservation";
import type { Contexte } from "@/lib/courriel/messages";
import { siteUrl } from "@/lib/site-url";
import { notifierEtablissement } from "@/lib/push/envoyer";
import { chargerAcces } from "@/lib/abonnement/acces";
import {
  disponibiliteEspace,
  heuresDArrivee,
  serviceOuvertCeJour,
  servicePasseOuTropTard,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import type { Espace, Service } from "@/types/reservation";

// Durée de vie de l'option posée par une demande. Trop court on perd les
// hésitants, trop long on gèle les vendredis soir.
const OPTION_HEURES = 48;

/** Longueur au-delà de laquelle un champ libre n'est plus un message. */
const TEXTE_MAX = 1000;

export type DemandeState = { error: string | null };

function texte(valeur: FormDataEntryValue | null, max = 200): string {
  // Coupé plutôt que refusé : un nom de trois cents caractères est une
  // maladresse ou un robot, dans les deux cas ce n'est pas au client de
  // recommencer sa saisie pour ça.
  return ((valeur as string | null) ?? "").trim().slice(0, max);
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
  const message = texte(formData.get("message"), TEXTE_MAX);
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

  // Les colonnes de confirmation et de contact viennent de la migration
  // 0038. Demander une colonne absente ne renvoie pas un champ vide : la
  // requête entière est refusée, et la prise de réservation tomberait sur
  // « établissement introuvable » pour tout le monde. On retente donc sans
  // elles — le temps qu'une migration passe, un déploiement en avance
  // confirme moins, mais il réserve.
  type Etablissement = {
    id: string;
    nom: string;
    adresse: string | null;
    email_contact?: string | null;
    confirmation_auto?: boolean | null;
    confirmation_auto_delai_heures?: number | null;
  };

  const complet = await supabase
    .from("restaurants")
    .select(
      "id, nom, adresse, email_contact, confirmation_auto, confirmation_auto_delai_heures",
    )
    .eq("slug_reservation", slug)
    .maybeSingle();

  const replis = complet.data
    ? null
    : await supabase
        .from("restaurants")
        .select("id, nom, adresse")
        .eq("slug_reservation", slug)
        .maybeSingle();

  const restaurant = ((complet.data ?? replis?.data) ??
    null) as Etablissement | null;
  if (!restaurant) return { error: "Établissement introuvable." };

  // Le formulaire a pu être chargé avant la fermeture du module, ou
  // rejoué depuis une console : l'action est une porte publique, elle se
  // vérifie elle-même.
  const acces = await chargerAcces(restaurant.id, supabase);
  if (!acces.ouvert.reservations) {
    return {
      error:
        "Cet établissement ne prend plus de réservation en ligne. " +
        "Appelle-le directement.",
    };
  }

  // Une demande pose une option de 48 heures : elle bloque des couverts.
  // Sans compteur, un script les bloque tous et met les réservations en
  // ligne d'un établissement hors service pour deux jours. Le compteur
  // vient après l'établissement, pour ne pas révéler l'existence d'un slug
  // à qui tape au hasard, et avant toute écriture.
  const entetes = await headers();
  const visiteur = empreinte(
    "resa",
    adresseIp(entetes),
    entetes.get("user-agent") ?? "",
    secretEmpreinte(),
  );
  const [sousPlafondGlobal, sousPlafondMaison] = await Promise.all([
    consommer(supabase, visiteur, DEMANDES_PAR_JOUR),
    consommer(supabase, `${visiteur}:${restaurant.id}`, DEMANDES_PAR_RESTAURANT),
  ]);
  if (!sousPlafondGlobal || !sousPlafondMaison) {
    return {
      error:
        "Tu as déjà envoyé plusieurs demandes aujourd'hui. Appelle " +
        "l'établissement directement, il te répondra plus vite.",
    };
  }

  const [espaceResult, serviceResult, reservationsResult, fermetures] =
    await Promise.all([
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
          "id, espace_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, option_expire_le",
        )
        .eq("restaurant_id", restaurant.id)
        .eq("date_reservation", date),
      chargerFermetures(supabase, restaurant.id, date),
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

  // L'heure ne se prend pas telle quelle : un champ bricolé enverrait
  // « 03:00 » sur un service qui ferme à 2h, ou une heure hors du pas des
  // créneaux, et le calcul de chevauchement s'appuierait dessus.
  const heure = texte(formData.get("heure")).slice(0, 5);
  const proposees = heuresDArrivee(service);
  if (!proposees.includes(heure)) {
    return {
      error: "Choisis une heure d'arrivée dans la liste proposée.",
    };
  }

  const dispo = disponibiliteEspace({
    espace,
    service,
    date,
    heure,
    couverts,
    reservations: (reservationsResult.data ?? []) as Reservation[],
    fermetures,
    maintenant,
  });

  const possible =
    type === "table" ? dispo.peutRecevoirTable : dispo.peutEtrePrivatise;
  if (!possible) {
    return {
      error:
        // Pour une table, le client n'a choisi aucune salle : c'est Klarr
        // qui l'a placé. Lui répondre « cet espace n'est plus libre » le
        // renverrait à une décision qu'il n'a pas prise. On lui dit ce
        // qu'il peut faire, pas ce qui s'est passé en coulisses.
        type === "table"
          ? "Ce créneau vient d'être pris pendant que tu remplissais le formulaire. Recharge la page : il reste peut-être de la place à une autre heure."
          : (dispo.raison ??
            "Ce créneau vient d'être pris. Choisis-en un autre, ou une autre date."),
    };
  }

  const expiration = new Date(
    maintenant.getTime() + OPTION_HEURES * 60 * 60 * 1000,
  );

  // Confirmer ou non, sans jamais court-circuiter la garantie : une
  // privatisation qui réclame un acompte reste une option jusqu'au
  // paiement, quel que soit le réglage.
  const decision = decisionAutomatique({
    regles: {
      confirmation_auto: restaurant.confirmation_auto ?? true,
      confirmation_auto_delai_heures:
        restaurant.confirmation_auto_delai_heures ?? 24,
    },
    service,
    date,
    type,
    garantie: garantieRequise(espace, type, couverts),
    maintenant,
  });
  const confirmee = decision.statut === "confirmee";

  // Le jeton part avec la réservation : c'est lui qui permettra au client
  // de rendre sa table sans téléphoner en plein service.
  const annulation = jetonAnnulation();

  const { data: creee, error } = await supabase.from("restaurant_reservations").insert({
    restaurant_id: restaurant.id,
    espace_id: espace.id,
    service_id: service.id,
    date_reservation: date,
    heure_arrivee: heure,
    couverts,
    type,
    statut: decision.statut,
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
    // Une réservation confirmée ne pose plus d'option : elle est acquise,
    // et une date d'expiration traînante la ferait disparaître du carnet.
    option_expire_le: confirmee ? null : expiration.toISOString(),
    annulation_token: annulation,
    // Recopié depuis l'espace, et non relu plus tard : ce qui a été
    // annoncé au client sur la page ne doit pas changer si le
    // restaurateur révise son tarif la semaine suivante.
    minimum_consommation_centimes:
      type === "privatisation"
        ? (espace.minimum_consommation_centimes ?? null)
        : null,
    minimum_consommation_ht: espace.minimum_consommation_ht ?? true,
  }).select("id").maybeSingle();

  if (error) {
    console.error("[demanderReservation]", error);
    return { error: "L'envoi a échoué. Réessaie dans un instant." };
  }

  // Les e-mails viennent après l'enregistrement, et n'en défont rien : la
  // table est prise, même si le fournisseur d'e-mails est en panne.
  const reservationId = (creee as { id: string } | null)?.id;
  if (reservationId) {
    const contexte: Contexte = {
      restaurantNom: restaurant.nom,
      restaurantAdresse: restaurant.adresse,
      clientNom: nom,
      date,
      heure,
      couverts,
      serviceNom: service.nom,
      type,
      lienAnnulation: `${siteUrl()}/annuler/${annulation}`,
      minimumConsommation:
        type === "privatisation" && espace.minimum_consommation_centimes
          ? `${(espace.minimum_consommation_centimes / 100).toLocaleString("fr-FR")} € ${espace.minimum_consommation_ht ? "HT" : "TTC"}`
          : null,
    };
    const couvertsLisibles = `${couverts} couvert${couverts > 1 ? "s" : ""}`;
    await Promise.all([
      prevenirClient({
        supabase,
        reservationId,
        contexte,
        destinataire: email,
        repondreA: restaurant.email_contact ?? undefined,
        confirmee,
      }),
      prevenirRestaurateur({
        supabase,
        reservationId,
        contexte,
        destinataire: restaurant.email_contact ?? null,
        confirmee,
      }),
      // Le téléphone en même temps que l'e-mail, et pas à sa place : en
      // plein service, l'e-mail attendra la fermeture. Une demande non
      // tranchée expire, alors elle mène droit au carnet ; une table
      // déjà confirmée n'est qu'une bonne nouvelle.
      notifierEtablissement(supabase, restaurant.id, {
        titre: confirmee
          ? `Table confirmée — ${nom}`
          : `Nouvelle demande — ${nom}`,
        corps: `${couvertsLisibles} le ${new Date(
          `${date}T12:00:00`,
        ).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })} à ${heure}${type === "privatisation" ? " (privatisation)" : ""}.`,
        chemin: `/dashboard/${restaurant.id}/reservations`,
        etiquette: `reservation-${reservationId}`,
      }),
    ]);
  }

  redirect(`/reserver/${slug}/merci?confirmee=${confirmee ? "1" : "0"}`);
}
