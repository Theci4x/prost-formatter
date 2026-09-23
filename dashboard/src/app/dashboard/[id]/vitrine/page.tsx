import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { basculerVitrine } from "@/app/dashboard/actions";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { siteUrl } from "@/lib/site-url";
import { horairesRenseignes } from "@/lib/site/horaires";
import { couvertureDe } from "@/lib/vitrine/couverture";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

  const supabase = await createClient();
  const [restaurantResult, photosResult, platsResult] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    // Toutes, et dans l'ordre du site : c'est avec elles qu'on montre ce
    // qui ouvre la page, et laquelle le fera par défaut.
    supabase
      .from("restaurant_photos")
      .select("*")
      .eq("restaurant_id", id)
      .order("ordre")
      .order("created_at"),
    supabase
      .from("restaurant_menu_items")
      .select("id")
      .eq("restaurant_id", id)
      .limit(1),
  ]);

  const restaurant = restaurantResult.data as
    | (Restaurant & {
        site_publie?: boolean;
        photo_couverture_id?: string | null;
      })
    | null;
  if (!restaurant) notFound();

  const photos = (photosResult.data ?? []) as RestaurantPhoto[];
  const couverture = couvertureDe(photos, restaurant.photo_couverture_id);

  const slug = restaurant.slug_reservation;
  const publiee = Boolean(restaurant.site_publie);
  const site = siteUrl();

  // Ce qui rendrait la vitrine plus convaincante. On n'interdit rien : c'est
  // son établissement, et une page incomplète vaut mieux que pas de page.
  const manques = [
    restaurant.adresse
      ? null
      : { texte: "ton adresse", ou: `/dashboard/${id}/edit` },
    restaurant.telephone
      ? null
      : { texte: "ton téléphone", ou: `/dashboard/${id}/edit` },
    restaurant.description
      ? null
      : { texte: "une description", ou: `/dashboard/${id}/edit` },
    horairesRenseignes(restaurant.horaires ?? {})
      ? null
      : { texte: "tes horaires", ou: `/dashboard/${id}/edit` },
    photos.length > 0
      ? null
      : { texte: "des photos", ou: `/dashboard/${id}/photos` },
    (platsResult.data ?? []).length > 0
      ? null
      : { texte: "ta carte", ou: `/dashboard/${id}/menu` },
  ].filter(
    (manque): manque is { texte: string; ou: string } => manque !== null,
  );

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.edit}
        title={`Site vitrine — ${restaurant.nom}`}
        backHref="/dashboard"
      />

      <p className="max-w-4xl text-sm text-zinc-500">
        Ton site, engendré de ce que tu as déjà rempli : tes photos, ta carte,
        tes horaires, ton adresse, ta note Google. Rien de plus à saisir, rien à
        mettre en page. C&apos;est l&apos;adresse à donner à Google, à ta fiche
        d&apos;établissement et à ton Instagram — et c&apos;est exactement ce
        qu&apos;un audit de visibilité reproche à un restaurant qui n&apos;en a
        pas.
      </p>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
        {!slug ? (
          <>
            <p className="text-sm font-medium text-zinc-900">
              Ouvre d&apos;abord ta page de réservation.
            </p>
            <p className="text-sm text-zinc-500">
              La vitrine partage son adresse : c&apos;est là que se décide le
              nom de ton site.
            </p>
            <Link
              href={`/dashboard/${id}/reservations/configuration`}
              className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
            >
              Ouvrir ma page de réservation
            </Link>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-900">
                {publiee
                  ? "Ton site est en ligne."
                  : "Ton site n'est pas encore ouvert."}
              </span>
              {publiee ? (
                <a
                  href={`/restaurant/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit break-all font-medium text-brand-orange hover:underline"
                >
                  {site}/restaurant/{slug}
                </a>
              ) : (
                <span className="break-all text-sm text-zinc-400">
                  Il recevra l&apos;adresse {site}/restaurant/{slug}
                </span>
              )}
            </div>

            <form action={basculerVitrine} className="w-fit">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="publier" value={publiee ? "0" : "1"} />
              <button
                type="submit"
                className={
                  publiee
                    ? "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                    : "rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
                }
              >
                {publiee ? "Retirer mon site" : "Publier mon site"}
              </button>
            </form>
          </>
        )}
      </section>

      {/* La photo qui ouvre le site, montrée comme le site la montre : en
          grand, le nom dessus. Depuis que la vitrine s'ouvre en plein écran,
          c'est la décision qui compte le plus, et elle se prenait dans un
          coin de l'écran Photos, au survol d'une vignette. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">
            Photo de couverture
          </h2>
          <p className="text-sm text-zinc-500">
            C&apos;est la première chose qu&apos;on voit de ton site, en plein
            écran, avant de lire quoi que ce soit.
          </p>
        </div>

        {couverture.photo ? (
          <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-zinc-200/70 shadow-sm">
            <Image
              src={couverture.photo.url}
              alt={couverture.photo.legende ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <span className="absolute bottom-4 left-5 font-serif text-3xl text-white sm:text-4xl">
              {restaurant.nom}
            </span>
          </div>
        ) : (
          <div className="flex aspect-[21/9] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
            <span className="font-serif text-2xl text-zinc-400">
              {restaurant.nom}
            </span>
            <span className="text-sm text-zinc-500">
              Pour l&apos;instant, ton site s&apos;ouvre sur ce bandeau vide.
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href={`/dashboard/${id}/photos`}
            className={
              couverture.photo
                ? "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                : "rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
            }
          >
            {couverture.photo
              ? "Choisir une autre photo"
              : "Ajouter une photo de couverture"}
          </Link>
          {couverture.photo && !couverture.choisie && (
            <span className="text-sm text-zinc-500">
              C&apos;est la première de tes photos, faute de choix : une salle
              pleine ou la façade feront plus d&apos;effet qu&apos;un plat.
            </span>
          )}
        </div>
      </section>

      {slug && manques.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-zinc-900">
            Ce qui manque encore
          </h2>
          <p className="text-sm text-zinc-500">
            Ton site s&apos;affiche déjà sans, mais il paraîtra plus vide qu
            &apos;il ne devrait.
          </p>
          <ul className="flex flex-col gap-2">
            {manques.map((manque) => (
              <li key={manque.texte}>
                <Link
                  href={manque.ou}
                  className="text-sm font-medium text-brand-orange hover:underline"
                >
                  Ajouter {manque.texte}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
