// Tripadvisor Content API — clé API à demander sur
// tripadvisor.com/developers (auto-inscription, pas de programme
// partenaire commercial à négocier).
const TA_BASE_URL = "https://api.content.tripadvisor.com/api/v1";

export type TripadvisorLocation = {
  locationId: string;
  name: string;
};

export type TripadvisorDetails = {
  webUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
};

export type TripadvisorReview = {
  author: string;
  rating: number;
  text: string;
  publishedAt: string | null;
  url: string | null;
};

function apiKey() {
  const key = process.env.TRIPADVISOR_API_KEY;
  if (!key) throw new Error("TRIPADVISOR_API_KEY manquante");
  return key;
}

export async function searchTripadvisorLocation(
  query: string,
): Promise<TripadvisorLocation | null> {
  const url = new URL(`${TA_BASE_URL}/location/search`);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("searchQuery", query);
  url.searchParams.set("category", "restaurants");
  url.searchParams.set("language", "fr");

  const res = await fetch(url, { headers: { accept: "application/json" } });

  if (!res.ok) {
    throw new Error(
      `Tripadvisor search a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    data?: { location_id: string; name: string }[];
  };

  const first = data.data?.[0];
  if (!first) return null;

  return { locationId: first.location_id, name: first.name };
}

export async function getTripadvisorDetails(
  locationId: string,
): Promise<TripadvisorDetails> {
  const url = new URL(`${TA_BASE_URL}/location/${locationId}/details`);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("language", "fr");

  const res = await fetch(url, { headers: { accept: "application/json" } });

  if (!res.ok) {
    throw new Error(
      `Tripadvisor details a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    web_url?: string;
    rating?: string;
    num_reviews?: string;
  };

  return {
    webUrl: data.web_url ?? null,
    rating: data.rating ? Number(data.rating) : null,
    reviewCount: data.num_reviews ? Number(data.num_reviews) : null,
  };
}

export async function getTripadvisorReviews(
  locationId: string,
): Promise<TripadvisorReview[]> {
  const url = new URL(`${TA_BASE_URL}/location/${locationId}/reviews`);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("language", "fr");

  const res = await fetch(url, { headers: { accept: "application/json" } });

  if (!res.ok) {
    throw new Error(
      `Tripadvisor reviews a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    data?: {
      text: string;
      rating: number;
      published_date?: string;
      url?: string;
      user?: { username?: string };
    }[];
  };

  return (data.data ?? []).map((r) => ({
    author: r.user?.username ?? "Client Tripadvisor",
    rating: r.rating,
    text: r.text,
    publishedAt: r.published_date ?? null,
    url: r.url ?? null,
  }));
}
