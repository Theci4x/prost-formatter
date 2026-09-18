/**
 * Ce que cherchait le client en posant sa question.
 *
 * Un taux de citation global ne veut rien dire. Être nommé dans « quels
 * sont les bars les plus populaires à Paris » flatte ; être nommé dans
 * « où réserver une table pour un dîner événementiel » remplit une salle.
 * Le premier chiffre se regarde, le second se travaille.
 *
 * Les intentions sont nommées du point de vue du restaurateur, et non en
 * jargon de référencement : « on me découvre » se comprend sans glossaire,
 * « informational » non.
 */

export const INTENTIONS = ["decouverte", "comparaison", "reservation"] as const;
export type Intention = (typeof INTENTIONS)[number];

export const LIBELLE_INTENTION: Record<Intention, string> = {
  decouverte: "On me découvre",
  comparaison: "On me compare",
  reservation: "On me réserve",
};

export const RESUME_INTENTION: Record<Intention, string> = {
  decouverte:
    "Le client explore un quartier ou un genre, sans idée précise. Y figurer construit la notoriété.",
  comparaison:
    "Le client a réduit son choix et cherche le meilleur. Y figurer se dispute avec vos voisins directs.",
  reservation:
    "Le client sait ce qu'il veut et cherche où le réserver. C'est l'intention qui remplit la salle — et celle qui compte vraiment.",
};

/** Ce qu'on demande au modèle quand on lui fait écrire des questions. */
export const CONSIGNE_INTENTION: Record<Intention, string> = {
  decouverte:
    "des questions larges, où le client explore un quartier, un genre ou une ambiance sans avoir choisi",
  comparaison:
    "des questions où le client compare et cherche le meilleur, le plus réputé, le mieux noté",
  reservation:
    "des questions où le client cherche explicitement à réserver, pour une occasion précise — anniversaire, dîner d'affaires, événement privé, groupe",
};

export function estIntention(valeur: string): valeur is Intention {
  return (INTENTIONS as readonly string[]).includes(valeur);
}
