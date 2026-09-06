import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, removePhoto } from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: restaurantData } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const restaurant = restaurantData as Restaurant | null;
  if (!restaurant) {
    notFound();
  }

  const { data: photosData } = await supabase
    .from("restaurant_photos")
    .select("*")
    .eq("restaurant_id", id)
    .order("created_at", { ascending: false });

  const photos = (photosData ?? []) as RestaurantPhoto[];

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.photos}
        title={`Photos — ${restaurant.nom}`}
      />

      <form
        action={uploadPhoto}
        className="flex max-w-xl items-center gap-3 rounded-md border border-zinc-200 p-4"
      >
        <input type="hidden" name="restaurant_id" value={id} />
        <input
          type="file"
          name="photo"
          accept="image/*"
          required
          className="flex-1 text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          Ajouter
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune photo pour le moment.</p>
      ) : (
        <ul className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-md border border-zinc-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs Supabase Storage arbitraires, pas de domaine fixe a whitelister dans next/image */}
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
              />
              <form
                action={removePhoto}
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <input type="hidden" name="id" value={photo.id} />
                <input type="hidden" name="restaurant_id" value={id} />
                <input
                  type="hidden"
                  name="storage_path"
                  value={photo.storage_path}
                />
                <button
                  type="submit"
                  aria-label="Supprimer la photo"
                  className="rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/80"
                >
                  Supprimer
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
