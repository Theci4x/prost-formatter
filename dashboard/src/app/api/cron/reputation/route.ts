import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { TOUJOURS_FRAIS } from "@/lib/reviews/fraicheur";
import {
  fetchGooglePlatformReviews,
  fetchYelpPlatformReviews,
  fetchTripadvisorPlatformReviews,
} from "@/lib/reviews/aggregate";

export const maxDuration = 60;

/**
 * Un établissement est relevé une fois par semaine, pas une fois par nuit.
 *
 * La note d'un restaurant ne bouge pas d'un jour à l'autre : sept fois par
 * semaine, c'était sept fois la facture Google Places pour la même
 * information. Et à quelques dizaines d'établissements, la boucle dépassait
 * la minute accordée par Vercel — coupée au même endroit chaque nuit, elle
 * n'aurait jamais relevé la fin de la liste, sans que rien ne le dise.
 */
const JOURS_DU_CYCLE = 7;

/**
 * La tâche s'arrête d'elle-même avant le plafond, plutôt que de se faire
 * couper au milieu d'un établissement. Ce qui n'a pas été relevé cette nuit
 * l'est la suivante : la file est triée par ancienneté, les laissés-pour-
 * compte passent donc en tête.
 */
const BUDGET_MS = 45_000;

type RestaurantRow = {
  id: string;
  nom: string;
  adresse: string | null;
  // L'établissement Tripadvisor confirmé par le restaurateur. Le relevé de
  // nuit doit l'honorer comme l'écran : sinon il enregistrerait chaque nuit
  // la note d'un homonyme par-dessus celle qu'on lui a désignée.
  tripadvisor_location_id: string | null;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  // Sans secret configuré on refuse : une route ouverte déclencherait des
  // appels facturés aux API Google/Yelp pour n'importe quel visiteur.
  if (!secret) {
    console.error("[cron/reputation] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { count, error: comptageError } = await supabase
    .from("restaurants")
    .select("id", { count: "exact", head: true });

  if (comptageError) {
    console.error("[cron/reputation] comptage", comptageError);
    return NextResponse.json({ error: "lecture impossible" }, { status: 500 });
  }

  const total = count ?? 0;
  // Un septième par nuit, jamais zéro : avec trois établissements, un
  // arrondi à zéro ne relèverait plus jamais rien.
  const lot = Math.max(1, Math.ceil(total / JOURS_DU_CYCLE));

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, nom, adresse, tripadvisor_location_id")
    // Les plus anciennement relevés d'abord, et les jamais relevés avant
    // tous les autres : une fois le parc à jour, un établissement inscrit ce
    // soir a donc sa note dès demain matin.
    .order("reputation_relevee_le", { ascending: true, nullsFirst: true })
    // Départage les jamais relevés par ancienneté d'inscription. Sans cela
    // leur ordre est celui que la base veut bien rendre : au démarrage, avec
    // tout le parc à NULL, on ne saurait pas dire qui passe quand — et le
    // même établissement pourrait attendre plusieurs jours de plus qu'un
    // autre inscrit après lui.
    .order("created_at", { ascending: true })
    .limit(lot);

  if (error) {
    console.error("[cron/reputation] lecture des restaurants", error);
    return NextResponse.json({ error: "lecture impossible" }, { status: 500 });
  }

  const restaurants = (data ?? []) as RestaurantRow[];
  const debut = Date.now();
  let releves = 0;
  let traites = 0;

  // Séquentiel volontairement : les quotas Places/Yelp se comptent à la
  // requête, et rien ne presse dans une tâche de nuit.
  for (const restaurant of restaurants) {
    if (Date.now() - debut > BUDGET_MS) {
      console.log(
        `[cron/reputation] budget atteint après ${traites} établissement(s) : le reste passe demain`,
      );
      break;
    }

    const location = restaurant.adresse ?? "";

    const platforms = await Promise.all([
      fetchGooglePlatformReviews(restaurant.nom, location, TOUJOURS_FRAIS),
      fetchYelpPlatformReviews(restaurant.nom, location, TOUJOURS_FRAIS),
      fetchTripadvisorPlatformReviews(
        restaurant.nom,
        location,
        restaurant.tripadvisor_location_id,
        TOUJOURS_FRAIS,
      ),
    ]);

    // Tracé dans les logs : sans ça, une tâche qui n'enregistre rien est
    // indiscernable d'une tâche qui n'a pas tourné.
    console.log(
      `[cron/reputation] ${restaurant.nom} :`,
      platforms
        .map(
          (p) =>
            `${p.platform}=${!p.configured ? "clé absente" : p.found ? `${p.rating}/${p.reviewCount}` : "introuvable"}`,
        )
        .join(", "),
    );

    // Marqué relevé dès qu'au moins une plateforme a été interrogée, même
    // si elle n'a rien trouvé : sans cela, un établissement introuvable sur
    // Google serait réinterrogé toutes les nuits, à nos frais, pour le même
    // résultat. Aucune clé configurée, en revanche, ne coûte ni n'apprend
    // rien : on ne consomme pas son tour.
    if (platforms.some((platform) => platform.configured)) {
      traites += 1;
      const { error: dateError } = await supabase
        .from("restaurants")
        .update({ reputation_relevee_le: new Date().toISOString() })
        .eq("id", restaurant.id);
      if (dateError) {
        // Sans cette date, l'établissement repasserait en tête demain et
        // bloquerait la rotation sur lui : c'est une erreur à voir.
        console.error("[cron/reputation] rotation", restaurant.id, dateError);
      }
    }

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

  console.log(
    `[cron/reputation] terminé : ${traites}/${restaurants.length} établissement(s) du lot, ${releves} relevé(s), ${total} au total`,
  );

  return NextResponse.json({
    // De quoi vérifier la rotation d'un coup d'œil dans les journaux Vercel :
    // un lot qui n'avance pas se voit ici avant de se voir sur la facture.
    total,
    lot,
    traites,
    releves,
  });
}
