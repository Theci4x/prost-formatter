import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlatformReviews } from "@/lib/reviews/aggregate";

/**
 * La note Tripadvisor telle que le relevé de nuit l'a enregistrée.
 *
 * La page Avis interrogeait Tripadvisor à chaque affichage — deux appels
 * facturés, renouvelés toutes les six heures pour qui garde la page
 * ouverte, pour une note qui bouge une fois par mois. Le relevé
 * hebdomadaire la connaît déjà : l'écran la lit en base et ne coûte
 * plus rien. Les textes des avis, eux, ne se stockent pas ; ils se
 * chargent quand on les demande.
 */
export async function tripadvisorDuReleve(
  supabase: SupabaseClient,
  restaurant: {
    id: string;
    tripadvisor_url?: string | null;
    tripadvisor_location_id?: string | null;
    reputation_relevee_le?: string | null;
  },
): Promise<PlatformReviews> {
  const epingle = Boolean(restaurant.tripadvisor_location_id);
  if (!restaurant.tripadvisor_url) {
    return {
      platform: "tripadvisor",
      configured: false,
      found: false,
      reviews: [],
    };
  }

  const { data } = await supabase
    .from("restaurant_reputation_snapshots")
    .select("note, nombre_avis, releve_le")
    .eq("restaurant_id", restaurant.id)
    .eq("plateforme", "tripadvisor")
    .order("releve_le", { ascending: false })
    .limit(1)
    .maybeSingle();

  const releve = data as {
    note: number | string | null;
    nombre_avis: number | null;
    releve_le: string;
  } | null;
  const releveAttendu = !restaurant.reputation_relevee_le;

  if (!releve) {
    return {
      platform: "tripadvisor",
      configured: true,
      found: false,
      epingle,
      releveAttendu,
      reviews: [],
    };
  }

  return {
    platform: "tripadvisor",
    configured: true,
    found: true,
    epingle,
    businessUrl: restaurant.tripadvisor_url ?? null,
    rating: releve.note == null ? null : Number(releve.note),
    reviewCount: releve.nombre_avis,
    releveLe: releve.releve_le,
    releveAttendu,
    reviews: [],
  };
}
