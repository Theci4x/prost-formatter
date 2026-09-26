import type { SupabaseClient } from "@supabase/supabase-js";
import type { Fermeture } from "@/types/reservation";

/**
 * Les fermetures d'un restaurant qui couvrent une date. Le moteur de
 * disponibilité accepte une liste vide par défaut : tout appelant qui oublie
 * de les charger vendrait un jour de vacances sans s'en apercevoir. D'où
 * cette fonction unique, utilisée partout où l'on calcule une disponibilité.
 *
 * Le client varie selon l'appelant — session du restaurateur côté tableau de
 * bord, clé de service côté page publique — mais la requête est la même.
 */
export async function chargerFermetures(
  supabase: SupabaseClient,
  restaurantId: string,
  date: string,
): Promise<Fermeture[]> {
  const { data } = await supabase
    .from("restaurant_fermetures")
    .select("id, restaurant_id, espace_id, date_debut, date_fin, motif")
    .eq("restaurant_id", restaurantId)
    .lte("date_debut", date)
    .gte("date_fin", date);

  return (data ?? []) as Fermeture[];
}
