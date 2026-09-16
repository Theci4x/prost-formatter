import { optionsFraicheur, FRAICHEUR_ECRAN } from "@/lib/reviews/fraicheur";
// Tripadvisor Content API — clé API à demander sur
// tripadvisor.com/developers (auto-inscription, pas de programme
// partenaire commercial à négocier).
const TA_BASE_URL = "https://api.content.tripadvisor.com/api/v1";

export type TripadvisorLocation = {
  locationId: string;
  name: string;
  /** Ce qui permet de distinguer deux homonymes d'un coup d'œil. */
  adresse: string | null;
};

export type TripadvisorDetails = {
  nom: string | null;
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

/**
 * Les établissements que Tripadvisor propose pour cette recherche.
 *
 * Renvoie la liste et non le premier résultat : c'est elle qu'on montre
 * au restaurateur quand la devinette automatique s'est trompée, et
 * choisir entre des homonymes suppose de les voir tous, avec leur
 * adresse.
 */
export async function searchTripadvisorLocations(
  query: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<TripadvisorLocation[]> {
  const url = new URL(`${TA_BASE_URL}/location/search`);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("searchQuery", query);
  url.searchParams.set("category", "restaurants");
  url.searchParams.set("language", "fr");

  const res = await fetch(url, {
    headers: { accept: "application/json" },
    ...optionsFraicheur(fraicheur),
  });

  if (!res.ok) {
    throw new Error(
      `Tripadvisor search a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    data?: {
      location_id: string;
      name: string;
      address_obj?: { address_string?: string };
    }[];
  };

  return (data.data ?? []).map((lieu) => ({
    locationId: lieu.location_id,
    name: lieu.name,
    adresse: lieu.address_obj?.address_string ?? null,
  }));
}

/** La devinette automatique : le premier résultat, faute de mieux. */
export async function searchTripadvisorLocation(
  query: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<TripadvisorLocation | null> {
  const lieux = await searchTripadvisorLocations(query, fraicheur);
  return lieux[0] ?? null;
}

export async function getTripadvisorDetails(
  locationId: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<TripadvisorDetails> {
  const url = new URL(`${TA_BASE_URL}/location/${locationId}/details`);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("language", "fr");

  const res = await fetch(url, {
    headers: { accept: "application/json" },
    ...optionsFraicheur(fraicheur),
  });

  if (!res.ok) {
    throw new Error(
      `Tripadvisor details a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    name?: string;
    web_url?: string;
    rating?: string;
    num_reviews?: string;
  };

  return {
    nom: data.name ?? null,
    webUrl: data.web_url ?? null,
    rating: data.rating ? Number(data.rating) : null,
    reviewCount: data.num_reviews ? Number(data.num_reviews) : null,
  };
}

export async function getTripadvisorReviews(
  locationId: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<TripadvisorReview[]> {
  const url = new URL(`${TA_BASE_URL}/location/${locationId}/reviews`);
  url.searchParams.set("key", apiKey());
  url.searchParams.set("language", "fr");

  const res = await fetch(url, {
    headers: { accept: "application/json" },
    ...optionsFraicheur(fraicheur),
  });

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
