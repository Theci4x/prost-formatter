/**
 * Ce qu'une campagne doit respecter pour partir.
 *
 * En fonctions pures, hors de toute action serveur : une règle qui décide
 * si un message part à cinq cents personnes doit pouvoir se lire et se
 * vérifier sans base de données.
 */

/** L'objet d'un e-mail : au-delà, les messageries coupent. */
export const OBJET_MAX = 120;

/**
 * La longueur du corps.
 *
 * Généreuse, mais pas infinie : une newsletter de restaurant qui dépasse
 * quelques milliers de signes n'est pas lue, et un champ sans limite finit
 * par recevoir un roman collé depuis un traitement de texte.
 */
export const TEXTE_MAX = 4000;

export const LIBELLE_BOUTON_MAX = 40;

export type Brouillon = {
  objet: string;
  texte: string;
  boutonLibelle: string | null;
  boutonUrl: string | null;
};

/** Ce qui manque pour enregistrer, ou rien. */
export function validerContenu(b: Brouillon): string | null {
  if (!b.objet.trim()) return "Il manque l'objet du message.";
  if (b.objet.length > OBJET_MAX) {
    return `L'objet dépasse ${OBJET_MAX} caractères.`;
  }
  if (!b.texte.trim()) return "Le message est vide.";
  if (b.texte.length > TEXTE_MAX) {
    return `Le message dépasse ${TEXTE_MAX} caractères.`;
  }

  const libelle = b.boutonLibelle?.trim() ?? "";
  const url = b.boutonUrl?.trim() ?? "";
  // Les deux ou aucun : un bouton sans adresse ne mène nulle part, une
  // adresse sans libellé ne s'affiche pas. La base le refuse aussi, mais
  // un message clair vaut mieux qu'une erreur de contrainte.
  if (libelle && !url) return "Le bouton n'a pas d'adresse.";
  if (url && !libelle) return "Le bouton n'a pas de libellé.";
  if (libelle.length > LIBELLE_BOUTON_MAX) {
    return `Le libellé du bouton dépasse ${LIBELLE_BOUTON_MAX} caractères.`;
  }
  if (url && !/^https?:\/\/\S+$/i.test(url)) {
    return "L'adresse du bouton doit commencer par https://";
  }
  return null;
}

/**
 * Le jour d'envoi est-il acceptable ?
 *
 * Aujourd'hui est accepté : la tâche passe le matin, et quelqu'un qui
 * programme à midi pour le jour même verra simplement son message partir
 * le lendemain. Le refuser obligerait à expliquer une règle d'horaire
 * pour rien.
 */
export function validerDate(jour: string, aujourdhui: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(jour)) return "Choisissez une date d'envoi.";
  if (jour < aujourdhui) return "Cette date est passée.";
  return null;
}
