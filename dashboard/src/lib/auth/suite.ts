/**
 * Où revenir après la connexion.
 *
 * Seulement un chemin de ce site : « /admin », pas « //ailleurs.com » ni
 * « https://… ». Sans ce filtre, un lien de connexion piégé renverrait
 * le restaurateur, tout juste identifié et en confiance, sur la page de
 * quelqu'un d'autre.
 */
export function suiteSure(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  if (!valeur.startsWith("/") || valeur.startsWith("//")) return null;
  if (valeur.includes("\\") || /[\r\n]/.test(valeur)) return null;
  return valeur;
}
