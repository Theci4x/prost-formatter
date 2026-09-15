import type { createClient } from "@/lib/supabase/server";
import { refreshAccessToken } from "./oauth";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type StoredConnection = {
  restaurant_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
};

// Rafraichit le token d'acces s'il expire dans moins de 5 minutes, et
// persiste le nouveau token en base pour les appels suivants.
export async function getValidAccessToken(
  supabase: SupabaseClient,
  connection: StoredConnection,
): Promise<string> {
  const expiresInMs = new Date(connection.token_expires_at).getTime() - Date.now();
  if (expiresInMs > 5 * 60 * 1000) {
    return connection.access_token;
  }

  const refreshed = await refreshAccessToken(connection.refresh_token);
  const tokenExpiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000,
  ).toISOString();

  await supabase
    .from("google_business_connections")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("restaurant_id", connection.restaurant_id);

  return refreshed.access_token;
}
