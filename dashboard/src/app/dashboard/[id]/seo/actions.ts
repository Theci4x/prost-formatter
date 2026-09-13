"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

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

export type AnalyzeResult = { analysis: string } | { error: string };

export async function analyzeKeywords(
  restaurantId: string,
): Promise<AnalyzeResult> {
  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("nom, adresse")
    .eq("id", restaurantId)
    .maybeSingle();

  const restaurant = restaurantData as {
    nom: string;
    adresse: string | null;
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
            "Analyse la pertinence de ces mots-clés pour le référencement " +
            "local, signale ceux qui sont trop génériques ou peu utiles, et " +
            "propose 5 à 10 mots-clés supplémentaires pertinents (variations " +
            "locales, type de cuisine, occasions, etc.).",
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
