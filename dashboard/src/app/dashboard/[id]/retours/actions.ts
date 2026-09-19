"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";

export async function marquerTraite(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const retourId = String(formData.get("retour_id") ?? "");
  const traite = String(formData.get("traite") ?? "") === "1";
  if (!restaurantId || !retourId) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurant_retours")
    .update({ traite })
    .eq("id", retourId)
    .eq("restaurant_id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/retours`);
}
