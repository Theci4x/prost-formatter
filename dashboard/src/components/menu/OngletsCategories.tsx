import Link from "next/link";

/**
 * Les onglets de catégories, en haut de la carte.
 *
 * Une carte de brasserie tient en soixante plats et huit catégories. Le
 * client qui cherche un dessert faisait défiler entrées, salades, plats
 * et burgers avant d'y arriver — sur un téléphone, ça fait beaucoup de
 * pouce pour une information qu'il avait déjà en tête en ouvrant la page.
 *
 * Ce sont de simples ancres, et c'est délibéré : la page doit marcher
 * sans JavaScript, sur le réseau d'un sous-sol de restaurant. Le
 * navigateur saute à la section, et le bouton « précédent » revient d'où
 * l'on vient — ce qu'aucun onglet en JavaScript ne fait gratuitement.
 *
 * Collants en haut pendant le défilement, parce qu'un onglet utile est
 * un onglet atteignable depuis le bas de la page.
 */
export function OngletsCategories({
  sections,
}: {
  sections: { ancre: string; titre: string }[];
}) {
  // Une seule catégorie : les onglets ne mènent nulle part, ils prennent
  // seulement de la place au-dessus de la carte.
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Catégories"
      className="sticky top-0 z-10 -mx-5 border-b border-zinc-200/70 bg-brand-cream/95 px-5 py-3 backdrop-blur"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <li key={section.ancre} className="shrink-0">
            <Link
              href={`#${section.ancre}`}
              className="block rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-orange hover:text-brand-orange"
            >
              {section.titre}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
