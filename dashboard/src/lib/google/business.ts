// API Google Business Profile — nécessite les API "My Business Account
// Management API" et "My Business Business Information API" activées sur
// le projet Google Cloud (menu "API et services" > "Bibliothèque").
const ACCOUNT_MANAGEMENT_BASE_URL =
  "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFORMATION_BASE_URL =
  "https://mybusinessbusinessinformation.googleapis.com/v1";

/**
 * Google a-t-il ouvert la publication ?
 *
 * Les identifiants OAuth existent depuis longtemps ; ce qui manque est
 * l'accès à l'API de publication, accordé sur dossier et encore en
 * attente. Aucune variable existante ne le dit — d'où celle-ci, qu'on
 * pose le jour où la réponse arrive.
 *
 * Tant qu'elle est absente, l'écran des publications disparaît. Un
 * restaurateur qui programme cinq posts le lundi et découvre trois
 * semaines plus tard qu'aucun n'est parti ne fait plus confiance au reste :
 * mieux vaut ne rien proposer que proposer ce qu'on ne tient pas.
 */
export function publicationsGoogleOuvertes(): boolean {
  // Le même accès ouvre les réponses aux avis : même API v4, même dossier.
  return process.env.GOOGLE_POSTS_ACTIF === "1";
}

export type GoogleAccount = {
  name: string; // ex: "accounts/1234567890"
  accountName: string;
};

export async function listAccounts(
  accessToken: string,
): Promise<GoogleAccount[]> {
  const res = await fetch(`${ACCOUNT_MANAGEMENT_BASE_URL}/accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(
      `Google accounts.list a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    accounts?: { name: string; accountName: string }[];
  };

  return (data.accounts ?? []).map((a) => ({
    name: a.name,
    accountName: a.accountName,
  }));
}

export type GoogleLocation = {
  name: string; // ex: "accounts/1234567890/locations/9876543210"
  title: string;
  address: string | null;
};

export async function listLocations(
  accessToken: string,
  accountName: string,
): Promise<GoogleLocation[]> {
  const url = new URL(
    `${BUSINESS_INFORMATION_BASE_URL}/${accountName}/locations`,
  );
  url.searchParams.set("readMask", "name,title,storefrontAddress");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(
      `Google locations.list a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as {
    locations?: {
      name: string;
      title: string;
      storefrontAddress?: { addressLines?: string[]; locality?: string };
    }[];
  };

  return (data.locations ?? []).map((l) => ({
    name: l.name,
    title: l.title,
    address: l.storefrontAddress
      ? [
          ...(l.storefrontAddress.addressLines ?? []),
          l.storefrontAddress.locality,
        ]
          .filter(Boolean)
          .join(", ")
      : null,
  }));
}

// L'API de publication (Business Profile v4) est distincte des deux
// précédentes, et Google n'en ouvre l'accès que sur dossier : jusque-là,
// le quota du projet reste à zéro et chaque appel répond 403. Le code
// complet vit donc ici en attendant, et la file d'attente se videra sans
// qu'on y retouche le jour où l'accès est accordé.
// `GOOGLE_BUSINESS_V4_URL` ne sert qu'aux essais : il pointe l'appel vers
// un faux serveur, puisque le vrai refuse tout tant que l'accès n'est pas
// accordé.
export const BUSINESS_V4_BASE_URL =
  process.env.GOOGLE_BUSINESS_V4_URL?.replace(/\/+$/, "") ||
  "https://mybusiness.googleapis.com/v4";

export type PostLocal = {
  texte: string;
  /** L'adresse publique de la photo. Google va la chercher lui-même. */
  photoUrl?: string | null;
  bouton?: { action: string; url?: string | null } | null;
};

/**
 * Publie sur la fiche établissement.
 *
 * La photo n'est pas téléversée : elle vit déjà dans Klarr, servie par une
 * adresse publique, et Google sait aller la chercher. Deux copies de la
 * même image ne rendraient service à personne.
 */
export async function publierPostLocal(
  accessToken: string,
  accountName: string,
  locationName: string,
  post: PostLocal,
): Promise<string> {
  // « locations/123 » côté API récente, « accounts/x/locations/123 » ici.
  const locationId = locationName.replace(/^locations\//, "");
  const chemin = `${accountName}/locations/${locationId}/localPosts`;

  const corps: Record<string, unknown> = {
    languageCode: "fr",
    summary: post.texte,
    topicType: "STANDARD",
  };
  if (post.photoUrl) {
    corps.media = [{ mediaFormat: "PHOTO", sourceUrl: post.photoUrl }];
  }
  if (post.bouton) {
    corps.callToAction = {
      actionType: post.bouton.action,
      ...(post.bouton.url ? { url: post.bouton.url } : {}),
    };
  }

  const res = await fetch(`${BUSINESS_V4_BASE_URL}/${chemin}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(corps),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Google localPosts a échoué : ${res.status} ${await res.text()}`,
    );
  }

  const data = (await res.json()) as { name?: string };
  return data.name ?? "";
}
