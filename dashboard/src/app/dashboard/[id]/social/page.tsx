import Link from "next/link";
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
import { langueUtilisateur } from "@/lib/i18n/langue";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { SOCIAL } from "@/lib/i18n/pages/social";

/** « 20 septembre », ou rien si Facebook renvoie une date illisible. */
function jour(iso: string, langue: Langue): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(localeDe(langue), {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
}

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

  const instagram = details?.instagramUsername ?? null;
  const langue = await langueUtilisateur();
  const t = traducteur(langue, SOCIAL, COMMUN);

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-3">
        <PageHeader
          icon={dashboardIcons.social}
          title={t("Réseaux sociaux — {nom}", { nom: restaurant.nom })}
          backHref={`/dashboard/${id}/connexions`}
        />
        <p className="max-w-4xl text-sm text-zinc-600">
          {t(
            "Ta page Facebook et ton compte Instagram professionnel, reliés ensemble : Klarr suit tes abonnés et tes derniers posts, et ton flux Instagram s'affiche sur ton site vitrine sans rien recopier.",
          )}
        </p>
      </div>

      {connected && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          {t("Compte Facebook connecté avec succès.")}
        </p>
      )}

      {/* Les trois mêmes cases, reliée ou non : sans page, elles disent
          ce qui manque au lieu de disparaître. */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur
          valeur={
            details?.followersCount != null
              ? details.followersCount.toLocaleString(localeDe(langue))
              : "—"
          }
          libelle={
            connection ? t("abonnés Facebook") : t("page Facebook à relier")
          }
          accent={!connection}
        />
        <Compteur
          valeur={details ? details.posts.length : "—"}
          libelle={t("publications récentes")}
        />
        <Compteur
          valeur={instagram ? t("Relié") : "—"}
          libelle={
            instagram
              ? t("Instagram : @{compte}", { compte: instagram })
              : t("Instagram pas encore relié")
          }
          accent={Boolean(details) && !instagram}
        />
      </div>

      {!connection ? (
        <section className="flex flex-col items-start gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-3 w-3 rounded-full bg-zinc-300"
            />
            <span className="font-serif text-3xl text-ink">
              {t("Aucune page reliée")}
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
            {t(
              "Relie ta page Facebook : ton compte Instagram professionnel suit avec elle, et ton flux Instagram apparaît sur ton site vitrine.",
            )}
          </p>
          <FacebookConnectButton restaurantId={id} langue={langue} />
        </section>
      ) : (
        <div className="grid items-start gap-8 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <section className="flex flex-col gap-4">
            <TitreSection>{t("Ta page")}</TitreSection>
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full bg-emerald-500"
                />
                <span className="font-serif text-2xl text-ink">
                  {t("Page reliée")}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 rounded-xl bg-white px-4 py-3">
                <span className="text-lg font-semibold text-ink">
                  {connection.facebook_page_name ?? t("Page Facebook")}
                </span>
                {instagram && (
                  <span className="text-sm text-zinc-500">@{instagram}</span>
                )}
              </div>
              {fetchError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {t(
                    "Impossible de récupérer les données Facebook pour le moment.",
                  )}
                </p>
              )}
              {/* Instagram ne se relie pas seul : Meta ne le rend visible
                  que s'il est professionnel et rattaché à la page. */}
              {details && !instagram && (
                <p className="rounded-xl bg-white/70 px-4 py-3 text-sm leading-relaxed text-ink">
                  {t(
                    "Pour qu'Instagram suive, passe ton compte en professionnel et rattache-le à cette page dans Meta Business Suite, puis reconnecte-toi ici.",
                  )}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 border-t border-emerald-200/70 pt-4">
                <Link
                  href={`/dashboard/${id}/vitrine`}
                  className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {t("Voir ma vitrine")}
                </Link>
                <form action={disconnectSocial}>
                  <input type="hidden" name="restaurant_id" value={id} />
                  <button
                    type="submit"
                    className="text-sm font-medium text-zinc-500 hover:text-red-600"
                  >
                    {t("Déconnecter")}
                  </button>
                </form>
              </div>
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-4">
            <TitreSection
              aside={
                details
                  ? t("{n} récents", { n: details.posts.length })
                  : undefined
              }
            >
              {t("Derniers posts")}
            </TitreSection>
            {!details || details.posts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-10 text-center text-sm text-zinc-600">
                {t("Aucun post récent sur ta page.")}
              </p>
            ) : (
              <ul className="grid gap-3 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {details.posts.map((post, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
                  >
                    {jour(post.createdTime, langue) && (
                      <span className="text-xs text-zinc-400">
                        {jour(post.createdTime, langue)}
                      </span>
                    )}
                    <p className="line-clamp-4 text-[15px] leading-relaxed text-ink">
                      {post.message ?? t("(sans texte)")}
                    </p>
                    <a
                      href={post.permalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
                    >
                      {t("Voir le post ↗")}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
