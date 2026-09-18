import "server-only";

/**
 * Le plan d'action : ce qu'on fait de la mesure.
 *
 * Savoir qu'on n'est pas cité ne sert à rien. La question du restaurateur
 * n'est pas « quel est mon score », c'est « je fais quoi lundi ». Les
 * outils de suivi s'arrêtent au score parce qu'ils ne connaissent que la
 * réponse de l'IA ; Klarr connaît aussi la fiche, la carte, les photos, la
 * FAQ, les espaces privatisables et les requêtes Google de l'établissement
 * — de quoi dire « ta FAQ ne mentionne nulle part que tu privatises »
 * plutôt que « soignez votre présence en ligne ».
 */

/** Les écrans où l'on va effectivement corriger quelque chose. */
export const ECRANS = {
  vitrine: { libelle: "Vitrine", chemin: "vitrine" },
  menu: { libelle: "Carte", chemin: "menu" },
  photos: { libelle: "Photos", chemin: "photos" },
  faq: { libelle: "Questions fréquentes", chemin: "faq" },
  experiences: { libelle: "Expériences et privatisation", chemin: "experiences" },
  google: { libelle: "Fiche Google", chemin: "google" },
  seo: { libelle: "SEO et mots-clés", chemin: "seo" },
  avis: { libelle: "Avis", chemin: "avis" },
} as const;

export type Ecran = keyof typeof ECRANS;

export function estEcran(valeur: string): valeur is Ecran {
  return Object.prototype.hasOwnProperty.call(ECRANS, valeur);
}

export type ActionPlan = {
  /** L'action, à l'impératif, en une ligne. */
  titre: string;
  /** Ce que la mesure montre, et qui justifie l'action. */
  pourquoi: string;
  /** Null quand l'action se joue hors de Klarr. */
  ecran: Ecran | null;
};

/** Ce que Klarr sait déjà de l'établissement, en clair pour le modèle. */
export type Inventaire = {
  description: string | null;
  typeCuisine: string | null;
  adresse: string | null;
  siteWeb: string | null;
  plats: number;
  photos: number;
  faq: number;
  espaces: number;
  googleRelie: boolean;
  requetes: string[];
};

export function decrireInventaire(inv: Inventaire): string {
  const lignes = [
    `Description publiée : ${inv.description ? `« ${inv.description} »` : "aucune"}`,
    `Type de cuisine renseigné : ${inv.typeCuisine ?? "aucun"}`,
    `Adresse : ${inv.adresse ?? "aucune"}`,
    `Site web : ${inv.siteWeb ?? "aucun"}`,
    `Plats sur la carte : ${inv.plats}`,
    `Photos : ${inv.photos}`,
    `Questions fréquentes publiées : ${inv.faq}`,
    `Espaces privatisables décrits : ${inv.espaces}`,
    `Fiche Google reliée : ${inv.googleRelie ? "oui" : "non"}`,
  ];
  if (inv.requetes.length > 0) {
    lignes.push(
      `Requêtes réellement tapées sur Google pour le trouver : ${inv.requetes.join(", ")}`,
    );
  }
  return lignes.join("\n");
}
