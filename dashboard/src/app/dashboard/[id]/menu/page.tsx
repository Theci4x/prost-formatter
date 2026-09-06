import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addMenuItem, removeMenuItem } from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import type { Restaurant } from "@/types/restaurant";
import type { MenuItem } from "@/types/menu";

export default async function MenuPage({
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

  const { data: itemsData } = await supabase
    .from("restaurant_menu_items")
    .select("*")
    .eq("restaurant_id", id)
    .order("categorie", { ascending: true })
    .order("ordre", { ascending: true });

  const items = (itemsData ?? []) as MenuItem[];

  const categories = new Map<string, MenuItem[]>();
  for (const item of items) {
    const list = categories.get(item.categorie) ?? [];
    list.push(item);
    categories.set(item.categorie, list);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader icon={dashboardIcons.menu} title={`Menu — ${restaurant.nom}`} />

      <form
        action={addMenuItem}
        className="flex max-w-xl flex-wrap items-end gap-2 rounded-md border border-zinc-200 p-4"
      >
        <input type="hidden" name="restaurant_id" value={id} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600">
            Catégorie
          </label>
          <input
            name="categorie"
            type="text"
            required
            placeholder="ex : Entrées"
            className="w-32 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600">Plat</label>
          <input
            name="nom"
            type="text"
            required
            placeholder="ex : Salade César"
            className="w-40 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600">
            Description
          </label>
          <input
            name="description"
            type="text"
            placeholder="facultatif"
            className="w-48 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600">
            Prix (€)
          </label>
          <input
            name="prix"
            type="number"
            step="0.01"
            min="0"
            placeholder="12.50"
            className="w-24 rounded-md border border-zinc-300 px-2 py-1.5 text-sm outline-none focus:border-zinc-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand-navy px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
        >
          Ajouter
        </button>
      </form>

      {categories.size === 0 ? (
        <p className="text-sm text-zinc-500">Aucun plat pour le moment.</p>
      ) : (
        <div className="flex max-w-xl flex-col gap-6">
          {[...categories.entries()].map(([categorie, categoryItems]) => (
            <div key={categorie} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-zinc-900">
                {categorie}
              </h2>
              <ul className="flex flex-col divide-y divide-zinc-100 rounded-md border border-zinc-200">
                {categoryItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {item.nom}
                      </p>
                      {item.description && (
                        <p className="text-sm text-zinc-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {item.prix != null && (
                        <span className="text-sm font-medium text-zinc-700">
                          {item.prix.toFixed(2)} €
                        </span>
                      )}
                      <form action={removeMenuItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <input
                          type="hidden"
                          name="restaurant_id"
                          value={id}
                        />
                        <button
                          type="submit"
                          aria-label={`Supprimer ${item.nom}`}
                          className="text-sm text-zinc-400 hover:text-red-600"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
