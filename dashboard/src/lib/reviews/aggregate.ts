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
  type StatutGoogle,
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
  /**
   * L'état de la fiche, quand la plateforme le dit. Google seul le rend
   * aujourd'hui ; d'où l'optionnel plutôt qu'un champ par plateforme.
   */
  businessStatus?: StatutGoogle | null;
  /**
   * La date du relevé d'où vient la note, quand elle ne sort pas d'un
   * appel à l'instant : l'écran le dit, pour qu'une note vieille de six
   * jours ne passe pas pour celle du matin.
   */
  releveLe?: string | null;
  /**
   * Vrai tant que le relevé de nuit n'est pas encore passé — premier
   * relevé, ou établissement qu'on vient de confirmer.
   */
  releveAttendu?: boolean;
  /**
   * L'identifiant de l'établissement chez la plateforme, quand elle en a
   * un et qu'on l'a trouvé : le relevé le garde pour ne plus le chercher.
   */
  locationId?: string | null;
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
  {
    epingle: locationIdEpingle = null,
    devine = null,
    fraicheur = FRAICHEUR_ECRAN,
    avecAvis = true,
  }: {
    /** L'identifiant confirmé par le restaurateur : il passe avant tout. */
    epingle?: string | null;
    /**
     * Celui qu'une recherche précédente a trouvé. Tripadvisor facture
     * chaque établissement qu'une recherche renvoie — jusqu'à dix : on ne
     * la refait pas quand on connaît déjà la réponse.
     */
    devine?: string | null;
    fraicheur?: number;
    /**
     * Faux pour le relevé de nuit, qui n'enregistre que la note et le
     * nombre d'avis : les textes lui coûteraient un appel facturé par
     * établissement et par semaine, pour rien.
     */
    avecAvis?: boolean;
  } = {},
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
      devine ??
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
      avecAvis
        ? getTripadvisorReviews(locationId, fraicheur)
        : Promise.resolve([]),
    ]);

    return {
      platform: "tripadvisor",
      configured: true,
      found: true,
      epingle: Boolean(locationIdEpingle),
      locationId,
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

    // Un seul appel : la fiche rend déjà les avis. En faire un second pour
    // les mêmes avis, c'était payer deux fois au palier le plus cher.
    const details = await getPlaceDetails(place.id, fraicheur);
    const reviews = details.avis;

    return {
      platform: "google",
      configured: true,
      found: true,
      businessName: place.displayName,
      businessUrl: `https://www.google.com/maps/place/?q=place_id:${place.id}`,
      rating: details.rating,
      reviewCount: details.userRatingCount,
      businessStatus: details.businessStatus,
      reviews,
    };
  } catch (err) {
    console.error("[fetchGooglePlatformReviews]", err);
    return { platform: "google", configured: true, found: false, reviews: [] };
  }
}
