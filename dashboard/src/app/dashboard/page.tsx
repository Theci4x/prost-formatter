import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteRestaurantButton } from "@/components/restaurants/DeleteRestaurantButton";
import type { Restaurant } from "@/types/restaurant";

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
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Ajouter un restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aucun restaurant pour le moment.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 rounded-md border border-zinc-200">
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="flex items-center justify-between px-4 py-3"
            >
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
                  href={`/dashboard/${restaurant.id}/seo`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  SEO
                </Link>
                <Link
                  href={`/dashboard/${restaurant.id}/avis`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Avis
                </Link>
                <Link
                  href={`/dashboard/${restaurant.id}/google`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Google Business Profile
                </Link>
                <Link
                  href={`/dashboard/${restaurant.id}/social`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Réseaux sociaux
                </Link>
                <Link
                  href={`/dashboard/${restaurant.id}/edit`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Modifier
                </Link>
                <DeleteRestaurantButton id={restaurant.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
