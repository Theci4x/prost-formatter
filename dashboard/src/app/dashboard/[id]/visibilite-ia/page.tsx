import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import {
  addQuestion,
  analyzeQuestion,
  removeQuestion,
  suggestQuestions,
} from "./actions";
import { configuredProviders } from "@/lib/ai-visibility/providers";
import type { Restaurant } from "@/types/restaurant";
import type {
  AiVisibilityCheck,
  AiVisibilityQuestion,
} from "@/types/ai-visibility";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import {
  INTENTIONS,
  LIBELLE_INTENTION,
  RESUME_INTENTION,
  estIntention,
} from "@/lib/ai-visibility/intentions";

export default async function VisibiliteIaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

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
  // première rencontrée pour un couple (question, assistant) est donc la
  // dernière en date.
  const latestByQuestion = new Map<string, AiVisibilityCheck[]>();
  const seen = new Set<string>();
  for (const check of checks) {
    const key = `${check.question_id}:${check.fournisseur}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const list = latestByQuestion.get(check.question_id) ?? [];
    list.push(check);
    latestByQuestion.set(check.question_id, list);
  }

  const actifs = configuredProviders().map((provider) => provider.label);

  const analysedChecks = [...latestByQuestion.values()].flat();

  // Un taux global ne dit rien : être cité partout dans « les meilleurs bars
  // de Paris » et nulle part dans « où réserver pour un anniversaire » donne
  // le même chiffre qu'une salle pleine. On compte donc par intention, et
  // c'est « on me réserve » qu'on regarde en premier.
  const parIntention = INTENTIONS.map((intention) => {
    const concernees = questions.filter(
      (question) =>
        (estIntention(question.intention)
          ? question.intention
          : "decouverte") === intention,
    );
    const reponses = concernees.flatMap(
      (question) => latestByQuestion.get(question.id) ?? [],
    );
    return {
      intention,
      questions: concernees,
      analysees: reponses.length,
      citees: reponses.filter((check) => check.est_cite).length,
    };
  });

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

      {actifs.length === 0 && (
        <div className="max-w-2xl rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm font-medium text-orange-900">
            Aucun assistant n&apos;est configuré.
          </p>
          <p className="mt-1 text-sm text-orange-800">
            Les analyses ne peuvent pas être lancées tant qu&apos;aucune clé
            d&apos;API n&apos;est renseignée. Vous pouvez déjà enregistrer vos
            questions : elles seront analysables dès qu&apos;une clé sera en
            place.
          </p>
        </div>
      )}

      {analysedChecks.length > 0 && (
        <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
          {parIntention.map((bloc) => (
            <div
              key={bloc.intention}
              className="flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-700">
                {LIBELLE_INTENTION[bloc.intention]}
              </p>
              <p className="text-2xl font-semibold text-brand-navy">
                {bloc.analysees > 0 ? `${bloc.citees}/${bloc.analysees}` : "—"}
              </p>
              <p className="text-xs leading-relaxed text-zinc-500">
                {bloc.analysees > 0
                  ? "réponses où tu es cité"
                  : "aucune question analysée"}
              </p>
            </div>
          ))}
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">
              Ce que le client cherche
            </label>
            <select
              name="intention"
              defaultValue="reservation"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            >
              {INTENTIONS.map((intention) => (
                <option key={intention} value={intention}>
                  {LIBELLE_INTENTION[intention]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover"
          >
            Ajouter
          </button>
        </form>

        {/* Devant un champ vide, personne ne sait quoi taper — et une page de
            suivi sans rien à suivre ne se rouvre pas. Tant qu'aucune question
            n'existe, la proposition devient donc le geste principal. */}
        <form action={suggestQuestions}>
          <input type="hidden" name="restaurant_id" value={id} />
          {questions.length === 0 ? (
            <button
              type="submit"
              className="rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:brightness-95"
            >
              Commencer : proposer six questions
            </button>
          ) : (
            <button
              type="submit"
              className="text-sm font-medium text-brand-orange hover:underline"
            >
              Proposer d&apos;autres questions
            </button>
          )}
        </form>

        <p className="text-xs leading-relaxed text-zinc-500">
          Les propositions partent de tes mots-clés et, si ton compte Google est
          relié, des requêtes réellement tapées par ceux qui t&apos;ont trouvé.
        </p>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aucune question suivie pour le moment.
        </p>
      ) : (
        <div className="flex max-w-2xl flex-col gap-8">
          {parIntention
            .filter((bloc) => bloc.questions.length > 0)
            .map((bloc) => (
              <section key={bloc.intention} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    {LIBELLE_INTENTION[bloc.intention]}
                  </h2>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    {RESUME_INTENTION[bloc.intention]}
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {bloc.questions.map((question) => (
                    <CarteQuestion
                      key={question.id}
                      restaurantId={id}
                      question={question}
                      results={latestByQuestion.get(question.id) ?? []}
                      analysable={actifs.length > 0}
                    />
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      <p className="max-w-2xl text-xs leading-relaxed text-zinc-400">
        Assistants interrogés aujourd&apos;hui :{" "}
        {actifs.length > 0 ? actifs.join(", ") : "aucun"}. Les autres
        s&apos;activeront automatiquement dès que leur clé d&apos;API sera
        renseignée. Les analyses portent sur les connaissances propres de chaque
        assistant ; les réponses affichées dans les applications grand public
        (qui vont chercher sur le web en direct) demanderaient un accès
        supplémentaire.
      </p>
    </div>
  );
}

/**
 * Une question suivie, et ce que chaque assistant en a dit.
 *
 * Sortie de la page parce que la liste se regroupe maintenant par
 * intention : la même carte se rend dans trois sections.
 */
function CarteQuestion({
  restaurantId,
  question,
  results,
  analysable,
}: {
  restaurantId: string;
  question: AiVisibilityQuestion;
  results: AiVisibilityCheck[];
  analysable: boolean;
}) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-zinc-900">{question.question}</p>
        <form action={removeQuestion}>
          <input type="hidden" name="restaurant_id" value={restaurantId} />
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

      {results.length > 0 ? (
        <div className="flex flex-col gap-3">
          {results.map((check) => (
            <div
              key={check.id}
              className="flex flex-col gap-2 border-t border-zinc-100 pt-3 first:border-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-zinc-900">
                  {check.modele}
                </span>
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
                  Voir la réponse
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {check.reponse}
                </p>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Pas encore analysée.</p>
      )}

      <form action={analyzeQuestion}>
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="question_id" value={question.id} />
        <button
          type="submit"
          disabled={!analysable}
          className="w-fit rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-700"
        >
          {results.length > 0 ? "Relancer l'analyse" : "Analyser"}
        </button>
      </form>
    </li>
  );
}
