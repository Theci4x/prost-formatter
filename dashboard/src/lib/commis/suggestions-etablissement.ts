/**
 * Les questions proposées en ouvrant l'assistant d'un restaurant.
 *
 * Elles ne sont pas décoratives : devant un champ vide, personne ne sait
 * ce qu'un assistant sait faire, et la première question décide si on en
 * pose une deuxième. Elles disent donc son domaine — et, par ce qu'elles
 * ne contiennent pas, ses limites.
 *
 * **Aucune ne porte sur la disponibilité.** Pas de « avez-vous une table
 * ce soir ». Proposer la question qu'on refuse de répondre serait la plus
 * sûre façon de décevoir au premier essai, alors que le formulaire de
 * réservation est juste au-dessus et répond, lui.
 *
 * On ne propose que ce que la fiche peut honorer : la carte n'est
 * suggérée que si elle est publiée, la privatisation que si une salle
 * s'en propose.
 */

export function suggestionsPour({
  carte,
  privatisation,
}: {
  /** La carte est publiée sur cette page. */
  carte: boolean;
  /** Au moins une salle se privatise. */
  privatisation: boolean;
}): string[] {
  return [
    "Quels sont vos horaires ?",
    carte ? "Avez-vous des plats végétariens ?" : null,
    privatisation ? "Peut-on privatiser une salle ?" : null,
    "Acceptez-vous les chiens ?",
  ].filter((question): question is string => question !== null);
}
