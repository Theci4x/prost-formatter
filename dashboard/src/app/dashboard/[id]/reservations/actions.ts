"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { slugDisponible, slugifier } from "@/lib/reservations/slug";
import {
  disponibiliteEspace,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import {
  ESPACE_VIDE,
  SERVICE_VIDE,
  type Espace,
  type EspaceValeurs,
  type SaisieValeurs,
  type Service,
  type ServiceValeurs,
  SAISIE_VIDE,
} from "@/types/reservation";

// « rendu » s'incrémente à chaque tentative : le formulaire s'en sert comme
// clé React pour se remonter et reprendre les valeurs ci-dessous, qu'il
// s'agisse de la saisie à corriger ou d'un formulaire vidé après succès.
export type EspaceState = {
  error: string | null;
  rendu: number;
  valeurs: EspaceValeurs;
};

export type ServiceState = {
  error: string | null;
  rendu: number;
  valeurs: ServiceValeurs;
};

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

function entierPositif(brut: string): number | null {
  if (!brut) return null;
  const n = Number(brut);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function addEspace(
  prevState: EspaceState,
  formData: FormData,
): Promise<EspaceState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const valeurs: EspaceValeurs = {
    nom: texte(formData.get("nom")),
    capacite: texte(formData.get("capacite")),
    description: texte(formData.get("description")),
    accepteTable: formData.get("accepte_table") === "on",
    privatisable: formData.get("privatisable") === "on",
    minimum: texte(formData.get("privatisation_minimum")),
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): EspaceState => ({ error, rendu, valeurs });

  const capacite = entierPositif(valeurs.capacite);
  const minimum = entierPositif(valeurs.minimum);

  if (!valeurs.nom) return echec("Donne un nom à cet espace.");
  if (!capacite) {
    return echec("Indique la capacité en couverts (un nombre entier).");
  }
  // Un espace qui n'accepte ni table ni privatisation ne serait proposé nulle
  // part : mieux vaut le dire que le laisser créer.
  if (!valeurs.accepteTable && !valeurs.privatisable) {
    return echec(
      "Coche au moins « tables classiques » ou « privatisation », sinon cet espace ne sera jamais réservable.",
    );
  }
  if (valeurs.privatisable && !minimum) {
    return echec(
      "Indique le minimum de couverts à partir duquel tu privatises.",
    );
  }
  if (minimum && minimum > capacite) {
    return echec(
      `Le minimum de privatisation (${minimum}) dépasse la capacité de l'espace (${capacite}).`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_espaces").insert({
    restaurant_id: restaurantId,
    nom: valeurs.nom,
    description: valeurs.description || null,
    capacite,
    privatisation_minimum: valeurs.privatisable ? minimum : null,
    accepte_table: valeurs.accepteTable,
  });

  if (error) {
    console.error("[addEspace]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  return { error: null, rendu, valeurs: ESPACE_VIDE };
}

export async function removeEspace(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_espaces")
    .delete()
    .eq("id", id);

  if (error) console.error("[removeEspace]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
}

export async function addService(
  prevState: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const valeurs: ServiceValeurs = {
    nom: texte(formData.get("nom")),
    heureDebut: texte(formData.get("heure_debut")),
    heureFin: texte(formData.get("heure_fin")),
    delai: texte(formData.get("delai_heures")),
    jours: formData
      .getAll("jours")
      .map(Number)
      .filter((jour) => Number.isInteger(jour) && jour >= 1 && jour <= 7),
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): ServiceState => ({ error, rendu, valeurs });

  const delai = Number(valeurs.delai);

  if (!valeurs.nom) return echec("Donne un nom à ce service (« Déjeuner »…).");
  if (valeurs.jours.length === 0) {
    return echec("Choisis au moins un jour de la semaine.");
  }
  if (!valeurs.heureDebut || !valeurs.heureFin) {
    return echec("Indique l'heure de début et l'heure de fin.");
  }
  // Une fin antérieure au début signifie « le lendemain » : c'est ainsi
  // qu'on saisit un service de 17h30 à 2h du matin. Seule l'égalité reste
  // refusée, faute de savoir s'il s'agit d'un service vide ou de 24 h.
  if (valeurs.heureFin === valeurs.heureDebut) {
    return echec("L'heure de fin doit être différente de l'heure de début.");
  }
  if (!Number.isInteger(delai) || delai < 0) {
    return echec("Le délai de prévenance doit être un nombre d'heures.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_services").insert({
    restaurant_id: restaurantId,
    nom: valeurs.nom,
    jours: valeurs.jours,
    heure_debut: valeurs.heureDebut,
    heure_fin: valeurs.heureFin,
    delai_heures: delai,
  });

  if (error) {
    console.error("[addService]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  return { error: null, rendu, valeurs: SERVICE_VIDE };
}

export async function removeService(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_services")
    .delete()
    .eq("id", id);

  if (error) console.error("[removeService]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
}

/**
 * Donne au restaurant une adresse publique de réservation. Le slug est
 * dérivé du nom et suffixé tant qu'il est pris — deux « Le Bistrot » peuvent
 * coexister dans deux villes.
 */
export async function activerPageReservation(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("nom, slug_reservation")
    .eq("id", restaurantId)
    .maybeSingle();

  const restaurant = data as { nom: string; slug_reservation: string | null } | null;
  if (!restaurant || restaurant.slug_reservation) return;

  // On lit les slugs déjà pris avec la clé de service : la RLS masquerait
  // ceux des autres restaurateurs, et on créerait des doublons.
  const service = createServiceClient();
  const { data: pris } = await service
    .from("restaurants")
    .select("slug_reservation")
    .not("slug_reservation", "is", null);

  const dejaPris = new Set(
    ((pris ?? []) as { slug_reservation: string }[]).map(
      (ligne) => ligne.slug_reservation,
    ),
  );

  const slug = slugDisponible(slugifier(restaurant.nom), (candidat) =>
    dejaPris.has(candidat),
  );

  const { error } = await supabase
    .from("restaurants")
    .update({ slug_reservation: slug })
    .eq("id", restaurantId);

  if (error) console.error("[activerPageReservation]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
}

// — Suivi des demandes —

async function chargerPourDecision(reservationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_reservations")
    .select("*")
    .eq("id", reservationId)
    .maybeSingle();
  return { supabase, reservation: data as ReservationComplete | null };
}

type ReservationComplete = {
  id: string;
  restaurant_id: string;
  espace_id: string;
  service_id: string | null;
  date_reservation: string;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  option_expire_le: string | null;
};

export type DecisionState = { error: string | null };

/**
 * Confirme une demande après avoir revérifié la disponibilité. Entre le
 * moment où la demande est arrivée et celui où le restaurateur clique, une
 * autre réservation a pu être confirmée sur le même créneau.
 */
export async function accepterDemande(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const reservationId = formData.get("reservation_id") as string;
  const { supabase, reservation } = await chargerPourDecision(reservationId);

  if (!reservation) return { error: "Demande introuvable." };
  if (reservation.statut !== "demande" && reservation.statut !== "expiree") {
    return { error: "Cette demande a déjà été traitée." };
  }

  const [espaceResult, serviceResult, voisinesResult] = await Promise.all([
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("id", reservation.espace_id)
      .maybeSingle(),
    supabase
      .from("restaurant_services")
      .select("*")
      .eq("id", reservation.service_id ?? "")
      .maybeSingle(),
    supabase
      .from("restaurant_reservations")
      .select(
        "id, espace_id, service_id, date_reservation, couverts, type, statut, option_expire_le",
      )
      .eq("restaurant_id", reservation.restaurant_id)
      .eq("date_reservation", reservation.date_reservation),
  ]);

  const espace = espaceResult.data as Espace | null;
  const service = serviceResult.data as Service | null;
  if (!espace || !service) {
    return { error: "L'espace ou le service de cette demande a été supprimé." };
  }

  // La demande en cours d'acceptation ne doit pas se compter elle-même.
  const voisines = ((voisinesResult.data ?? []) as Reservation[]).filter(
    (autre) => autre.id !== reservation.id,
  );

  const dispo = disponibiliteEspace({
    espace,
    service,
    date: reservation.date_reservation,
    couverts: reservation.couverts,
    reservations: voisines,
    maintenant: new Date(),
  });

  const possible =
    reservation.type === "table"
      ? dispo.peutRecevoirTable
      : dispo.peutEtrePrivatise;

  if (!possible) {
    return {
      error:
        dispo.raison ??
        "Ce créneau n'est plus disponible : une autre réservation a été confirmée entre-temps.",
    };
  }

  const { error } = await supabase
    .from("restaurant_reservations")
    // L'option n'a plus lieu d'être une fois la réservation ferme.
    .update({ statut: "confirmee", option_expire_le: null })
    .eq("id", reservation.id);

  if (error) {
    console.error("[accepterDemande]", error);
    return { error: "L'enregistrement a échoué. Réessaie dans un instant." };
  }

  revalidatePath(`/dashboard/${reservation.restaurant_id}/reservations`);
  return { error: null };
}

async function changerStatut(
  formData: FormData,
  statut: "refusee" | "annulee",
) {
  const reservationId = formData.get("reservation_id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ statut, option_expire_le: null })
    .eq("id", reservationId);

  if (error) console.error("[changerStatut]", statut, error);
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
}

export async function refuserDemande(formData: FormData) {
  await changerStatut(formData, "refusee");
}

export async function annulerReservation(formData: FormData) {
  await changerStatut(formData, "annulee");
}

/** Note privée du restaurateur, jamais montrée au client. */
export async function enregistrerNote(formData: FormData) {
  const reservationId = formData.get("reservation_id") as string;
  const restaurantId = formData.get("restaurant_id") as string;
  const note = ((formData.get("note_interne") as string) ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ note_interne: note || null })
    .eq("id", reservationId);

  if (error) console.error("[enregistrerNote]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
}

// — Réservation saisie par le restaurateur —

export type SaisieState = {
  error: string | null;
  rendu: number;
  valeurs: SaisieValeurs;
};

/**
 * Enregistre une réservation prise au téléphone ou au comptoir. Elle est
 * confirmée d'emblée : le restaurateur n'a pas à s'accorder l'autorisation
 * à lui-même. La disponibilité est vérifiée, mais il peut passer outre —
 * il voit sa salle, nous non.
 */
export async function ajouterReservation(
  prevState: SaisieState,
  formData: FormData,
): Promise<SaisieState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const espaceId = texte(formData.get("espace_id"));
  const serviceId = texte(formData.get("service_id"));
  const date = texte(formData.get("date_reservation"));
  const couverts = entierPositif(texte(formData.get("couverts")));
  const type = texte(formData.get("type"));
  const nom = texte(formData.get("client_nom"));
  const telephone = texte(formData.get("client_telephone"));
  const note = texte(formData.get("note_interne"));
  const forcer = formData.get("forcer") === "on";

  const rendu = prevState.rendu + 1;
  // Comme les autres formulaires : React vide le champ après l'action, on
  // lui rend la saisie pour qu'une erreur ne coûte pas tout à retaper.
  const valeurs: SaisieValeurs = {
    nom,
    telephone,
    date,
    couverts: texte(formData.get("couverts")),
    serviceId,
    espaceId,
    type,
    note,
    forcer,
  };
  const echec = (error: string): SaisieState => ({ error, rendu, valeurs });

  if (!nom) return echec("Indique au moins le nom du client.");
  if (!espaceId || !serviceId) return echec("Choisis un espace et un service.");
  if (!date) return echec("Choisis une date.");
  if (!couverts) return echec("Indique le nombre de couverts.");
  if (type !== "table" && type !== "privatisation") {
    return echec("Type de réservation inconnu.");
  }

  const supabase = await createClient();
  const [espaceResult, serviceResult, voisinesResult] = await Promise.all([
    supabase
      .from("restaurant_espaces")
      .select("*")
      .eq("id", espaceId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("restaurant_services")
      .select("*")
      .eq("id", serviceId)
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("restaurant_reservations")
      .select(
        "id, espace_id, service_id, date_reservation, couverts, type, statut, option_expire_le",
      )
      .eq("restaurant_id", restaurantId)
      .eq("date_reservation", date),
  ]);

  const espace = espaceResult.data as Espace | null;
  const service = serviceResult.data as Service | null;
  if (!espace || !service) {
    return echec("Cet espace ou ce service n'existe plus.");
  }

  if (!forcer) {
    const dispo = disponibiliteEspace({
      espace,
      service,
      date,
      couverts,
      reservations: (voisinesResult.data ?? []) as Reservation[],
      maintenant: new Date(),
    });
    const possible =
      type === "table" ? dispo.peutRecevoirTable : dispo.peutEtrePrivatise;
    if (!possible) {
      return echec(
        `${dispo.raison ?? "Ce créneau n'est pas disponible."} Coche « forcer » si tu sais que ça passe.`,
      );
    }
  }

  const { error } = await supabase.from("restaurant_reservations").insert({
    restaurant_id: restaurantId,
    espace_id: espaceId,
    service_id: serviceId,
    date_reservation: date,
    couverts,
    type,
    statut: "confirmee",
    origine: "restaurateur",
    client_nom: nom,
    // Une réservation téléphonique n'a pas toujours d'e-mail ; la colonne
    // ne peut pas être vide, on y met une marque explicite plutôt qu'une
    // adresse inventée.
    client_email: texte(formData.get("client_email")) || "—",
    client_telephone: telephone || null,
    note_interne: note || null,
  });

  if (error) {
    console.error("[ajouterReservation]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  return { error: null, rendu, valeurs: SAISIE_VIDE };
}

/** Logo et mentions légales affichés sur la page publique. */
export async function enregistrerIdentitePublique(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const mentions = texte(formData.get("mentions_legales"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ mentions_legales: mentions || null })
    .eq("id", restaurantId);

  if (error) console.error("[enregistrerIdentitePublique]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
}

export async function televerserLogo(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return;

  const supabase = await createClient();
  const { data: actuel } = await supabase
    .from("restaurants")
    .select("logo_storage_path")
    .eq("id", restaurantId)
    .maybeSingle();

  const ext = file.name.split(".").pop() || "png";
  const path = `${restaurantId}/logo-${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("restaurant-photos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("[televerserLogo]", uploadError);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("restaurant-photos").getPublicUrl(path);

  await supabase
    .from("restaurants")
    .update({ logo_url: publicUrl, logo_storage_path: path })
    .eq("id", restaurantId);

  // L'ancien fichier n'a plus de référence : le laisser encombrerait le
  // stockage sans que personne puisse le retrouver.
  const ancien = (actuel as { logo_storage_path: string | null } | null)
    ?.logo_storage_path;
  if (ancien) {
    await supabase.storage.from("restaurant-photos").remove([ancien]);
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
}
