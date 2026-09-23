import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
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
    // Le compte seul, sans rapatrier les plats : le compteur et la liste
    // n'ont besoin que de savoir combien.
    supabase
      .from("restaurant_menu_items")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", id)
      .eq("actif", true),
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

  // Ce qui fait un site convaincant, dans l'ordre où un client le voit.
  // On n'interdit rien : c'est son établissement, et une page incomplète
  // vaut mieux que pas de page. Mais on montre ce qui est fait autant que
  // ce qui manque — une liste de manques seule se lit comme un reproche.
  const elements: { texte: string; fait: boolean; ou: string }[] = [
    {
      texte: "Une photo de couverture",
      fait: Boolean(couverture.photo),
      ou: `/dashboard/${id}/photos`,
    },
    {
      texte: "Une description",
      fait: Boolean(restaurant.description?.trim()),
      ou: `/dashboard/${id}/edit`,
    },
    {
      texte: "Des photos",
      fait: photos.length > 1,
      ou: `/dashboard/${id}/photos`,
    },
    {
      texte: "La carte",
      fait: (platsResult.count ?? 0) > 0,
      ou: `/dashboard/${id}/menu`,
    },
    {
      texte: "Les horaires",
      fait: horairesRenseignes(restaurant.horaires ?? {}),
      ou: `/dashboard/${id}/edit`,
    },
    {
      texte: "L'adresse",
      fait: Boolean(restaurant.adresse),
      ou: `/dashboard/${id}/edit`,
    },
    {
      texte: "Le téléphone",
      fait: Boolean(restaurant.telephone),
      ou: `/dashboard/${id}/edit`,
    },
  ];
  const faits = elements.filter((e) => e.fait).length;
  const nombrePlats = platsResult.count ?? 0;
  const adresse = slug ? `${site}/restaurant/${slug}` : null;

  return (
    <div className="flex flex-1 flex-col gap-8 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.vitrine}
        title={`Site vitrine — ${restaurant.nom}`}
        backHref="/dashboard"
      />

      <p className="max-w-4xl text-sm text-zinc-600">
        Ton site, engendré de ce que tu as déjà rempli : tes photos, ta carte,
        tes horaires, ton adresse, ta note Google. Rien de plus à saisir, rien à
        mettre en page. C&apos;est l&apos;adresse à donner à Google, à ta fiche
        d&apos;établissement et à ton Instagram — et c&apos;est exactement ce
        qu&apos;un audit de visibilité reproche à un restaurant qui n&apos;en a
        pas.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Compteur
          valeur={publiee ? "En ligne" : "Hors ligne"}
          libelle={
            publiee ? "ton site est ouvert" : "ton site n'est pas publié"
          }
          accent={!publiee}
        />
        <Compteur
          valeur={`${faits}/${elements.length}`}
          libelle="éléments du site remplis"
          accent={faits < elements.length}
        />
        <Link href={`/dashboard/${id}/photos`} className="block">
          <Compteur
            valeur={photos.length}
            libelle={`photo${photos.length > 1 ? "s" : ""} sur le site`}
          />
        </Link>
        <Link href={`/dashboard/${id}/menu`} className="block">
          <Compteur
            valeur={nombrePlats}
            libelle={`plat${nombrePlats > 1 ? "s" : ""} à la carte`}
          />
        </Link>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[26rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          {/* L'état du site : en ligne ou non, et son adresse. */}
          <section
            className={`flex flex-col gap-4 rounded-2xl border p-6 shadow-sm ${
              publiee
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-zinc-200/70 bg-white"
            }`}
          >
            {!slug ? (
              <>
                <span className="font-serif text-2xl text-ink">
                  Ouvre d&apos;abord ta page de réservation.
                </span>
                <p className="text-sm text-zinc-500">
                  La vitrine partage son adresse : c&apos;est là que se décide
                  le nom de ton site.
                </p>
                <Link
                  href={`/dashboard/${id}/reservations/configuration`}
                  className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                >
                  Ouvrir ma page de réservation
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${
                      publiee ? "bg-emerald-500" : "bg-zinc-300"
                    }`}
                  />
                  <span className="font-serif text-2xl text-ink">
                    {publiee
                      ? "Ton site est en ligne"
                      : "Ton site n'est pas ouvert"}
                  </span>
                </div>
                {publiee ? (
                  <div className="flex flex-col gap-3">
                    <a
                      href={`/restaurant/${slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit break-all text-sm font-semibold text-brand-orange-dark hover:underline"
                    >
                      {adresse} ↗
                    </a>
                    {/* L'adresse sert ailleurs qu'ici : on la copie pour la
                        coller sur la fiche Google, la bio Instagram, la
                        page Facebook. */}
                    <div className="flex flex-wrap items-center gap-2">
                      <BoutonCopier texte={adresse!} />
                      <span className="text-xs text-zinc-500">
                        À coller sur ta fiche Google et ton Instagram.
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="break-all text-sm text-zinc-500">
                    Il recevra l&apos;adresse {adresse}
                  </span>
                )}
                <form action={basculerVitrine} className="w-fit">
                  <input type="hidden" name="id" value={id} />
                  <input
                    type="hidden"
                    name="publier"
                    value={publiee ? "0" : "1"}
                  />
                  <button
                    type="submit"
                    className={
                      publiee
                        ? "rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                        : "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
                    }
                  >
                    {publiee ? "Retirer mon site" : "Publier mon site"}
                  </button>
                </form>
              </>
            )}
          </section>

          {/* Ce qui est fait, ce qui reste : une barre et une liste. */}
          <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl text-ink">Ton site</h2>
              <span className="text-sm text-zinc-500">
                <strong className="font-semibold text-ink">{faits}</strong> sur{" "}
                {elements.length}
              </span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-zinc-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={elements.length}
              aria-valuenow={faits}
            >
              <div
                className="h-full rounded-full bg-brand-orange"
                style={{ width: `${(faits / elements.length) * 100}%` }}
              />
            </div>
            <ul className="flex flex-col divide-y divide-zinc-100">
              {elements.map((e) => (
                <li
                  key={e.texte}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        e.fait
                          ? "bg-emerald-100 text-emerald-700"
                          : "border border-dashed border-zinc-300 text-zinc-300"
                      }`}
                    >
                      {e.fait ? "✓" : ""}
                    </span>
                    <span className={e.fait ? "text-ink" : "text-zinc-500"}>
                      {e.texte}
                    </span>
                  </span>
                  <Link
                    href={e.ou}
                    className={`shrink-0 text-xs font-semibold hover:underline ${
                      e.fait ? "text-zinc-400" : "text-brand-orange-dark"
                    }`}
                  >
                    {e.fait ? "Modifier" : "Ajouter"}
                  </Link>
                </li>
              ))}
            </ul>
            {couverture.photo && !couverture.choisie && (
              <p className="rounded-lg bg-brand-cream px-3 py-2 text-xs leading-relaxed text-zinc-600">
                La couverture est la première de tes photos, faute de choix :
                une salle pleine ou la façade feront plus d&apos;effet
                qu&apos;un plat.{" "}
                <Link
                  href={`/dashboard/${id}/photos`}
                  className="font-semibold text-brand-orange-dark hover:underline"
                >
                  En choisir une
                </Link>
              </p>
            )}
          </section>
        </div>

        {/* L'aperçu : le vrai site, pas une imitation. Tant qu'il n'est
            pas publié, l'adresse répond « introuvable » — on montre alors
            la couverture, comme le site l'ouvrira. */}
        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-serif text-2xl text-ink">Aperçu</h2>
            {publiee && slug && (
              <span className="text-xs text-zinc-500">
                Ton site tel que tes clients le voient, en direct.
              </span>
            )}
          </div>
          {publiee && slug ? (
            <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_300px]">
              <Navigateur adresse={adresse!}>
                <div className="relative h-[640px] overflow-hidden">
                  <iframe
                    src={`/restaurant/${slug}`}
                    title={`Aperçu du site de ${restaurant.nom}`}
                    loading="lazy"
                    className="absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50 border-0"
                  />
                </div>
              </Navigateur>
              <div className="hidden flex-col items-center gap-2 2xl:flex">
                <div className="overflow-hidden rounded-[2.2rem] border-[10px] border-ink bg-ink shadow-xl">
                  <div className="relative h-[560px] w-[280px] overflow-hidden rounded-[1.5rem] bg-white">
                    <iframe
                      src={`/restaurant/${slug}`}
                      title={`Aperçu mobile du site de ${restaurant.nom}`}
                      loading="lazy"
                      className="absolute left-0 top-0 h-[140%] w-[140%] origin-top-left scale-[0.7143] border-0"
                    />
                  </div>
                </div>
                <span className="text-xs text-zinc-500">Sur téléphone</span>
              </div>
            </div>
          ) : couverture.photo ? (
            <Navigateur adresse={adresse ?? site}>
              <div className="relative aspect-[16/9]">
                <Image
                  src={couverture.photo.url}
                  alt={couverture.photo.legende ?? ""}
                  fill
                  sizes="(max-width: 1280px) 100vw, 70vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 flex flex-col gap-3">
                  <span className="font-serif text-5xl text-white sm:text-6xl">
                    {restaurant.nom}
                  </span>
                  <span className="w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink">
                    Réserver une table
                  </span>
                </div>
              </div>
            </Navigateur>
          ) : (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 text-center">
              <span className="font-serif text-4xl text-zinc-300">
                {restaurant.nom}
              </span>
              <span className="text-sm text-zinc-500">
                Pour l&apos;instant, ton site s&apos;ouvre sur un bandeau vide.
              </span>
              <Link
                href={`/dashboard/${id}/photos`}
                className="mt-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                Ajouter une photo de couverture
              </Link>
            </div>
          )}
          {!publiee && slug && (
            <p className="text-xs text-zinc-500">
              L&apos;aperçu complet, en direct, apparaît ici dès que le site est
              publié.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

/** Un cadre de navigateur : la barre, trois points, l'adresse. */
function Navigateur({
  adresse,
  children,
}: {
  adresse: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_30px_80px_-40px_oklch(20%_0.02_60/45%)]">
      <div className="flex items-center gap-3 border-b border-zinc-200/70 bg-zinc-50 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-zinc-500">
          {adresse.replace(/^https?:\/\//, "")}
        </span>
      </div>
      {children}
    </div>
  );
}
