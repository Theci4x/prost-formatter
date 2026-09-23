import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { FormulaireQuestion } from "@/components/seo/FormulaireQuestion";
import { supprimerQuestion } from "./actions";
import { ReponsesRapides } from "@/components/seo/ReponsesRapides";
import {
  completude,
  questionsARepondre,
  SUGGESTIONS,
} from "@/lib/seo/questions-suggerees";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerSection } from "@/lib/abonnement/acces";

type Question = {
  id: string;
  question: string;
  reponse: string;
};

export default async function FaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  // La section, pas le module : ces réponses servent la visibilité comme
  // les réservations, et l'un des deux abonnements suffit à les saisir.
  await exigerSection(id, "faq");

  const supabase = await createClient();
  const [
    { data: restaurantData },
    { data: questionsData },
    { data: services },
  ] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_faq")
      .select("id, question, reponse")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("created_at"),
    supabase
      .from("restaurant_services")
      .select("heure_debut")
      .eq("restaurant_id", id),
  ]);

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) notFound();

  const questions = (questionsData ?? []) as Question[];

  // Une maison qui n'ouvre que le soir n'a pas à répondre sur le menu du
  // midi : on ne lui pose pas la question, et elle ne compte pas contre
  // elle dans la complétude.
  const fiche = {
    serviceMidi: ((services ?? []) as { heure_debut: string | null }[]).some(
      (service) => (service.heure_debut ?? "").slice(0, 5) < "15:00",
    ),
  };
  const posees = questions.map((q) => q.question);
  const restantes = questionsARepondre(fiche, posees);
  const etat = completude(fiche, posees);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.visibiliteIa}
        title={`Questions fréquentes — ${restaurant.nom}`}
      />

      <p className="max-w-4xl text-sm text-zinc-600">
        Ces réponses s&apos;affichent sur ta page publique et sont lues par
        Google et les assistants, qui les reprennent presque mot pour mot quand
        on leur demande si tu as une terrasse ou si tu acceptes les chiens.
        Accessoirement, elles épargnent autant d&apos;appels en plein service.
      </p>

      {/* L'état d'abord : c'est la phrase qui dit s'il reste à faire,
          et elle dit ce que coûte le fait de ne pas le faire. */}
      <section
        className={`flex flex-col gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center sm:gap-8 ${
          etat.complet
            ? "border-emerald-200 bg-emerald-50/70"
            : "border-brand-orange/50 bg-brand-orange-soft"
        }`}
      >
        <span className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-serif text-6xl leading-none text-ink">
            {etat.repondues}
          </span>
          <span className="font-serif text-2xl text-zinc-500">
            / {etat.attendues}
          </span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className="text-sm leading-relaxed text-ink sm:text-base">
            {etat.complet ? (
              <>
                Ta page répond aux {etat.attendues} questions qu&apos;on pose le
                plus. C&apos;est autant d&apos;appels que tu ne prendras pas en
                plein service.
              </>
            ) : (
              <>
                Ta page répond à <strong>{etat.repondues}</strong> question
                {etat.repondues > 1 ? "s" : ""} sur {etat.attendues}. Pour les{" "}
                {etat.attendues - etat.repondues} autres, les clients appellent
                — ou vont voir ailleurs.
              </>
            )}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className={`h-full rounded-full ${
                etat.complet ? "bg-emerald-500" : "bg-brand-orange"
              }`}
              style={{
                width: `${etat.attendues ? (etat.repondues / etat.attendues) * 100 : 100}%`,
              }}
            />
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <ReponsesRapides restaurantId={id} questions={restantes} />

          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl text-ink">Une autre question</h2>
            <FormulaireQuestion
              restaurantId={id}
              suggestions={SUGGESTIONS.map((s) => s.question)}
              dejaPosees={posees}
            />
          </section>
        </div>

        {/* Les réponses telles que la page les montre : on relit ce que
            le client lira, pas une liste de champs. */}
        <section className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-24">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-2xl text-ink">Sur ta page</h2>
            <span className="text-xs text-zinc-500">
              {questions.length} question{questions.length > 1 ? "s" : ""}
            </span>
          </div>
          {questions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
              Aucune question pour l&apos;instant. Commence par les deux ou
              trois qu&apos;on te pose au téléphone toutes les semaines.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              {questions.map((q) => (
                <li key={q.id} className="flex flex-col gap-1.5 px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[15px] font-semibold text-ink">
                      {q.question}
                    </p>
                    <form action={supprimerQuestion} className="shrink-0">
                      <input type="hidden" name="restaurant_id" value={id} />
                      <input type="hidden" name="question_id" value={q.id} />
                      <button
                        type="submit"
                        aria-label={`Supprimer « ${q.question} »`}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-600">
                    {q.reponse}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
