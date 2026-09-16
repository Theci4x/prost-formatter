"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { etatSearchConsole } from "@/lib/google/requetes-restaurant";

export async function addKeyword(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const keyword = (formData.get("keyword") as string).trim();
  if (!keyword) return;

  const supabase = await createClient();
  await supabase
    .from("restaurant_keywords")
    .insert({ restaurant_id: restaurantId, keyword });

  revalidatePath(`/dashboard/${restaurantId}/seo`);
}

export async function removeKeyword(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  const supabase = await createClient();
  await supabase.from("restaurant_keywords").delete().eq("id", id);

  revalidatePath(`/dashboard/${restaurantId}/seo`);
}

/** Le restaurateur désigne la propriété Search Console à suivre. */
export async function choisirPropriete(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const site = String(formData.get("site") ?? "").trim();
  if (!restaurantId) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurants")
    // Vide = on revient au choix non fait, utile quand le compte Google
    // relié change et que l'ancienne propriété n'existe plus.
    .update({ search_console_site: site || null })
    .eq("id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/seo`);
}

export type AnalyzeResult = { analysis: string } | { error: string };

export async function analyzeKeywords(
  restaurantId: string,
): Promise<AnalyzeResult> {
  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("nom, adresse, search_console_site")
    .eq("id", restaurantId)
    .maybeSingle();

  const restaurant = restaurantData as {
    nom: string;
    adresse: string | null;
    search_console_site: string | null;
  } | null;

  if (!restaurant) {
    return { error: "Restaurant introuvable." };
  }

  const { data: keywordsData } = await supabase
    .from("restaurant_keywords")
    .select("keyword")
    .eq("restaurant_id", restaurantId);

  const keywords = ((keywordsData ?? []) as { keyword: string }[]).map(
    (k) => k.keyword,
  );

  // Les requêtes réellement tapées, quand Search Console est relié. C'est
  // ce qui sépare un conseil d'un constat : sans elles, l'analyse ne peut
  // que gloser sur un nom et une adresse.
  const mesure = await etatSearchConsole(
    supabase,
    restaurantId,
    restaurant.search_console_site,
  );
  const requetesReelles = mesure.requetes
    .slice(0, 20)
    .map(
      (r) =>
        `« ${r.requete} » — ${r.impressions} impressions, ${r.clics} clics, ` +
        `position moyenne ${r.position}`,
    )
    .join("\n");

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2000,
      system:
        "Tu es un consultant en référencement local (SEO) spécialisé dans " +
        "la restauration. Réponds en français, de façon concise et actionnable.",
      messages: [
        {
          role: "user",
          content:
            `Restaurant : "${restaurant.nom}"` +
            (restaurant.adresse ? ` (${restaurant.adresse})` : "") +
            `.\n\nMots-clés actuellement ciblés : ${
              keywords.length > 0 ? keywords.join(", ") : "aucun"
            }.\n\n` +
            (requetesReelles
              ? `Requêtes réellement tapées par ceux qui ont trouvé cet ` +
                `établissement ces quatre dernières semaines, mesurées par ` +
                `Google Search Console :\n${requetesReelles}\n\n`
              : "") +
            "Analyse la pertinence de ces mots-clés pour le référencement " +
            "local, signale ceux qui sont trop génériques ou peu utiles, et " +
            "propose 5 à 10 mots-clés supplémentaires pertinents (variations " +
            "locales, type de cuisine, occasions, etc.)." +
            (requetesReelles
              ? " Appuie-toi sur les chiffres mesurés plutôt que sur des " +
                "suppositions : signale les requêtes où l'établissement " +
                "est vu sans être cliqué, celles où il est proche de la " +
                "première page, et les intentions auxquelles aucun mot-clé " +
                "ciblé ne répond."
              : ""),
        },
      ],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    return { analysis: textBlock?.text ?? "" };
  } catch (err) {
    console.error("[analyzeKeywords]", err);
    return { error: "L'analyse a échoué. Réessaie dans un instant." };
  }
}
