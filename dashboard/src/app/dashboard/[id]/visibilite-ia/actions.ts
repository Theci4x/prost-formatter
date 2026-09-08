"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { runVisibilityCheck, VISIBILITY_MODEL } from "@/lib/ai-visibility/check";

async function getOwnedRestaurant(restaurantId: string) {
  const supabase = await createClient();
  // La RLS garantit qu'on ne récupère le restaurant que s'il appartient à
  // l'utilisateur connecté.
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, adresse")
    .eq("id", restaurantId)
    .maybeSingle();

  return {
    supabase,
    restaurant: data as { id: string; nom: string; adresse: string | null } | null,
  };
}

export async function addQuestion(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const question = ((formData.get("question") as string) ?? "").trim();
  if (!question) return;

  const supabase = await createClient();
  await supabase
    .from("ai_visibility_questions")
    .upsert(
      { restaurant_id: restaurantId, question },
      { onConflict: "restaurant_id,question" },
    );

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
}

export async function removeQuestion(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const questionId = formData.get("question_id") as string;

  const supabase = await createClient();
  await supabase.from("ai_visibility_questions").delete().eq("id", questionId);

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
}

// Une analyse = un appel court, lancé question par question, pour rester dans
// le temps d'exécution d'une fonction serveur.
export async function analyzeQuestion(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const questionId = formData.get("question_id") as string;

  const { supabase, restaurant } = await getOwnedRestaurant(restaurantId);
  if (!restaurant) return;

  const { data: questionData } = await supabase
    .from("ai_visibility_questions")
    .select("id, question")
    .eq("id", questionId)
    .maybeSingle();

  const questionRow = questionData as { id: string; question: string } | null;
  if (!questionRow) return;

  try {
    const result = await runVisibilityCheck({
      question: questionRow.question,
      restaurantName: restaurant.nom,
    });

    await supabase.from("ai_visibility_checks").insert({
      question_id: questionRow.id,
      restaurant_id: restaurantId,
      modele: VISIBILITY_MODEL,
      est_cite: result.estCite,
      rang: result.rang,
      concurrents: result.concurrents,
      reponse: result.reponse,
    });
  } catch (err) {
    console.error("[analyzeQuestion]", err);
  }

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
}

// Transforme les mots-clés déjà suivis (page SEO) en questions telles qu'un
// client les poserait réellement à une IA. Les questions sont seulement
// enregistrées : c'est le bouton "Analyser" qui déclenche ensuite l'analyse.
export async function suggestQuestions(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;

  const { supabase, restaurant } = await getOwnedRestaurant(restaurantId);
  if (!restaurant) return;

  const { data: keywordsData } = await supabase
    .from("restaurant_keywords")
    .select("keyword")
    .eq("restaurant_id", restaurantId);

  const keywords = ((keywordsData ?? []) as { keyword: string }[]).map(
    (k) => k.keyword,
  );

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: VISIBILITY_MODEL,
      max_tokens: 700,
      system:
        "Tu génères des questions telles qu'un client les poserait à une IA " +
        "pour trouver où manger. Réponds uniquement par un tableau JSON de " +
        'chaînes, par exemple ["Où manger ... ?"]. Aucun autre texte.',
      messages: [
        {
          role: "user",
          content:
            `Restaurant : "${restaurant.nom}"` +
            (restaurant.adresse ? ` (${restaurant.adresse})` : "") +
            `.\nMots-clés suivis : ${
              keywords.length > 0 ? keywords.join(", ") : "aucun"
            }.\n\n` +
            "Propose 5 questions courtes, en français, sans jamais citer le " +
            "nom du restaurant, telles qu'un client du quartier les poserait.",
        },
      ],
    });

    const raw = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) return;

    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed)) return;

    const questions = parsed
      .filter((item): item is string => typeof item === "string")
      .slice(0, 5)
      .map((question) => ({ restaurant_id: restaurantId, question }));

    if (questions.length > 0) {
      await supabase
        .from("ai_visibility_questions")
        .upsert(questions, { onConflict: "restaurant_id,question" });
    }
  } catch (err) {
    console.error("[suggestQuestions]", err);
  }

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
}
