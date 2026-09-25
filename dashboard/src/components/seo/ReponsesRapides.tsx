import { repondreVite } from "@/app/dashboard/[id]/faq/actions";
import type { Suggestion } from "@/lib/seo/questions-suggerees";
import type { T } from "@/lib/i18n/t";

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
  t,
}: {
  restaurantId: string;
  questions: Suggestion[];
  t: T;
}) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-2xl text-ink">
          {t("Réponds en un appui")}
        </h2>
        <p className="text-sm text-zinc-600">
          {t(
            "Choisis la phrase qui correspond à ta maison. Tu pourras la retoucher ensuite — c'est un point de départ, pas un texte imposé.",
          )}
        </p>
      </div>

      <ul className="grid gap-3 lg:grid-cols-2">
        {questions.map((suggestion) => (
          <li
            key={suggestion.question}
            className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-brand-cream/50 p-4"
          >
            <p className="text-[15px] font-semibold text-ink">
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
                    className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-left text-sm text-zinc-700 transition-colors hover:border-brand-orange hover:bg-brand-orange-soft hover:text-ink"
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
