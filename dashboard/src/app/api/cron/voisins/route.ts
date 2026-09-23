import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { jetonValide } from "@/lib/limites/publiques";
import { chargerAcces } from "@/lib/abonnement/acces";
import { noteDe } from "@/lib/google/places";

export const maxDuration = 300;

/** On s'arrête avant d'être coupé : le reste passera la semaine suivante. */
const BUDGET_MS = 240_000;

/**
 * Le relevé des voisins, chaque lundi.
 *
 * Un appel Google par voisin suivi : c'est pour ça qu'on s'en tient à
 * cinq par maison, à une fois par semaine, et aux seules maisons dont la
 * visibilité est ouverte — un compte fermé ne paie plus, il ne coûte plus.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/voisins] CRON_SECRET manquant");
    return NextResponse.json({ error: "non configuré" }, { status: 500 });
  }
  if (!jetonValide(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "clé Google absente" }, { status: 500 });
  }

  const debut = Date.now();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("restaurant_voisins")
    .select("restaurant_id, place_id");
  if (error) {
    console.error("[cron/voisins]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const parMaison = new Map<string, string[]>();
  for (const v of (data ?? []) as {
    restaurant_id: string;
    place_id: string;
  }[]) {
    parMaison.set(v.restaurant_id, [
      ...(parMaison.get(v.restaurant_id) ?? []),
      v.place_id,
    ]);
  }

  const bilan = { maisons: 0, releves: 0, echecs: 0, ignorees: 0 };
  for (const [restaurantId, lieux] of parMaison) {
    if (Date.now() - debut > BUDGET_MS) break;
    const acces = await chargerAcces(restaurantId, supabase);
    if (!acces.ouvert.visibilite) {
      bilan.ignorees += 1;
      continue;
    }
    bilan.maisons += 1;
    for (const placeId of lieux) {
      try {
        const { note, nombreAvis } = await noteDe(placeId);
        const { error: erreur } = await supabase
          .from("restaurant_voisins_releves")
          .upsert(
            {
              restaurant_id: restaurantId,
              place_id: placeId,
              note,
              nombre_avis: nombreAvis,
            },
            { onConflict: "restaurant_id,place_id,releve_le" },
          );
        if (erreur) throw new Error(erreur.message);
        bilan.releves += 1;
      } catch (cause) {
        bilan.echecs += 1;
        console.error("[cron/voisins]", placeId, cause);
      }
    }
  }

  console.log(
    `[cron/voisins] ${bilan.releves} relevé(s) pour ${bilan.maisons} maison(s), ` +
      `${bilan.echecs} échec(s), ${bilan.ignorees} maison(s) sans visibilité`,
  );
  return NextResponse.json(bilan);
}
