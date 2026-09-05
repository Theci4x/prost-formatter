import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
} from "@/lib/reviews/aggregate";
import { PlatformReviewsCard } from "@/components/reviews/PlatformReviewsCard";
import type { Restaurant } from "@/types/restaurant";

export default async function AvisPage({
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

  const location = restaurant.adresse ?? "";
  const [yelp, tripadvisor] = await Promise.all([
    fetchYelpPlatformReviews(restaurant.nom, location),
    fetchTripadvisorPlatformReviews(restaurant.nom, location),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <h1 className="text-lg font-semibold text-zinc-900">
        Avis — {restaurant.nom}
      </h1>

      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <PlatformReviewsCard data={yelp} />
        <PlatformReviewsCard data={tripadvisor} />
      </div>
    </div>
  );
}
