import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
  fetchGooglePlatformReviews,
} from "@/lib/reviews/aggregate";
import {
  CarteAvis,
  TuilePlateforme,
  type AvisAffiche,
} from "@/components/reviews/PlatformReviewsCard";
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

  const plateformes = [google, yelp, tripadvisor].filter((p) => p.configured);

  // Toutes plateformes confondues, du plus récent au plus ancien : c'est
  // l'ordre dans lequel on répond. Sans date, en dernier.
  const avis: AvisAffiche[] = plateformes
    .filter((p) => p.found)
    .flatMap((p) =>
      p.reviews.map((r) => ({
        ...r,
        platform: p.platform,
        ficheUrl: p.businessUrl ?? null,
      })),
    )
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

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

      {/* Une plateforme sans clé API n'est pas montrée : « ajoutez une clé
          Yelp » s'adresse à nous, et le restaurateur n'y peut rien. Elle
          apparaîtra le jour où la clé sera posée. */}
      <div
        className={`grid gap-4 ${
          plateformes.length >= 3
            ? "md:grid-cols-3"
            : plateformes.length === 2
              ? "md:grid-cols-2"
              : ""
        }`}
      >
        {plateformes.map((p) => (
          <TuilePlateforme
            key={p.platform}
            data={p}
            pied={
              p.platform === "tripadvisor" ? (
                <ConfirmationTripadvisor
                  restaurantId={id}
                  nomTrouve={p.businessName ?? null}
                  requeteInitiale={`${restaurant.nom} ${location}`.trim()}
                  epingle={Boolean(p.epingle)}
                />
              ) : null
            }
          />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="font-serif text-2xl text-ink">Derniers avis</h2>
          {avis.length > 0 && (
            <p className="text-xs text-zinc-500">
              Les plateformes n&apos;en transmettent que quelques-uns — les
              plus récents ou les plus pertinents selon elles.
            </p>
          )}
        </div>
        {avis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
            Aucun avis à afficher pour l&apos;instant — la raison est indiquée
            sur chaque plateforme, au-dessus.
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {avis.map((a, i) => (
              <CarteAvis key={`${a.platform}-${i}`} avis={a} restaurantId={id} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
