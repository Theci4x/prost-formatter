import Image from "next/image";
import Link from "next/link";
import { carteOrganisee, carteVisible, formatPrix } from "@/lib/menu/carte";
import type { MenuItem } from "@/types/menu";
import { listeAllergenes } from "@/types/allergenes";
import {
  MENTION_ALLERGENES,
  MENTION_ALLERGENES_ABSENTS,
  MENTION_PRIX,
} from "@/lib/menu/mentions";

/**
 * La carte telle que la lit un client : les plats décrochés n'y sont pas,
 * les catégories dans l'ordre voulu par le restaurateur. Servie telle quelle
 * sur la page de réservation et en aperçu dans le tableau de bord, pour que
 * ce qu'on relit soit exactement ce qui est publié.
 */
export function Carte({ items, slug }: { items: MenuItem[]; slug?: string }) {
  const visibles = carteVisible(items);
  const blocs = carteOrganisee(visibles);
  if (blocs.length === 0) return null;
  const quelquesAllergenes = visibles.some((plat) => plat.allergenes !== null);

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
                <li key={plat.id} className="flex items-start gap-3">
                  {plat.photo_url && (
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      <Image
                        src={plat.photo_url}
                        alt={plat.nom}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="text-base font-medium text-zinc-900">
                        {plat.nom}
                      </span>
                      {plat.prix_centimes !== null && (
                        <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-700">
                          {formatPrix(plat.prix_centimes)}
                        </span>
                      )}
                    </span>
                    {plat.description && (
                      <span className="text-base text-zinc-500">
                        {plat.description}
                      </span>
                    )}
                    {plat.allergenes !== null && plat.allergenes.length > 0 && (
                      <span className="text-sm text-zinc-400">
                        Allergènes : {listeAllergenes(plat.allergenes, false)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex max-w-lg flex-col gap-1.5 text-sm text-zinc-400">
          <p>
            Carte donnée à titre indicatif : elle peut changer selon
            l&apos;arrivage et la saison.
          </p>
          <p>{MENTION_PRIX.fr}</p>
          <p>
            {quelquesAllergenes
              ? MENTION_ALLERGENES.fr
              : MENTION_ALLERGENES_ABSENTS.fr}
          </p>
        </div>
        {slug && (
          <Link
            href={`/carte/${slug}`}
            className="text-base text-brand-navy underline-offset-2 hover:underline"
          >
            Voir la carte en entier →
          </Link>
        )}
      </div>
    </section>
  );
}
