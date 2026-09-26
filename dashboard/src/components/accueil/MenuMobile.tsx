"use client";

import Link from "next/link";
import { useRef } from "react";

/**
 * La navigation de la page d'accueil, sur un téléphone.
 *
 * En dessous de 640 pixels, la barre du haut ne montrait que le logo, le
 * sélecteur de langue et le bouton d'essai : les outils gratuits, le
 * journal et les tarifs étaient invisibles. Or plus de la moitié des
 * visiteurs arrivent par un téléphone, et les outils sont précisément ce
 * qu'on veut leur mettre sous les yeux avant qu'ils décident s'ils nous
 * font confiance.
 *
 * **C'est un `<details>`, et c'est le point du fichier.** Un menu bâti
 * sur un état React ne s'ouvre pas quand le script n'arrive pas — et sur
 * le réseau d'un restaurateur en salle, le script n'arrive pas toujours.
 * Le navigateur, lui, ouvre et ferme un `<details>` tout seul, sans une
 * ligne de JavaScript. Le peu de script ici ne fait qu'une chose : le
 * refermer après un clic. Sans lui le menu resterait ouvert par-dessus
 * la section qu'on vient de rejoindre, ce qui est désagréable mais pas
 * bloquant — exactement le genre de confort qu'on peut perdre sans que
 * la page cesse de marcher.
 */

type Entree = { libelle: string; href: string; accent?: boolean };

export function MenuMobile({
  libelle,
  entrees,
}: {
  /** Le nom du bouton, pour les lecteurs d'écran. */
  libelle: string;
  entrees: Entree[];
}) {
  const bloc = useRef<HTMLDetailsElement>(null);

  return (
    // Pas de « relative » ici : le panneau s'aligne sur le bord droit de
    // l'en-tête, pas sur celui du bouton, sinon il pend au milieu de
    // l'écran en laissant une marge inexpliquée à sa droite.
    <details ref={bloc} className="lg:hidden">
      <summary
        aria-label={libelle}
        className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-black/10 [&::-webkit-details-marker]:hidden"
      >
        <span
          aria-hidden="true"
          className="flex flex-col gap-[3px]"
          style={{ color: "var(--ink-soft)" }}
        >
          <span className="block h-[1.5px] w-4 rounded bg-current" />
          <span className="block h-[1.5px] w-4 rounded bg-current" />
          <span className="block h-[1.5px] w-4 rounded bg-current" />
        </span>
      </summary>

      <nav
        aria-label={libelle}
        onClick={() => {
          if (bloc.current) bloc.current.open = false;
        }}
        className="absolute right-0 z-50 mt-2 flex w-56 flex-col rounded-xl border border-black/10 bg-white py-1.5 shadow-lg"
      >
        {entrees.map((entree) =>
          // Une ancre de la même page n'est pas une navigation : `Link`
          // la traiterait comme telle et couperait le défilement doux.
          entree.href.startsWith("#") ? (
            <a
              key={entree.href}
              href={entree.href}
              className="px-4 py-2.5 text-sm"
              style={{
                fontWeight: entree.accent ? 600 : 500,
                color: entree.accent ? "var(--accent-dark)" : "var(--ink-soft)",
              }}
            >
              {entree.libelle}
            </a>
          ) : (
            <Link
              key={entree.href}
              href={entree.href}
              className="px-4 py-2.5 text-sm"
              style={{
                fontWeight: entree.accent ? 600 : 500,
                color: entree.accent ? "var(--accent-dark)" : "var(--ink-soft)",
              }}
            >
              {entree.libelle}
            </Link>
          ),
        )}
      </nav>
    </details>
  );
}
