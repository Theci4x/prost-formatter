import "server-only";

/**
 * Les modèles que le Commis sait faire tourner, et ce qu'ils coûtent.
 *
 * **Le tarif voyage avec le modèle.** C'est tout l'objet de ce fichier.
 * Le compteur de dépense décide quand le Commis s'arrête pour la journée ;
 * un modèle cinq fois moins cher, facturé au tarif de l'ancien, éteindrait
 * l'assistant cinq fois trop tôt — et rien ne le signalerait, puisque le
 * plafond se déclencherait exactement comme prévu.
 *
 * `effort` dit si le modèle accepte `output_config.effort`. Tous ne le
 * prennent pas : Haiku 4.5 rejette la requête entière quand on le lui
 * envoie. Sans cette colonne, changer une variable d'environnement
 * éteindrait le Commis en production, et l'erreur n'apparaîtrait que dans
 * les journaux.
 */

export type Tarif = {
  /** Dollars par million de jetons d'entrée. */
  entree: number;
  /** Dollars par million de jetons de sortie. */
  sortie: number;
  /** Le modèle accepte-t-il `output_config.effort` ? */
  effort: boolean;
};

export const MODELE_PAR_DEFAUT = "claude-opus-5";

/**
 * Le modèle de l'assistant d'un restaurant.
 *
 * Haiku, et fixé ici plutôt que réglable : ce Commis-là relit trois
 * phrases dans une fiche pour répondre « nous fermons à 23h ». C'est du
 * travail de lecture, pas de raisonnement, et il tourne sur toutes les
 * pages publiques de tous les établissements — cinq fois moins cher y
 * change l'ordre de grandeur de la facture.
 */
export const MODELE_ETABLISSEMENT = "claude-haiku-4-5";

export const MODELES: Record<string, Tarif> = {
  "claude-opus-5": { entree: 5, sortie: 25, effort: true },
  "claude-sonnet-5": { entree: 2, sortie: 10, effort: true },
  "claude-haiku-4-5": { entree: 1, sortie: 5, effort: false },
};

/** Le modèle d'un assistant d'établissement, avec son tarif. */
export function modeleEtablissement(): { nom: string; tarif: Tarif } {
  return {
    nom: MODELE_ETABLISSEMENT,
    tarif: MODELES[MODELE_ETABLISSEMENT]!,
  };
}

/**
 * Le modèle demandé par la configuration, ou celui par défaut.
 *
 * Un nom inconnu n'est jamais utilisé tel quel : on ne saurait ni ce
 * qu'il coûte, ni ce qu'il accepte. Un Commis qui tourne sur le modèle
 * par défaut vaut mieux qu'un compteur qui ment ou qu'une requête qui
 * échoue à chaque question.
 */
export function modeleDuCommis(demande = process.env.ANTHROPIC_MODEL): {
  nom: string;
  tarif: Tarif;
} {
  const nom = demande?.trim();
  const connu = nom ? MODELES[nom] : undefined;
  if (nom && connu) return { nom, tarif: connu };
  if (nom) {
    console.error(
      `[commis] modèle inconnu « ${nom} » — repli sur ${MODELE_PAR_DEFAUT}. Ajoute-le à MODELES avec son tarif.`,
    );
  }
  return { nom: MODELE_PAR_DEFAUT, tarif: MODELES[MODELE_PAR_DEFAUT]! };
}
