import { repondreVite } from "@/app/dashboard/[id]/faq/actions";
import type { Suggestion } from "@/lib/seo/questions-suggerees";

/**
 * Les questions qui restent, avec leurs réponses à portée de doigt.
 *
 * Devant un champ vide, un restaurateur en plein service ne rédige rien —
 * ce n'est pas de la mauvaise volonté, c'est la page blanche. Il
 * reconnaît en revanche sa maison dans une phrase toute faite, et un
 * appui suffit. Huit réponses en une minute plutôt que huit paragraphes
 * qu'on remet à jamais.
 *
 * Aucun état, aucun `"use client"` : ce sont des formulaires qui postent
 * deux champs cachés. Ça marche donc sans JavaScript, ce qui compte
 * quand on remplit ça d'un téléphone entre deux services.
 */
export function ReponsesRapides({
  restaurantId,
  questions,
}: {
  restaurantId: string;
  questions: Suggestion[];
}) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-zinc-900">
          Réponds en un appui
        </h2>
        <p className="text-sm text-zinc-600">
          Choisis la phrase qui correspond à ta maison. Tu pourras la retoucher
          ensuite — c&apos;est un point de départ, pas un texte imposé.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {questions.map((suggestion) => (
          <li key={suggestion.question} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-zinc-800">
              {suggestion.question}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestion.reponses.map((reponse) => (
                <form key={reponse} action={repondreVite}>
                  <input
                    type="hidden"
                    name="restaurant_id"
                    value={restaurantId}
                  />
                  <input
                    type="hidden"
                    name="question"
                    value={suggestion.question}
                  />
                  <input type="hidden" name="reponse" value={reponse} />
                  <button
                    type="submit"
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-left text-xs text-zinc-700 transition-colors hover:border-brand-navy hover:bg-brand-cream hover:text-brand-navy"
                  >
                    {reponse}
                  </button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
