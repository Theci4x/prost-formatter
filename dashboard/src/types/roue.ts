/**
 * La roue du totem, telle qu'elle se lit en base et se saisit à l'écran.
 */

export type Roue = {
  restaurant_id: string;
  active: boolean;
  titre: string;
  sous_titre: string | null;
  validite_jours: number;
  delai_rejeu_jours: number;
};

export type LotRoue = {
  id: string;
  restaurant_id: string;
  libelle: string;
  precision_interne: string | null;
  gagnant: boolean;
  poids: number;
  stock: number | null;
  ordre: number;
  created_at: string;
};

/** Ce que le formulaire manipule : des chaînes, comme tout formulaire. */
export type LotValeurs = {
  libelle: string;
  precision: string;
  gagnant: boolean;
  poids: string;
  stock: string;
};

export const LOT_VIDE: LotValeurs = {
  libelle: "",
  precision: "",
  gagnant: true,
  poids: "1",
  stock: "",
};

export const ROUE_PAR_DEFAUT: Roue = {
  restaurant_id: "",
  active: false,
  titre: "Tentez votre chance",
  sous_titre: null,
  validite_jours: 30,
  delai_rejeu_jours: 90,
};

export const LOTS_MAX = 12;

/**
 * La part d'une case, en pourcentage, telle qu'on l'annonce au
 * restaurateur.
 *
 * Il saisit des poids — « 70, 20, 10 » — parce qu'ajouter une case ne doit
 * pas l'obliger à recalculer les autres. Mais ce qu'il veut savoir, c'est
 * combien de cafés il va offrir sur cent parties. On lui montre donc les
 * deux : ce qu'il tape, et ce que ça donne.
 *
 * Une case épuisée ou à poids nul ne sort plus : elle compte pour zéro, et
 * les autres se repartagent le tout.
 */
export function partEnPourcent(
  lot: LotRoue,
  tous: LotRoue[],
  distribues: Record<string, number> = {},
): number {
  const actif = (l: LotRoue) => {
    if (l.poids <= 0) return false;
    if (l.stock === null) return true;
    return (distribues[l.id] ?? 0) < l.stock;
  };
  if (!actif(lot)) return 0;
  const total = tous.filter(actif).reduce((s, l) => s + l.poids, 0);
  return total === 0 ? 0 : (lot.poids / total) * 100;
}
