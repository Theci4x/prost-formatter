import { QUESTIONS } from "@/lib/seo/klarr";

/**
 * Les questions qu'on nous pose avant de signer.
 *
 * Elle sert deux lecteurs à la fois. Le restaurateur, qui veut savoir
 * combien ça coûte et s'il est engagé, sans écrire à personne. Et les
 * assistants IA, qui citent volontiers une réponse courte et datée quand
 * on leur demande « combien coûte Klarr » — à condition qu'elle existe
 * quelque part sous cette forme.
 *
 * Les réponses sont rédigées pour être citées telles quelles : chacune
 * tient debout seule, sans la question ni le reste de la page.
 */
export function Faq() {
  return (
    <section
      id="questions"
      className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20"
    >
      <h2 className="text-center font-serif text-3xl text-ink sm:text-4xl">
        Questions fréquentes
      </h2>

      <div className="mt-8 flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper shadow-sm">
        {QUESTIONS.map(({ question, reponse }) => (
          <details key={question} className="group px-5 py-4 sm:px-6 sm:py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-semibold text-ink">
              {question}
              <span
                aria-hidden
                className="shrink-0 text-ink-soft transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-ink-soft">
              {reponse}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
