import { choisirPropriete } from "@/app/dashboard/[id]/seo/actions";
import type { EtatSearchConsole } from "@/lib/google/requetes-restaurant";

/**
 * Ce que les gens tapent vraiment.
 *
 * Le reste de cette page relève du projet : les mots-clés qu'on vise,
 * l'analyse qui les commente. Ce tableau-ci relève du constat, et c'est
 * la seule chose qui puisse contredire une intuition.
 *
 * Les colonnes sont ordonnées comme on les lit : d'abord combien de fois
 * on a été vu, puis combien de fois on a été choisi, puis à quelle place.
 * Les impressions d'abord, parce qu'une requête où l'on est invisible n'a
 * pas de position à commenter.
 */
export function RequetesReelles({
  etat,
  restaurantId,
}: {
  etat: EtatSearchConsole;
  restaurantId: string;
}) {
  if (!etat.connecte) {
    return (
      <p className="text-sm text-zinc-500">
        Relie ton compte Google depuis « Connexions » pour voir les requêtes
        réellement tapées par ceux qui te trouvent.
      </p>
    );
  }

  if (etat.erreur) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {etat.erreur}
      </p>
    );
  }

  if (!etat.site) {
    if (etat.proprietes.length === 0) {
      return (
        <p className="text-sm text-zinc-500">
          Aucun site vérifié sur ce compte Google. Search Console suppose que tu
          possèdes un site et que tu l&apos;y as fait vérifier.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-600">Quel site suivre ?</p>
        <ul className="flex flex-col gap-1">
          {etat.proprietes.map((propriete) => (
            <li key={propriete.site}>
              <form action={choisirPropriete}>
                <input
                  type="hidden"
                  name="restaurant_id"
                  value={restaurantId}
                />
                <input type="hidden" name="site" value={propriete.site} />
                <button
                  type="submit"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-left text-sm font-medium text-zinc-900 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {propriete.site}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-xs text-zinc-500">{etat.site} · 28 derniers jours</p>
        {etat.proprietes.length > 1 && (
          <form action={choisirPropriete}>
            <input type="hidden" name="restaurant_id" value={restaurantId} />
            <input type="hidden" name="site" value="" />
            <button
              type="submit"
              className="text-xs text-zinc-500 underline underline-offset-2 hover:text-brand-navy"
            >
              Changer de site
            </button>
          </form>
        )}
      </div>

      {etat.requetes.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Aucune requête sur la période. C&apos;est normal pour un site récent :
          Google met quelques semaines à accumuler de quoi mesurer.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                <th className="py-2 font-medium">Requête</th>
                <th className="py-2 text-right font-medium">Vu</th>
                <th className="py-2 text-right font-medium">Clics</th>
                <th className="py-2 text-right font-medium">Position</th>
              </tr>
            </thead>
            <tbody>
              {etat.requetes.map((r) => (
                <tr key={r.requete} className="border-b border-zinc-100">
                  <td className="py-2 pr-3 text-zinc-800">{r.requete}</td>
                  <td className="py-2 text-right tabular-nums text-zinc-600">
                    {r.impressions}
                  </td>
                  <td className="py-2 text-right tabular-nums text-zinc-600">
                    {r.clics}
                  </td>
                  <td className="py-2 text-right tabular-nums text-zinc-600">
                    {r.position}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
