/**
 * Combien de temps une lecture d'avis peut resservir.
 *
 * La page Avis interrogeait Google Places, Yelp et Tripadvisor à chaque
 * affichage. Trois appels facturés par rafraîchissement, par retour en
 * arrière, par onglet rouvert — pour une note qui bouge une fois par
 * semaine. Un restaurateur qui laisse sa page ouverte et la recharge dix
 * fois dans la journée payait trente appels pour la même information.
 *
 * Next 16 ne met plus rien en cache sans qu'on le demande : le défaut est
 * donc explicite ici, et se choisit par appelant. L'écran se contente de
 * six heures ; le relevé de nuit, lui, est la source de vérité et doit
 * voir l'état réel, pas ce qu'un visiteur a mis en cache à deux heures du
 * matin.
 */

/** Six heures : un avis n'arrive pas à la minute, un écran non plus. */
export const FRAICHEUR_ECRAN = 6 * 3600;

/** Zéro : toujours frais, pour qui fait autorité. */
export const TOUJOURS_FRAIS = 0;

export function optionsFraicheur(secondes: number): RequestInit {
  return secondes > 0
    ? ({
        cache: "force-cache",
        next: { revalidate: secondes },
      } as RequestInit)
    : { cache: "no-store" };
}
