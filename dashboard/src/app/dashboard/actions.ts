"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RestaurantFormState = {
  error: string | null;
};

export async function createRestaurant(
  _prevState: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const nom = formData.get("nom") as string;
  const adresse = formData.get("adresse") as string;

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

  const supabase = await createClient();

  // La RLS ("restaurants_update_own") garantit qu'on ne peut modifier que
  // ses propres restaurants, meme si l'id est manipule.
  const { error } = await supabase
    .from("restaurants")
    .update({ nom, adresse: adresse || null })
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
