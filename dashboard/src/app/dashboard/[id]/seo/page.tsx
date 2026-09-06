import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addKeyword, removeKeyword, analyzeKeywords } from "./actions";
import { KeywordAnalysis } from "@/components/seo/KeywordAnalysis";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantKeyword } from "@/types/keyword";

export default async function SeoPage({
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

  const { data: keywordsData } = await supabase
    .from("restaurant_keywords")
    .select("*")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false });

  const keywords = (keywordsData ?? []) as RestaurantKeyword[];

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader icon={dashboardIcons.seo} title={`SEO — ${restaurant.nom}`} />

      <div className="flex max-w-lg flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-700">
          Mots-clés ciblés
        </h2>
        <form action={addKeyword} className="flex gap-2">
          <input type="hidden" name="restaurant_id" value={id} />
          <input
            name="keyword"
            type="text"
            required
            placeholder="ex : restaurant italien Lyon"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Ajouter
          </button>
        </form>

        {keywords.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun mot-clé pour le moment.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <li
                key={k.id}
                className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
              >
                {k.keyword}
                <form action={removeKeyword}>
                  <input type="hidden" name="id" value={k.id} />
                  <input type="hidden" name="restaurant_id" value={id} />
                  <button
                    type="submit"
                    aria-label={`Supprimer ${k.keyword}`}
                    className="text-zinc-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex max-w-lg flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-700">
          Analyse SEO par Claude
        </h2>
        <KeywordAnalysis analyzeAction={analyzeKeywords.bind(null, id)} />
      </div>
    </div>
  );
}
