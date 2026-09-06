"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addMenuItem(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const categorie = (formData.get("categorie") as string).trim();
  const nom = (formData.get("nom") as string).trim();
  const description = (formData.get("description") as string).trim();
  const prixRaw = (formData.get("prix") as string).trim();

  if (!categorie || !nom) return;

  const supabase = await createClient();
  await supabase.from("restaurant_menu_items").insert({
    restaurant_id: restaurantId,
    categorie,
    nom,
    description: description || null,
    prix: prixRaw ? Number(prixRaw) : null,
  });

  revalidatePath(`/dashboard/${restaurantId}/menu`);
}

export async function removeMenuItem(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  await supabase.from("restaurant_menu_items").delete().eq("id", id);

  revalidatePath(`/dashboard/${restaurantId}/menu`);
}
