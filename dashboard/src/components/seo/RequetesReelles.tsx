import { choisirPropriete } from "@/app/dashboard/[id]/seo/actions";
import type { EtatSearchConsole } from "@/lib/google/requetes-restaurant";
import type { RequeteMesuree } from "@/lib/google/search-console";

/**
 * Ce que les gens tapent vraiment — les cas où il n'y a rien à dessiner.
 *
 * Pas de compte relié, une erreur, un site à choisir : trois écrans
 * courts. Dès qu'il y a des chiffres, la page prend le relais avec les
 * tuiles et les graphiques ; ici on ne garde que ce qui précède.
 *
 * Rend `null` quand tout est en place : c'est le signe, pour la page,
 * qu'elle peut dessiner.
 */
export function AvantLesChiffres({
  etat,
  restaurantId,
}: {
  etat: EtatSearchConsole;
  restaurantId: string;
}) {
  if (!etat.connecte) {
    return (
      <Encadre>
        Reliez votre compte Google depuis « Connexions » pour voir les requêtes
        réellement tapées par ceux qui vous trouvent. C&apos;est la seule mesure
        qui ne soit pas une supposition.
      </Encadre>
    );
  }

  if (etat.erreur) {
    return (
      <p
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {etat.erreur}
      </p>
    );
  }

  if (!etat.site) {
    if (etat.proprietes.length === 0) {
      return (
        <Encadre>
          Aucun site vérifié sur ce compte Google. Search Console suppose que
          vous possédez un site et que vous l&apos;y avez fait vérifier.
        </Encadre>
      );
    }
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-5">
        <p className="text-sm font-medium text-ink">Quel site suivre ?</p>
        <ul className="grid gap-2 sm:grid-cols-2">
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
                  className="w-full rounded-lg border border-line px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:border-brand-navy hover:text-brand-navy"
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

  return null;
}

function Encadre({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-line bg-paper/60 px-5 py-4 text-sm leading-relaxed text-ink-soft">
      {children}
    </p>
  );
}

/** La ligne sous le titre : quel site, quelle période, et comment changer. */
export function SourceSuivie({
  etat,
  restaurantId,
}: {
  etat: EtatSearchConsole;
  restaurantId: string;
}) {
  if (!etat.site) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-ink-soft">
      <span>
        {etat.site} · 28 derniers jours · pages de votre établissement
      </span>
      {etat.proprietes.length > 1 && (
        <form action={choisirPropriete}>
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <input type="hidden" name="site" value="" />
          <button
            type="submit"
            className="underline underline-offset-2 hover:text-brand-navy"
          >
            Changer de site
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Le tableau complet, replié.
 *
 * Les graphiques montrent dix requêtes ; le tableau les a toutes, et il
 * est la seule forme qu'un lecteur d'écran ou une feuille de calcul
 * puisse lire. Rien de ce qu'une infobulle montre ne doit manquer ici.
 */
export function TableauRequetes({ requetes }: { requetes: RequeteMesuree[] }) {
  return (
    <details className="group rounded-xl border border-line bg-paper">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
        <span>
          Toutes les requêtes{" "}
          <span className="font-normal text-ink-soft">({requetes.length})</span>
        </span>
        <span
          aria-hidden="true"
          className="text-ink-soft transition-transform group-open:rotate-180"
        >
          ⌄
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-line px-5 pb-4">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-soft">
              <th className="py-2.5 font-medium">Requête</th>
              <th className="py-2.5 text-right font-medium">Vu</th>
              <th className="py-2.5 text-right font-medium">Clics</th>
              <th className="py-2.5 text-right font-medium">Taux</th>
              <th className="py-2.5 text-right font-medium">Position</th>
            </tr>
          </thead>
          <tbody className="[&_td]:border-t [&_td]:border-line [&_td]:py-2">
            {requetes.map((r) => (
              <tr key={r.requete}>
                <td className="pr-3 text-ink">{r.requete}</td>
                <td className="text-right tabular-nums text-ink-soft">
                  {r.impressions}
                </td>
                <td className="text-right tabular-nums text-ink-soft">
                  {r.clics}
                </td>
                <td className="text-right tabular-nums text-ink-soft">
                  {r.ctr} %
                </td>
                <td className="text-right tabular-nums text-ink-soft">
                  {r.position}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
