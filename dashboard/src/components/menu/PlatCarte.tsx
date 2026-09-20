import Image from "next/image";
import { formatPrix } from "@/lib/menu/carte";
import { platAffiche } from "@/lib/menu/traduction";
import { listeAllergenes } from "@/types/allergenes";
import type { Langue, MenuItem } from "@/types/menu";

/**
 * Un plat sur la carte publique : photo, nom, prix, allergènes déclarés.
 *
 * Extrait de la page pour être rendu deux fois — dans la carte, et dans
 * la liste des plats dont les allergènes n'ont pas été déclarés, quand un
 * client filtre. Deux copies du même balisage auraient divergé au premier
 * ajustement, et c'est la seconde, moins regardée, qui aurait vieilli.
 */
export function PlatCarte({
  plat,
  langue,
}: {
  plat: MenuItem;
  langue: Langue;
}) {
  const affiche = platAffiche(plat, langue);
  const anglais = langue === "en";

  return (
    <li className="flex items-start gap-4 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm">
      {plat.photo_url && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-24 sm:w-24">
          <Image
            src={plat.photo_url}
            alt={affiche.nom}
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-zinc-900">
            {affiche.nom}
          </span>
          {plat.prix_centimes !== null && (
            <span className="shrink-0 text-sm font-medium tabular-nums text-zinc-700">
              {formatPrix(plat.prix_centimes)}
            </span>
          )}
        </span>
        {affiche.description && (
          <span className="text-sm text-zinc-500">{affiche.description}</span>
        )}
        {plat.allergenes !== null && plat.allergenes.length > 0 && (
          <span className="text-xs text-zinc-400">
            {anglais ? "Allergens" : "Allergènes"} :{" "}
            {listeAllergenes(plat.allergenes, anglais)}
          </span>
        )}
      </span>
    </li>
  );
}
