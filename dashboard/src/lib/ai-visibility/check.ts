import Anthropic from "@anthropic-ai/sdk";
import { configuredProviders, type ProviderId } from "./providers";

export type VisibilityResult = {
  fournisseur: ProviderId;
  modele: string;
  reponse: string;
  estCite: boolean;
  rang: number | null;
  concurrents: string[];
};

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

// L'extraction passe toujours par Claude, quel que soit l'assistant mesuré :
// c'est de l'outillage interne, pas la mesure elle-même.
async function extractNames(reponse: string): Promise<string[]> {
  const client = new Anthropic();
  const extraction = await client.messages.create({
    model: "claude-opus-5",
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

  return parseNameList(
    extraction.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n"),
  );
}

// Interroge chaque assistant configuré. La question ne mentionne jamais le
// restaurant analysé, sinon la mesure n'aurait aucune valeur.
export async function runVisibilityChecks({
  question,
  restaurantName,
}: {
  question: string;
  restaurantName: string;
}): Promise<VisibilityResult[]> {
  const providers = configuredProviders();

  const results = await Promise.all(
    providers.map(async (provider): Promise<VisibilityResult | null> => {
      try {
        const reponse = await provider.ask(question);
        if (!reponse) return null;

        const names = await extractNames(reponse);
        const matchIndex = names.findIndex((name) =>
          matchesRestaurant(name, restaurantName),
        );

        // Filet de sécurité si l'extraction échoue : on cherche le nom
        // directement dans la réponse, quitte à ne pas connaître le rang.
        const estCite =
          matchIndex !== -1 ||
          normalize(reponse).includes(normalize(restaurantName));

        return {
          fournisseur: provider.id,
          modele: provider.label,
          reponse,
          estCite,
          rang: matchIndex === -1 ? null : matchIndex + 1,
          concurrents: names.filter(
            (name) => !matchesRestaurant(name, restaurantName),
          ),
        };
      } catch (err) {
        // Un assistant en échec (clé invalide, quota, modèle renommé) ne doit
        // pas faire tomber l'analyse des autres.
        console.error(`[visibilite-ia] ${provider.id}`, err);
        return null;
      }
    }),
  );

  return results.filter((result): result is VisibilityResult => result !== null);
}
