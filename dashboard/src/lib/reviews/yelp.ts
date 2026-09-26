import { scraperFiche, type ScrapedReview } from "@/lib/reviews/scrape";

export type YelpBusiness = {
  id: string;
  name: string;
  url: string;
  rating: number;
  reviewCount: number;
};

export type YelpReview = ScrapedReview;

/** Relevé limité à l'URL publique confirmée par le restaurateur. */
export async function scrapeYelpBusiness(
  sourceUrl: string,
  fraicheur = 0,
): Promise<YelpBusiness | null> {
  const fiche = await scraperFiche("yelp", sourceUrl, fraicheur);
  if (fiche.rating == null && fiche.reviewCount == null) return null;
  return {
    id: fiche.url,
    name: fiche.name ?? "Établissement Yelp",
    url: fiche.url,
    rating: fiche.rating ?? 0,
    reviewCount: fiche.reviewCount ?? 0,
  };
}

export async function scrapeYelpReviews(
  sourceUrl: string,
  fraicheur = 0,
): Promise<YelpReview[]> {
  return (await scraperFiche("yelp", sourceUrl, fraicheur)).reviews;
}
