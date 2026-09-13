import { createRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";

export default function NewRestaurantPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader icon={dashboardIcons.new} title="Ajouter un restaurant" />
      <RestaurantForm action={createRestaurant} submitLabel="Créer" />
    </div>
  );
}
