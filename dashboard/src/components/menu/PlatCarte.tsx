import Image from "next/image";
import { formatPrix, formatsDe, formatsLisibles } from "@/lib/menu/carte";
import { platAffiche } from "@/lib/menu/traduction";
import { listeAllergenes } from "@/types/allergenes";
import type { Langue, MenuItem } from "@/types/menu";
import { ETIQUETTES, t } from "@/lib/menu/etiquettes";

/**
 * Un plat sur la carte publique : une carte à photo, pas une ligne.
 *
 * Le format a changé, et pour une raison qui n'est pas décorative. Une
 * vignette de 96 pixels à gauche d'une ligne de texte sert à identifier
 * un plat qu'on cherche ; une photo en pleine largeur sert à en donner
 * envie. Une carte de restaurant fait le second travail — c'est même à
 * peu près son seul travail, une fois que le client est assis.
 *
 * Le prix passe en orange et en gras parce qu'il est la deuxième chose
 * qu'on regarde après la photo, et qu'en gris à côté du nom il se
 * cherchait.
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
  const formats = formatsDe(plat);

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
      {plat.photo_url && (
        /* Le rapport 4/3 est celui d'une assiette photographiée de biais,
           et il est tenu quelle que soit la photo envoyée : une grille
           dont les images n'ont pas la même hauteur se lit comme une
           page cassée. */
        <div className="relative aspect-[4/3] w-full bg-zinc-100">
          <Image
            src={plat.photo_url}
            alt={affiche.nom}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-base font-semibold text-zinc-900">
            {affiche.nom}
          </span>
          {!formats && plat.prix_centimes !== null && (
            <span className="shrink-0 text-base font-semibold tabular-nums text-brand-orange">
              {formatPrix(plat.prix_centimes)}
            </span>
          )}
        </div>

        {affiche.description && (
          <span className="text-sm leading-relaxed text-zinc-500">
            {affiche.description}
          </span>
        )}

        {formats && (
          <span className="text-sm font-semibold tabular-nums text-brand-orange">
            {formatsLisibles(formats, affiche.formats)}
          </span>
        )}

        {plat.allergenes !== null && plat.allergenes.length > 0 && (
          <span className="mt-auto pt-1.5 text-xs text-zinc-400">
            {t(ETIQUETTES.allergenes, langue)}
            {langue === "zh" ? "：" : " : "}
            {listeAllergenes(plat.allergenes, langue)}
          </span>
        )}
      </div>
    </li>
  );
}
