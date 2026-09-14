import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { basculerVitrine, updateRestaurant } from "@/app/dashboard/actions";
import { RestaurantForm } from "@/components/restaurants/RestaurantForm";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import { exiger } from "@/lib/equipe/roles";
import { siteUrl } from "@/lib/site-url";
import { horairesRenseignes } from "@/lib/site/horaires";

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

  const slug = restaurant.slug_reservation;
  const publiee = Boolean(restaurant.site_publie);
  // Ce qui manque à la vitrine pour ne pas paraître vide. On ne bloque pas
  // la publication pour autant : c'est son établissement, pas le nôtre.
  const manques = [
    restaurant.adresse ? null : "l'adresse",
    restaurant.telephone ? null : "le téléphone",
    restaurant.description ? null : "la description",
    horairesRenseignes(restaurant.horaires ?? {}) ? null : "les horaires",
  ].filter((manque): manque is string => manque !== null);

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader icon={dashboardIcons.edit} title={`Modifier ${restaurant.nom}`} />
      <RestaurantForm
        action={updateRestaurant}
        restaurant={restaurant}
        submitLabel="Enregistrer"
      />

      <section className="flex max-w-2xl flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-zinc-900">Ta vitrine</h2>
          <p className="text-sm text-zinc-500">
            Un site engendré de ce que tu viens de remplir : tes photos, ta
            carte, tes horaires, ton adresse. Rien de plus à saisir. C&apos;est
            l&apos;adresse à donner à Google, qui reproche à la plupart des
            restaurants de ne pas en avoir.
          </p>
        </div>

        {!slug ? (
          <p className="text-sm text-zinc-500">
            Ouvre d&apos;abord ta page de réservation : la vitrine partagera
            son adresse.
          </p>
        ) : (
          <>
            {publiee && (
              <a
                href={`/restaurant/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit break-all font-medium text-brand-orange hover:underline"
              >
                {siteUrl()}/restaurant/{slug}
              </a>
            )}
            {manques.length > 0 && (
              <p className="text-sm text-amber-700">
                Il manque encore {manques.join(", ")} — ta vitrine les
                affichera en creux tant que le formulaire ci-dessus reste
                vide.
              </p>
            )}
            <form action={basculerVitrine} className="w-fit">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="publier" value={publiee ? "0" : "1"} />
              <button
                type="submit"
                className={
                  publiee
                    ? "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                    : "rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
                }
              >
                {publiee ? "Retirer ma vitrine" : "Publier ma vitrine"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
