import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPageDetails, type PageDetails } from "@/lib/facebook/oauth";
import { disconnectSocial } from "./actions";
import { FacebookConnectButton } from "@/components/connections/FacebookConnectButton";
import { Compteur, TitreSection } from "@/components/dashboard/Compteur";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

export default async function SocialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ connected?: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");
  const { connected } = await searchParams;

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
      <PageHeader
        icon={dashboardIcons.social}
        title={`Réseaux sociaux — ${restaurant.nom}`}
        backHref={`/dashboard/${id}/connexions`}
      />

      {connected && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Compte Facebook connecté avec succès.
        </p>
      )}

      {!connection ? (
        <section className="flex flex-col items-start gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full bg-zinc-300"
            />
            <span className="font-serif text-3xl text-ink">
              Aucune page reliée
            </span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600">
            Relie ta page Facebook : ton compte Instagram professionnel suit
            avec elle, et ton flux Instagram apparaît sur ton site vitrine.
          </p>
          <FacebookConnectButton restaurantId={id} />
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <Compteur
              valeur={
                details?.followersCount != null
                  ? details.followersCount.toLocaleString("fr-FR")
                  : "—"
              }
              libelle="abonnés Facebook"
            />
            <Compteur
              valeur={details ? details.posts.length : "—"}
              libelle="publications récentes"
            />
            <Compteur
              valeur={details?.instagramUsername ? "Oui" : "Non"}
              libelle={
                details?.instagramUsername
                  ? `Instagram relié : @${details.instagramUsername}`
                  : "Instagram pas encore relié"
              }
              accent={Boolean(details) && !details?.instagramUsername}
            />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <section className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full bg-emerald-500"
                />
                <span className="font-serif text-2xl text-ink">
                  Page reliée
                </span>
              </div>
              <span className="rounded-xl bg-white px-4 py-3 text-lg font-semibold text-ink">
                {connection.facebook_page_name ?? "Page Facebook"}
              </span>
              {fetchError && (
                <p className="text-sm text-red-600">
                  Impossible de récupérer les données Facebook pour le moment.
                </p>
              )}
              <form action={disconnectSocial}>
                <input type="hidden" name="restaurant_id" value={id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-zinc-500 hover:text-red-600"
                >
                  Déconnecter
                </button>
              </form>
            </section>

            <section className="flex min-w-0 flex-col gap-3">
              <TitreSection>Derniers posts</TitreSection>
              {!details || details.posts.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
                  Aucun post récent.
                </p>
              ) : (
                <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {details.posts.map((post, i) => (
                    <li
                      key={i}
                      className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                    >
                      <p className="line-clamp-4 text-[15px] leading-relaxed text-ink">
                        {post.message ?? "(sans texte)"}
                      </p>
                      <a
                        href={post.permalinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto text-sm font-semibold text-brand-orange-dark hover:underline"
                      >
                        Voir le post ↗
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
