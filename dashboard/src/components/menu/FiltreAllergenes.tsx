import Link from "next/link";
import {
  ALLERGENES,
  libelleAllergene,
  listeAllergenes,
} from "@/types/allergenes";
import { ETIQUETTES, t } from "@/lib/menu/etiquettes";
import type { Langue } from "@/lib/i18n/langues";

/**
 * « Je suis allergique à… », sur la carte publique.
 *
 * Un formulaire GET, pas de JavaScript : le choix part dans l'adresse, le
 * serveur renvoie la carte filtrée. Trois raisons, dans cet ordre.
 *
 * D'abord le réseau. Cette page s'ouvre au comptoir, en terrasse, dans un
 * sous-sol — sur des téléphones qui chargent le HTML et abandonnent le
 * reste. Une carte filtrée par du script est une carte non filtrée quand
 * le script ne vient pas, et personne ne s'en aperçoit.
 *
 * Ensuite le partage. `?sans=gluten,lait` s'envoie à la tablée : chacun
 * ouvre la même carte, déjà triée.
 *
 * Enfin le retour en arrière. Le bouton « précédent » du téléphone annule
 * le filtre, ce qu'aucun état local ne fait aussi bien.
 *
 * Les quatorze sont tous proposés, même ceux qu'aucun plat ne déclare :
 * l'allergie du client ne dépend pas de ce que le restaurant a eu le
 * temps de saisir. Ce que le restaurant n'a pas saisi ressort ailleurs,
 * dans les plats indéterminés.
 */
export function FiltreAllergenes({
  slug,
  langue,
  choisis,
}: {
  slug: string;
  langue: Langue;
  /** Les codes cochés, tels que l'adresse les porte. */
  choisis: string[];
}) {
  const actif = choisis.length > 0;

  return (
    <details
      open={actif}
      className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-zinc-900">
        <span>
          {t(ETIQUETTES.filtreTitre, langue)}
          {actif && (
            <span className="ml-2 font-normal text-zinc-500">
              {listeAllergenes(choisis, langue)}
            </span>
          )}
        </span>
        <span aria-hidden="true" className="text-zinc-400">
          ▾
        </span>
      </summary>

      <form method="get" className="mt-4 flex flex-col gap-4">
        {/* La langue ne doit pas se perdre en filtrant : un formulaire GET
            réécrit l'adresse entière. */}
        {langue !== "fr" && <input type="hidden" name="lang" value={langue} />}

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">
            {t(ETIQUETTES.filtreLegende, langue)}
          </legend>
          <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {ALLERGENES.map((allergene) => (
              <label
                key={allergene.code}
                className="flex items-baseline gap-2 text-sm text-zinc-700"
              >
                <input
                  type="checkbox"
                  name="sans"
                  value={allergene.code}
                  defaultChecked={choisis.includes(allergene.code)}
                  className="shrink-0 accent-brand-navy"
                />
                <span>{libelleAllergene(allergene.code, langue)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t(ETIQUETTES.filtreAppliquer, langue)}
          </button>
          {actif && (
            <Link
              href={`/carte/${slug}${langue === "fr" ? "" : `?lang=${langue}`}`}
              className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              {t(ETIQUETTES.filtreTout, langue)}
            </Link>
          )}
        </div>

        <p className="text-xs text-zinc-500">
          {t(ETIQUETTES.filtreReserve, langue)}
        </p>
      </form>
    </details>
  );
}
