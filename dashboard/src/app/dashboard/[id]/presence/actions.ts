"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { estPlateforme, estStatut } from "@/lib/presence/plateformes";

/**
 * Ce que le restaurateur a constaté sur une plateforme.
 *
 * Les boutons d'une carte envoient le même formulaire : celui qui a été
 * cliqué porte le statut. « Pas vérifiée » n'est pas un statut qu'on
 * choisit : c'est l'absence de ligne, et le bouton « Effacer » la rétablit.
 *
 * Depuis le mode guidé, on y retourne, la plateforme ajoutée aux
 * « passées » : « à terminer plus tard » la laisse dans la file, et sans
 * ça le guide la reproposerait aussitôt.
 */
export async function majPresence(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const plateforme = String(formData.get("plateforme") ?? "");
  const statut = formData.get("statut");
  const retour = formData.get("retour");

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

  if (retour === "guide") {
    const passees = String(formData.get("passees") ?? "")
      .split(",")
      .filter(estPlateforme);
    if (!passees.includes(plateforme)) passees.push(plateforme);
    redirect(
      `/dashboard/${restaurantId}/presence/guide?passees=${passees.join(",")}`,
    );
  }
}

export async function enregistrerUrlPresence(formData: FormData) {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const plateforme = String(formData.get("plateforme") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!restaurantId || !estPlateforme(plateforme)) return;
  await exiger(restaurantId, "gerant");
  if (url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
    } catch { return; }
  }
  const supabase = await createClient();
  const { data: restaurant, error: lectureError } = await supabase
    .from("restaurants")
    .select("presence_urls")
    .eq("id", restaurantId)
    .maybeSingle();
  if (lectureError) {
    console.error("[presence/url] lecture", lectureError.message);
    redirect(`/dashboard/${restaurantId}/presence?presence=erreur`);
  }
  const urls = (restaurant?.presence_urls ?? {}) as Record<string, string>;
  if (url) urls[plateforme] = url;
  else delete urls[plateforme];
  const { error } = await supabase
    .from("restaurants")
    .update({ presence_urls: urls })
    .eq("id", restaurantId);
  if (error) console.error("[presence/url]", error.message);
  if (error) {
    redirect(`/dashboard/${restaurantId}/presence?presence=erreur`);
  }
  revalidatePath(`/dashboard/${restaurantId}/presence`);
  redirect(`/dashboard/${restaurantId}/presence?presence=ok`);
}
