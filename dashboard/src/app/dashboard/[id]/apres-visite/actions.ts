"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";

/** Envoyer la demande d'avis le lendemain, ou plus. */
export async function basculerAvisApresVisite(
  formData: FormData,
): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  if (!restaurantId) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({ avis_apres_visite: formData.get("actif") === "1" })
    .eq("id", restaurantId);
  if (error) console.error("[apres-visite/basculer]", error.message);

  revalidatePath(`/dashboard/${restaurantId}/apres-visite`);
}
