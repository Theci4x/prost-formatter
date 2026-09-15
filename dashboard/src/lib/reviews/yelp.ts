// Yelp Fusion API — clé API self-service (yelp.com/developers), pas de
// programme partenaire à valider. Les avis renvoyés sont limités à 3 par
// Yelp (restriction de leurs conditions d'utilisation).
const YELP_BASE_URL = "https://api.yelp.com/v3";

export type YelpBusiness = {
  id: string;
  name: string;
  url: string;
  rating: number;
  reviewCount: number;
};

export type YelpReview = {
  author: string;
  rating: number;
  text: string;
  publishedAt: string | null;
  url: string | null;
};

function apiKey() {
  const key = process.env.YELP_API_KEY;
  if (!key) throw new Error("YELP_API_KEY manquante");
  return key;
}

export async function searchYelpBusiness(
  term: string,
  location: string,
): Promise<YelpBusiness | null> {
  const url = new URL(`${YELP_BASE_URL}/businesses/search`);
  url.searchParams.set("term", term);
  url.searchParams.set("location", location);
  url.searchParams.set("limit", "1");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });

  if (!res.ok) {
    throw new Error(`Yelp search a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    businesses?: {
      id: string;
      name: string;
      url: string;
      rating: number;
      review_count: number;
    }[];
  };

  const first = data.businesses?.[0];
  if (!first) return null;

  return {
    id: first.id,
    name: first.name,
    url: first.url,
    rating: first.rating,
    reviewCount: first.review_count,
  };
}

export async function getYelpReviews(businessId: string): Promise<YelpReview[]> {
  const res = await fetch(`${YELP_BASE_URL}/businesses/${businessId}/reviews`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });

  if (!res.ok) {
    throw new Error(`Yelp reviews a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    reviews?: {
      text: string;
      rating: number;
      time_created?: string;
      url?: string;
      user?: { name?: string };
    }[];
  };

  return (data.reviews ?? []).map((r) => ({
    author: r.user?.name ?? "Client Yelp",
    rating: r.rating,
    text: r.text,
    publishedAt: r.time_created ?? null,
    url: r.url ?? null,
  }));
}
