import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/google/connection";
import { listAccounts, listLocations, type GoogleLocation } from "@/lib/google/business";
import { disconnectGoogle, selectGoogleLocation } from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { GoogleBusinessConnection } from "@/types/google";

export default async function GoogleConnectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { id } = await params;
  const { connected, error } = await searchParams;

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

  const { data: connectionData } = await supabase
    .from("google_business_connections")
    .select(
      "id, restaurant_id, google_email, location_name, location_title, access_token, refresh_token, token_expires_at, created_at, updated_at",
    )
    .eq("restaurant_id", id)
    .maybeSingle();

  const connection = connectionData as
    | (GoogleBusinessConnection & { access_token: string; refresh_token: string })
    | null;

  const locations: GoogleLocation[] = [];
  let locationsError: string | null = null;
  if (connection && !connection.location_name) {
    try {
      const accessToken = await getValidAccessToken(supabase, connection);
      const accounts = await listAccounts(accessToken);
      for (const account of accounts) {
        locations.push(...(await listLocations(accessToken, account.name)));
      }
      if (locations.length === 0) {
        locationsError =
          "Aucune fiche établissement trouvée sur ce compte Google.";
      }
    } catch (err) {
      console.error("[google/page] fetch locations", err);
      locationsError =
        "Impossible de récupérer tes fiches établissement pour le moment (l'API Google Business Profile est peut-être encore en cours d'activation).";
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.google}
        title={`Google Business Profile — ${restaurant.nom}`}
      />

      {connected && (
        <p className="max-w-md rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte Google connecté avec succès.
        </p>
      )}
      {error && (
        <p className="max-w-md rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          La connexion à Google a échoué. Réessaie.
        </p>
      )}

      {!connection ? (
        <div className="flex max-w-sm flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">
            Aucun compte Google connecté pour ce restaurant.
          </p>
          <a
            href={`/api/google/authorize?restaurant_id=${id}`}
            className="rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Connecter mon compte Google Business Profile
          </a>
        </div>
      ) : connection.location_name ? (
        <div className="flex max-w-sm flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-700">
            Connecté en tant que{" "}
            <span className="font-medium">{connection.google_email}</span>
          </p>
          <div className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2">
            <p className="text-sm font-medium text-zinc-900">
              {connection.location_title}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <form action={selectGoogleLocation}>
              <input type="hidden" name="restaurant_id" value={id} />
              <input type="hidden" name="location_name" value="" />
              <input type="hidden" name="location_title" value="" />
              <button
                type="submit"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Changer de fiche
              </button>
            </form>
            <form action={disconnectGoogle}>
              <input type="hidden" name="restaurant_id" value={id} />
              <button
                type="submit"
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Déconnecter ce compte
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex max-w-md flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-700">
            Connecté en tant que{" "}
            <span className="font-medium">{connection.google_email}</span>
          </p>
          <p className="text-sm text-zinc-500">
            Choisis la fiche établissement correspondant à ce restaurant :
          </p>

          {locationsError && (
            <p className="text-sm text-red-600">{locationsError}</p>
          )}

          {locations.length > 0 && (
            <ul className="flex flex-col gap-2">
              {locations.map((location) => (
                <li key={location.name}>
                  <form action={selectGoogleLocation}>
                    <input type="hidden" name="restaurant_id" value={id} />
                    <input
                      type="hidden"
                      name="location_name"
                      value={location.name}
                    />
                    <input
                      type="hidden"
                      name="location_title"
                      value={location.title}
                    />
                    <button
                      type="submit"
                      className="flex w-full flex-col items-start gap-0.5 rounded-md border border-zinc-200 px-3 py-2 text-left hover:border-zinc-400"
                    >
                      <span className="text-sm font-medium text-zinc-900">
                        {location.title}
                      </span>
                      {location.address && (
                        <span className="text-xs text-zinc-500">
                          {location.address}
                        </span>
                      )}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={disconnectGoogle}>
            <input type="hidden" name="restaurant_id" value={id} />
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Déconnecter ce compte
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
