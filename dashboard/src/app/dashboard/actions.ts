"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { JOURS_SEMAINE, type Horaires } from "@/types/restaurant";

export type RestaurantFormState = {
  error: string | null;
};

// Reconstruit l'objet horaires a partir des champs
// `horaire_<jour>_ferme/ouverture/fermeture` soumis par RestaurantForm.
function parseHoraires(formData: FormData): Horaires {
  const horaires: Horaires = {};
  for (const jour of JOURS_SEMAINE) {
    horaires[jour] = {
      ferme: formData.get(`horaire_${jour}_ferme`) === "on",
      ouverture: (formData.get(`horaire_${jour}_ouverture`) as string) || "09:00",
      fermeture: (formData.get(`horaire_${jour}_fermeture`) as string) || "22:00",
    };
  }
  return horaires;
}

export async function createRestaurant(
  _prevState: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const siteWeb = formData.get("site_web") as string;
  const description = formData.get("description") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("restaurants").insert({
    nom,
    adresse: adresse || null,
    telephone: telephone || null,
    site_web: siteWeb || null,
    description: description || null,
    horaires: parseHoraires(formData),
    proprietaire_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateRestaurant(
  _prevState: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const id = formData.get("id") as string;
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;
  const telephone = formData.get("telephone") as string;
  const siteWeb = formData.get("site_web") as string;
  const description = formData.get("description") as string;

  const supabase = await createClient();

  // La RLS ("restaurants_update_own") garantit qu'on ne peut modifier que
  // ses propres restaurants, meme si l'id est manipule.
  const { error } = await supabase
    .from("restaurants")
    .update({
      nom,
      adresse: adresse || null,
      telephone: telephone || null,
      site_web: siteWeb || null,
      description: description || null,
      horaires: parseHoraires(formData),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteRestaurant(formData: FormData) {
  const id = formData.get("id") as string;

  const supabase = await createClient();
  await supabase.from("restaurants").delete().eq("id", id);

  revalidatePath("/dashboard");
}
