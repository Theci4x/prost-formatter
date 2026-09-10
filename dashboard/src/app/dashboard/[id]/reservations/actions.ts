"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ESPACE_VIDE,
  SERVICE_VIDE,
  type EspaceValeurs,
  type ServiceValeurs,
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
  if (valeurs.heureFin <= valeurs.heureDebut) {
    return echec("L'heure de fin doit être après l'heure de début.");
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
