import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
  fetchGooglePlatformReviews,
} from "@/lib/reviews/aggregate";
import { PlatformReviewsCard } from "@/components/reviews/PlatformReviewsCard";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
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
  const [google, yelp, tripadvisor] = await Promise.all([
    fetchGooglePlatformReviews(restaurant.nom, location),
    fetchYelpPlatformReviews(restaurant.nom, location),
    fetchTripadvisorPlatformReviews(restaurant.nom, location),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader icon={dashboardIcons.avis} title={`Avis — ${restaurant.nom}`} />

      <p className="max-w-2xl text-sm text-zinc-600">
        Klarr peut rédiger une réponse pour chaque avis. La publication
        directe sur Google arrivera avec l&apos;accès à son API ; en
        attendant, la réponse se copie en un clic.
      </p>

      <div className="grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
        <PlatformReviewsCard data={google} restaurantId={id} />
        <PlatformReviewsCard data={yelp} restaurantId={id} />
        <PlatformReviewsCard data={tripadvisor} restaurantId={id} />
      </div>
    </div>
  );
}
