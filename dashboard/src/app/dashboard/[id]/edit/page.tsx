import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { updateRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");

  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = data as (Restaurant & { site_publie?: boolean }) | null;

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.edit}
        title={`Modifier ${restaurant.nom}`}
      />
      <RestaurantForm
        action={updateRestaurant}
        restaurant={restaurant}
        submitLabel="Enregistrer"
      />

      {/* Le réglage de la vitrine a sa propre page, atteignable depuis le
          tableau de bord : ici, il était au bas d'un formulaire que
          personne n'ouvre. */}
      <Link
        href={`/dashboard/${id}/vitrine`}
        className="w-fit text-sm font-medium text-brand-orange hover:underline"
      >
        Voir mon site vitrine
      </Link>
    </div>
  );
}
