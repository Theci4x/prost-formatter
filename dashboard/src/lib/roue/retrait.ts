/**
 * Ce que l'écran de retrait manipule, hors du fichier d'actions.
 *
 * Un fichier marqué « use server » ne peut exporter que des fonctions
 * asynchrones : une constante ou une fonction ordinaire y fait échouer la
 * construction entière, pas seulement sa page. D'où ce module.
 */

export type Trouvaille = {
  id: string;
  code: string;
  libelle: string;
  precision: string | null;
  expireLe: string;
  utiliseLe: string | null;
  gagnant: boolean;
};

export type RetraitState = {
  error: string | null;
  trouvaille: Trouvaille | null;
  retire: boolean;
};

export const RETRAIT_INITIAL: RetraitState = {
  error: null,
  trouvaille: null,
  retire: false,
};

/**
 * Le jour d'aujourd'hui, en heure locale — pas en UTC.
 *
 * À une heure du matin à Paris, `toISOString()` rend encore la veille : un
 * lot valable jusqu'à aujourd'hui serait refusé en plein service de nuit,
 * ce qui est exactement le moment où l'on s'en sert.
 */
export function aujourdhui(): string {
  const maintenant = new Date();
  return new Date(maintenant.getTime() - maintenant.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}
