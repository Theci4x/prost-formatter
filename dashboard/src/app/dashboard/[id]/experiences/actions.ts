"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { peutGerer, roleSur } from "@/lib/equipe/roles";
import {
  EXPERIENCE_VIDE,
  type ExperienceValeurs,
} from "@/types/experience";

export type ExperienceState = {
  error: string | null;
  rendu: number;
  valeurs: ExperienceValeurs;
};

function texte(valeur: FormDataEntryValue | null): string {
  return ((valeur as string | null) ?? "").trim();
}

/** Un montant en euros saisi à la main, rendu en centimes. */
function enCentimes(brut: string): number | null {
  if (!brut) return null;
  const propre = brut.replace(/[\s  €]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return null;
  const centimes = Math.round(Number(propre) * 100);
  return centimes > 0 ? centimes : null;
}

function entierPositif(brut: string): number | null {
  if (!brut) return null;
  const n = Number(brut);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function ajouterExperience(
  prevState: ExperienceState,
  formData: FormData,
): Promise<ExperienceState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const valeurs: ExperienceValeurs = {
    nom: texte(formData.get("nom")),
    description: texte(formData.get("description")),
    prix: texte(formData.get("prix")),
    places: texte(formData.get("places")),
    duree: texte(formData.get("duree")),
    jours: formData
      .getAll("jours")
      .map((jour) => Number(jour))
      .filter((jour) => jour >= 1 && jour <= 7),
    heure: texte(formData.get("heure")),
    dateDebut: texte(formData.get("date_debut")),
    dateFin: texte(formData.get("date_fin")),
    delai: texte(formData.get("delai_heures")),
    prepaiement: formData.get("prepaiement") === "on",
  };
  const rendu = prevState.rendu + 1;
  const echec = (error: string): ExperienceState => ({ error, rendu, valeurs });

  if (!peutGerer(await roleSur(restaurantId))) {
    return echec("Seul le gérant ou le propriétaire peut créer une expérience.");
  }

  if (!valeurs.nom) return echec("Donne un nom à cette expérience.");
  const prix = enCentimes(valeurs.prix);
  if (!prix) {
    return echec("Indique un prix par personne, en euros — par exemple 38.");
  }
  const places = entierPositif(valeurs.places);
  if (!places) return echec("Indique le nombre de places par séance.");
  if (valeurs.jours.length === 0) {
    return echec("Choisis au moins un jour de la semaine.");
  }
  if (!/^\d{2}:\d{2}/.test(valeurs.heure)) {
    return echec("Indique l'heure de la séance.");
  }
  // Une période à l'envers ne produirait aucune séance, sans rien dire.
  if (
    valeurs.dateDebut &&
    valeurs.dateFin &&
    valeurs.dateFin < valeurs.dateDebut
  ) {
    return echec("La date de fin est antérieure à la date de début.");
  }
  const duree = valeurs.duree ? entierPositif(valeurs.duree) : null;
  if (valeurs.duree && !duree) {
    return echec("La durée doit être un nombre de minutes.");
  }
  const delai = valeurs.delai === "" ? 0 : Number(valeurs.delai);
  if (!Number.isInteger(delai) || delai < 0) {
    return echec("Le délai doit être un nombre d'heures, 0 compris.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("restaurant_experiences").insert({
    restaurant_id: restaurantId,
    nom: valeurs.nom,
    description: valeurs.description || null,
    prix_centimes: prix,
    places,
    duree_minutes: duree,
    jours: valeurs.jours,
    heure: valeurs.heure,
    date_debut: valeurs.dateDebut || null,
    date_fin: valeurs.dateFin || null,
    delai_heures: delai,
    prepaiement: valeurs.prepaiement,
  });

  if (error) {
    console.error("[ajouterExperience]", error);
    return echec("L'enregistrement a échoué. Réessaie dans un instant.");
  }

  revalidatePath(`/dashboard/${restaurantId}/experiences`);
  return { error: null, rendu, valeurs: EXPERIENCE_VIDE };
}

/**
 * Arrête ou relance une expérience. On ne la supprime pas : les places déjà
 * vendues doivent rester lisibles, et un atelier saisonnier se rallume.
 */
export async function basculerExperience(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const experienceId = formData.get("experience_id") as string;
  const actif = formData.get("actif") === "1";
  if (!peutGerer(await roleSur(restaurantId))) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_experiences")
    .update({ actif, updated_at: new Date().toISOString() })
    .eq("id", experienceId)
    .eq("restaurant_id", restaurantId);
  if (error) console.error("[basculerExperience]", error);

  revalidatePath(`/dashboard/${restaurantId}/experiences`);
}

export async function annulerPlace(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const reservationId = formData.get("reservation_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurant_experience_reservations")
    .update({ statut: "annulee", updated_at: new Date().toISOString() })
    .eq("id", reservationId)
    .eq("restaurant_id", restaurantId);
  if (error) console.error("[annulerPlace]", error);

  revalidatePath(`/dashboard/${restaurantId}/experiences`);
}
