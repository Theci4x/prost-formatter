import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/service";
import { chargerFiche, ficheUtile } from "@/lib/commis/fiche";
import { consigneEtablissement } from "@/lib/commis/consigne-etablissement";
import { historiqueSain, questionSaine } from "@/lib/commis/consigne";
import { modeleEtablissement } from "@/lib/commis/modeles";
import {
  adresseIp,
  coutCentimes,
  empreinteVisiteur,
  facturer,
  plafondEtablissement,
  reserver,
  type DureeCache,
} from "@/lib/commis/quota";

/**
 * L'assistant d'un restaurant, sur sa page de réservation.
 *
 * Il ne lit que la fiche publique de l'établissement — jamais le carnet.
 * Voir `lib/commis/fiche.ts` pour la frontière, et
 * `lib/commis/consigne-etablissement.ts` pour ce qu'il s'interdit de dire.
 *
 * Le plafond est par établissement et non global : un restaurant très
 * fréquenté ne doit pas éteindre l'assistant de tous les autres.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Une seule déclaration pour les deux usages, comme pour l'autre Commis :
// la durée demandée à l'API, et celle qui en fixe le prix. Cinq minutes
// ici et non une heure — dans une conversation les questions s'enchaînent
// en quelques secondes, et d'une conversation à l'autre la fiche a peu de
// chances d'être encore chaude. L'écriture d'une heure coûterait le double
// pour un cache que personne ne relirait.
const DUREE_CACHE: DureeCache = "5m";

function texte(message: string, statut = 200): Response {
  return new Response(message, {
    status: statut,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

const INDISPONIBLE =
  "Je ne peux pas répondre pour le moment. Le formulaire de réservation reste à votre disposition sur cette page.";

const TROP =
  "J'ai répondu à beaucoup de questions aujourd'hui. Appelez le restaurant, ou utilisez le formulaire de cette page.";

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return texte(INDISPONIBLE, 503);

  let corps: unknown;
  try {
    corps = await request.json();
  } catch {
    return texte("Requête illisible.", 400);
  }

  const restaurantId = String(
    (corps as { restaurant?: unknown })?.restaurant ?? "",
  ).trim();
  const question = questionSaine((corps as { question?: unknown })?.question);
  if (!restaurantId) return texte("Établissement inconnu.", 400);
  if (!question) return texte("Posez-moi votre question.", 400);
  const historique = historiqueSain(
    (corps as { historique?: unknown })?.historique,
  );

  // La clé de service, comme la page publique : le visiteur n'est
  // authentifié à rien, et ces tables ne s'ouvrent pas aux anonymes.
  const service = createServiceClient();

  // La fiche d'abord, le quota ensuite : inutile de consommer le plafond
  // d'un établissement dont on n'a rien à dire.
  const fiche = await chargerFiche(service, restaurantId);
  if (!fiche || !ficheUtile(fiche)) return texte(INDISPONIBLE, 404);

  const cle = empreinteVisiteur(
    adresseIp(request.headers),
    request.headers.get("user-agent") ?? "",
    process.env.CRON_SECRET ?? "klarr",
  );
  const plafond = plafondEtablissement(restaurantId);
  const verdict = await reserver(service, cle, { plafond });
  if (!verdict.autorise) return texte(TROP, 429);

  const client = new Anthropic();
  const { nom: modele, tarif } = modeleEtablissement();

  const flux = new ReadableStream<Uint8Array>({
    async start(controle) {
      const encodeur = new TextEncoder();
      try {
        const reponse = client.messages.stream({
          model: modele,
          // Une réponse tient en deux ou trois phrases ; ce plafond borne
          // aussi ce qu'une question tordue peut coûter.
          max_tokens: 512,
          // La fiche ne change pas d'une question à l'autre : mise en
          // cache, elle coûte un dixième du tarif dès la deuxième.
          system: [
            {
              type: "text",
              text: consigneEtablissement(fiche.nom, fiche.corpus),
              cache_control: { type: "ephemeral", ttl: DUREE_CACHE },
            },
          ],
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
          dureeCache: DUREE_CACHE,
          dollarsEntreeParMillion: tarif.entree,
          dollarsSortieParMillion: tarif.sortie,
        });
        await facturer(service, cle, centimes, plafond);
      } catch (erreur) {
        console.error("[commis/etablissement]", erreur);
        // Le flux est peut-être déjà commencé : on ne peut plus changer le
        // code HTTP, alors on termine par un aveu lisible.
        controle.enqueue(new TextEncoder().encode(`\n\n${INDISPONIBLE}`));
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
