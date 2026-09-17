"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { slugDisponible, slugifier } from "@/lib/reservations/slug";
import { chargerFermetures } from "@/lib/reservations/fermetures";
import { peutGerer, roleSur } from "@/lib/equipe/roles";
import { OCTETS_JETON } from "@/lib/reservations/acompte";
import {
  echeancePaiement,
  garantieRequise,
} from "@/lib/reservations/garantie";
import { montantDebitable } from "@/lib/reservations/caution";
import { jetonAnnulation } from "@/lib/reservations/annulation";
import {
  peutConstaterAbsence,
  type ReservationAbsence,
} from "@/lib/reservations/absence";
import { siteUrl } from "@/lib/site-url";
import {
  envoyerLienDePaiement,
  prevenirClient,
  prevenirRefus,
} from "@/lib/courriel/reservation";
import type { Contexte } from "@/lib/courriel/messages";
import { debiterCaution } from "@/lib/stripe/caution";
import {
  disponibiliteEspace,
  heuresDArrivee,
  type Reservation,
} from "@/lib/reservations/disponibilite";
import {
  ESPACE_VIDE,
  FERMETURE_VIDE,
  SERVICE_VIDE,
  type Espace,
  type EspaceValeurs,
  type FermetureValeurs,
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

export type FermetureState = {
  error: string | null;
  rendu: number;
  valeurs: FermetureValeurs;
};

export type ServiceState = {
  error: string | null;
  rendu: number;
  valeurs: ServiceValeurs;
};

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

/**
 * Un montant en euros saisi à la main, rendu en centimes. Accepte la virgule
 * comme le point, et les espaces des milliers : un restaurateur écrit
 * « 1 500 » ou « 1500,50 », pas « 150050 ».
 */
function lireGarantie(brut: string): "aucune" | "acompte" | "caution" {
  return brut === "acompte" || brut === "caution" ? brut : "aucune";
}

function enCentimes(brut: string): number | null {
  if (!brut) return null;
  const propre = brut.replace(/[\s\u00a0\u202f€]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return null;
  const centimes = Math.round(Number(propre) * 100);
  return centimes > 0 ? centimes : null;
}

function entierPositif(brut: string): number | null {
  if (!brut) return null;
  const n = Number(brut);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Les valeurs du formulaire d'espace, telles que tapées. */
function lireEspace(formData: FormData): EspaceValeurs {
  return {
    nom: texte(formData.get("nom")),
    capacite: texte(formData.get("capacite")),
    description: texte(formData.get("description")),
    accepteTable: formData.get("accepte_table") === "on",
    privatisable: formData.get("privatisable") === "on",
    minimum: texte(formData.get("privatisation_minimum")),
    acompte: texte(formData.get("acompte")),
    acompteMode:
      texte(formData.get("acompte_mode")) === "par_couvert"
        ? "par_couvert"
        : "forfait",
    caution: texte(formData.get("caution")),
    cautionMode:
      texte(formData.get("caution_mode")) === "par_couvert"
        ? "par_couvert"
        : "forfait",
    seuil: texte(formData.get("garantie_seuil")),
    minimumConsommation: texte(formData.get("minimum_consommation")),
    minimumConsommationHt:
      texte(formData.get("minimum_consommation_tva")) !== "ttc",
    garantie: lireGarantie(texte(formData.get("garantie"))),
  };
}

/**
 * Ce qu'on écrit en base, ou la phrase à montrer. Partagé par l'ajout et la
 * modification : deux validations séparées finissent toujours par diverger,
 * et c'est la seconde qui laisse passer ce que la première refusait.
 */
function validerEspace(
  valeurs: EspaceValeurs,
): { erreur: string } | { donnees: Record<string, unknown> } {
  const capacite = entierPositif(valeurs.capacite);
  const minimum = entierPositif(valeurs.minimum);

  if (!valeurs.nom) return { erreur: "Donne un nom à cet espace." };
  if (!capacite) {
    return { erreur: "Indique la capacité en couverts (un nombre entier)." };
  }
  // Un espace qui n'accepte ni table ni privatisation ne serait proposé nulle
  // part : mieux vaut le dire que le laisser créer.
  if (!valeurs.accepteTable && !valeurs.privatisable) {
    return {
      erreur:
        "Coche au moins « tables classiques » ou « privatisation », sinon cet espace ne sera jamais réservable.",
    };
  }
  if (valeurs.privatisable && !minimum) {
    return {
      erreur: "Indique le minimum de couverts à partir duquel tu privatises.",
    };
  }
  if (minimum && minimum > capacite) {
    return {
      erreur: `Le minimum de privatisation (${minimum}) dépasse la capacité de l'espace (${capacite}).`,
    };
  }

  // Les montants sont saisis en euros et stockés en centimes : un montant à
  // virgule en base finit toujours par produire un centime de trop ou de
  // moins.
  const veutAcompte = valeurs.garantie === "acompte";
  const veutCaution = valeurs.garantie === "caution";

  const acompteCentimes = veutAcompte ? enCentimes(valeurs.acompte) : null;
  if (veutAcompte && acompteCentimes === null) {
    return {
      erreur: "L'acompte doit être un montant en euros, par exemple 500.",
    };
  }
  const cautionCentimes = veutCaution ? enCentimes(valeurs.caution) : null;
  if (veutCaution && cautionCentimes === null) {
    return {
      erreur: "La caution doit être un montant en euros, par exemple 1000.",
    };
  }
  if (valeurs.garantie !== "aucune" && !valeurs.privatisable) {
    return {
      erreur:
        "Acompte et caution ne s'appliquent qu'aux privatisations : coche « privatisation », ou choisis « aucune garantie ».",
    };
  }

  // Le seuil est facultatif : vide, la garantie s'applique dès le premier
  // convive. Mais s'il est saisi, il doit vouloir dire quelque chose.
  const seuil = valeurs.seuil ? entierPositif(valeurs.seuil) : null;
  if (valeurs.seuil && !seuil) {
    return {
      erreur:
        "Le seuil doit être un nombre de convives, par exemple 20 — ou vide pour l'appliquer dès le premier.",
    };
  }
  if (seuil && seuil > capacite) {
    return {
      erreur: `Le seuil de garantie (${seuil}) dépasse la capacité de l'espace (${capacite}) : elle ne se déclencherait jamais.`,
    };
  }

  // Le minimum de consommation n'est pas une garantie : rien n'est
  // encaissé ni bloqué. Il vit donc à côté de l'acompte et de la caution,
  // et peut se cumuler avec eux — une salle peut demander 500 € d'acompte
  // et annoncer 3 000 € de minimum, ce sont deux choses différentes.
  const minimumConsommation = valeurs.minimumConsommation
    ? enCentimes(valeurs.minimumConsommation)
    : null;
  if (valeurs.minimumConsommation && minimumConsommation === null) {
    return {
      erreur:
        "Le minimum de consommation doit être un montant en euros, par exemple 1000.",
    };
  }
  if (minimumConsommation && !valeurs.privatisable) {
    return {
      erreur:
        "Le minimum de consommation ne s'applique qu'aux privatisations : coche « privatisation », ou laisse le champ vide.",
    };
  }

  return {
    donnees: {
      nom: valeurs.nom,
      description: valeurs.description || null,
      capacite,
      privatisation_minimum: valeurs.privatisable ? minimum : null,
      accepte_table: valeurs.accepteTable,
      minimum_consommation_centimes: valeurs.privatisable
        ? minimumConsommation
        : null,
      minimum_consommation_ht: valeurs.minimumConsommationHt,
      acompte_centimes: valeurs.privatisable ? acompteCentimes : null,
      acompte_mode: valeurs.acompteMode,
      caution_centimes: valeurs.privatisable ? cautionCentimes : null,
      caution_mode: valeurs.cautionMode,
      garantie_seuil_couverts: valeurs.privatisable ? seuil : null,
    },
  };
}

export async function addEspace(
  prevState: EspaceState,
  formData: FormData,
): Promise<EspaceState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const valeurs = lireEspace(formData);
  const rendu = prevState.rendu + 1;

  const verdict = validerEspace(valeurs);
  if ("erreur" in verdict) {
    return { error: verdict.erreur, rendu, valeurs };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_espaces")
    .insert({ restaurant_id: restaurantId, ...verdict.donnees });

  if (error) {
    console.error("[addEspace]", error);
    return {
      error: "L'enregistrement a échoué. Réessaie dans un instant.",
      rendu,
      valeurs,
    };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  // C'est l'écran de configuration qui affiche ces listes : sans cette
  // ligne, on ajoute un espace et on ne le retrouve pas en revenant.
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null, rendu, valeurs: ESPACE_VIDE };
}

/**
 * Modifier un espace existant. Jusqu'ici il fallait le supprimer et le
 * recréer, ce qui emportait ses photos et coupait le lien avec les
 * réservations prises dessus. Changer une caution ne doit pas coûter ça —
 * et sans cet écran, le restaurateur ne pourrait régler sa garantie qu'une
 * seule fois, à la création.
 */
export async function modifierEspace(
  prevState: EspaceState,
  formData: FormData,
): Promise<EspaceState> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const espaceId = texte(formData.get("espace_id"));
  const valeurs = lireEspace(formData);
  const rendu = prevState.rendu + 1;
  const echec = (error: string): EspaceState => ({ error, rendu, valeurs });

  if (!peutGerer(await roleSur(restaurantId))) {
    return echec("Seul un gérant peut modifier les espaces.");
  }

  const verdict = validerEspace(valeurs);
  if ("erreur" in verdict) return echec(verdict.erreur);

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_espaces")
    .update(verdict.donnees)
    .eq("id", espaceId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[modifierEspace]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null, rendu, valeurs };
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
  // C'est l'écran de configuration qui affiche ces listes : sans cette
  // ligne, on ajoute un service et on ne le retrouve pas en revenant.
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
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
    duree: texte(formData.get("duree_minutes")),
    delai: texte(formData.get("delai_heures")),
    jours: formData
      .getAll("jours")
      .map(Number)
      .filter((jour) => Number.isInteger(jour) && jour >= 1 && jour <= 7),
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): ServiceState => ({ error, rendu, valeurs });

  const delai = Number(valeurs.delai);
  const duree = Number(valeurs.duree);

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
  // Les bornes sont celles de la base : moins d'un quart d'heure ne veut
  // rien dire, plus de douze heures non plus.
  if (!Number.isInteger(duree) || duree < 15 || duree > 720) {
    return echec("La durée d'une table doit être comprise entre 15 et 720 minutes.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_services").insert({
    restaurant_id: restaurantId,
    nom: valeurs.nom,
    jours: valeurs.jours,
    heure_debut: valeurs.heureDebut,
    heure_fin: valeurs.heureFin,
    duree_minutes: duree,
    delai_heures: delai,
  });

  if (error) {
    console.error("[addService]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  // C'est l'écran de configuration qui affiche ces listes : sans cette
  // ligne, on ajoute un service et on ne le retrouve pas en revenant.
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null, rendu, valeurs: SERVICE_VIDE };
}

/**
 * Modifier un service existant. Jusqu'ici il fallait le supprimer et le
 * recréer — ce qui, au passage, coupait le lien avec les réservations déjà
 * prises dessus : leur service_id repassait à NULL et elles disparaissaient
 * de l'écran du jour. Corriger une heure de fin ne doit pas coûter ça.
 */
export async function modifierService(
  prevState: ServiceState,
  formData: FormData,
): Promise<ServiceState> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const serviceId = texte(formData.get("service_id"));
  const valeurs: ServiceValeurs = {
    nom: texte(formData.get("nom")),
    heureDebut: texte(formData.get("heure_debut")),
    heureFin: texte(formData.get("heure_fin")),
    duree: texte(formData.get("duree_minutes")),
    delai: texte(formData.get("delai_heures")),
    jours: formData
      .getAll("jours")
      .map(Number)
      .filter((jour) => Number.isInteger(jour) && jour >= 1 && jour <= 7),
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): ServiceState => ({ error, rendu, valeurs });

  if (!peutGerer(await roleSur(restaurantId))) {
    return echec("Seul un gérant peut modifier les services.");
  }

  const delai = Number(valeurs.delai);
  const duree = Number(valeurs.duree);

  if (!valeurs.nom) return echec("Donne un nom à ce service (« Déjeuner »…).");
  if (valeurs.jours.length === 0) {
    return echec("Choisis au moins un jour de la semaine.");
  }
  if (!valeurs.heureDebut || !valeurs.heureFin) {
    return echec("Indique l'heure de début et l'heure de fin.");
  }
  if (valeurs.heureFin === valeurs.heureDebut) {
    return echec("L'heure de fin doit être différente de l'heure de début.");
  }
  if (!Number.isInteger(delai) || delai < 0) {
    return echec("Le délai de prévenance doit être un nombre d'heures.");
  }
  // Les bornes sont celles de la base : moins d'un quart d'heure ne veut
  // rien dire, plus de douze heures non plus.
  if (!Number.isInteger(duree) || duree < 15 || duree > 720) {
    return echec("La durée d'une table doit être comprise entre 15 et 720 minutes.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_services")
    .update({
      nom: valeurs.nom,
      jours: valeurs.jours,
      heure_debut: valeurs.heureDebut,
      heure_fin: valeurs.heureFin,
      duree_minutes: duree,
      delai_heures: delai,
    })
    .eq("id", serviceId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[modifierService]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null, rendu, valeurs };
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
  // C'est l'écran de configuration qui affiche ces listes : sans cette
  // ligne, on ajoute un service et on ne le retrouve pas en revenant.
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
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
  // C'est l'écran de configuration qui affiche ces listes : sans cette
  // ligne, on ajoute un service et on ne le retrouve pas en revenant.
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
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
  heure_arrivee: string | null;
  couverts: number;
  type: "table" | "privatisation";
  statut: "demande" | "confirmee" | "refusee" | "annulee" | "expiree";
  option_expire_le: string | null;
  // Déjà rempli si le client a reçu un lien de paiement lors d'une
  // acceptation précédente.
  paiement_token: string | null;
  client_nom: string | null;
  client_email: string | null;
  annulation_token: string | null;
  minimum_consommation_centimes: number | null;
  minimum_consommation_ht: boolean | null;
  derniere_relance_le: string | null;
};

/**
 * Ce qu'il faut pour écrire au client d'une réservation : le nom de la
 * maison, l'heure, l'adresse à laquelle il répondra.
 *
 * Lu avec la clé de service, et pas avec la session du restaurateur : la
 * table des envois est fermée par RLS — aucune politique, donc aucun accès
 * depuis un compte. C'est voulu : ces lignes n'appartiennent à personne
 * d'autre qu'au serveur.
 */
async function contexteCourriel(reservation: ReservationComplete): Promise<{
  service: ReturnType<typeof createServiceClient>;
  contexte: Contexte;
  destinataire: string;
  repondreA?: string;
} | null> {
  if (!reservation.client_email) return null;

  const service = createServiceClient();
  const [restaurantResult, serviceResult] = await Promise.all([
    service
      .from("restaurants")
      .select("nom, adresse, email_contact")
      .eq("id", reservation.restaurant_id)
      .maybeSingle(),
    reservation.service_id
      ? service
          .from("restaurant_services")
          .select("nom")
          .eq("id", reservation.service_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const restaurant = restaurantResult.data as {
    nom: string;
    adresse: string | null;
    email_contact: string | null;
  } | null;
  if (!restaurant) return null;

  return {
    service,
    destinataire: reservation.client_email,
    repondreA: restaurant.email_contact ?? undefined,
    contexte: {
      restaurantNom: restaurant.nom,
      restaurantAdresse: restaurant.adresse,
      clientNom: reservation.client_nom ?? "",
      date: reservation.date_reservation,
      heure: reservation.heure_arrivee?.slice(0, 5) ?? null,
      couverts: reservation.couverts,
      serviceNom: (serviceResult.data as { nom: string } | null)?.nom ?? null,
      type: reservation.type,
      // Le lien d'annulation voyage avec chaque message : c'est celui du
      // dernier e-mail reçu que le client retrouvera le jour venu.
      lienAnnulation: reservation.annulation_token
        ? `${siteUrl()}/annuler/${reservation.annulation_token}`
        : null,
      minimumConsommation: reservation.minimum_consommation_centimes
        ? `${(reservation.minimum_consommation_centimes / 100).toLocaleString("fr-FR")} € ${reservation.minimum_consommation_ht === false ? "TTC" : "HT"}`
        : null,
    },
  };
}

export type DecisionState = { error: string | null };

/** « samedi 20 septembre à 18h », pour annoncer une échéance. */
function echeanceLisible(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

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

  const [espaceResult, serviceResult, voisinesResult, fermetures] =
    await Promise.all([
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
          "id, espace_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, option_expire_le",
        )
        .eq("restaurant_id", reservation.restaurant_id)
        .eq("date_reservation", reservation.date_reservation),
      chargerFermetures(
        supabase,
        reservation.restaurant_id,
        reservation.date_reservation,
      ),
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
    // La demande a son heure : c'est celle-là qu'on juge, pas l'ouverture
    // du service. Sans ça, accepter une table de 23h la confronterait aux
    // tables de 19h, qui seront parties depuis longtemps.
    heure: reservation.heure_arrivee?.slice(0, 5) ?? undefined,
    couverts: reservation.couverts,
    reservations: voisines,
    fermetures,
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

  // La somme est figée ici, à l'acceptation : si le tarif de l'espace change
  // ensuite, ce qu'on demande au client ne bouge pas sous ses pieds.
  const garantie = garantieRequise(espace, reservation.type, reservation.couverts);

  // Un client déjà relancé garde son lien : en régénérer un invaliderait
  // celui qu'il a reçu, sans que personne ne le sache avant qu'il clique.
  const jeton = reservation.paiement_token
    ? {}
    : { paiement_token: randomBytes(OCTETS_JETON).toString("base64url") };

  const argent = garantie.acompteCentimes
    ? {
        acompte_centimes: garantie.acompteCentimes,
        acompte_statut: "attendu",
        ...jeton,
      }
    : garantie.cautionCentimes
      ? {
          caution_centimes: garantie.cautionCentimes,
          caution_statut: "attendue",
          ...jeton,
        }
      : {};

  // Rien n'est ferme tant que l'argent n'est pas posé : la salle reste tenue
  // par une option, que la tâche de nuit rendra si le client ne donne pas
  // suite. Sans garantie à réclamer, l'acceptation confirme comme avant.
  const engagement = garantie.exigee
    ? {
        statut: "demande",
        option_expire_le: echeancePaiement(new Date()).toISOString(),
      }
    : { statut: "confirmee", option_expire_le: null };

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ ...engagement, ...argent })
    .eq("id", reservation.id);

  if (error) {
    console.error("[accepterDemande]", error);
    return { error: "L'enregistrement a échoué. Réessaie dans un instant." };
  }

  // Une acceptation qui réclame de l'argent doit partir avec le moyen de
  // le donner. Sans ce message, le restaurateur acceptait, Klarr
  // fabriquait un lien — et le laissait dans le tableau de bord, à charge
  // pour lui de le recopier à la main. Le client attendait sans rien
  // savoir, et l'option expirait.
  if (garantie.exigee) {
    const envoi = await contexteCourriel(reservation);
    const jetonPaiement =
      ("paiement_token" in jeton ? jeton.paiement_token : null) ??
      reservation.paiement_token;
    if (envoi && jetonPaiement) {
      const centimes = garantie.acompteCentimes || garantie.cautionCentimes;
      await envoyerLienDePaiement({
        supabase: envoi.service,
        reservationId: reservation.id,
        contexte: envoi.contexte,
        destinataire: envoi.destinataire,
        repondreA: envoi.repondreA,
        lien: `${siteUrl()}/paiement/${jetonPaiement}`,
        garantie: {
          montant: `${(centimes / 100).toLocaleString("fr-FR")} €`,
          caution: garantie.acompteCentimes === 0,
          echeance: echeanceLisible(engagement.option_expire_le),
        },
        unique: true,
      });
    }
  }

  if (!garantie.exigee) {
    const envoi = await contexteCourriel(reservation);
    if (envoi) {
      await prevenirClient({
        supabase: envoi.service,
        reservationId: reservation.id,
        contexte: envoi.contexte,
        destinataire: envoi.destinataire,
        repondreA: envoi.repondreA,
        confirmee: true,
      });
    }
  }

  revalidatePath(`/dashboard/${reservation.restaurant_id}/reservations`);
  revalidatePath(`/dashboard/${reservation.restaurant_id}/service`);
  return { error: null };
}

async function changerStatut(
  formData: FormData,
  statut: "refusee" | "annulee",
): Promise<DecisionState> {
  const reservationId = formData.get("reservation_id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_reservations")
    // On note qui décide : le restaurateur, ici. Une table qu'il refuse
    // et une table que le client rend ne se lisent pas pareil dans le
    // carnet, et la seconde se revend.
    .update({ statut, option_expire_le: null, annulee_par: "restaurant" })
    .eq("id", reservationId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[changerStatut]", statut, error);
    // Le journal du serveur ne sert qu'à nous. Sans cette phrase, le
    // restaurateur clique, la page se recharge inchangée, et il n'a
    // aucun moyen de savoir si c'est fait ou raté.
    return {
      error:
        statut === "annulee"
          ? "L'annulation a échoué. Réessaie dans un instant."
          : "Le refus a échoué. Réessaie dans un instant.",
    };
  }

  // Une mise à jour qui ne touche aucune ligne n'est pas une erreur pour
  // la base : c'est le cas d'une réservation déjà tranchée ailleurs, ou
  // d'un identifiant que la RLS ne laisse pas voir.
  if (!data) {
    return {
      error: "Cette réservation n'existe plus, ou a déjà été traitée.",
    };
  }

  // Un client qui n'est pas prévenu se présente. C'est le cas où le
  // silence coûte le plus cher — à lui comme à la maison, qui doit
  // l'éconduire sur le pas de la porte.
  const reservation = data as ReservationComplete | null;
  if (reservation) {
    const envoi = await contexteCourriel(reservation);
    if (envoi) {
      await prevenirRefus({
        supabase: envoi.service,
        reservationId: reservation.id,
        contexte: envoi.contexte,
        destinataire: envoi.destinataire,
        repondreA: envoi.repondreA,
        motif: statut,
      });
    }
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null };
}

export async function refuserDemande(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  return changerStatut(formData, "refusee");
}

export async function annulerReservation(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  return changerStatut(formData, "annulee");
}

/** Note privée du restaurateur, jamais montrée au client. */
export async function enregistrerNote(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const reservationId = formData.get("reservation_id") as string;
  const restaurantId = formData.get("restaurant_id") as string;
  const note = ((formData.get("note_interne") as string) ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ note_interne: note || null })
    .eq("id", reservationId);

  if (error) {
    console.error("[enregistrerNote]", error);
    return { error: "La note n'a pas pu être enregistrée." };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null };
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
  const type: "table" | "privatisation" =
    texte(formData.get("type")) === "privatisation" ? "privatisation" : "table";
  const nom = texte(formData.get("client_nom"));
  const telephone = texte(formData.get("client_telephone"));
  const note = texte(formData.get("note_interne"));
  const heureDemandee = texte(formData.get("heure")).slice(0, 5);
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
    heure: heureDemandee,
    espaceId,
    type,
    note,
    forcer,
  };
  const echec = (error: string): SaisieState => ({ error, rendu, valeurs });

  if (!nom) return echec("Indique au moins le nom du client.");
  if (!serviceId) return echec("Choisis un service.");
  // Une privatisation désigne sa salle ; une réservation ordinaire non, et
  // c'est à Klarr de la placer plus bas.
  if (type === "privatisation" && !espaceId) {
    return echec("Choisis l'espace à privatiser.");
  }
  if (!date) return echec("Choisis une date.");
  if (!couverts) return echec("Indique le nombre de couverts.");

  const supabase = await createClient();
  const [espacesResult, serviceResult, voisinesResult, fermetures] =
    await Promise.all([
      supabase
        .from("restaurant_espaces")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("ordre")
        .order("created_at"),
      supabase
        .from("restaurant_services")
        .select("*")
        .eq("id", serviceId)
        .eq("restaurant_id", restaurantId)
        .maybeSingle(),
      supabase
        .from("restaurant_reservations")
        .select(
          "id, espace_id, service_id, date_reservation, heure_arrivee, couverts, type, statut, option_expire_le",
        )
        .eq("restaurant_id", restaurantId)
        .eq("date_reservation", date),
      chargerFermetures(supabase, restaurantId, date),
    ]);

  const espaces = (espacesResult.data ?? []) as Espace[];
  const service = serviceResult.data as Service | null;
  if (!service) return echec("Ce service n'existe plus.");

  const reservations = (voisinesResult.data ?? []) as Reservation[];
  const maintenant = new Date();
  const proposees = heuresDArrivee(service);
  // Une heure absente ou fantaisiste retombe sur l'ouverture du service :
  // au téléphone, le restaurateur note souvent l'heure après coup, et lui
  // refuser la saisie pour si peu serait pénible.
  const heure = proposees.includes(heureDemandee)
    ? heureDemandee
    : proposees[0];
  const dispoDe = (espace: Espace) =>
    disponibiliteEspace({
      espace,
      service,
      date,
      heure,
      couverts,
      reservations,
      fermetures,
      maintenant,
    });

  // Les candidats : la salle désignée pour une privatisation, sinon toutes
  // celles qui acceptent les réservations ordinaires, dans l'ordre choisi par
  // le restaurateur — il a rangé ses salles par préférence, on la respecte.
  const candidats =
    type === "privatisation"
      ? espaces.filter((espace) => espace.id === espaceId)
      : espaces.filter((espace) => espace.accepte_table);

  if (candidats.length === 0) {
    return echec(
      type === "privatisation"
        ? "Cet espace n'existe plus."
        : "Aucun espace n'accepte les réservations individuelles.",
    );
  }

  const retenu = candidats.find((espace) => {
    const dispo = dispoDe(espace);
    return type === "table" ? dispo.peutRecevoirTable : dispo.peutEtrePrivatise;
  });

  // Forcer passe outre la jauge, mais il faut tout de même une salle où
  // écrire : à défaut de place, on prend la première proposée.
  const espace = retenu ?? (forcer ? candidats[0] : null);
  if (!espace) {
    const raisons = candidats
      .map((candidat) => {
        const dispo = dispoDe(candidat);
        return dispo.raison ? `${candidat.nom} : ${dispo.raison}` : null;
      })
      .filter(Boolean);
    return echec(
      `${raisons.join(" ") || "Ce créneau n'est pas disponible."} Coche « forcer » si tu sais que ça passe.`,
    );
  }

  const { error } = await supabase.from("restaurant_reservations").insert({
    restaurant_id: restaurantId,
    espace_id: espace.id,
    service_id: serviceId,
    date_reservation: date,
    heure_arrivee: heure,
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
    // Même une réservation prise au téléphone reçoit son jeton : si le
    // client a laissé une adresse, le rappel de la veille pourra lui
    // proposer de rendre sa table comme aux autres.
    annulation_token: jetonAnnulation(),
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

// Au-delà, l'hébergeur refuse le corps de la requête avant nous : mieux vaut
// le dire tout de suite que laisser l'envoi partir pour rien.
const LOGO_MAX = 4 * 1024 * 1024;

export async function televerserLogo(formData: FormData): Promise<{
  error: string | null;
}> {
  const restaurantId = formData.get("restaurant_id") as string;
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "Choisis un fichier." };
  if (!file.type.startsWith("image/")) {
    return { error: "Ce fichier n'est pas une image." };
  }
  if (file.size > LOGO_MAX) {
    return {
      error: "Logo trop lourd (4 Mo maximum). Réduis-le avant de l'envoyer.",
    };
  }

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
    return { error: "L'envoi a échoué. Réessaie." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("restaurant-photos").getPublicUrl(path);

  const { error: ecriture } = await supabase
    .from("restaurants")
    .update({ logo_url: publicUrl, logo_storage_path: path })
    .eq("id", restaurantId);

  if (ecriture) {
    console.error("[televerserLogo]", ecriture);
    await supabase.storage.from("restaurant-photos").remove([path]);
    return { error: "Le logo n'a pas été enregistré." };
  }

  // L'ancien fichier n'a plus de référence : le laisser encombrerait le
  // stockage sans que personne puisse le retrouver.
  const ancien = (actuel as { logo_storage_path: string | null } | null)
    ?.logo_storage_path;
  if (ancien) {
    await supabase.storage.from("restaurant-photos").remove([ancien]);
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null };
}


const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Ferme une période. Le restaurateur part en vacances, un jour est férié, ou
 * une salle est prise par un événement traité hors Klarr : dans les trois cas
 * la page publique doit cesser d'encaisser des promesses.
 */
export async function ajouterFermeture(
  prevState: FermetureState,
  formData: FormData,
): Promise<FermetureState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const valeurs: FermetureValeurs = {
    dateDebut: texte(formData.get("date_debut")),
    dateFin: texte(formData.get("date_fin")),
    espaceId: texte(formData.get("espace_id")),
    motif: texte(formData.get("motif")),
  };
  const echec = (message: string): FermetureState => ({
    error: message,
    rendu: prevState.rendu + 1,
    valeurs,
  });

  if (!DATE_ISO.test(valeurs.dateDebut)) {
    return echec("Choisis une date de début.");
  }
  // Fermer un seul jour est le cas courant : la date de fin vide vaut la date
  // de début plutôt qu'une erreur.
  const dateFin = DATE_ISO.test(valeurs.dateFin)
    ? valeurs.dateFin
    : valeurs.dateDebut;
  if (dateFin < valeurs.dateDebut) {
    return echec("La date de fin est antérieure à la date de début.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_fermetures").insert({
    restaurant_id: restaurantId,
    espace_id: valeurs.espaceId || null,
    date_debut: valeurs.dateDebut,
    date_fin: dateFin,
    motif: valeurs.motif || null,
  });

  if (error) {
    console.error("[ajouterFermeture]", error);
    return echec("La fermeture n'a pas pu être enregistrée.");
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null, rendu: prevState.rendu + 1, valeurs: FERMETURE_VIDE };
}

export async function supprimerFermeture(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_fermetures")
    .delete()
    .eq("id", id);

  if (error) console.error("[supprimerFermeture]", error);
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
}


// — La caution —

type LigneCaution = {
  id: string;
  restaurant_id: string;
  client_nom: string;
  caution_centimes: number | null;
  caution_statut: string;
  stripe_customer_id: string | null;
  stripe_payment_method_id: string | null;
};

async function chargerCaution(restaurantId: string, reservationId: string) {
  const supabase = await createClient();
  // RLS filtre déjà sur le propriétaire ; le restaurant est repassé en
  // condition pour qu'un identifiant emprunté ne désigne pas la réservation
  // d'un autre établissement.
  const { data } = await supabase
    .from("restaurant_reservations")
    .select(
      "id, restaurant_id, client_nom, caution_centimes, caution_statut, stripe_customer_id, stripe_payment_method_id",
    )
    .eq("id", reservationId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  return { supabase, ligne: data as LigneCaution | null };
}

function rafraichir(restaurantId: string) {
  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
}

/**
 * Seule l'erreur est renvoyée : en cas de succès la ligne passe à « débitée »
 * et le formulaire disparaît avec elle. Un message de confirmation ne
 * s'afficherait jamais — c'est le nouvel état de la réservation qui confirme.
 */
export type DebitState = { error: string | null };

/**
 * Prélève tout ou partie de la caution. Le plafond est appliqué ici et non
 * seulement affiché : débiter au-delà de la somme annoncée au client serait
 * un prélèvement auquel il n'a pas consenti.
 */
export async function debiter(
  _prevState: DebitState,
  formData: FormData,
): Promise<DebitState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const reservationId = formData.get("reservation_id") as string;

  // RLS laisse le service écrire sur les réservations — il en a besoin pour
  // accepter, refuser et noter. Prélever la carte d'un client n'en fait pas
  // partie : ce contrôle-là se fait ici, faute de pouvoir distinguer les
  // colonnes dans une politique.
  if (!peutGerer(await roleSur(restaurantId))) {
    return {
      error: "Seul le gérant ou le propriétaire peut débiter une caution.",
    };
  }
  const { supabase, ligne } = await chargerCaution(restaurantId, reservationId);

  if (!ligne || !ligne.caution_centimes) {
    return { error: "Cette réservation n'a pas de caution." };
  }
  if (ligne.caution_statut !== "enregistree") {
    return {
      error:
        ligne.caution_statut === "debitee"
          ? "Cette caution a déjà été débitée."
          : "Aucune carte n'est enregistrée pour cette réservation.",
    };
  }
  if (!ligne.stripe_customer_id || !ligne.stripe_payment_method_id) {
    return { error: "La carte enregistrée est introuvable." };
  }

  const demande = enCentimes(texte(formData.get("montant")));
  const { centimes, erreur } = montantDebitable(
    demande ?? 0,
    ligne.caution_centimes,
  );
  if (erreur) return { error: erreur };

  const { data: connexion } = await supabase
    .from("restaurant_stripe_connexions")
    .select("stripe_account_id")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  const compte = (connexion as { stripe_account_id: string } | null)
    ?.stripe_account_id;
  if (!compte) {
    return { error: "Ton compte Stripe n'est plus relié." };
  }

  const resultat = await debiterCaution({
    compteStripe: compte,
    customerId: ligne.stripe_customer_id,
    carteId: ligne.stripe_payment_method_id,
    centimes,
    intitule: `Caution — ${ligne.client_nom}`,
    reservationId: ligne.id,
  });

  if (!resultat.ok) return { error: resultat.message };

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({
      caution_statut: "debitee",
      caution_debitee_centimes: centimes,
      stripe_payment_intent_id: resultat.paymentIntentId,
    })
    .eq("id", ligne.id);
  if (error) {
    console.error("[debiter]", error);
    // L'argent est prélevé : le dire est plus utile que de laisser croire
    // que rien ne s'est passé.
    return {
      error:
        "Le prélèvement a réussi mais n'a pas pu être enregistré. Vérifie ton tableau de bord Stripe avant de recommencer.",
    };
  }

  rafraichir(restaurantId);
  return { error: null };
}

/**
 * Libère la caution : rien à faire chez Stripe, puisque rien n'était bloqué.
 * On l'inscrit tout de même, pour que le restaurateur voie qu'il a tranché et
 * ne reste pas avec une carte « en attente » sur un service déjà passé.
 */
export async function libererCaution(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const reservationId = formData.get("reservation_id") as string;
  if (!peutGerer(await roleSur(restaurantId))) return;
  const { supabase, ligne } = await chargerCaution(restaurantId, reservationId);
  if (!ligne || ligne.caution_statut === "debitee") return;

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({ caution_statut: "liberee" })
    .eq("id", ligne.id);
  if (error) console.error("[libererCaution]", error);

  rafraichir(restaurantId);
}

export type ConfirmationState = { error: string | null; ok: boolean };

/**
 * Le réglage de confirmation, et l'adresse qui reçoit les réservations.
 *
 * Passe par le client utilisateur, pas le client de service : c'est la
 * politique de sécurité de la base qui vérifie que ce restaurant est bien
 * le sien, pas une condition écrite ici qu'on pourrait oublier.
 */
export async function enregistrerConfirmation(
  _prevState: ConfirmationState,
  formData: FormData,
): Promise<ConfirmationState> {
  const restaurantId = texte(formData.get("restaurant_id"));
  const auto = formData.get("confirmation_auto") === "on";
  const delai = Number(texte(formData.get("confirmation_auto_delai_heures")));
  const email = texte(formData.get("email_contact"));

  if (!Number.isInteger(delai) || delai < 0 || delai > 336) {
    return { error: "Le délai doit être un nombre d'heures, entre 0 et 336.", ok: false };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Cette adresse e-mail ne semble pas valide.", ok: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({
      confirmation_auto: auto,
      confirmation_auto_delai_heures: delai,
      email_contact: email || null,
    })
    .eq("id", restaurantId);

  if (error) {
    console.error("[enregistrerConfirmation]", error);
    return { error: "L'enregistrement a échoué. Réessaie dans un instant.", ok: false };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations/configuration`);
  return { error: null, ok: true };
}

/**
 * Constate — ou retire — l'absence d'un client.
 *
 * Passe par la session : c'est la RLS qui vérifie que la réservation est
 * bien dans un restaurant qu'on gère. Et le constat porte l'identifiant
 * de qui l'a coché, parce qu'en brigade « ils ne sont jamais venus » se
 * discute le lendemain.
 */
export async function constaterAbsence(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const reservationId = texte(formData.get("reservation_id"));
  const restaurantId = texte(formData.get("restaurant_id"));
  // Le bouton dit ce qu'il fait : cocher, ou décocher.
  const retirer = formData.get("retirer") === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("restaurant_reservations")
    .select("id, date_reservation, statut, absence_constatee_le")
    .eq("id", reservationId)
    .maybeSingle();

  const reservation = data as (ReservationAbsence & { id: string }) | null;
  if (!reservation) {
    return { error: "Cette réservation n'existe plus." };
  }

  // Retirer un constat ne se refuse jamais : on a pu cocher à tort, et un
  // constat qu'on ne peut pas défaire serait un piège.
  if (!retirer) {
    const verdict = peutConstaterAbsence(reservation, new Date());
    if (!verdict.possible) return { error: verdict.motif };
  }

  const { error } = await supabase
    .from("restaurant_reservations")
    .update({
      absence_constatee_le: retirer ? null : new Date().toISOString(),
      absence_constatee_par: retirer ? null : (user?.id ?? null),
    })
    .eq("id", reservationId);

  if (error) {
    console.error("[constaterAbsence]", error);
    return {
      error: retirer
        ? "Le retrait du constat a échoué. Réessaie dans un instant."
        : "Le constat n'a pas pu être enregistré. Réessaie dans un instant.",
    };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null };
}

/** En deçà, on refuse de relancer : trois messages en dix minutes agacent. */
const DELAI_RELANCE_MINUTES = 30;

/**
 * Renvoie au client le lien de paiement de sa réservation.
 *
 * Geste délibéré du restaurateur, donc pas soumis au garde-fou du premier
 * envoi : on relance parce qu'on a constaté que rien n'arrivait. Mais
 * pas plus d'une fois par demi-heure — un client relancé trois fois en
 * dix minutes ne paie pas plus vite, il bloque l'expéditeur.
 */
export async function relancerPaiement(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const reservationId = texte(formData.get("reservation_id"));
  const restaurantId = texte(formData.get("restaurant_id"));

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_reservations")
    .select("*")
    .eq("id", reservationId)
    .maybeSingle();

  const reservation = data as ReservationComplete | null;
  if (!reservation) return { error: "Cette réservation n'existe plus." };
  if (!reservation.paiement_token) {
    return { error: "Cette réservation n'attend aucun paiement." };
  }

  const derniere = reservation.derniere_relance_le
    ? new Date(reservation.derniere_relance_le).getTime()
    : 0;
  if (Date.now() - derniere < DELAI_RELANCE_MINUTES * 60 * 1000) {
    return {
      error: `Tu viens de relancer ce client. Laisse-lui au moins ${DELAI_RELANCE_MINUTES} minutes.`,
    };
  }

  const espaceResult = await supabase
    .from("restaurant_espaces")
    .select("*")
    .eq("id", reservation.espace_id)
    .maybeSingle();
  const espace = espaceResult.data as Espace | null;
  if (!espace) return { error: "L'espace de cette réservation a été supprimé." };

  // Le montant vient de la réservation, pas de l'espace : c'est celui qui
  // a été figé à l'acceptation, et donc celui que le client a déjà lu.
  const centimes =
    (reservation as unknown as { acompte_centimes: number | null })
      .acompte_centimes ||
    (reservation as unknown as { caution_centimes: number | null })
      .caution_centimes;
  if (!centimes) return { error: "Aucun montant n'est attendu." };

  const envoi = await contexteCourriel(reservation);
  if (!envoi) {
    return { error: "Ce client n'a pas laissé d'adresse e-mail." };
  }

  const resultat = await envoyerLienDePaiement({
    supabase: envoi.service,
    reservationId: reservation.id,
    contexte: envoi.contexte,
    destinataire: envoi.destinataire,
    repondreA: envoi.repondreA,
    lien: `${siteUrl()}/paiement/${reservation.paiement_token}`,
    garantie: {
      montant: `${(centimes / 100).toLocaleString("fr-FR")} €`,
      caution:
        !(reservation as unknown as { acompte_centimes: number | null })
          .acompte_centimes,
      echeance: echeanceLisible(reservation.option_expire_le),
    },
    unique: false,
  });

  if (!resultat.envoye) {
    return {
      error:
        resultat.erreur === "Envoi non configuré."
          ? "L'envoi d'e-mails n'est pas encore configuré. Copie le lien et envoie-le toi-même."
          : "La relance n'est pas partie. Réessaie dans un instant.",
    };
  }

  await envoi.service
    .from("restaurant_reservations")
    .update({ derniere_relance_le: new Date().toISOString() })
    .eq("id", reservation.id);

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  return { error: null };
}

/**
 * Corrige les coordonnées du client.
 *
 * Une adresse mal saisie — par le client sur son téléphone, ou par le
 * restaurateur qui prend une réservation au comptoir pendant le service —
 * rend la réservation muette : la confirmation part dans le vide, le devis
 * aussi, et personne ne s'en aperçoit avant le jour dit. Jusqu'ici, rien
 * ne permettait de la rattraper.
 *
 * Ce qui a déjà été envoyé ne se renvoie pas tout seul pour autant : un
 * genre de courriel ne part qu'une fois par réservation. Un devis, lui, se
 * renvoie autant de fois qu'il le faut.
 */
export async function corrigerCoordonnees(
  _prevState: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const reservationId = (formData.get("reservation_id") as string)?.trim();
  const restaurantId = (formData.get("restaurant_id") as string)?.trim();
  const nom = texte(formData.get("client_nom"));
  const email = texte(formData.get("client_email")).toLowerCase();
  const telephone = texte(formData.get("client_telephone"));

  if (!reservationId || !restaurantId) {
    return { error: "Réservation introuvable." };
  }
  if (!nom) return { error: "Le nom ne peut pas être vide." };
  // La colonne n'accepte pas de vide, et une réservation sans adresse ne
  // pourrait plus rien recevoir : on refuse plutôt que d'effacer.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Cette adresse e-mail ne semble pas valide." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_reservations")
    .update({
      client_nom: nom,
      client_email: email,
      client_telephone: telephone || null,
    })
    .eq("id", reservationId)
    // Le carnet d'un autre établissement ne se corrige pas d'ici, même
    // avec un identifiant emprunté.
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("[corrigerCoordonnees]", error);
    return { error: "La correction n'a pas pu être enregistrée." };
  }

  revalidatePath(`/dashboard/${restaurantId}/reservations`);
  revalidatePath(`/dashboard/${restaurantId}/service`);
  return { error: null };
}
