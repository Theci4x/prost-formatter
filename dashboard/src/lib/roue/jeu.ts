/**
 * L'état du jeu, hors du fichier d'actions.
 *
 * Un fichier marqué « use server » ne peut exporter que des fonctions
 * asynchrones. Une constante qu'on y laisse n'est pas une constante à
 * l'arrivée : elle devient une référence vers le serveur. Passée en état
 * initial à `useActionState`, elle donne un état dont les champs valent
 * `undefined` au lieu de `null` — et un bouton désactivé pour toujours,
 * sans la moindre erreur dans la console.
 *
 * C'est la troisième fois que ce piège se referme sur ce dépôt. D'où ce
 * fichier, et d'où le contrôle ajouté à `scripts/verifier-frontiere.mjs`.
 */

export type JeuState = {
  error: string | null;
  resultat: {
    /** L'index de la case dans la liste affichée, pour l'animation. */
    index: number;
    libelle: string;
    gagnant: boolean;
    code: string | null;
    expireLe: string | null;
  } | null;
};

export const JEU_INITIAL: JeuState = { error: null, resultat: null };
