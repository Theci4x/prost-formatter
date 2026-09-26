/**
 * Les incohérences entre ce que Klarr sait et ce que le monde voit.
 *
 * À part du pouls, qui compte des lignes : ici on ne compte rien, on
 * juge. Une règle qui décide d'allumer un point rouge sur l'écran d'un
 * restaurateur mérite d'être lisible seule, et vérifiable sans base.
 */

/**
 * La fiche Google dit « fermé temporairement » alors que des clients sont
 * attendus dans la semaine.
 *
 * Une fiche fermée pendant des travaux est normale, et ne regarde
 * personne : le restaurateur l'a posée lui-même. Ce qui coûte cher, c'est
 * la réouverture — on rouvre la salle, on rouvre le carnet, et on oublie
 * la fiche pendant trois semaines. Pendant ce temps Google ne propose
 * plus l'établissement à personne, et le restaurateur croit simplement
 * que « ça repart doucement ».
 *
 * Les couverts des sept prochains jours sont la preuve qu'une maison
 * tourne. Une réservation prise pour dans trois mois ne prouve rien — un
 * restaurant en travaux en accepte ; une table attendue jeudi, si.
 *
 * « Fermé définitivement » n'entre pas dans la règle : ce n'est pas une
 * étourderie, et l'annoncer comme telle serait déplacé.
 *
 * Un statut inconnu — jamais relevé, ou Google qui ne l'a pas dit — ne
 * déclenche rien. On n'alerte pas sur ce qu'on ignore.
 */
export function ficheFermeeAlorsQuOnOuvre(
  statutGoogle: string | null | undefined,
  couvertsProches: number,
): boolean {
  return statutGoogle === "CLOSED_TEMPORARILY" && couvertsProches > 0;
}
