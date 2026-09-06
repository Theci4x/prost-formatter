import { searchYelpBusiness, getYelpReviews } from "@/lib/reviews/yelp";
import {
  searchTripadvisorLocation,
  getTripadvisorDetails,
  getTripadvisorReviews,
} from "@/lib/reviews/tripadvisor";

export type PlatformReviews = {
  platform: "yelp" | "tripadvisor";
  configured: boolean;
  found: boolean;
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
): Promise<PlatformReviews> {
  if (!process.env.YELP_API_KEY) {
    return { platform: "yelp", configured: false, found: false, reviews: [] };
  }

  try {
    const business = await searchYelpBusiness(name, location);
    if (!business) {
      return { platform: "yelp", configured: true, found: false, reviews: [] };
    }

    const reviews = await getYelpReviews(business.id);

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
    const place = await searchTripadvisorLocation(`${name} ${location}`);
    if (!place) {
      return {
        platform: "tripadvisor",
        configured: true,
        found: false,
        reviews: [],
      };
    }

    const [details, reviews] = await Promise.all([
      getTripadvisorDetails(place.locationId),
      getTripadvisorReviews(place.locationId),
    ]);

    return {
      platform: "tripadvisor",
      configured: true,
      found: true,
      businessName: place.name,
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
      reviews: [],
    };
  }
}
