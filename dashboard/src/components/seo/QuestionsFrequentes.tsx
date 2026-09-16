import type { QuestionFrequente } from "@/lib/seo/donnees-structurees";

/**
 * Les questions fréquentes, sur la vitrine.
 *
 * En texte brut et non en accordéon : un contenu replié derrière un
 * JavaScript est un contenu qu'un robot lit mal et qu'un client scanne
 * moins vite. Ces réponses sont courtes, elles tiennent à l'écran.
 */
export function QuestionsFrequentes({
  questions,
}: {
  questions: QuestionFrequente[];
}) {
  if (questions.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-zinc-900">
        Questions fréquentes
      </h2>
      <dl className="flex flex-col divide-y divide-zinc-200/70 rounded-2xl border border-zinc-200/70 bg-white px-5 shadow-sm">
        {questions.map((q) => (
          <div key={q.question} className="flex flex-col gap-1 py-4">
            <dt className="text-sm font-medium text-zinc-900">{q.question}</dt>
            <dd className="text-sm leading-relaxed text-zinc-600">
              {q.reponse}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
