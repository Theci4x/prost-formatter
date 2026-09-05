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
