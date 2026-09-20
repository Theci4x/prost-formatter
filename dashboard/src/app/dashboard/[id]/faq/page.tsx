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

      <p className="max-w-2xl text-sm text-zinc-600">
        Ces réponses s&apos;affichent sur ta page publique et sont lues par
        Google et les assistants, qui les reprennent presque mot pour mot quand
        on leur demande si tu as une terrasse ou si tu acceptes les chiens.
        Accessoirement, elles épargnent autant d&apos;appels en plein service.
      </p>

      <div className="flex max-w-2xl flex-col gap-4">
        {/* L'état d'abord : c'est la phrase qui dit s'il reste à faire,
            et elle dit ce que coûte le fait de ne pas le faire. */}
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            etat.complet
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
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
              {etat.attendues - etat.repondues} autres, les clients appellent —
              ou vont voir ailleurs.
            </>
          )}
        </p>

        <ReponsesRapides restaurantId={id} questions={restantes} />

        <FormulaireQuestion
          restaurantId={id}
          suggestions={SUGGESTIONS.map((s) => s.question)}
          dejaPosees={posees}
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
