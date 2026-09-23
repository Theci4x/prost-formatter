import type { RequeteMesuree } from "@/lib/google/search-console";

/**
 * La maison d'exemple qui illustre le site.
 *
 * Elle n'existe pas, et c'est le point. Le haut de page montrait Prost —
 * un vrai client — sous des chiffres de démonstration. On ne met pas de
 * faux chiffres sous un vrai nom : c'est exactement ce que la page
 * d'accueil reproche aux autres, et un concurrent aurait raison de nous
 * le renvoyer. Une seule maison inventée, la même partout, marquée
 * « Exemple » à chaque apparition.
 *
 * Les concurrents qu'un assistant cite à sa place sont inventés aussi.
 * Nommer de vrais restaurants dans une démonstration, c'est leur faire de
 * la publicité ou leur en faire le procès ; ni l'un ni l'autre.
 */
export const MAISON = {
  nom: "La Table d'Anselme",
  initiale: "A",
  /** Ce qu'elle écrit sous son nom, sur sa propre page : pas une UI. */
  sousTitre: "BISTROT · LYON",
  slug: "la-table-d-anselme",
} as const;

export const ASSISTANTS = ["ChatGPT", "Gemini", "Claude"] as const;

/** Ce que chaque assistant a répondu, ce matin, à la question posée. */
export const VERDICTS: {
  modele: (typeof ASSISTANTS)[number];
  rang: number | null;
}[] = [
  { modele: "ChatGPT", rang: null },
  { modele: "Gemini", rang: 3 },
  { modele: "Claude", rang: null },
];

/** Les maisons citées, et sur combien de réponses. La nôtre est dedans. */
export const CITATIONS: { nom: string; fois: number; nous?: boolean }[] = [
  { nom: "Le Bistrot Voltigeur", fois: 3 },
  { nom: "Maison Corbière", fois: 2 },
  { nom: "Chez Odile", fois: 2 },
  { nom: MAISON.nom, fois: 1, nous: true },
];

/**
 * Ce que Search Console dirait d'elle. Des requêtes en français : c'est
 * ce que tapent les gens qui cherchent un bistrot à Lyon, quelle que soit
 * la langue du visiteur qui regarde la démonstration.
 */
const r = (
  requete: string,
  impressions: number,
  clics: number,
  position: number,
): RequeteMesuree => ({
  requete,
  impressions,
  clics,
  position,
  ctr: Math.round((clics / impressions) * 1000) / 10,
});

export const REQUETES: RequeteMesuree[] = [
  r("restaurant lyon 2 terrasse", 1840, 92, 6.1),
  r("la table d'anselme", 1210, 388, 1.0),
  r("bistrot presqu'île lyon", 960, 41, 8.4),
  r("où manger près de bellecour", 720, 18, 13.2),
  r("restaurant quenelle lyon", 540, 9, 17.5),
  r("bistrot lyonnais pas cher", 410, 12, 11.8),
  r("brunch lyon 2e", 380, 4, 24.0),
  r("restaurant terrasse bellecour", 290, 22, 4.7),
  r("bouchon lyon centre", 260, 3, 31),
  r("table d'anselme réservation", 190, 71, 1.2),
];

/** Le matin de la carte d'accueil : de quoi remplir les quatre chiffres. */
export const MATIN = {
  couvertsMidi: 34,
  couvertsSoir: 58,
  demandes: 3,
  retours: 1,
  note: 4.6,
  avis: 412,
} as const;
