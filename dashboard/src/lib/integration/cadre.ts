import "server-only";
import { headers } from "next/headers";

/**
 * La page est-elle affichée dans le site d'un restaurant ?
 *
 * Le navigateur le dit lui-même : une page chargée dans une iframe arrive
 * avec « Sec-Fetch-Dest: iframe ». C'est mieux qu'un paramètre d'adresse,
 * qui se perdrait au premier changement de date ou de nombre de couverts
 * — chaque lien de la page devrait penser à le recopier. Le paramètre
 * reste accepté pour les navigateurs qui n'envoient pas l'en-tête.
 */
export async function estIntegre(parametre?: string | null): Promise<boolean> {
  if (parametre === "1") return true;
  return (await headers()).get("sec-fetch-dest") === "iframe";
}
