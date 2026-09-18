"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { runVisibilityChecks } from "@/lib/ai-visibility/check";
import {
  CONSIGNE_INTENTION,
  INTENTIONS,
  estIntention,
  type Intention,
} from "@/lib/ai-visibility/intentions";
import { etatSearchConsole } from "@/lib/google/requetes-restaurant";

/**
 * Ce que rend une action lente.
 *
 * Analyser et proposer prennent des dizaines de secondes et peuvent
 * échouer — clé refusée, quota, assistant muet. Sans état rendu, l'échec
 * ne partait que dans le journal du serveur : la page se rechargeait
 * inchangée et le bouton passait pour cassé.
 */
export type AnalyseState = { error: string | null };

const RIEN_A_SIGNALER: AnalyseState = { error: null };

async function getOwnedRestaurant(restaurantId: string) {
  const supabase = await createClient();
  // La RLS garantit qu'on ne récupère le restaurant que s'il appartient à
  // l'utilisateur connecté.
  const { data } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, search_console_site")
    .eq("id", restaurantId)
    .maybeSingle();

  return {
    supabase,
    restaurant: data as {
      id: string;
      nom: string;
      adresse: string | null;
      search_console_site: string | null;
    } | null,
  };
}

export async function addQuestion(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const question = ((formData.get("question") as string) ?? "").trim();
  if (!question) return;

  // Le formulaire propose toujours les trois choix ; la découverte reste le
  // repli, c'est l'intention la plus large et la moins engageante à corriger.
  const brute = (formData.get("intention") as string) ?? "";
  const intention: Intention = estIntention(brute) ? brute : "decouverte";

  const supabase = await createClient();
  // ignoreDuplicates génère un ON CONFLICT DO NOTHING : sans lui, PostgREST
  // produit un DO UPDATE, qui exige en plus une policy UPDATE que la table
  // n'a pas — l'ajout échouait alors silencieusement.
  const { error } = await supabase
    .from("ai_visibility_questions")
    .upsert(
      { restaurant_id: restaurantId, question, intention },
      { onConflict: "restaurant_id,question", ignoreDuplicates: true },
    );

  if (error) console.error("[addQuestion]", error);

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
}

export async function removeQuestion(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const questionId = formData.get("question_id") as string;

  const supabase = await createClient();
  const { error } = await supabase
    .from("ai_visibility_questions")
    .delete()
    .eq("id", questionId);

  if (error) console.error("[removeQuestion]", error);

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
}

// Une analyse = un appel court, lancé question par question, pour rester dans
// le temps d'exécution d'une fonction serveur.
export async function analyzeQuestion(
  _prev: AnalyseState,
  formData: FormData,
): Promise<AnalyseState> {
  const restaurantId = formData.get("restaurant_id") as string;
  const questionId = formData.get("question_id") as string;

  const { supabase, restaurant } = await getOwnedRestaurant(restaurantId);
  if (!restaurant) return { error: "Établissement introuvable." };

  const { data: questionData } = await supabase
    .from("ai_visibility_questions")
    .select("id, question")
    .eq("id", questionId)
    .maybeSingle();

  const questionRow = questionData as { id: string; question: string } | null;
  if (!questionRow) return { error: "Question introuvable." };

  try {
    const results = await runVisibilityChecks({
      question: questionRow.question,
      restaurantName: restaurant.nom,
    });

    // Zéro résultat n'est pas un succès silencieux : tous les assistants
    // ont échoué, et c'est précisément le cas qui donnait un bouton muet.
    if (results.length === 0) {
      return {
        error: "Aucun assistant n'a répondu. Réessaie dans un instant.",
      };
    }

    const { error } = await supabase.from("ai_visibility_checks").insert(
      results.map((result) => ({
        question_id: questionRow.id,
        restaurant_id: restaurantId,
        fournisseur: result.fournisseur,
        modele: result.modele,
        est_cite: result.estCite,
        rang: result.rang,
        concurrents: result.concurrents,
        reponse: result.reponse,
      })),
    );
    if (error) {
      console.error("[analyzeQuestion] insertion", error);
      return { error: "L'analyse a abouti mais n'a pas pu être enregistrée." };
    }
  } catch (err) {
    console.error("[analyzeQuestion]", err);
    return { error: "L'analyse a échoué. Réessaie dans un instant." };
  }

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
  return RIEN_A_SIGNALER;
}

