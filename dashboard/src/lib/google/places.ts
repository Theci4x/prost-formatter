import { optionsFraicheur, FRAICHEUR_ECRAN } from "@/lib/reviews/fraicheur";
// Google Places API (New) — nécessite une clé API avec "Places API (New)"
// activée et la facturation Google Cloud configurée (pas d'OAuth, pas de
// vérification à attendre, contrairement à l'API Business Profile).
// L'adresse est surchargeable pour les tests : sans cela, l'audit de
// visibilité ne peut être vérifié de bout en bout qu'en appelant Google
// pour de vrai, donc en payant, donc jamais. La variable n'est définie que
// sur la machine de test ; absente, on parle à Google.
const PLACES_BASE_URL =
  process.env.GOOGLE_PLACES_BASE_URL ?? "https://places.googleapis.com/v1";

/**
 * Deux points d'entrée, et deux seulement.
 *
 *   `places:searchText`  → trouver l'établissement à partir de son nom
 *   `places/{id}`        → en lire la note, le nombre d'avis, le statut
 *
 * Ce n'est pas qu'une observation : c'est un réglage posé côté Google.
 * Les dix-neuf autres quotas de Places API (New) — autocomplétion, photos,
 * recherche à proximité, médias — sont à **zéro** dans la console Cloud.
 * Une API qu'on n'appelle pas n'a aucune raison d'être autorisée, et
 * `AutocompletePlacesRequest` était ouverte à 175 000 requêtes par jour :
 * c'est le genre de ligne qui fait les factures dont on parle sur les
 * forums, le jour où une clé fuite.
 *
 * Donc : **ajouter ici un appel à un troisième point d'entrée ne
 * marchera pas** tant que son quota n'aura pas été relevé dans la
 * console. L'échec ne sera pas parlant — Google refuse, il n'explique
 * pas. Si vous ajoutez les photos Google ou l'autocomplétion, commencez
 * par là, sans quoi vous chercherez le défaut dans ce fichier.
 */

export type PlaceSearchResult = {
  id: string;
  displayName: string;
  formattedAddress: string;
};

/**
 * L'état d'un établissement selon Google. Les trois valeurs sont les
 * siennes, reprises telles quelles : « fermé temporairement » et « fermé
 * définitivement » n'appellent pas la même réaction, et un booléen nous
 * obligerait à remigrer le jour où on veut les distinguer.
 */
export type StatutGoogle =
  | "OPERATIONAL"
  | "CLOSED_TEMPORARILY"
  | "CLOSED_PERMANENTLY";

export type PlaceDetails = {
  displayName: string;
  /**
   * Null quand Google ne le dit pas — ce qui arrive, et ne veut surtout
   * pas dire « ouvert ». L'appelant doit pouvoir répondre « je ne sais
   * pas » plutôt que d'affirmer.
   */
  businessStatus: StatutGoogle | null;
  /**
   * Le genre de l'établissement, tel que Google le nomme : « Bar à bière »,
   * « Restaurant italien ». C'est avec ça qu'on formule la question posée
   * aux assistants — « le meilleur bar à bière à Paris » est ce qu'un
   * client tape vraiment, là où « le meilleur restaurant » ne mesure rien.
   */
  primaryType: string | null;
  formattedAddress: string;
  nationalPhoneNumber: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  hasOpeningHours: boolean;
  photoCount: number;
  reviews: { publishTime: string }[];
};

/** Ce que Google rend et qu'on ne connaît pas ne vaut pas mieux que rien. */
function statutConnu(valeur: string | undefined): StatutGoogle | null {
  return valeur === "OPERATIONAL" ||
    valeur === "CLOSED_TEMPORARILY" ||
    valeur === "CLOSED_PERMANENTLY"
    ? valeur
    : null;
}

function apiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY manquante");
  return key;
}

/**
 * Les établissements qui répondent à la recherche, dans l'ordre de Google.
 *
 * Plusieurs et non un seul : sur « Le Bistrot Paris », le premier résultat
 * n'est pas forcément le bon, et prendre celui-là sans regarder revient à
 * auditer l'établissement d'un autre.
 */
export async function searchPlaces(
  query: string,
  limite = 5,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlaceSearchResult[]> {
  const res = await fetch(`${PLACES_BASE_URL}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "fr" }),
    ...optionsFraicheur(fraicheur),
  });

  if (!res.ok) {
    throw new Error(
      `Places searchText a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    places?: {
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
    }[];
  };

  return (data.places ?? []).slice(0, limite).map((place) => ({
    id: place.id,
    displayName: place.displayName?.text ?? query,
    formattedAddress: place.formattedAddress ?? "",
  }));
}

/**
 * Le premier résultat, pour les appelants qui savent déjà de quel
 * établissement ils parlent — la fiche d'un restaurant déjà inscrit, par
 * exemple, dont on connaît le nom exact.
 */
export async function searchPlace(
  query: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlaceSearchResult | null> {
  const [premier] = await searchPlaces(query, 1, fraicheur);
  return premier ?? null;
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
export async function getPlaceReviews(
  placeId: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlaceReview[]> {
  const res = await fetch(`${PLACES_BASE_URL}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": "reviews",
    },
    ...optionsFraicheur(fraicheur),
  });

  if (!res.ok) {
    throw new Error(
      `Places reviews a échoué : ${res.status} ${await res.text()}`,
    );
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

export async function getPlaceDetails(
  placeId: string,
  fraicheur: number = FRAICHEUR_ECRAN,
): Promise<PlaceDetails> {
  const fields = [
    "displayName",
    "primaryTypeDisplayName",
    "formattedAddress",
    "nationalPhoneNumber",
    "websiteUri",
    "rating",
    "userRatingCount",
    // Gratuit ici : l'appel demande déjà la note et les avis, donc il est
    // facturé au palier le plus élevé quoi qu'on ajoute de plus modeste.
    "businessStatus",
    "currentOpeningHours",
    "photos",
    "reviews",
  ].join(",");

  const res = await fetch(`${PLACES_BASE_URL}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": apiKey(),
      "X-Goog-FieldMask": fields,
    },
    ...optionsFraicheur(fraicheur),
  });

  if (!res.ok) {
    throw new Error(
      `Places details a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    displayName?: { text?: string };
    primaryTypeDisplayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
    currentOpeningHours?: unknown;
    photos?: unknown[];
    reviews?: { publishTime?: string }[];
  };

  return {
    displayName: data.displayName?.text ?? "",
    businessStatus: statutConnu(data.businessStatus),
    primaryType: data.primaryTypeDisplayName?.text ?? null,
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
