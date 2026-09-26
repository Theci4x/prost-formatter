/**
 * Le mode d'emploi de Klarr.
 *
 * Une seule source pour trois usages : les pages d'aide que lit le
 * restaurateur, l'indexation par les moteurs, et plus tard le Commis — qui
 * ne répondra QUE sur la base de ces articles. C'est pour ça qu'ils vivent
 * dans le dépôt et pas dans un outil à part : une documentation qui dérive
 * du produit fait dire n'importe quoi à un assistant.
 */

export type CategorieAide =
  | "decouvrir"
  | "demarrer"
  | "reservations"
  | "salle"
  | "carte"
  | "argent"
  | "equipe"
  | "visibilite";

export const CATEGORIES: {
  cle: CategorieAide;
  titre: string;
  resume: string;
}[] = [
  {
    cle: "decouvrir",
    titre: "Découvrir Klarr",
    resume: "Ce que c'est, ce que ça coûte, et ce que ça ne fait pas.",
  },
  {
    cle: "demarrer",
    titre: "Démarrer",
    resume: "Créer son établissement et ouvrir sa page de réservation.",
  },
  {
    cle: "reservations",
    titre: "Réservations",
    resume: "Prendre, confirmer et suivre les réservations, jour après jour.",
  },
  {
    cle: "salle",
    titre: "Salle et plan de table",
    resume: "Dessiner ses salles, placer ses clients, fermer des jours.",
  },
  {
    cle: "carte",
    titre: "La carte",
    resume: "Saisir sa carte, la publier, le QR code et l'anglais.",
  },
  {
    cle: "argent",
    titre: "Acomptes et paiements",
    resume: "Stripe, acomptes de privatisation, cautions, abonnement.",
  },
  {
    cle: "equipe",
    titre: "Équipe",
    resume: "Donner un accès à son gérant et à ses serveurs.",
  },
  {
    cle: "visibilite",
    titre: "Visibilité",
    resume: "Fiche Google, avis, réseaux sociaux, présence dans les IA.",
  },
];

export type Article = {
  slug: string;
  titre: string;
  /** Une phrase, affichée dans la liste et dans les résultats de recherche. */
  resume: string;
  categorie: CategorieAide;
  ordre: number;
  /** Les questions auxquelles l'article répond, telles qu'on les pose. */
  questions: string[];
  markdown: string;
};

export function titreCategorie(cle: CategorieAide): string {
  return CATEGORIES.find((c) => c.cle === cle)?.titre ?? "Aide";
}
