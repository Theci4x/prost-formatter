"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { searchPlace, getPlaceDetails } from "@/lib/google/places";
import { checkWebsite } from "@/lib/audit/website";
import {
  scoreLocalSeo,
  scoreEReputation,
  scoreGeo,
  scoreGlobal,
  scoreLabel,
} from "@/lib/audit/scoring";

export type AuditResult = {
  score: number;
  label: "excellent" | "bon" | "moyen" | "critique";
  pillars: { localSeo: number; eReputation: number; geo: number };
  summary: string;
};

export type ProspectFormState = {
  status: "idle" | "success" | "error";
  error?: "missing" | "generic";
  audit?: AuditResult;
};

async function generateSummary(signals: unknown): Promise<string> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 1200,
    system:
      "Tu es consultant en visibilité locale pour restaurants. On te donne " +
      "des données brutes d'audit (scores sur 100 et signaux détaillés). " +
      "Rédige, en français : un commentaire court sur le score global, puis " +
      "3 à 5 recommandations concrètes et priorisées. Sois direct, concis " +
      "et actionnable, sans jargon.",
    messages: [
      { role: "user", content: JSON.stringify(signals) },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  return textBlock?.text ?? "";
}

async function runAudit(
  restaurantName: string,
  ville: string,
  prospectId: string,
): Promise<AuditResult | undefined> {
  const supabase = await createClient();

  try {
    const place = await searchPlace(`${restaurantName} ${ville}`);
    if (!place) {
      await supabase.from("visibility_audits").insert({
        prospect_id: prospectId,
        restaurant_name: restaurantName,
        ville,
        error: "Établissement introuvable sur Google Maps",
      });
      return undefined;
    }

    const details = await getPlaceDetails(place.id);
    const website = await checkWebsite(details.websiteUri);

    const localSeo = scoreLocalSeo(details);
    const eReputation = scoreEReputation(details);
    const geo = scoreGeo(website);
    const global = scoreGlobal(localSeo, eReputation, geo);

    const signals = {
      restaurant: details.displayName,
      adresse: details.formattedAddress,
      note: details.rating,
      nombreAvis: details.userRatingCount,
      photos: details.photoCount,
      siteWeb: details.websiteUri,
      siteAccessible: website.reachable,
      donneesStructurees: website.hasJsonLd,
      liensReseauxSociaux: website.hasSameAs,
      scores: { localSeo, eReputation, geo, global },
    };

    // La synthèse Claude est un plus : si elle échoue, on garde quand même
    // les scores calculés plutôt que de perdre tout l'audit.
    let summary = "";
    try {
      summary = await generateSummary(signals);
    } catch (err) {
      console.error("[generateSummary]", err);
    }

    await supabase.from("visibility_audits").insert({
      prospect_id: prospectId,
      restaurant_name: restaurantName,
      ville,
      google_place_id: place.id,
      local_seo_score: localSeo,
      e_reputation_score: eReputation,
      geo_score: geo,
      global_score: global,
      summary,
      raw_signals: signals,
    });

    return {
      score: global,
      label: scoreLabel(global),
      pillars: { localSeo, eReputation, geo },
      summary,
    };
  } catch (err) {
    // L'audit est un bonus : s'il échoue (clé API manquante, service
    // indisponible...), on garde quand même le lead et on retombe sur le
    // message de remerciement classique plutôt que de casser le formulaire.
    console.error("[runAudit]", err);
    return undefined;
  }
}

export async function submitProspect(
  _prevState: ProspectFormState,
  formData: FormData,
): Promise<ProspectFormState> {
  const prenom = (formData.get("prenom") as string)?.trim();
  const nom = (formData.get("nom") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const telephone = (formData.get("telephone") as string)?.trim();
  const entreprise = (formData.get("entreprise") as string)?.trim();
  const ville = (formData.get("ville") as string)?.trim();

  if (!prenom || !nom || !email || !telephone || !entreprise || !ville) {
    return { status: "error", error: "missing" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prospects")
    .insert({ prenom, nom, email, telephone, entreprise, ville })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[submitProspect]", error);
    return { status: "error", error: "generic" };
  }

  const audit = await runAudit(entreprise, ville, data.id as string);

  return { status: "success", audit };
}
