import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { definirCouverture, removePhoto } from "./actions";
import { AjoutPhoto } from "@/components/photos/AjoutPhoto";
import { LegendePhoto } from "@/components/photos/LegendePhoto";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";

export default async function PhotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");
  await exigerModule(id, "visibilite");

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
  // Colonne récente : lue avec un défaut, pour qu'un déploiement en
  // avance sur la base n'emporte pas toute la page.
  const couvertureId =
    (restaurant as Restaurant & { photo_couverture_id?: string | null })
      .photo_couverture_id ?? null;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.photos}
        title={`Photos — ${restaurant.nom}`}
      />

      <AjoutPhoto restaurantId={id} />

      <p className="max-w-2xl text-sm text-zinc-500">
        Une de ces photos ouvre ton site vitrine, en grand. C&apos;est
        elle qu&apos;on voit avant de lire quoi que ce soit : choisis la
        salle pleine plutôt que le plat isolé.
      </p>

      {photos.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucune photo pour le moment.</p>
      ) : (
        <ul className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="flex flex-col gap-2">
              <div className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200/70 shadow-sm">
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 240px"
                  className="object-cover"
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

                {/* La couverture porte son insigne en permanence, pas au
                    survol : sur un écran tactile il n'y a pas de survol,
                    et c'est l'information qu'on vient chercher. */}
                {photo.id === couvertureId ? (
                  <span className="absolute bottom-2 left-2 rounded-full bg-brand-navy px-2.5 py-1 text-xs font-medium text-white">
                    Couverture
                  </span>
                ) : (
                  !photo.espace_id && (
                    <form
                      action={definirCouverture}
                      className="absolute bottom-2 left-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
                    >
                      <input type="hidden" name="restaurant_id" value={id} />
                      <input type="hidden" name="photo_id" value={photo.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-white"
                      >
                        Mettre en couverture
                      </button>
                    </form>
                  )
                )}
              </div>
              <LegendePhoto
                photoId={photo.id}
                restaurantId={id}
                legende={photo.legende ?? null}
                placeholder="La terrasse, l'été"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
