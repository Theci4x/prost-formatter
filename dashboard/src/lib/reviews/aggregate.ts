import { searchYelpBusiness, getYelpReviews } from "@/lib/reviews/yelp";
import {
  searchTripadvisorLocation,
  getTripadvisorDetails,
  getTripadvisorReviews,
} from "@/lib/reviews/tripadvisor";
import { FRAICHEUR_ECRAN } from "@/lib/reviews/fraicheur";
import {
  searchPlace,
  getPlaceDetails,
  getPlaceReviews,
} from "@/lib/google/places";

export type PlatformReviews = {
  platform: "yelp" | "tripadvisor" | "google";
  configured: boolean;
  found: boolean;
  /**
   * Vrai quand l'établissement a été confirmé par le restaurateur, faux
   * quand Klarr l'a deviné. Ce qui est deviné se conteste : l'écran doit
   * pouvoir le dire, sans quoi une note empruntée à un homonyme passe
   * pour la sienne.
   */
  epingle?: boolean;
  businessName?: string;
  businessUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  reviews: {
    author: string;
    rating: number;
    text: string;
    publishedAt: string | null;
    url: string | null;
  }[];
};

export async function fetchYelpPlatformReviews(
  name: string,
  location: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlatformReviews> {
  if (!process.env.YELP_API_KEY) {
    return { platform: "yelp", configured: false, found: false, reviews: [] };
  }

  try {
    const business = await searchYelpBusiness(name, location, fraicheur);
    if (!business) {
      return { platform: "yelp", configured: true, found: false, reviews: [] };
    }

    const reviews = await getYelpReviews(business.id, fraicheur);

    return {
      platform: "yelp",
      configured: true,
      found: true,
      businessName: business.name,
      businessUrl: business.url,
      rating: business.rating,
      reviewCount: business.reviewCount,
      reviews,
    };
  } catch (err) {
    console.error("[fetchYelpPlatformReviews]", err);
    return { platform: "yelp", configured: true, found: false, reviews: [] };
  }
}

export async function fetchTripadvisorPlatformReviews(
  name: string,
  location: string,
  /** L'identifiant confirmé, s'il y en a un : on ne redevine alors plus. */
  locationIdEpingle?: string | null,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlatformReviews> {
  if (!process.env.TRIPADVISOR_API_KEY) {
    return {
      platform: "tripadvisor",
      configured: false,
      found: false,
      reviews: [],
    };
  }

  try {
    const locationId =
      locationIdEpingle ??
      (await searchTripadvisorLocation(`${name} ${location}`, fraicheur))
        ?.locationId ??
      null;

    if (!locationId) {
      return {
        platform: "tripadvisor",
        configured: true,
        found: false,
        epingle: false,
        reviews: [],
      };
    }

    const [details, reviews] = await Promise.all([
      getTripadvisorDetails(locationId, fraicheur),
      getTripadvisorReviews(locationId, fraicheur),
    ]);

    return {
      platform: "tripadvisor",
      configured: true,
      found: true,
      epingle: Boolean(locationIdEpingle),
      businessName: details.nom ?? name,
      businessUrl: details.webUrl,
      rating: details.rating,
      reviewCount: details.reviewCount,
      reviews,
    };
  } catch (err) {
    console.error("[fetchTripadvisorPlatformReviews]", err);
    return {
      platform: "tripadvisor",
      configured: true,
      found: false,
      epingle: Boolean(locationIdEpingle),
      reviews: [],
    };
  }
}

// Les avis Google passent par l'API Places, self-service et déjà utilisée
// pour l'audit : contrairement à l'API Business Profile, elle ne demande
// aucune autorisation à attendre. Lecture seule en revanche — publier une
// réponse relève de l'autre API.
export async function fetchGooglePlatformReviews(
  name: string,
  location: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlatformReviews> {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return { platform: "google", configured: false, found: false, reviews: [] };
  }

  try {
    const place = await searchPlace(`${name} ${location}`.trim(), fraicheur);
    if (!place) {
      return {
        platform: "google",
        configured: true,
        found: false,
        reviews: [],
      };
    }

    const [details, reviews] = await Promise.all([
      getPlaceDetails(place.id, fraicheur),
      getPlaceReviews(place.id, fraicheur),
    ]);

    return {
      platform: "google",
      configured: true,
      found: true,
      businessName: place.displayName,
      businessUrl: `https://www.google.com/maps/place/?q=place_id:${place.id}`,
      rating: details.rating,
      reviewCount: details.userRatingCount,
      reviews,
    };
  } catch (err) {
    console.error("[fetchGooglePlatformReviews]", err);
    return { platform: "google", configured: true, found: false, reviews: [] };
  }
}
