"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { estPlateforme, estStatut } from "@/lib/presence/plateformes";

/**
 * Ce que le restaurateur a constaté sur une plateforme.
 *
 * Les trois boutons d'une carte envoient le même formulaire : celui qui a
 * été cliqué porte le statut. « Pas vérifiée » n'est pas un statut qu'on
 * choisit : c'est l'absence de ligne, et le bouton « Effacer » la rétablit.
 */
export async function majPresence(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const plateforme = String(formData.get("plateforme") ?? "");
  const statut = formData.get("statut");

  if (!restaurantId || !estPlateforme(plateforme)) return;
  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  const { error } =
    statut === "effacer"
      ? await supabase
          .from("restaurant_presence")
          .delete()
          .eq("restaurant_id", restaurantId)
          .eq("plateforme", plateforme)
      : estStatut(statut)
        ? await supabase.from("restaurant_presence").upsert({
            restaurant_id: restaurantId,
            plateforme,
            statut,
            verifie_le: new Date().toISOString(),
          })
        : { error: null };

  if (error) console.error("[presence/maj]", error.message);
  revalidatePath(`/dashboard/${restaurantId}/presence`);
}
