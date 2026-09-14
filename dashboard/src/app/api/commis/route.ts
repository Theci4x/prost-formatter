import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { corpusComplet } from "@/lib/aide/articles";
import {
  consigne,
  historiqueSain,
  questionSaine,
  type Public,
} from "@/lib/commis/consigne";
import {
  MESSAGES,
  adresseIp,
  coutCentimes,
  empreinteVisiteur,
  facturer,
  reserver,
} from "@/lib/commis/quota";

// La réponse arrive au fil de l'eau : attendre huit secondes devant un
// curseur qui ne bouge pas donne l'impression que c'est cassé.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Tarifs publics de Claude Opus 5, par million de jetons.
const DOLLARS_ENTREE = 5;
const DOLLARS_SORTIE = 25;

function texte(message: string, statut = 200): Response {
  return new Response(message, {
    status: statut,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return texte(
      "Le Commis n'est pas encore branché. Écris-nous en attendant.",
      503,
    );
  }

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return texte("Requête illisible.", 400);
  }

  const question = questionSaine((corps as { question?: unknown })?.question);
  if (!question) return texte("Pose-moi une question.", 400);
  const historique = historiqueSain((corps as { historique?: unknown })?.historique);

  // Un abonné connecté n'est pas limité en nombre : il paie, et un
  // restaurateur ne pose pas cinquante questions dans une soirée.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const destinataire: Public = user ? "client" : "visiteur";
  const service = createServiceClient();
  const cle = user
    ? `u:${user.id}`
    : empreinteVisiteur(
        adresseIp(request.headers),
        request.headers.get("user-agent") ?? "",
        process.env.CRON_SECRET ?? "klarr",
      );

  const verdict = await reserver(service, cle, { illimite: Boolean(user) });
  if (!verdict.autorise) return texte(MESSAGES[verdict.motif], 429);

  const client = new Anthropic();

  const flux = new ReadableStream<Uint8Array>({
    async start(controle) {
      const encodeur = new TextEncoder();
      try {
        const reponse = client.messages.stream({
          model: process.env.ANTHROPIC_MODEL ?? "claude-opus-5",
          // Une réponse d'aide tient en quelques phrases ; ce plafond borne
          // aussi ce qu'une question tordue peut coûter.
          max_tokens: 1024,
          // Le mode d'emploi est identique à chaque question : mis en cache,
          // il coûte un dixième du plein tarif d'une question à l'autre.
          system: [
            {
              type: "text",
              text: consigne(corpusComplet(), destinataire),
              cache_control: { type: "ephemeral", ttl: "1h" },
            },
          ],
          // Répondre à partir d'un texte fourni ne demande pas de longues
          // délibérations : l'effort le plus bas suffit et réduit l'attente.
          output_config: { effort: "low" },
          messages: [...historique, { role: "user", content: question }],
        });

        for await (const evenement of reponse) {
          if (
            evenement.type === "content_block_delta" &&
            evenement.delta.type === "text_delta"
          ) {
            controle.enqueue(encodeur.encode(evenement.delta.text));
          }
        }

        const finale = await reponse.finalMessage();
        const centimes = coutCentimes({
          entree: finale.usage.input_tokens,
          sortie: finale.usage.output_tokens,
          cacheEcriture: finale.usage.cache_creation_input_tokens ?? 0,
          cacheLecture: finale.usage.cache_read_input_tokens ?? 0,
          dollarsEntreeParMillion: DOLLARS_ENTREE,
          dollarsSortieParMillion: DOLLARS_SORTIE,
        });
        await facturer(service, cle, centimes);
      } catch (erreur) {
        console.error("[commis]", erreur);
        // Le flux est peut-être déjà commencé : on ne peut plus changer le
        // code HTTP, alors on termine la phrase par un aveu lisible.
        controle.enqueue(
          new TextEncoder().encode(
            "\n\nDésolé, je n'arrive pas à répondre pour le moment.",
          ),
        );
      } finally {
        controle.close();
      }
    },
  });

  return new Response(flux, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
