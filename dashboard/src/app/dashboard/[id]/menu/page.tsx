import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  basculerCartePublique,
  basculerPlat,
  monterCategorie,
  monterPlat,
  supprimerPlat,
} from "./actions";
import { PageHeader, dashboardIcons } from "@/components/dashboard/PageHeader";
import { PlatForm } from "@/components/menu/PlatForm";
import { carteOrganisee, formatPrix } from "@/lib/menu/carte";
import { exiger } from "@/lib/equipe/roles";
import type { MenuItem } from "@/types/menu";
import type { Restaurant } from "@/types/restaurant";

const bouton =
  "rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-30";

/** Un bouton qui ne fait que poster : rien à retenir côté navigateur. */
function Action({
  action,
  champs,
  children,
  libelle,
  classe = bouton,
}: {
  action: (formData: FormData) => Promise<void>;
  champs: Record<string, string>;
  children: React.ReactNode;
  libelle: string;
  classe?: string;
}) {
  return (
    <form action={action}>
      {Object.entries(champs).map(([nom, valeur]) => (
        <input key={nom} type="hidden" name={nom} value={valeur} />
      ))}
      <button type="submit" aria-label={libelle} className={classe}>
        {children}
      </button>
    </form>
  );
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await exiger(id, "gerant");

  const supabase = await createClient();
  const [restaurantResult, itemsResult] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("restaurant_menu_items")
      .select("*")
      .eq("restaurant_id", id),
  ]);

  const restaurant = restaurantResult.data as Restaurant | null;
  if (!restaurant) notFound();

  const items = (itemsResult.data ?? []) as MenuItem[];
  const blocs = carteOrganisee(items);
  const categories = blocs.map((bloc) => bloc.categorie);
  const publique = restaurant.carte_publique === true;
  const visibles = items.filter((plat) => plat.actif).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-8">
      <PageHeader
        icon={dashboardIcons.menu}
        title={`Carte — ${restaurant.nom}`}
      />

      <p className="max-w-2xl text-sm text-zinc-500">
        Ta carte s&apos;affiche sur ta page de réservation, sous les
        disponibilités : le client sait ce qu&apos;il vient manger avant de
        demander une table. Les catégories apparaissent dans l&apos;ordre où
        tu les ranges ici, pas par ordre alphabétique.
      </p>

      {/* Publier est un choix explicite : une carte saisie pour essayer n'a
          rien à faire sur une adresse publique. */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-900">
            {publique
              ? "Ta carte est visible par tes clients."
              : "Ta carte n'est visible que par toi."}
          </span>
          <span className="text-sm text-zinc-500">
            {visibles} plat{visibles > 1 ? "s" : ""} à la carte
            {items.length > visibles &&
              ` · ${items.length - visibles} décroché${
                items.length - visibles > 1 ? "s" : ""
              }`}
            {publique && restaurant.slug_reservation && (
              <>
                {" · "}
                <Link
                  href={`/reserver/${restaurant.slug_reservation}`}
                  className="text-brand-navy underline-offset-2 hover:underline"
                >
                  voir ma page
                </Link>
              </>
            )}
          </span>
        </div>
        <Action
          action={basculerCartePublique}
          champs={{ restaurant_id: id, publique: publique ? "0" : "1" }}
          libelle={publique ? "Retirer la carte" : "Publier la carte"}
          classe={
            publique
              ? "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              : "rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          }
        >
          {publique ? "Retirer de ma page" : "Publier sur ma page"}
        </Action>
      </div>

      <PlatForm restaurantId={id} categories={categories} />

      {blocs.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-500 shadow-sm">
          Aucun plat pour l&apos;instant. Commence par tes entrées : les
          catégories s&apos;afficheront dans l&apos;ordre où tu les ajoutes.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {blocs.map((bloc, rang) => (
            <section
              key={bloc.categorie}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
                  {bloc.categorie}
                </h2>
                <div className="flex items-center gap-1">
                  {rang > 0 && (
                    <Action
                      action={monterCategorie}
                      champs={{
                        restaurant_id: id,
                        categorie: bloc.categorie,
                        sens: "haut",
                      }}
                      libelle={`Monter ${bloc.categorie}`}
                    >
                      ↑
                    </Action>
                  )}
                  {rang < blocs.length - 1 && (
                    <Action
                      action={monterCategorie}
                      champs={{
                        restaurant_id: id,
                        categorie: bloc.categorie,
                        sens: "bas",
                      }}
                      libelle={`Descendre ${bloc.categorie}`}
                    >
                      ↓
                    </Action>
                  )}
                </div>
              </div>

              <ul className="flex flex-col divide-y divide-zinc-100">
                {bloc.plats.map((plat, index) => (
                  <li
                    key={plat.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={`flex min-w-0 flex-col ${
                        plat.actif ? "" : "opacity-50"
                      }`}
                    >
                      <span className="text-sm font-medium text-zinc-900">
                        {plat.nom}
                        {!plat.actif && (
                          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                            décroché
                          </span>
                        )}
                      </span>
                      {plat.description && (
                        <span className="text-sm text-zinc-500">
                          {plat.description}
                        </span>
                      )}
                    </span>

                    <span className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums text-zinc-700">
                        {plat.prix_centimes === null
                          ? "—"
                          : formatPrix(plat.prix_centimes)}
                      </span>
                      <span className="flex items-center gap-1">
                        {index > 0 && (
                          <Action
                            action={monterPlat}
                            champs={{
                              restaurant_id: id,
                              id: plat.id,
                              sens: "haut",
                            }}
                            libelle={`Monter ${plat.nom}`}
                          >
                            ↑
                          </Action>
                        )}
                        {index < bloc.plats.length - 1 && (
                          <Action
                            action={monterPlat}
                            champs={{
                              restaurant_id: id,
                              id: plat.id,
                              sens: "bas",
                            }}
                            libelle={`Descendre ${plat.nom}`}
                          >
                            ↓
                          </Action>
                        )}
                      </span>
                      <Action
                        action={basculerPlat}
                        champs={{
                          restaurant_id: id,
                          id: plat.id,
                          actif: plat.actif ? "0" : "1",
                        }}
                        libelle={
                          plat.actif
                            ? `Décrocher ${plat.nom}`
                            : `Remettre ${plat.nom}`
                        }
                      >
                        {plat.actif ? "Décrocher" : "Remettre"}
                      </Action>
                      <Action
                        action={supprimerPlat}
                        champs={{ restaurant_id: id, id: plat.id }}
                        libelle={`Supprimer ${plat.nom}`}
                        classe="text-xs text-zinc-400 transition-colors hover:text-red-600"
                      >
                        Supprimer
                      </Action>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
