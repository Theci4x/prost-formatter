import Anthropic from "@anthropic-ai/sdk";

export const VISIBILITY_MODEL = "claude-opus-5";

export type VisibilityResult = {
  reponse: string;
  estCite: boolean;
  rang: number | null;
  concurrents: string[];
};

function collectText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

// "Le Petit Marcel" et "le petit marcel." doivent correspondre.
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesRestaurant(candidate: string, restaurantName: string): boolean {
  const a = normalize(candidate);
  const b = normalize(restaurantName);
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

// Le modèle renvoie parfois le JSON entouré de texte ou d'un bloc markdown.
function parseNameList(raw: string): string[] {
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) return [];

  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

// Deux appels : le premier mesure la réponse spontanée de l'IA (aucune mention
// du restaurant analysé, sinon le résultat n'aurait aucune valeur), le second
// ne fait qu'extraire mécaniquement les établissements cités et leur ordre.
export async function runVisibilityCheck({
  question,
  restaurantName,
}: {
  question: string;
  restaurantName: string;
}): Promise<VisibilityResult> {
  const client = new Anthropic();

  const answer = await client.messages.create({
    model: VISIBILITY_MODEL,
    max_tokens: 1500,
    system:
      "Tu réponds comme un assistant grand public à qui quelqu'un demande " +
      "une recommandation de restaurant. Cite des établissements précis " +
      "quand tu en connais, et n'invente pas d'adresses.",
    messages: [{ role: "user", content: question }],
  });

  const reponse = collectText(answer.content);

  const extraction = await client.messages.create({
    model: VISIBILITY_MODEL,
    max_tokens: 500,
    output_config: { effort: "low" },
    system:
      "Tu extrais des noms d'établissements. Réponds uniquement par un " +
      'tableau JSON de chaînes, par exemple ["Nom A", "Nom B"]. Aucun autre ' +
      "texte.",
    messages: [
      {
        role: "user",
        content:
          "Liste, dans leur ordre d'apparition, les noms des restaurants ou " +
          "établissements cités dans le texte suivant. Si aucun n'est cité, " +
          `réponds [].\n\n---\n${reponse}`,
      },
    ],
  });

  const names = parseNameList(collectText(extraction.content));
  const matchIndex = names.findIndex((name) =>
    matchesRestaurant(name, restaurantName),
  );

  // Filet de sécurité si l'extraction échoue : on cherche le nom directement
  // dans la réponse, quitte à ne pas connaître le rang.
  const estCite =
    matchIndex !== -1 || normalize(reponse).includes(normalize(restaurantName));

  return {
    reponse,
    estCite,
    rang: matchIndex === -1 ? null : matchIndex + 1,
    concurrents: names.filter(
      (name) => !matchesRestaurant(name, restaurantName),
    ),
  };
}
