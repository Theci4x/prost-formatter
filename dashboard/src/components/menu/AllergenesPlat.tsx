import { enregistrerAllergenes } from "@/app/dashboard/[id]/menu/actions";
import { ALLERGENES, listeAllergenes } from "@/types/allergenes";

/**
 * Cocher les allergènes d'un plat, depuis la carte du tableau de bord.
 *
 * Replié par défaut, et c'est délibéré : quatorze cases ouvertes sous
 * chaque plat feraient d'une carte de trente plats un mur de quatre cent
 * vingt cases, et plus personne ne remplirait rien. Ce qui reste visible
 * quand c'est replié, c'est l'essentiel — la liste déclarée, ou le fait
 * qu'il n'y en a pas.
 *
 * Aucun JavaScript : `<details>` s'ouvre tout seul, et l'enregistrement
 * est un POST. Le tableau de bord se tient souvent sur le téléphone du
 * gérant, en salle, avec un réseau qui va et vient.
 */
export function AllergenesPlat({
  restaurantId,
  plat,
}: {
  restaurantId: string;
  plat: { id: string; nom: string; allergenes: string[] | null };
}) {
  const declares = plat.allergenes;
  const coches = new Set(declares ?? []);

  const resume =
    declares === null ? (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        allergènes à déclarer
      </span>
    ) : declares.length === 0 ? (
      <span className="text-xs text-zinc-500">Aucun allergène déclaré</span>
    ) : (
      <span className="text-xs text-zinc-500">
        {listeAllergenes(declares, "fr")}
      </span>
    );

  return (
    <details className="w-full">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-brand-navy">
        <span aria-hidden="true">▸</span>
        {resume}
      </summary>

      <form
        action={enregistrerAllergenes}
        className="mt-2 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
      >
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="id" value={plat.id} />
        {/* Le témoin qui distingue « rien coché » de « rien envoyé ». */}
        <input type="hidden" name="declare" value="1" />

        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Allergènes de {plat.nom}</legend>
          <div className="grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
            {ALLERGENES.map((allergene) => (
              <label
                key={allergene.code}
                className="flex items-baseline gap-2 text-sm text-zinc-700"
              >
                <input
                  type="checkbox"
                  name="allergenes"
                  value={allergene.code}
                  defaultChecked={coches.has(allergene.code)}
                  className="mt-0.5 shrink-0 accent-brand-navy"
                />
                <span>
                  {allergene.fr}
                  {allergene.detailFr && (
                    <span className="text-zinc-400">
                      {" "}
                      — {allergene.detailFr}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-brand-navy px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Enregistrer
          </button>
          <p className="text-xs text-zinc-500">
            Enregistrer sans rien cocher déclare que ce plat n&apos;en contient
            aucun.
          </p>
        </div>
      </form>
    </details>
  );
}
