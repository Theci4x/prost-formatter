import Link from "next/link";
import { createRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";

export default function NewRestaurantPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-zinc-500 hover:text-zinc-900"
      >
        ← Retour
      </Link>
      <h1 className="text-lg font-semibold text-zinc-900">
        Ajouter un restaurant
      </h1>
      <RestaurantForm action={createRestaurant} submitLabel="Créer" />
    </div>
  );
}
