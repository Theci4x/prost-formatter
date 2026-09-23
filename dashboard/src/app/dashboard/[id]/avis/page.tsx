import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
  fetchGooglePlatformReviews,
} from "@/lib/reviews/aggregate";
import { PlatformReviewsCard } from "@/components/reviews/PlatformReviewsCard";
import { ConfirmationTripadvisor } from "@/components/reviews/ConfirmationTripadvisor";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

export default async function AvisPage({
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

  const location = restaurant.adresse ?? "";
  const epingleTripadvisor = (
    restaurant as Restaurant & { tripadvisor_location_id?: string | null }
  ).tripadvisor_location_id;

  const [google, yelp, tripadvisor] = await Promise.all([
    fetchGooglePlatformReviews(restaurant.nom, location),
    fetchYelpPlatformReviews(restaurant.nom, location),
    fetchTripadvisorPlatformReviews(
      restaurant.nom,
      location,
      epingleTripadvisor,
    ),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.avis}
        title={`Avis — ${restaurant.nom}`}
      />

      <p className="max-w-4xl text-sm text-zinc-600">
        Klarr peut rédiger une réponse pour chaque avis. La publication directe
        sur Google arrivera avec l&apos;accès à son API ; en attendant, la
        réponse se copie en un clic.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PlatformReviewsCard data={google} restaurantId={id} />
        <PlatformReviewsCard data={yelp} restaurantId={id} />
        <PlatformReviewsCard
          data={tripadvisor}
          restaurantId={id}
          pied={
            tripadvisor.configured ? (
              <ConfirmationTripadvisor
                restaurantId={id}
                nomTrouve={tripadvisor.businessName ?? null}
                requeteInitiale={`${restaurant.nom} ${location}`.trim()}
                epingle={Boolean(tripadvisor.epingle)}
              />
            ) : null
          }
        />
      </div>
    </div>
  );
}
