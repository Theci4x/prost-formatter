import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidAccessToken } from "@/lib/google/connection";
import { listAccounts } from "@/lib/google/business";

/**
 * La fiche Google d'un établissement, prête à recevoir des appels.
 *
 * Publications et réponses aux avis passent par le même chemin : la
 * connexion OAuth du restaurant, un jeton encore valide, le compte et la
 * fiche qu'il a choisie. Ce qui manque est dit, pour que l'écran puisse
 * proposer la bonne étape plutôt qu'un échec muet.
 */
export type FicheGoogle =
  | {
      etat: "prete";
      accessToken: string;
      accountName: string;
      /** « locations/123 » ou « accounts/x/locations/123 », selon l'époque. */
      locationName: string;
    }
  | { etat: "non-connecte" }
  | { etat: "sans-fiche" };

export async function ouvrirFicheGoogle(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<FicheGoogle> {
  const { data } = await supabase
    .from("google_business_connections")
    .select(
      "restaurant_id, access_token, refresh_token, token_expires_at, account_name, location_name",
    )
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  const connexion = data as {
    restaurant_id: string;
    access_token: string;
    refresh_token: string;
    token_expires_at: string;
    account_name: string | null;
    location_name: string | null;
  } | null;

  if (!connexion) return { etat: "non-connecte" };
  if (!connexion.location_name) return { etat: "sans-fiche" };

  const accessToken = await getValidAccessToken(supabase, connexion);

  // Les connexions établies avant que le compte soit retenu n'en ont
  // pas : on le retrouve une fois, et on le range pour la suite.
  let accountName = connexion.account_name;
  if (!accountName) {
    const comptes = await listAccounts(accessToken);
    accountName = comptes[0]?.name ?? null;
    if (accountName) {
      await supabase
        .from("google_business_connections")
        .update({ account_name: accountName })
        .eq("restaurant_id", restaurantId);
    }
  }
  if (!accountName) return { etat: "sans-fiche" };

  return {
    etat: "prete",
    accessToken,
    accountName,
    locationName: connexion.location_name,
  };
}

/** Le chemin v4 de la fiche : « accounts/x/locations/123 ». */
export function cheminFiche(accountName: string, locationName: string): string {
  const locationId = locationName.replace(/^.*locations\//, "");
  return `${accountName}/locations/${locationId}`;
}
