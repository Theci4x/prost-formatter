import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteRestaurantButton } from "@/components/restaurants/DeleteRestaurantButton";
import { dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";

const FEATURE_LINKS = [
  { href: "photos", label: "Photos", icon: dashboardIcons.photos },
  { href: "menu", label: "Menu", icon: dashboardIcons.menu },
  { href: "seo", label: "SEO", icon: dashboardIcons.seo },
  { href: "avis", label: "Avis", icon: dashboardIcons.avis },
  { href: "google", label: "Google", icon: dashboardIcons.google },
  { href: "social", label: "Réseaux sociaux", icon: dashboardIcons.social },
  { href: "tiktok", label: "TikTok", icon: dashboardIcons.tiktok },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  const restaurants = (data ?? []) as Restaurant[];

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Mes restaurants
          </h1>
          <p className="text-sm text-zinc-500">
            Gère la présence en ligne de tes établissements.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
        >
          Ajouter un restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange-soft to-white text-brand-navy shadow-sm">
            {dashboardIcons.menu}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-zinc-900">
              Aucun restaurant pour le moment.
            </p>
            <p className="text-sm text-zinc-500">
              Ajoute ton premier restaurant pour commencer à gérer sa
              présence en ligne.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
          >
            Ajouter un restaurant
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-semibold text-white">
                    {restaurant.nom.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {restaurant.nom}
                    </p>
                    {restaurant.adresse && (
                      <p className="text-sm text-zinc-500">
                        {restaurant.adresse}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/dashboard/${restaurant.id}/edit`}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    Modifier
                  </Link>
                  <DeleteRestaurantButton id={restaurant.id} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {FEATURE_LINKS.map((feature) => (
                  <Link
                    key={feature.href}
                    href={`/dashboard/${restaurant.id}/${feature.href}`}
                    className="flex items-center gap-1.5 rounded-full bg-brand-orange-soft px-3 py-1.5 text-xs font-medium text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                  >
                    <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
                      {feature.icon}
                    </span>
                    {feature.label}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
