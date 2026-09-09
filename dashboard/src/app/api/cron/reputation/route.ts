import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  fetchGooglePlatformReviews,
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
} from "@/lib/reviews/aggregate";

// Un relevé par jour et par établissement : c'est la cadence des plans
// gratuits Vercel, et la note d'un restaurant ne bouge pas à l'heure.
export const maxDuration = 60;

type RestaurantRow = { id: string; nom: string; adresse: string | null };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Sans secret configuré on refuse : une route ouverte déclencherait des
  // appels facturés aux API Google/Yelp pour n'importe quel visiteur.
  if (!secret) {
    console.error("[cron/reputation] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id, nom, adresse");

  if (error) {
    console.error("[cron/reputation] lecture des restaurants", error);
    return NextResponse.json({ error: "lecture impossible" }, { status: 500 });
  }

  const restaurants = (data ?? []) as RestaurantRow[];
  let releves = 0;

  // Séquentiel volontairement : les quotas Places/Yelp se comptent à la
  // requête, et rien ne presse dans une tâche de nuit.
  for (const restaurant of restaurants) {
    const location = restaurant.adresse ?? "";

    const platforms = await Promise.all([
      fetchGooglePlatformReviews(restaurant.nom, location),
      fetchYelpPlatformReviews(restaurant.nom, location),
      fetchTripadvisorPlatformReviews(restaurant.nom, location),
    ]);

    const rows = platforms
      // Un établissement introuvable n'est pas un établissement à zéro
      // avis : ne rien enregistrer vaut mieux qu'enregistrer un faux
      // effondrement de la note.
      .filter((platform) => platform.found)
      .map((platform) => ({
        restaurant_id: restaurant.id,
        plateforme: platform.platform,
        note: platform.rating ?? null,
        nombre_avis: platform.reviewCount ?? null,
      }));

    if (rows.length === 0) continue;

    const { error: insertError } = await supabase
      .from("restaurant_reputation_snapshots")
      .insert(rows);

    if (insertError) {
      console.error("[cron/reputation] insertion", restaurant.id, insertError);
      continue;
    }
    releves += rows.length;
  }

  return NextResponse.json({
    restaurants: restaurants.length,
    releves,
  });
}
