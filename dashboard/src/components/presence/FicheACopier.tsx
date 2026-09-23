import Link from "next/link";
import { BoutonCopier } from "@/components/dashboard/BoutonCopier";
import type { ChampFiche } from "@/lib/presence/etat";

/**
 * La fiche du restaurant, champ par champ, chacun avec son bouton Copier.
 *
 * `compact` l'empile — libellé au-dessus de la valeur — pour la colonne
 * étroite du mode guidé, où elle reste à côté des étapes pendant qu'on
 * remplit le formulaire d'une plateforme.
 */
export function FicheACopier({
  restaurantId,
  champs,
  compact = false,
}: {
  restaurantId: string;
  champs: ChampFiche[];
  compact?: boolean;
}) {
  return (
    <ul className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
      {champs.map((champ, index) => {
        const rempli = Boolean(champ.valeur && champ.valeur.trim());
        return (
          <li
            key={champ.libelle}
            className={`grid gap-2 ${
              compact
                ? "grid-cols-[minmax(0,1fr)_auto] items-start px-4 py-3"
                : "px-5 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4"
            } ${index > 0 ? "border-t border-zinc-100" : ""}`}
          >
            {compact ? (
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-xs font-medium text-zinc-500">
                  {champ.libelle}
                </span>
                <span
                  className={`whitespace-pre-line break-words text-sm leading-relaxed ${
                    rempli ? "text-ink" : "text-zinc-400"
                  }`}
                >
                  {rempli ? champ.valeur : "Pas renseigné"}
                </span>
              </span>
            ) : (
              <>
                <span className="text-sm font-medium text-zinc-500">
                  {champ.libelle}
                </span>
                <span
                  className={`min-w-0 whitespace-pre-line break-words text-sm leading-relaxed ${
                    rempli ? "text-ink" : "text-zinc-400"
                  }`}
                >
                  {rempli ? champ.valeur : "Pas renseigné"}
                </span>
              </>
            )}
            {rempli ? (
              <span className="w-fit">
                <BoutonCopier
                  texte={champ.valeur!}
                  libelle="Copier"
                  copie="Copié ✓"
                />
              </span>
            ) : (
              <Link
                href={`/dashboard/${restaurantId}/${champ.ou}`}
                className="w-fit text-sm font-semibold text-brand-orange-dark hover:underline"
              >
                Compléter →
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Tous les champs remplis, en un bloc : pour les formulaires d'une traite. */
export function texteFiche(champs: ChampFiche[]): string {
  return champs
    .filter((c) => c.valeur && c.valeur.trim())
    .map((c) => `${c.libelle} : ${c.valeur}`)
    .join("\n");
}
