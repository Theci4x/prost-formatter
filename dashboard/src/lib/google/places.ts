// Google Places API (New) — nécessite une clé API avec "Places API (New)"
// activée et la facturation Google Cloud configurée (pas d'OAuth, pas de
// vérification à attendre, contrairement à l'API Business Profile).
const PLACES_BASE_URL = "https://places.googleapis.com/v1";

export type PlaceSearchResult = {
  id: string;
  displayName: string;
  formattedAddress: string;
};

export type PlaceDetails = {
  displayName: string;
  formattedAddress: string;
  nationalPhoneNumber: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  hasOpeningHours: boolean;
  photoCount: number;
  reviews: { publishTime: string }[];
};

function apiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY manquante");
  return key;
}

export async function searchPlace(
  query: string,
): Promise<PlaceSearchResult | null> {
  const res = await fetch(`${PLACES_BASE_URL}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "fr" }),
  });

  if (!res.ok) {
    throw new Error(`Places searchText a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    places?: {
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
    }[];
  };

  const first = data.places?.[0];
  if (!first) return null;

  return {
    id: first.id,
    displayName: first.displayName?.text ?? query,
    formattedAddress: first.formattedAddress ?? "",
  };
}

export type PlaceReview = {
  author: string;
  rating: number;
  text: string;
  publishedAt: string | null;
  url: string | null;
};

// L'API Places (New) plafonne à cinq avis, les plus pertinents selon Google.
// Répondre aux avis demande en revanche l'API Business Profile, soumise à
// une demande d'accès — d'où la lecture seule ici.
export async function getPlaceReviews(placeId: string): Promise<PlaceReview[]> {
  const res = await fetch(`${PLACES_BASE_URL}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": "reviews",
    },
  });

  if (!res.ok) {
    throw new Error(`Places reviews a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    reviews?: {
      rating?: number;
      text?: { text?: string };
      originalText?: { text?: string };
      publishTime?: string;
      googleMapsUri?: string;
      authorAttribution?: { displayName?: string };
    }[];
  };

  return (data.reviews ?? []).map((review) => ({
    author: review.authorAttribution?.displayName ?? "Anonyme",
    rating: review.rating ?? 0,
    // "text" est la version traduite dans la langue demandée ; on retombe sur
    // l'originale quand Google ne fournit pas de traduction.
    text: review.text?.text ?? review.originalText?.text ?? "",
    publishedAt: review.publishTime ?? null,
    url: review.googleMapsUri ?? null,
  }));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const fields = [
    "displayName",
    "formattedAddress",
    "nationalPhoneNumber",
    "websiteUri",
    "rating",
    "userRatingCount",
    "currentOpeningHours",
    "photos",
    "reviews",
  ].join(",");

  const res = await fetch(`${PLACES_BASE_URL}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": fields,
    },
  });

  if (!res.ok) {
    throw new Error(`Places details a échoué : ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    currentOpeningHours?: unknown;
    photos?: unknown[];
    reviews?: { publishTime?: string }[];
  };

  return {
    displayName: data.displayName?.text ?? "",
    formattedAddress: data.formattedAddress ?? "",
    nationalPhoneNumber: data.nationalPhoneNumber ?? null,
    websiteUri: data.websiteUri ?? null,
    rating: data.rating ?? null,
    userRatingCount: data.userRatingCount ?? null,
    hasOpeningHours: Boolean(data.currentOpeningHours),
    photoCount: data.photos?.length ?? 0,
    reviews: (data.reviews ?? [])
      .filter((r): r is { publishTime: string } => Boolean(r.publishTime))
      .map((r) => ({ publishTime: r.publishTime })),
  };
}
