import Link from "next/link";
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
import { tripadvisorDuReleve } from "@/lib/reviews/releve";
import { FRAICHEUR_DEMANDE } from "@/lib/reviews/fraicheur";
import { ConfirmationTripadvisor } from "@/components/reviews/ConfirmationTripadvisor";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

export default async function AvisPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tripadvisor?: string }>;
}) {
  const { id } = await params;
  // Les avis Tripadvisor ne se chargent que sur demande : chaque appel
  // est facturé, et la note, elle, vient du relevé de la semaine.
  const chargerTripadvisor = (await searchParams).tripadvisor === "avis";
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
  const suivi = restaurant as Restaurant & {
    tripadvisor_location_id?: string | null;
    tripadvisor_location_devine?: string | null;
    reputation_relevee_le?: string | null;
  };
  const epingleTripadvisor = suivi.tripadvisor_location_id;

  const [google, yelp, releveTripadvisor, direct] = await Promise.all([
    fetchGooglePlatformReviews(restaurant.nom, location),
    fetchYelpPlatformReviews(restaurant.nom, location),
    tripadvisorDuReleve(supabase, suivi),
    chargerTripadvisor
      ? fetchTripadvisorPlatformReviews(restaurant.nom, location, {
          epingle: epingleTripadvisor,
          devine: suivi.tripadvisor_location_devine ?? null,
          fraicheur: FRAICHEUR_DEMANDE,
        })
      : Promise.resolve(null),
  ]);
  // Chargé à la demande, l'appel direct l'emporte : il porte les avis, le
  // lien vers la fiche et le nom retenu. Sinon, le relevé suffit.
  const tripadvisor = direct?.found ? direct : releveTripadvisor;

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
                <div className="flex flex-col gap-3">
                  {!direct && (
                    <Link
                      href={`/dashboard/${id}/avis?tripadvisor=avis`}
                      className="w-fit rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
                    >
                      Charger les derniers avis Tripadvisor
                    </Link>
                  )}
                  <ConfirmationTripadvisor
                    restaurantId={id}
                    nomTrouve={
                      // Le relevé ne garde que la note : le nom exact se
                      // voit en chargeant les avis, qui l'apportent.
                      p.businessName ??
                      (p.epingle
                        ? "l'établissement que tu as choisi"
                        : p.found
                          ? "nom visible en chargeant les avis"
                          : null)
                    }
                    requeteInitiale={`${restaurant.nom} ${location}`.trim()}
                    epingle={Boolean(p.epingle)}
                  />
                </div>
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
              Les plateformes n&apos;en transmettent que quelques-uns — les plus
              récents ou les plus pertinents selon elles.
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
              <CarteAvis
                key={`${a.platform}-${i}`}
                avis={a}
                restaurantId={id}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
