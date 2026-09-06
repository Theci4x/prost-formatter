import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
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
      <PageHeader icon={dashboardIcons.edit} title={`Modifier ${restaurant.nom}`} />
      <RestaurantForm
        action={updateRestaurant}
        restaurant={restaurant}
        submitLabel="Enregistrer"
      />
    </div>
  );
}