// Transforme ce qu'on sait déjà du restaurant en questions telles qu'un
// client les poserait à une IA. Les questions sont seulement enregistrées :
// c'est le bouton "Analyser" qui déclenche ensuite l'analyse.
//
// Deux sources, et la seconde fait toute la différence. Les mots-clés sont
// ce que le restaurateur croit qu'on tape ; les requêtes Search Console sont
// ce qu'on a réellement tapé pour le trouver. Suivre des mots-clés, tout le
// monde le propose — Malou, Nimt, Semrush. Partir des requêtes mesurées de
// l'établissement, il faut son compte Google relié, et c'est ce que Klarr a.
export async function suggestQuestions(
  _prev: AnalyseState,
  formData: FormData,
): Promise<AnalyseState> {
  const restaurantId = formData.get("restaurant_id") as string;

  const { supabase, restaurant } = await getOwnedRestaurant(restaurantId);
  if (!restaurant) return { error: "Établissement introuvable." };

  const { data: keywordsData } = await supabase
    .from("restaurant_keywords")
    .select("keyword")
    .eq("restaurant_id", restaurantId);

  const keywords = ((keywordsData ?? []) as { keyword: string }[]).map(
    (k) => k.keyword,
  );

  // Ne lève jamais : sans compte Google relié, on retombe simplement sur les
  // mots-clés, comme avant.
  const mesure = await etatSearchConsole(
    supabase,
    restaurantId,
    restaurant.search_console_site,
  );
  const requetes = mesure.requetes.slice(0, 15).map((r) => r.requete);

  const parIntention = INTENTIONS.map(
    (intention) => `- ${intention} : ${CONSIGNE_INTENTION[intention]}`,
  ).join("\n");

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1500,
      system:
        "Tu génères des questions telles qu'un client les poserait à une IA " +
        "pour trouver où manger. Réponds uniquement par un tableau JSON " +
        'd\'objets {"question": "...", "intention": "..."}. Aucun autre texte.',
      messages: [
        {
          role: "user",
          content:
            `Restaurant : "${restaurant.nom}"` +
            (restaurant.adresse ? ` (${restaurant.adresse})` : "") +
            `.\nMots-clés suivis : ${
              keywords.length > 0 ? keywords.join(", ") : "aucun"
            }.\n` +
            (requetes.length > 0
              ? `Requêtes réellement tapées par ceux qui l'ont trouvé sur ` +
                `Google ces quatre dernières semaines : ${requetes.join(", ")}.\n`
              : "") +
            `\nTrois intentions possibles :\n${parIntention}\n\n` +
            "Propose deux questions par intention, soit six en tout, " +
            "courtes, en français, sans jamais citer le nom du restaurant, " +
            "telles qu'un client du quartier les poserait.",
        },
      ],
    });

    const raw = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]");
    if (start === -1 || end === -1) {
      return { error: "Réponse inattendue du modèle. Réessaie." };
    }

    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed)) {
      return { error: "Réponse inattendue du modèle. Réessaie." };
    }

    const questions = parsed
      .filter(
        (item): item is { question: string; intention?: string } =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { question?: unknown }).question === "string",
      )
      .slice(0, 9)
      .map((item) => ({
        restaurant_id: restaurantId,
        question: item.question.trim(),
        // Une intention inventée par le modèle ne doit pas faire échouer
        // l'insertion entière sur la contrainte : on retombe au plus large.
        intention:
          item.intention && estIntention(item.intention)
            ? item.intention
            : "decouverte",
      }))
      .filter((item) => item.question.length > 0);

    if (questions.length === 0) {
      return { error: "Le modèle n'a proposé aucune question. Réessaie." };
    }

    const { error } = await supabase
      .from("ai_visibility_questions")
      .upsert(questions, {
        onConflict: "restaurant_id,question",
        ignoreDuplicates: true,
      });
    if (error) {
      console.error("[suggestQuestions] insertion", error);
      return { error: "Les questions n'ont pas pu être enregistrées." };
    }
  } catch (err) {
    console.error("[suggestQuestions]", err);
    return { error: "La proposition a échoué. Réessaie dans un instant." };
  }

  revalidatePath(`/dashboard/${restaurantId}/visibilite-ia`);
  return RIEN_A_SIGNALER;
}
