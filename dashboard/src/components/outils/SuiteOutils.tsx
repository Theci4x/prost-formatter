import Link from "next/link";
import { SUITE, t } from "@/lib/i18n/outils";
import type { Langue } from "@/lib/i18n/langues";

/**
 * Le pied des pages d'outils : où aller ensuite.
 *
 * Les quatre outils forment une suite — le local, puis le calendrier,
 * puis la visibilité, puis le carnet — et quelqu'un qui vient d'en finir
 * un est exactement la personne qui fera le suivant. Jusqu'ici il devait
 * repasser par l'accueil, où la page d'accueil reprend la main sur son
 * attention et lui parle d'autre chose.
 *
 * Deux sorties, donc, et pas une : la suivante pour continuer, et le
 * retour à la liste pour celui que l'ordre proposé ne concerne pas — un
 * restaurant déjà ouvert n'a que faire du calendrier d'ouverture.
 *
 * Le dernier outil de la suite n'a pas de « suivant » : lui inventer une
 * étape de plus, ou boucler sur le premier, ferait tourner en rond
 * quelqu'un qui a fini.
 */

export type OutilId = "diagnostic" | "calendrier" | "audit" | "calculateur";

type Outil = { id: OutilId; chemin: string };

/** L'ordre des questions telles qu'elles se posent, pas des pages. */
const ORDRE: Outil[] = [
  { id: "diagnostic", chemin: "/diagnostic-local-restaurant" },
  { id: "calendrier", chemin: "/calendrier-ouverture-restaurant" },
  { id: "audit", chemin: "/audit-fiche-google-restaurant" },
  { id: "calculateur", chemin: "/calculateur-commissions-restaurant" },
];

export function SuiteOutils({
  actuel,
  langue,
}: {
  actuel: OutilId;
  langue: Langue;
}) {
  const rang = ORDRE.findIndex((outil) => outil.id === actuel);
  const suivant = rang >= 0 ? ORDRE[rang + 1] : undefined;

  return (
    <nav className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      {suivant ? (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
              {t(SUITE.surtitre, langue)}
            </span>
            <span className="text-base font-semibold text-zinc-900">
              {t(SUITE[suivant.id].titre, langue)}
            </span>
            <span className="text-base text-zinc-600">
              {t(SUITE[suivant.id].pourquoi, langue)}
            </span>
          </div>
          <Link
            href={suivant.chemin}
            className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            {t(SUITE.continuer, langue)}
          </Link>
        </>
      ) : (
        <p className="text-base text-zinc-600">{t(SUITE.fini, langue)}</p>
      )}

      <Link
        href="/ouvrir-un-restaurant"
        className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
      >
        {t(SUITE.revenir, langue)}
      </Link>
    </nav>
  );
}
