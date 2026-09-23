import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { definirCouverture, removePhoto } from "./actions";
import { AjoutPhoto } from "@/components/photos/AjoutPhoto";
import { LegendePhoto } from "@/components/photos/LegendePhoto";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { Compteur } from "@/components/dashboard/Compteur";
import type { Restaurant } from "@/types/restaurant";
import type { RestaurantPhoto } from "@/types/photo";
import { exiger } from "@/lib/equipe/roles";
import { exigerModule } from "@/lib/abonnement/acces";
import { couvertureDe } from "@/lib/vitrine/couverture";

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

  const [{ data: photosData }, { data: espacesData }] = await Promise.all([
    supabase
      .from("restaurant_photos")
      .select("*")
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
    // Pour dire de quelle salle est une photo : « La cave » sur la
    // vignette vaut mieux qu'une photo anonyme parmi d'autres.
    supabase
      .from("restaurant_espaces")
      .select("id, nom")
      .eq("restaurant_id", id),
  ]);
  const nomEspace = new Map(
    ((espacesData ?? []) as { id: string; nom: string }[]).map((e) => [
      e.id,
      e.nom,
    ]),
  );

  const photos = (photosData ?? []) as RestaurantPhoto[];
  // Colonne récente : lue avec un défaut, pour qu'un déploiement en
  // avance sur la base n'emporte pas toute la page.
  const couvertureId =
    (restaurant as Restaurant & { photo_couverture_id?: string | null })
      .photo_couverture_id ?? null;

  const couverture = couvertureDe(photos, couvertureId);
  const sansLegende = photos.filter((p) => !p.legende?.trim()).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.photos}
        title={`Photos — ${restaurant.nom}`}
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Compteur valeur={photos.length} libelle="photos" />
        <Compteur valeur={photos.length - sansLegende} libelle="avec légende" />
        <Compteur
          valeur={sansLegende}
          libelle="sans légende"
          accent={sansLegende > 0}
        />
      </div>

      {/* La couverture en tête, comme le site la montre : c'est la
          décision de cet écran qui compte le plus. */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="font-serif text-2xl text-ink">
              Photo de couverture
            </h2>
            <p className="text-xs text-zinc-500">
              {couverture.photo
                ? couverture.choisie
                  ? "Choisie par vous."
                  : "La première de vos photos, faute de choix."
                : "Aucune pour l'instant."}
            </p>
          </div>
          {couverture.photo ? (
            <div className="relative aspect-[21/9] overflow-hidden rounded-2xl border border-zinc-200/70 shadow-sm">
              <Image
                src={couverture.photo.url}
                alt={couverture.photo.legende ?? ""}
                fill
                sizes="(max-width: 1280px) 100vw, 60vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <span className="absolute bottom-5 left-6 font-serif text-4xl text-white sm:text-5xl">
                {restaurant.nom}
              </span>
            </div>
          ) : (
            <div className="flex aspect-[21/9] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white font-serif text-3xl text-zinc-300">
              {restaurant.nom}
            </div>
          )}
          <p className="text-sm text-zinc-500">
            Elle ouvre votre site, en plein écran, avant qu&apos;on lise quoi
            que ce soit : choisissez la salle pleine ou la façade plutôt que le
            plat isolé. Pour en changer, « Mettre en couverture » sous
            n&apos;importe quelle photo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl text-ink">Ajouter une photo</h2>
          <AjoutPhoto restaurantId={id} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-serif text-2xl text-ink">Toutes vos photos</h2>
        {photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-sm text-zinc-500">
            Aucune photo pour le moment. La première que vous ajoutez ouvrira
            votre site.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {photos.map((photo) => {
              const estCouverture = photo.id === couverture.photo?.id;
              const salle = photo.espace_id
                ? nomEspace.get(photo.espace_id)
                : null;
              return (
                <li
                  key={photo.id}
                  className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm ${
                    estCouverture
                      ? "border-brand-orange ring-2 ring-brand-orange/30"
                      : "border-zinc-200/70"
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-zinc-100">
                    <Image
                      src={photo.url}
                      alt={photo.legende ?? ""}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {/* La couverture porte son insigne en permanence,
                          pas au survol : sur un écran tactile il n'y a pas
                          de survol, et c'est l'information qu'on vient
                          chercher. */}
                      {estCouverture && (
                        <span className="rounded-full bg-brand-orange px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          Couverture
                        </span>
                      )}
                      {salle && (
                        <span className="rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                          {salle}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <LegendePhoto
                      photoId={photo.id}
                      restaurantId={id}
                      legende={photo.legende ?? null}
                      placeholder="Ajouter une légende…"
                    />
                    {/* Les actions visibles sans survol : sur un
                        téléphone, un bouton qui n'apparaît qu'au survol
                        n'existe pas. */}
                    <div className="mt-auto flex items-center justify-between gap-2">
                      {estCouverture && couverture.choisie ? (
                        <span className="text-xs text-zinc-400">
                          Ouvre votre site
                        </span>
                      ) : (
                        <form action={definirCouverture}>
                          <input
                            type="hidden"
                            name="restaurant_id"
                            value={id}
                          />
                          <input
                            type="hidden"
                            name="photo_id"
                            value={photo.id}
                          />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-brand-orange-dark hover:underline"
                          >
                            Mettre en couverture
                          </button>
                        </form>
                      )}
                      <form action={removePhoto}>
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
                          className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
