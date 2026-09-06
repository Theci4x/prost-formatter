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
        <h1 className="text-lg font-semibold text-zinc-900">
          Mes restaurants
        </h1>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          Ajouter un restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-soft text-brand-navy">
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
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Ajouter un restaurant
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4"
            >
              <div className="flex items-center justify-between">
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
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
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
