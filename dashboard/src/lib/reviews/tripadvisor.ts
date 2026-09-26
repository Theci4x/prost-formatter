import { scraperFiche, type ScrapedReview } from "@/lib/reviews/scrape";

export type TripadvisorLocation = {
  locationId: string;
  name: string;
  adresse: string | null;
};

export type TripadvisorDetails = {
  nom: string | null;
  webUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
};

export type TripadvisorReview = ScrapedReview;

/**
 * Sans API, la fiche est sélectionnée par son URL. On ne devine pas une fiche
 * à partir d'un nom : une homonymie ferait afficher la note d'un voisin.
 */
export async function scrapeTripadvisorDetails(
  sourceUrl: string,
  fraicheur = 0,
): Promise<TripadvisorDetails> {
  const fiche = await scraperFiche("tripadvisor", sourceUrl, fraicheur);
  return {
    nom: fiche.name,
    webUrl: fiche.url,
    rating: fiche.rating,
    reviewCount: fiche.reviewCount,
  };
}

export async function scrapeTripadvisorReviews(
  sourceUrl: string,
  fraicheur = 0,
): Promise<TripadvisorReview[]> {
  return (await scraperFiche("tripadvisor", sourceUrl, fraicheur)).reviews;
}

/** Le vieux parcours de recherche par API n'est plus utilisé sans URL confirmée. */
export async function searchTripadvisorLocations(
  _query?: string,
): Promise<TripadvisorLocation[]> {
  return [];
}
