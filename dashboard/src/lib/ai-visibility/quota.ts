import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { consommer } from "@/lib/limites/publiques";

/**
 * Le garde-fou de la facture d'IA.
 *
 * Rien n'empêchait un restaurateur — ou une boucle mal écrite — de lancer
 * mille analyses dans la journée. Mille analyses, c'est une soixantaine
 * d'euros chez les fournisseurs de modèles, et on ne le découvre que sur
 * la facture du mois suivant.
 *
 * Les plafonds sont posés très au-dessus de l'usage réel : six questions
 * réanalysées une fois par mois font six analyses par mois, pas trente par
 * jour. Personne d'honnête ne les touchera jamais ; ils n'existent que
 * pour l'accident.
 *
 * Le compteur passe par la clé de service : la fonction SQL est fermée aux
 * rôles anon et authenticated, précisément pour qu'on ne puisse pas
 * gonfler le compteur d'autrui jusqu'à le bloquer.
 */

/** Par établissement et par jour. */
export const PLAFONDS = {
  analyse: 30,
  suggestion: 10,
  plan: 10,
} as const;

export type Geste = keyof typeof PLAFONDS;

const REFUS: Record<Geste, string> = {
  analyse:
    "Trop d'analyses aujourd'hui. Le compteur repart demain — écris-moi si tu en as vraiment besoin de plus.",
  suggestion:
    "Trop de propositions de questions aujourd'hui. Le compteur repart demain.",
  plan: "Trop de plans écrits aujourd'hui. Le compteur repart demain.",
};

/** Null quand c'est bon, le message à afficher quand c'est refusé. */
export async function consommerGeste(
  restaurantId: string,
  geste: Geste,
): Promise<string | null> {
  // Une panne du compteur laisse passer : couper la fonctionnalité parce
  // qu'un compteur est indisponible ferait plus de mal que le dépassement
  // qu'on cherche à éviter. Le plafond mensuel de la console reste derrière.
  const ok = await consommer(
    createServiceClient(),
    `ia:${geste}:${restaurantId}`,
    PLAFONDS[geste],
  );
  return ok ? null : REFUS[geste];
}
