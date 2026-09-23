import type { RequeteMesuree } from "@/lib/google/search-console";

/**
 * Ce que les chiffres de Search Console disent, une fois lus ensemble.
 *
 * Le tableau brut est la vérité ; cette synthèse est ce qu'on en retient.
 * Elle ne calcule rien qu'on ne puisse recalculer à la main depuis le
 * tableau — c'est la condition pour l'afficher au-dessus de lui.
 *
 * Pure, sans base ni réseau : ce qui décide de ce qu'un restaurateur lit
 * en premier mérite d'être vérifiable seul.
 */

/** Position moyenne au-delà de laquelle Google ne montre plus grand-chose. */
export const PREMIERE_PAGE = 10;
/** La deuxième page : proche, et c'est là que se joue le plus court gain. */
export const DEUXIEME_PAGE = 20;
/** Au-delà, l'échelle des positions s'arrête : on note « > 30 ». */
export const POSITION_MAX = 30;

export type Synthese = {
  impressions: number;
  clics: number;
  /** Part des impressions cliquées, en pourcentage à une décimale. */
  ctr: number;
  requetes: number;
  enPremierePage: number;
  /** Positions 11 à 20 : visibles en insistant, et à portée. */
  presque: number;
};

export function synthese(requetes: RequeteMesuree[]): Synthese {
  const impressions = requetes.reduce((s, r) => s + r.impressions, 0);
  const clics = requetes.reduce((s, r) => s + r.clics, 0);
  return {
    impressions,
    clics,
    ctr: impressions > 0 ? Math.round((clics / impressions) * 1000) / 10 : 0,
    requetes: requetes.length,
    enPremierePage: requetes.filter((r) => r.position <= PREMIERE_PAGE).length,
    presque: requetes.filter(
      (r) => r.position > PREMIERE_PAGE && r.position <= DEUXIEME_PAGE,
    ).length,
  };
}

/**
 * Les requêtes à dessiner : les plus vues d'abord, dix au plus.
 *
 * Dix, parce qu'un graphique à vingt-cinq barres se lit comme une liste,
 * et qu'on a déjà la liste en dessous. Les mêmes dix dans les deux
 * graphiques, dans le même ordre : ils se lisent alors comme un seul
 * tableau à deux colonnes.
 */
export function aDessiner(requetes: RequeteMesuree[], combien = 10) {
  return [...requetes]
    .sort((a, b) => b.impressions - a.impressions || b.clics - a.clics)
    .slice(0, combien);
}

/**
 * Le plafond de l'axe des impressions : un nombre rond juste au-dessus du
 * maximum. « 1 000 » plutôt que « 987 » — l'échelle se lit, la barre la
 * plus longue ne colle pas au bord.
 */
export function plafond(maximum: number): number {
  if (maximum <= 0) return 1;
  const ordre = 10 ** Math.floor(Math.log10(maximum));
  const pas = maximum / ordre;
  const arrondi = pas <= 1 ? 1 : pas <= 2 ? 2 : pas <= 5 ? 5 : 10;
  return arrondi * ordre;
}

/** « 12 400 » — l'espace fine insécable est celle du français. */
export function nombre(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

/** Où une position tombe : la couleur et le mot qu'on lui donne. */
export type Page = "premiere" | "deuxieme" | "loin";

export function pageDe(position: number): Page {
  if (position <= PREMIERE_PAGE) return "premiere";
  if (position <= DEUXIEME_PAGE) return "deuxieme";
  return "loin";
}
