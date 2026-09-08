import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import {
  addQuestion,
  analyzeQuestion,
  removeQuestion,
  suggestQuestions,
} from "./actions";
import type { Restaurant } from "@/types/restaurant";
import type {
  AiVisibilityCheck,
  AiVisibilityQuestion,
} from "@/types/ai-visibility";

export default async function VisibiliteIaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const { data: questionsData } = await supabase
    .from("ai_visibility_questions")
    .select("*")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: true });

  const questions = (questionsData ?? []) as AiVisibilityQuestion[];

  const { data: checksData } = await supabase
    .from("ai_visibility_checks")
    .select("*")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false });

  const checks = (checksData ?? []) as AiVisibilityCheck[];

  // Les analyses arrivent triées de la plus récente à la plus ancienne : la
  // première rencontrée pour une question est donc la dernière en date.
  const latestByQuestion = new Map<string, AiVisibilityCheck>();
  for (const check of checks) {
    if (!latestByQuestion.has(check.question_id)) {
      latestByQuestion.set(check.question_id, check);
    }
  }

  const analysed = questions.filter((q) => latestByQuestion.has(q.id));
  const citedCount = analysed.filter(
    (q) => latestByQuestion.get(q.id)?.est_cite,
  ).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.visibiliteIa}
        title={`Visibilité IA — ${restaurant.nom}`}
      />

      <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
        De plus en plus de clients demandent à une IA où aller manger. Cette
        page pose de vraies questions de clients à l&apos;IA et vérifie si ton
        restaurant fait partie des réponses, à quelle place, et face à quels
        concurrents.
      </p>

      {analysed.length > 0 && (
        <div className="flex max-w-xl items-center gap-6 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
          <div>
            <p className="text-2xl font-semibold text-brand-navy">
              {citedCount}/{analysed.length}
            </p>
            <p className="text-sm text-zinc-500">questions où tu es cité</p>
          </div>
        </div>
      )}

      <div className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
        <form action={addQuestion} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="restaurant_id" value={id} />
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">
              Une question que poserait un client
            </label>
            <input
              name="question"
              type="text"
              required
              placeholder="ex : Quel est le meilleur restaurant coréen dans le 13e ?"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
          >
            Ajouter
          </button>
        </form>

        <form action={suggestQuestions}>
          <input type="hidden" name="restaurant_id" value={id} />
          <button
            type="submit"
            className="text-sm font-medium text-brand-orange hover:underline"
          >
            Proposer des questions à partir de mes mots-clés
          </button>
        </form>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aucune question suivie pour le moment.
        </p>
      ) : (
        <ul className="flex max-w-2xl flex-col gap-3">
          {questions.map((question) => {
            const check = latestByQuestion.get(question.id);
            return (
              <li
                key={question.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-medium text-zinc-900">
                    {question.question}
                  </p>
                  <form action={removeQuestion}>
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input type="hidden" name="question_id" value={question.id} />
                    <button
                      type="submit"
                      aria-label="Supprimer la question"
                      className="shrink-0 text-sm text-zinc-400 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>

                {check ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          check.est_cite
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {check.est_cite ? "Cité" : "Non cité"}
                      </span>
                      {check.rang && (
                        <span className="text-xs text-zinc-500">
                          Position {check.rang}
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">
                        {new Date(check.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {check.concurrents.length > 0 && (
                      <p className="text-sm text-zinc-600">
                        Également cités : {check.concurrents.join(", ")}
                      </p>
                    )}

                    <details className="text-sm text-zinc-600">
                      <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">
                        Voir la réponse de l&apos;IA
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                        {check.reponse}
                      </p>
                    </details>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Pas encore analysée.</p>
                )}

                <form action={analyzeQuestion}>
                  <input type="hidden" name="restaurant_id" value={id} />
                  <input type="hidden" name="question_id" value={question.id} />
                  <button
                    type="submit"
                    className="w-fit rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                  >
                    {check ? "Relancer l'analyse" : "Analyser"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      <p className="max-w-2xl text-xs leading-relaxed text-zinc-400">
        Les analyses interrogent aujourd&apos;hui Claude (Opus 5), sur ses
        connaissances propres. Les autres assistants (ChatGPT, Gemini,
        Perplexity, Copilot, AI Overviews) demandent chacun un accès dédié, à
        brancher au fur et à mesure.
      </p>
    </div>
  );
}
