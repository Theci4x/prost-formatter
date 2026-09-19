import "server-only";
import { runVisibilityChecks } from "@/lib/ai-visibility/check";

/**
 * Est-ce que l'IA connaît cet établissement ?
 *
 * Le pilier « Visibilité IA » de l'audit était jusqu'ici déduit : on
 * regardait si le site portait des données structurées, et on en tirait
 * qu'un assistant saurait le lire. C'est une présomption, pas une mesure.
 *
 * Ici on pose vraiment la question, comme un client la poserait, et on
 * regarde qui sort. Un restaurateur à qui l'on montre « sur "le meilleur
 * bar à bière à Paris", l'IA cite La Fine Mousse, Les Trois 8 et Hoppy
 * Corner — pas vous » comprend en une seconde ce qu'aucun score sur cent
 * ne lui aura expliqué. Et ce sont des noms qu'il connaît.
 */

export type PresenceIa = {
  /** La question posée, montrée telle quelle : elle fait la démonstration. */
  question: string;
  cite: boolean;
  /** Sa place dans la réponse, quand il y figure. */
  rang: number | null;
  /** Ceux que l'assistant a nommés à sa place, dans l'ordre. */
  concurrents: string[];
};

/**
 * La question qu'un client poserait vraiment.
 *
 * Le genre vient de Google — « Bar à bière », « Restaurant italien ». Sans
 * lui on ne demande rien : « le meilleur restaurant à Paris » met en
 * concurrence dix mille maisons et ne mesure plus rien d'utile.
 */
export function questionPour(
  genre: string | null,
  ville: string,
): string | null {
  const type = genre?.trim();
  if (!type || !ville.trim()) return null;
  return `Quel est le meilleur ${type.toLowerCase()} à ${ville.trim()} ?`;
}

export async function mesurerPresenceIa(
  nom: string,
  genre: string | null,
  ville: string,
): Promise<PresenceIa | null> {
  const question = questionPour(genre, ville);
  if (!question) return null;

  try {
    const resultats = await runVisibilityChecks({
      question,
      restaurantName: nom,
    });

    const premier = resultats[0];
    if (!premier) return null;

    return {
      question,
      cite: premier.estCite,
      rang: premier.rang,
      // Cinq noms suffisent à faire comprendre. Au-delà, on lit une liste
      // au lieu de reconnaître ses voisins.
      concurrents: premier.concurrents.slice(0, 5),
    };
  } catch (erreur) {
    // L'audit doit tourner sans clé d'IA : ce bloc est un bonus, pas une
    // dépendance. Son absence enlève un encart, elle ne casse rien.
    console.error("[audit/ia]", erreur);
    return null;
  }
}
