import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/tiktok/connection";
import { getUserInfo, getRecentVideos, type TikTokVideo } from "@/lib/tiktok/oauth";
import { disconnectTikTok } from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { TikTokConnection } from "@/types/tiktok";

export default async function TikTokPage({
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
    .from("tiktok_connections")
    .select("*")
    .eq("restaurant_id", id)
    .maybeSingle();

  const connection = connectionData as TikTokConnection | null;

  let displayName: string | null = null;
  let username: string | null = null;
  let followerCount: number | null = null;
  let videos: TikTokVideo[] = [];
  let fetchError = false;

  if (connection) {
    try {
      const accessToken = await getValidAccessToken(supabase, connection);
      const info = await getUserInfo(accessToken);
      displayName = info.displayName;
      username = info.username;
      followerCount = info.followerCount;
      videos = await getRecentVideos(accessToken);
    } catch (err) {
      console.error("[tiktok/page]", err);
      fetchError = true;
      displayName = connection.display_name;
      username = connection.tiktok_username;
      followerCount = connection.follower_count;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader icon={dashboardIcons.tiktok} title={`TikTok — ${restaurant.nom}`} />

      {connected && (
        <p className="max-w-md rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte TikTok connecté avec succès.
        </p>
      )}
      {error && (
        <p className="max-w-md rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          La connexion a échoué. Réessaie.
        </p>
      )}

      {!connection ? (
        <div className="flex max-w-sm flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">
            Aucun compte TikTok connecté pour ce restaurant.
          </p>
          <a
            href={`/api/tiktok/authorize?restaurant_id=${id}`}
            className="rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Connecter TikTok
          </a>
        </div>
      ) : (
        <div className="flex max-w-md flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-900">
              {displayName ?? "Compte TikTok"}
              {username && (
                <span className="ml-1 font-normal text-zinc-500">
                  @{username}
                </span>
              )}
            </p>
            <form action={disconnectTikTok}>
              <input type="hidden" name="restaurant_id" value={id} />
              <button
                type="submit"
                className="text-sm font-medium text-red-600 hover:text-red-800"
              >
                Déconnecter
              </button>
            </form>
          </div>

          {fetchError && (
            <p className="text-sm text-red-600">
              Impossible de récupérer les données TikTok pour le moment.
            </p>
          )}

          {followerCount != null && (
            <p className="text-sm text-zinc-600">{followerCount} abonnés</p>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-700">
              Dernières vidéos
            </h2>
            {videos.length === 0 ? (
              <p className="text-sm text-zinc-500">Aucune vidéo récente.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {videos.map((video) => (
                  <li
                    key={video.id}
                    className="border-t border-zinc-100 pt-3 first:border-0 first:pt-0"
                  >
                    <p className="line-clamp-2 text-sm text-zinc-700">
                      {video.title ?? "(sans titre)"}
                    </p>
                    <div className="flex items-center justify-between">
                      {video.viewCount != null && (
                        <span className="text-xs text-zinc-500">
                          {video.viewCount} vues
                        </span>
                      )}
                      <a
                        href={video.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        Voir la vidéo →
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
