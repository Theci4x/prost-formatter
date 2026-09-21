import Link from "next/link";

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

type Outil = { id: OutilId; chemin: string; titre: string; pourquoi: string };

/** L'ordre des questions telles qu'elles se posent, pas des pages. */
const SUITE: Outil[] = [
  {
    id: "diagnostic",
    chemin: "/diagnostic-local-restaurant",
    titre: "Le diagnostic du local",
    pourquoi: "Les cinq points qui empêchent d'ouvrir, avant de signer.",
  },
  {
    id: "calendrier",
    chemin: "/calendrier-ouverture-restaurant",
    titre: "Le calendrier d'ouverture",
    pourquoi: "Quand commencer quoi, à rebours depuis votre date.",
  },
  {
    id: "audit",
    chemin: "/audit-fiche-google-restaurant",
    titre: "L'audit de votre fiche Google",
    pourquoi: "Ce que Google, les avis et les IA disent de vous.",
  },
  {
    id: "calculateur",
    chemin: "/calculateur-commissions-restaurant",
    titre: "Le calculateur de commissions",
    pourquoi: "Ce que la plateforme vous coûte, avec vos chiffres.",
  },
];

export function SuiteOutils({ actuel }: { actuel: OutilId }) {
  const rang = SUITE.findIndex((outil) => outil.id === actuel);
  const suivant = rang >= 0 ? SUITE[rang + 1] : undefined;

  return (
    <nav className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      {suivant ? (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
              L&apos;outil suivant
            </span>
            <span className="text-base font-semibold text-zinc-900">
              {suivant.titre}
            </span>
            <span className="text-base text-zinc-600">{suivant.pourquoi}</span>
          </div>
          <Link
            href={suivant.chemin}
            className="w-fit rounded-md bg-brand-navy px-5 py-2.5 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover"
          >
            Continuer →
          </Link>
        </>
      ) : (
        <p className="text-base text-zinc-600">
          Vous avez fait le tour des quatre. Le reste du parcours est dans le
          journal, démarche par démarche.
        </p>
      )}

      <Link
        href="/ouvrir-un-restaurant"
        className="w-fit text-base text-brand-navy underline-offset-2 hover:underline"
      >
        ← Revenir aux outils
      </Link>
    </nav>
  );
}
