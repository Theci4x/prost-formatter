import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import type { Restaurant } from "@/types/restaurant";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = data as Restaurant | null;

  if (!restaurant) {
    notFound();
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
        Modifier {restaurant.nom}
      </h1>
      <RestaurantForm
        action={updateRestaurant}
        restaurant={restaurant}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
