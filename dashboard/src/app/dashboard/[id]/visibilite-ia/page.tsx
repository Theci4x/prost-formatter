import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import {
  addQuestion,
  analyzeQuestion,
  genererPlan,
  removeQuestion,
  suggestQuestions,
} from "./actions";
import { BoutonLent } from "@/components/visibilite-ia/BoutonLent";
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
  type Intention,
} from "@/lib/ai-visibility/intentions";
import { ECRANS, type ActionPlan } from "@/lib/ai-visibility/plan";

// Interroger un assistant puis en extraire les noms cités dépasse largement
// la durée par défaut d'une fonction serveur. Posée sur la page, la valeur
// s'applique à toutes ses actions serveur.
export const maxDuration = 60;

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

  const [questionsResult, checksResult, planResult] = await Promise.all([
    supabase
      .from("ai_visibility_questions")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("ai_visibility_checks")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("ai_visibility_plans")
      .select("actions, genere_le")
      .eq("restaurant_id", id)
      .maybeSingle(),
  ]);

  const questions = (questionsResult.data ?? []) as AiVisibilityQuestion[];
  const checks = (checksResult.data ?? []) as AiVisibilityCheck[];
  const plan = planResult.data as {
    actions: ActionPlan[];
    genere_le: string;
  } | null;

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

  const intentionDe = (question: AiVisibilityQuestion): Intention =>
    estIntention(question.intention) ? question.intention : "decouverte";

  // Un taux global ne dit rien : être cité partout dans « les meilleurs bars
  // de Paris » et nulle part dans « où réserver pour un anniversaire » donne
  // le même chiffre qu'une salle pleine. On compte donc par intention, et
  // c'est « on me réserve » qu'on regarde en premier.
  const parIntention = INTENTIONS.map((intention) => {
    const concernees = questions.filter((q) => intentionDe(q) === intention);
    const reponses = concernees.flatMap(
      (question) => latestByQuestion.get(question.id) ?? [],
    );
    const citees = reponses.filter((check) => check.est_cite).length;
    return {
      intention,
      questions: concernees,
      analysees: reponses.length,
      citees,
      part: reponses.length > 0 ? citees / reponses.length : 0,
    };
  });

  // Qui occupe la place. Un nom qui revient dans dix réponses n'est pas un
  // concurrent parmi d'autres : c'est celui à qui l'IA envoie tes clients.
  const occurrences = new Map<string, number>();
  for (const check of analysedChecks) {
    for (const nom of check.concurrents) {
      const propre = nom.trim();
      if (!propre) continue;
      occurrences.set(propre, (occurrences.get(propre) ?? 0) + 1);
    }
  }
  const concurrents = [...occurrences.entries()]
    .map(([nom, fois]) => ({ nom, fois }))
    .sort((a, b) => b.fois - a.fois || a.nom.localeCompare(b.nom))
    .slice(0, 8);
  const plusCite = concurrents[0]?.fois ?? 1;

  return (
    <div className="flex flex-1 flex-col gap-10 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.visibiliteIa}
        title={`Visibilité IA — ${restaurant.nom}`}
      />

      <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
        De plus en plus de clients demandent à une IA où aller manger. Cette
        page pose de vraies questions de clients à l&apos;IA, vérifie si ton
        restaurant fait partie des réponses, face à quels concurrents — et en
        tire ce qu&apos;il y a à corriger.
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

      {/* ——— Les trois taux ——————————————————————————————————— */}
      {analysedChecks.length > 0 && (
        <section className="flex max-w-3xl flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">Où tu en es</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {parIntention.map((bloc) => (
              <Jauge key={bloc.intention} {...bloc} />
            ))}
          </div>
          <p className="text-xs leading-relaxed text-zinc-500">
            {RESUME_INTENTION.reservation}
          </p>
        </section>
      )}

      {/* ——— Le plan d'action ————————————————————————————————— */}
      {analysedChecks.length > 0 && (
        <section className="flex max-w-3xl flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink">
              Ce que tu peux faire
            </h2>
            {plan && (
              <span className="text-xs text-zinc-400">
                Écrit le{" "}
                {new Date(plan.genere_le).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>

          {plan && plan.actions.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {plan.actions.map((action, rang) => (
                <li
                  key={`${rang}-${action.titre}`}
                  className="flex gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-semibold text-white">
                    {rang + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="text-sm font-medium text-ink">
                      {action.titre}
                    </p>
                    {action.pourquoi && (
                      <p className="text-sm leading-relaxed text-zinc-600">
                        {action.pourquoi}
                      </p>
                    )}
                    {action.ecran && (
                      <Link
                        href={`/dashboard/${id}/${ECRANS[action.ecran].chemin}`}
                        className="w-fit text-xs font-medium text-brand-orange hover:underline"
                      >
                        Aller dans « {ECRANS[action.ecran].libelle} » →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-zinc-500">
              Pas encore de plan. Il se déduit de tes analyses et de ta fiche
              — carte, photos, questions fréquentes, espaces privatisables.
            </p>
          )}

          <BoutonLent
            action={genererPlan}
            champs={{ restaurant_id: id }}
            libelle={plan ? "Réécrire le plan" : "Écrire mon plan d'action"}
            enCours="Claude lit tes analyses et ta fiche…"
            className={
              plan
                ? "text-sm font-medium text-brand-orange hover:underline"
                : "rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:brightness-95"
            }
          />
        </section>
      )}

      {/* ——— Qui te passe devant ——————————————————————————————— */}
      {concurrents.length > 0 && (
        <section className="flex max-w-xl flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">
            Qui te passe devant
          </h2>
          <p className="text-xs leading-relaxed text-zinc-500">
            Nombre de réponses où ce nom est cité, sur les{" "}
            {analysedChecks.length} analysées.
          </p>
          <ul className="flex flex-col gap-2">
            {concurrents.map((concurrent) => (
              <li key={concurrent.nom} className="flex flex-col gap-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm text-ink">
                    {concurrent.nom}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-500">
                    {concurrent.fois}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-1.5 rounded-full bg-brand-navy"
                    style={{
                      width: `${Math.max(4, (concurrent.fois / plusCite) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ——— Les questions suivies ————————————————————————————— */}
      <section className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-sm font-semibold text-ink">Tes questions</h2>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <form action={addQuestion} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="restaurant_id" value={id} />
            <div className="flex flex-1 basis-56 flex-col gap-1">
              <label className="text-xs font-medium text-zinc-600">
                Une question que poserait un client
              </label>
              <input
                name="question"
                type="text"
                required
                placeholder="ex : où réserver pour un anniversaire dans le 11e ?"
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

          {/* Devant un champ vide, personne ne sait quoi taper — et une page
              de suivi sans rien à suivre ne se rouvre pas. Tant qu'aucune
              question n'existe, la proposition devient le geste principal. */}
          <BoutonLent
            action={suggestQuestions}
            champs={{ restaurant_id: id }}
            libelle={
              questions.length === 0
                ? "Commencer : proposer six questions"
                : "Proposer d'autres questions"
            }
            enCours="Le modèle écrit tes questions…"
            className={
              questions.length === 0
                ? "rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:brightness-95"
                : "text-sm font-medium text-brand-orange hover:underline"
            }
          />

          <p className="text-xs leading-relaxed text-zinc-500">
            Les propositions partent de tes mots-clés et, si ton compte Google
            est relié, des requêtes réellement tapées par ceux qui t&apos;ont
            trouvé.
          </p>
        </div>

        {parIntention
          .filter((bloc) => bloc.questions.length > 0)
          .map((bloc) => (
            <div key={bloc.intention} className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-semibold text-ink">
                  {LIBELLE_INTENTION[bloc.intention]}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {RESUME_INTENTION[bloc.intention]}
                </p>
              </div>
              <ul className="flex flex-col gap-2">
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
            </div>
          ))}
      </section>

      <p className="max-w-2xl text-xs leading-relaxed text-zinc-400">
        Assistants interrogés aujourd&apos;hui :{" "}
        {actifs.length > 0 ? actifs.join(", ") : "aucun"}. Les autres
        s&apos;activeront automatiquement dès que leur clé d&apos;API sera
        renseignée. Les analyses portent sur les connaissances propres de
        chaque assistant ; les réponses affichées dans les applications grand
        public (qui vont chercher sur le web en direct) demanderaient un accès
        supplémentaire.
      </p>
    </div>
  );
}

/**
 * Le taux de citation d'une intention.
 *
 * La barre porte l'information, le chiffre la confirme : on compare trois
 * hauteurs d'un coup d'œil là où trois fractions demandent un calcul.
 */
function Jauge({
  intention,
  analysees,
  citees,
  part,
}: {
  intention: Intention;
  analysees: number;
  citees: number;
  part: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-zinc-600">
        {LIBELLE_INTENTION[intention]}
      </p>
      {analysees > 0 ? (
        <>
          <p className="text-2xl font-semibold tabular-nums text-brand-navy">
            {citees}
            <span className="text-base font-normal text-zinc-400">
              /{analysees}
            </span>
          </p>
          <div className="h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className="h-1.5 rounded-full bg-brand-navy"
              style={{ width: `${Math.round(part * 100)}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-2xl font-semibold text-zinc-300">—</p>
          <p className="text-xs text-zinc-400">aucune question analysée</p>
        </>
      )}
    </div>
  );
}

/**
 * Une question suivie, et ce que chaque assistant en a dit.
 *
 * Sortie de la page parce que la liste se regroupe par intention : la même
 * carte se rend dans trois sections.
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
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-ink">{question.question}</p>
        <form action={removeQuestion}>
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <input type="hidden" name="question_id" value={question.id} />
          <button
            type="submit"
            aria-label="Supprimer la question"
            className="shrink-0 text-xs text-zinc-400 transition-colors hover:text-red-600"
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
                <span className="text-sm font-medium text-ink">
                  {check.modele}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    check.est_cite
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-zinc-100 text-zinc-600"
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
                <p className="text-sm leading-relaxed text-zinc-600">
                  Cités à ta place : {check.concurrents.join(", ")}
                </p>
              )}

              <details className="text-sm text-zinc-600">
                <summary className="cursor-pointer text-xs text-zinc-500 hover:text-ink">
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

      {analysable ? (
        <BoutonLent
          action={analyzeQuestion}
          champs={{ restaurant_id: restaurantId, question_id: question.id }}
          libelle={results.length > 0 ? "Relancer l'analyse" : "Analyser"}
          // Une demi-minute sans rien à l'écran passe pour une panne. Dire
          // qui travaille, et à quoi s'attendre, suffit à faire patienter.
          enCours="Claude répond… (environ 30 secondes)"
          className="w-fit rounded-md border border-line px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        />
      ) : (
        <button
          type="button"
          disabled
          className="w-fit cursor-not-allowed rounded-md border border-line px-3 py-1.5 text-xs font-medium text-zinc-700 opacity-40"
        >
          Analyser
        </button>
      )}
    </li>
  );
}
