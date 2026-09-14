import { carteOrganisee, carteVisible, formatPrix } from "@/lib/menu/carte";
import type { MenuItem } from "@/types/menu";

/**
 * La carte telle que la lit un client : les plats décrochés n'y sont pas,
 * les catégories dans l'ordre voulu par le restaurateur. Servie telle quelle
 * sur la page de réservation et en aperçu dans le tableau de bord, pour que
 * ce qu'on relit soit exactement ce qui est publié.
 */
export function Carte({ items }: { items: MenuItem[] }) {
  const blocs = carteOrganisee(carteVisible(items));
  if (blocs.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-zinc-900">La carte</h2>

      <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        {blocs.map((bloc) => (
          <div key={bloc.categorie} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
              {bloc.categorie}
            </h3>
            <ul className="flex flex-col gap-3">
              {bloc.plats.map((plat) => (
                <li
                  key={plat.id}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-zinc-900">
                      {plat.nom}
                    </span>
                    {plat.description && (
                      <span className="text-sm text-zinc-500">
                        {plat.description}
                      </span>
                    )}
                  </span>
                  {plat.prix_centimes !== null && (
                    <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-700">
                      {formatPrix(plat.prix_centimes)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-400">
        Carte donnée à titre indicatif : elle peut changer selon
        l&apos;arrivage et la saison.
      </p>
    </section>
  );
}
