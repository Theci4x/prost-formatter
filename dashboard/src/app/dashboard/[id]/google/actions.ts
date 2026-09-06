"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function disconnectGoogle(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  await supabase
    .from("google_business_connections")
    .delete()
    .eq("restaurant_id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/google`);
}

export async function selectGoogleLocation(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const locationName = formData.get("location_name") as string;
  const locationTitle = formData.get("location_title") as string;

  const supabase = await createClient();
  // La RLS ("gbc_update_own") garantit que seule la connexion du
  // restaurant de l'utilisateur connecté peut être modifiée.
  await supabase
    .from("google_business_connections")
    .update({
      location_name: locationName,
      location_title: locationTitle,
      updated_at: new Date().toISOString(),
    })
    .eq("restaurant_id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/google`);
}
