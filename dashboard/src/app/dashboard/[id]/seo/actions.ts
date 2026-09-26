"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import { etatSearchConsole } from "@/lib/google/requetes-restaurant";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { SEO } from "@/lib/i18n/seo";

export async function addKeyword(formData: FormData) {
  const restaurantId = formData.get("restaurant_id") as string;
  const keyword = (formData.get("keyword") as string).trim();
  if (!keyword) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurant_keywords")
    .insert({ restaurant_id: restaurantId, keyword });

  revalidatePath(`/dashboard/${restaurantId}/seo`);
}

export async function removeKeyword(formData: FormData) {
  const id = formData.get("id") as string;
  const restaurantId = formData.get("restaurant_id") as string;

  await exiger(restaurantId, "gerant");

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

export type Analyse = {
  analysis: string;
  /** Quand elle a été produite, au format ISO. */
  analyseLe: string;
  /** Les mots-clés sur lesquels elle porte, au moment où elle est faite. */
  motsCles: string[];
};

export type AnalyzeResult = Analyse | { error: string };

export async function analyzeKeywords(
  restaurantId: string,
): Promise<AnalyzeResult> {
  // Une action serveur s'appelle sans passer par l'écran qui la propose.
  // Celle-ci interroge un modèle, donc elle coûte : sans cette ligne,
  // n'importe quel compte relié peut faire dépenser un établissement qui
  // n'est pas le sien.
  await exiger(restaurantId, "gerant");
  // L'analyse s'écrit dans la langue de l'écran : un gérant qui lit le
  // tableau de bord en chinois la lit en chinois.
  const t = SEO[await langueUtilisateur()];

  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("nom, adresse, search_console_site, slug_reservation")
    .eq("id", restaurantId)
    .maybeSingle();

  const restaurant = restaurantData as {
    nom: string;
    adresse: string | null;
    search_console_site: string | null;
    slug_reservation: string | null;
  } | null;

  if (!restaurant) {
    return { error: t.erreurIntrouvable };
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
    restaurant.slug_reservation,
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
        `la restauration. Réponds ${t.langueAnalyse}, de façon concise et ` +
        "actionnable. Les requêtes et mots-clés cités restent tels quels.",
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
    const analysis = textBlock?.text ?? "";

    // Rangée tout de suite, avec les mots-clés sur lesquels elle porte.
    // Une analyse qui ne vit que dans l'écran se perd au premier
    // rechargement, et se repaie pour le même texte.
    const analyseLe = new Date().toISOString();
    if (analysis) {
      await supabase
        .from("restaurants")
        .update({
          seo_analyse: analysis,
          seo_analyse_le: analyseLe,
          seo_analyse_mots_cles: keywords,
        })
        .eq("id", restaurantId);
      revalidatePath(`/dashboard/${restaurantId}/seo`);
    }

    return { analysis, analyseLe, motsCles: keywords };
  } catch (err) {
    console.error("[analyzeKeywords]", err);
    return { error: t.erreurAnalyse };
  }
}
