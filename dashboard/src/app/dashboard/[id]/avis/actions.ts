"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exiger } from "@/lib/equipe/roles";
import {
  searchTripadvisorLocations,
  type TripadvisorLocation,
} from "@/lib/reviews/tripadvisor";

export type DraftState = {
  draft: string | null;
  error: string | null;
  // Incrémenté à chaque proposition : le champ de saisie s'en sert comme clé
  // React pour repartir du nouveau texte, y compris quand Claude renvoie mot
  // pour mot la proposition précédente.
  version: number;
};

export async function draftReply(
  prevState: DraftState,
  formData: FormData,
): Promise<DraftState> {
  const version = prevState.version + 1;
  const restaurantId = formData.get("restaurant_id") as string;
  const author = (formData.get("author") as string) ?? "";
  const rating = Number(formData.get("rating") ?? 0);
  const text = (formData.get("text") as string) ?? "";

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      draft: null,
      error:
        "La rédaction automatique nécessite une clé d'API Anthropic, pas encore configurée.",
      version,
    };
  }

  const supabase = await createClient();
  // La RLS garantit que ce restaurant appartient bien à l'utilisateur
  // connecté : sans ça, n'importe qui pourrait faire rédiger des réponses
  // au nom d'un établissement qui n'est pas le sien.
  const { data } = await supabase
    .from("restaurants")
    .select("nom")
    .eq("id", restaurantId)
    .maybeSingle();

  const restaurant = data as { nom: string } | null;
  if (!restaurant) {
    return { draft: null, error: "Restaurant introuvable.", version };
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 600,
      system:
        "Tu écris la réponse publique d'un restaurateur à un avis client. " +
        "Ton chaleureux et professionnel, en français, à la première " +
        "personne du pluriel. Trois à cinq phrases maximum. Remercie, " +
        "reprends un détail précis de l'avis pour montrer qu'il a été lu, " +
        "et sur un avis négatif reconnais le problème et propose de " +
        "poursuivre en privé. N'invente aucun fait, ne promets pas de geste " +
        "commercial. Réponds uniquement par le texte de la réponse.",
      messages: [
        {
          role: "user",
          content:
            `Restaurant : "${restaurant.nom}".\n` +
            `Avis de ${author || "un client"}, noté ${rating}/5 :\n\n${text}`,
        },
      ],
    });

    const draft = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return { draft, error: null, version };
  } catch (err) {
    console.error("[draftReply]", err);
    return {
      draft: null,
      error: "La rédaction a échoué. Réessaie dans un instant.",
      version,
    };
  }
}

/**
 * La confirmation de l'établissement Tripadvisor.
 *
 * Klarr devine — nom plus adresse — et le restaurateur tranche. La
 * devinette suffit la plupart du temps et ne demande rien à personne ;
 * ces deux actions n'existent que pour le jour où elle se trompe. Ce
 * jour-là, sans elles, il n'y avait rien à faire : l'écran annonçait les
 * avis d'un homonyme, ou aucun, et c'était sans appel.
 */

export type RechercheState = {
  candidats: TripadvisorLocation[] | null;
  error: string | null;
};

export async function chercherSurTripadvisor(
  _prevState: RechercheState,
  formData: FormData,
): Promise<RechercheState> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const requete = String(formData.get("requete") ?? "").trim();

  if (!restaurantId) return { candidats: null, error: "Établissement inconnu." };
  if (requete.length < 3) {
    return { candidats: null, error: "Donne au moins trois caractères." };
  }

  await exiger(restaurantId, "gerant");

  try {
    const candidats = await searchTripadvisorLocations(requete);
    if (candidats.length === 0) {
      return {
        candidats: [],
        error: "Aucun établissement trouvé. Essaie en ajoutant la ville.",
      };
    }
    return { candidats, error: null };
  } catch (erreur) {
    console.error("[avis/chercherSurTripadvisor]", erreur);
    return {
      candidats: null,
      error: "Tripadvisor n'a pas répondu. Réessaie dans un instant.",
    };
  }
}

export async function epinglerTripadvisor(formData: FormData): Promise<void> {
  const restaurantId = String(formData.get("restaurant_id") ?? "");
  const locationId = String(formData.get("location_id") ?? "").trim();
  if (!restaurantId) return;

  await exiger(restaurantId, "gerant");

  const supabase = await createClient();
  await supabase
    .from("restaurants")
    // Une chaîne vide détache : le restaurateur revient à la recherche
    // automatique s'il s'est trompé en confirmant.
    .update({ tripadvisor_location_id: locationId || null })
    .eq("id", restaurantId);

  revalidatePath(`/dashboard/${restaurantId}/avis`);
}
