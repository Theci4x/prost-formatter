"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

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
