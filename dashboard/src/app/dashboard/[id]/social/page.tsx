import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPageDetails, type PageDetails } from "@/lib/facebook/oauth";
import { disconnectSocial } from "./actions";
import type { Restaurant } from "@/types/restaurant";

export default async function SocialPage({
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
    .from("social_connections")
    .select("facebook_page_id, facebook_page_name, facebook_page_access_token")
    .eq("restaurant_id", id)
    .maybeSingle();

  const connection = connectionData as {
    facebook_page_id: string;
    facebook_page_name: string | null;
    facebook_page_access_token: string;
  } | null;

  let details: PageDetails | null = null;
  let fetchError = false;
  if (connection) {
    try {
      details = await getPageDetails(
        connection.facebook_page_id,
        connection.facebook_page_access_token,
      );
    } catch (err) {
      console.error("[social/page]", err);
      fetchError = true;
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <h1 className="text-lg font-semibold text-zinc-900">
        Réseaux sociaux — {restaurant.nom}
      </h1>

      {connected && (
        <p className="max-w-md rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Compte Facebook connecté avec succès.
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
            Aucune page Facebook/Instagram connectée pour ce restaurant.
          </p>
          <a
            href={`/api/facebook/authorize?restaurant_id=${id}`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Connecter Facebook / Instagram
          </a>
        </div>
      ) : (
        <div className="flex max-w-md flex-col gap-4 rounded-md border border-zinc-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-900">
              {connection.facebook_page_name ?? "Page Facebook"}
            </p>
            <form action={disconnectSocial}>
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
              Impossible de récupérer les données Facebook pour le moment.
            </p>
          )}

          {details && (
            <>
              {details.followersCount != null && (
                <p className="text-sm text-zinc-600">
                  {details.followersCount} abonnés Facebook
                </p>
              )}

              {details.instagramUsername && (
                <p className="text-sm text-zinc-600">
                  Instagram lié : @{details.instagramUsername}
                </p>
              )}

              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-zinc-700">
                  Derniers posts
                </h2>
                {details.posts.length === 0 ? (
                  <p className="text-sm text-zinc-500">Aucun post récent.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {details.posts.map((post, i) => (
                      <li
                        key={i}
                        className="border-t border-zinc-100 pt-3 first:border-0 first:pt-0"
                      >
                        <p className="line-clamp-2 text-sm text-zinc-700">
                          {post.message ?? "(sans texte)"}
                        </p>
                        <a
                          href={post.permalinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                        >
                          Voir le post →
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
