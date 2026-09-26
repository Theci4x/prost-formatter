import type { Actualite } from "@/types/actualite";

import { actualite as quandoo } from "@/contenu/actualites/quandoo-ferme";
import { actualite as theforkAmex } from "@/contenu/actualites/thefork-rachat-american-express";

/**
 * Les actualités, importées une par une comme les billets du journal : un
 * texte qu'on oublie de brancher se voit ici, pas six mois plus tard.
 */
const TOUTES: Actualite[] = [quandoo, theforkAmex];

export const CHEMIN_ACTUALITES = "/actualites";

/** De la plus récente à la plus ancienne. */
export function toutesLesActualites(): Actualite[] {
  return [...TOUTES].sort(
    (a, b) =>
      b.publieLe.localeCompare(a.publieLe) ||
      b.misAJourLe.localeCompare(a.misAJourLe),
  );
}

export function actualiteParSlug(slug: string): Actualite | null {
  return TOUTES.find((actualite) => actualite.slug === slug) ?? null;
}
