import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/tiktok/connection";
import {
  getUserInfo,
  getRecentVideos,
  tiktokDisponible,
  type TikTokVideo,
} from "@/lib/tiktok/oauth";
import { disconnectTikTok } from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { TikTokConnection } from "@/types/tiktok";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { SOCIAL } from "@/lib/i18n/pages/social";

export default async function TikTokPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");
  // Masqué tant que l'application n'est pas validée chez TikTok : sans les
  // clés, même un compte déjà relié ne pourrait plus rafraîchir son jeton.
  if (!tiktokDisponible()) notFound();
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
  const langue = await langueUtilisateur();
  const t = traducteur(langue, SOCIAL, COMMUN);
  const nombre = (n: number) => n.toLocaleString(localeDe(langue));

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
      <PageHeader
        icon={dashboardIcons.tiktok}
        title={t("TikTok — {nom}", { nom: restaurant.nom })}
        backHref={`/dashboard/${id}/connexions`}
      />

      {connected && (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("Compte TikTok connecté avec succès.")}
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {t("La connexion a échoué. Réessaie.")}
        </p>
      )}

      {!connection ? (
        <div className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <p className="text-sm text-zinc-500">
            {t("Aucun compte TikTok connecté pour ce restaurant.")}
          </p>
          <a
            href={`/api/tiktok/authorize?restaurant_id=${id}`}
            className="w-fit rounded-md bg-brand-navy px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t("Connecter TikTok")}
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-900">
              {displayName ?? t("Compte TikTok")}
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
                {t("Déconnecter")}
              </button>
            </form>
          </div>

          {fetchError && (
            <p className="text-sm text-red-600">
              {t("Impossible de récupérer les données TikTok pour le moment.")}
            </p>
          )}

          {followerCount != null && (
            <p className="text-sm text-zinc-600">
              {t("{n} abonnés", { n: nombre(followerCount) })}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-zinc-700">
              {t("Dernières vidéos")}
            </h2>
            {videos.length === 0 ? (
              <p className="text-sm text-zinc-500">
                {t("Aucune vidéo récente.")}
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {videos.map((video) => (
                  <li
                    key={video.id}
                    className="border-t border-zinc-100 pt-3 first:border-0 first:pt-0"
                  >
                    <p className="line-clamp-2 text-sm text-zinc-700">
                      {video.title ?? t("(sans titre)")}
                    </p>
                    <div className="flex items-center justify-between">
                      {video.viewCount != null && (
                        <span className="text-xs text-zinc-500">
                          {t("{n} vues", { n: nombre(video.viewCount) })}
                        </span>
                      )}
                      <a
                        href={video.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        {t("Voir la vidéo →")}
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
