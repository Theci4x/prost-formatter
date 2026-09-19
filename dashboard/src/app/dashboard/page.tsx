import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { CarteRestaurant } from "@/components/dashboard/CarteRestaurant";
import { ACCUEIL } from "@/lib/i18n/accueil";
import { ChoixLangue } from "@/components/dashboard/ChoixLangue";
import { langueUtilisateur } from "@/lib/i18n/langue";
import { dashboardIcons } from "@/components/dashboard/PageHeader";
import { fetchAlerts } from "@/lib/reputation/alerts";
import { roleSur } from "@/lib/equipe/roles";
import type { Restaurant } from "@/types/restaurant";
import { chargerAcces } from "@/lib/abonnement/acces";
import { ACCES_COMPLET } from "@/lib/abonnement/modules";
import { chargerPouls } from "@/lib/dashboard/pouls";

// Les colonnes arrivées après le type : la carte de couverture et la
// publication du site. `select("*")` les rapporte, le type ne les connaît
// pas encore.
type RestaurantEtendu = Restaurant & {
  photo_couverture_id?: string | null;
  site_publie?: boolean | null;
  email_contact?: string | null;
};

export default async function DashboardPage() {
  const langue = await langueUtilisateur();
  const t = ACCUEIL[langue];
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  const restaurants = (data ?? []) as RestaurantEtendu[];

  const { alerts, surveillanceActive } = await fetchAlerts(supabase);
  const restaurantNames = new Map(restaurants.map((r) => [r.id, r.nom]));

  // Le rôle peut différer d'un établissement à l'autre : propriétaire du
  // sien, serveur chez un confrère.
  const roles = new Map(
    await Promise.all(
      restaurants.map(
        async (restaurant) =>
          [restaurant.id, await roleSur(restaurant.id)] as const,
      ),
    ),
  );

  // Ce que chaque établissement a payé. Un abonnement ne couvre jamais
  // deux maisons : chacune a son carnet, sa fiche Google et sa clientèle.
  const acces = new Map(
    await Promise.all(
      restaurants.map(
        async (restaurant) =>
          [restaurant.id, await chargerAcces(restaurant.id, supabase)] as const,
      ),
    ),
  );

  // Les chiffres du jour, maison par maison.
  const pouls = new Map(
    await Promise.all(
      restaurants.map(
        async (restaurant) =>
          [restaurant.id, await chargerPouls(supabase, restaurant)] as const,
      ),
    ),
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex justify-end">
        <ChoixLangue courante={langue} libelle={t.langue.choisir} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">
            {restaurants.length === 1 ? "Votre restaurant" : "Vos restaurants"}
          </h1>
          <p className="text-sm text-ink-soft">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="rounded-lg border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          Ajouter un restaurant
        </Link>
      </div>

      {restaurants.length > 0 && (
        <AlertsPanel
          alerts={alerts}
          restaurantNames={restaurantNames}
          surveillanceActive={surveillanceActive}
        />
      )}

      {restaurants.length === 0 ? (
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange-soft to-white text-brand-navy shadow-sm">
            {dashboardIcons.menu}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-zinc-900">
              Aucun restaurant pour le moment.
            </p>
            <p className="text-sm text-zinc-500">
              Ajoute ton premier restaurant pour commencer à gérer sa présence
              en ligne.
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-navy-hover hover:shadow"
          >
            Ajouter un restaurant
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-6">
          {restaurants.map((restaurant) => (
            <CarteRestaurant
              t={t}
              key={restaurant.id}
              restaurant={restaurant}
              role={roles.get(restaurant.id) ?? null}
              acces={acces.get(restaurant.id) ?? ACCES_COMPLET}
              pouls={pouls.get(restaurant.id)!}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
