/**
 * Les règles d'une publication Google, en fonctions pures.
 *
 * Séparées de l'envoi pour la même raison que le rattrapage des
 * courriels : ce qui décide si un post part, et quand, doit se vérifier
 * sans réseau ni base.
 */

export type Bouton = "reserver" | "appeler" | "en_savoir_plus";

export const LIBELLE_BOUTON: Record<Bouton, string> = {
  reserver: "Réserver",
  appeler: "Appeler",
  en_savoir_plus: "En savoir plus",
};

/** Ce que Google accepte dans le corps d'une publication. */
export const LONGUEUR_MAX = 1500;

/**
 * Au-delà, on cesse d'essayer.
 *
 * Un post qui échoue cinq fois n'échoue pas par accident : l'accès est
 * refusé, la photo a disparu, l'établissement n'est plus relié. Insister
 * chaque nuit indéfiniment ferait du bruit sans rien réparer.
 */
export const TENTATIVES_MAX = 5;

export type Brouillon = {
  texte: string;
  publierLe: Date | null;
  bouton: Bouton | null;
  boutonUrl: string | null;
};

/**
 * Ce qui empêche d'enregistrer, dit en une phrase. Null quand tout va.
 */
export function valider(brouillon: Brouillon, maintenant: Date): string | null {
  const texte = brouillon.texte.trim();
  if (!texte) return "Écris le texte de la publication.";
  if (texte.length > LONGUEUR_MAX) {
    return `Google limite à ${LONGUEUR_MAX} caractères — il y en a ${texte.length}.`;
  }

  if (!brouillon.publierLe || Number.isNaN(brouillon.publierLe.getTime())) {
    return "Choisis une date de publication.";
  }
  if (brouillon.publierLe.getTime() < maintenant.getTime()) {
    return "Cette date est déjà passée.";
  }

  // Un bouton sans destination ne fait rien, et Google refuse le post
  // entier plutôt que le seul bouton.
  if (brouillon.bouton && brouillon.bouton !== "appeler") {
    if (!brouillon.boutonUrl?.trim()) {
      return "Ce bouton a besoin d'une adresse.";
    }
    try {
      const url = new URL(brouillon.boutonUrl.trim());
      if (!/^https?:$/.test(url.protocol)) {
        return "L'adresse du bouton doit commencer par https.";
      }
    } catch {
      return "L'adresse du bouton n'est pas valide.";
    }
  }

  return null;
}

export type PostProgramme = {
  statut: string;
  publier_le: string;
  tentatives: number;
};

/** L'heure est venue, et on n'a pas encore renoncé. */
export function aPublier(post: PostProgramme, maintenant: Date): boolean {
  if (post.statut !== "programme") return false;
  if (post.tentatives >= TENTATIVES_MAX) return false;
  return new Date(post.publier_le).getTime() <= maintenant.getTime();
}

/** Le type d'action attendu par Google pour ce bouton. */
export function actionGoogle(bouton: Bouton): string {
  switch (bouton) {
    case "reserver":
      return "BOOK";
    case "appeler":
      return "CALL";
    case "en_savoir_plus":
      return "LEARN_MORE";
  }
}
