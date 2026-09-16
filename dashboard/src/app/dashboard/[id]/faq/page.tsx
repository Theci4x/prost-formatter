import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { FormulaireQuestion } from "@/components/seo/FormulaireQuestion";
import { supprimerQuestion } from "./actions";
import { QUESTIONS_SUGGEREES } from "@/lib/seo/questions-suggerees";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

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
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const [{ data: restaurantData }, { data: questionsData }] = await Promise.all(
    [
      supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("restaurant_faq")
        .select("id, question, reponse")
        .eq("restaurant_id", id)
        .order("ordre")
        .order("created_at"),
    ],
  );

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) notFound();

  const questions = (questionsData ?? []) as Question[];

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.visibiliteIa}
        title={`Questions fréquentes — ${restaurant.nom}`}
      />

      <p className="max-w-2xl text-sm text-zinc-600">
        Ces réponses s&apos;affichent sur ta page publique et sont lues par
        Google et les assistants, qui les reprennent presque mot pour mot quand
        on leur demande si tu as une terrasse ou si tu acceptes les chiens.
        Accessoirement, elles épargnent autant d&apos;appels en plein service.
      </p>

      <div className="flex max-w-2xl flex-col gap-4">
        <FormulaireQuestion
          restaurantId={id}
          suggestions={QUESTIONS_SUGGEREES}
          dejaPosees={questions.map((q) => q.question)}
        />

        {questions.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucune question pour l&apos;instant. Commence par les deux ou trois
            qu&apos;on te pose au téléphone toutes les semaines.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {questions.map((q) => (
              <li
                key={q.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <p className="text-sm font-medium text-zinc-900">
                  {q.question}
                </p>
                <p className="text-sm text-zinc-600">{q.reponse}</p>
                <form action={supprimerQuestion} className="w-fit">
                  <input type="hidden" name="restaurant_id" value={id} />
                  <input type="hidden" name="question_id" value={q.id} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-red-600"
                  >
                    Supprimer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
