import "server-only";

const TIMEOUT_MS = 12_000;
const USER_AGENT =
  "Klarr reputation monitor/1.0 (+https://klarr.net)";

export type ScrapedReview = {
  author: string;
  rating: number;
  text: string;
  publishedAt: string | null;
  url: string | null;
};

export type ScrapedRating = {
  name: string | null;
  url: string;
  rating: number | null;
  reviewCount: number | null;
  reviews: ScrapedReview[];
};

function domaineAutorise(source: "yelp" | "tripadvisor", valeur: string) {
  let url: URL;
  try {
    url = new URL(valeur);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (source === "yelp") return host === "yelp.com" || host.endsWith(".yelp.com") || host === "yelp.fr" || host.endsWith(".yelp.fr");
  return host === "tripadvisor.com" || host.endsWith(".tripadvisor.com") || host === "tripadvisor.fr" || host.endsWith(".tripadvisor.fr");
}

function nettoyerTexte(valeur: unknown): string | null {
  if (typeof valeur !== "string") return null;
  const texte = valeur.replace(/\s+/g, " ").trim();
  return texte || null;
}

function nombre(valeur: unknown): number | null {
  if (typeof valeur === "number" && Number.isFinite(valeur)) return valeur;
  if (typeof valeur !== "string") return null;
  const nettoye = valeur.replace(/[^0-9.,]/g, "").replace(",", ".");
  const resultat = Number(nettoye);
  return Number.isFinite(resultat) ? resultat : null;
}

function extraireJsonLd(html: string): unknown[] {
  const blocs = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const objets: unknown[] = [];
  for (const bloc of blocs) {
    const contenu = bloc[1]
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .trim();
    try {
      const valeur = JSON.parse(contenu) as unknown;
      if (Array.isArray(valeur)) objets.push(...valeur);
      else objets.push(valeur);
    } catch {
      // Certains sites injectent des blocs JSON-LD incomplets : le fallback
      // regex ci-dessous reste exploitable dans ce cas.
    }
  }
  return objets;
}

function parcourir(valeur: unknown, visite: (objet: Record<string, unknown>) => void) {
  if (Array.isArray(valeur)) {
    for (const element of valeur) parcourir(element, visite);
    return;
  }
  if (!valeur || typeof valeur !== "object") return;
  const objet = valeur as Record<string, unknown>;
  visite(objet);
  for (const enfant of Object.values(objet)) parcourir(enfant, visite);
}

function depuisJsonLd(html: string, sourceUrl: string): ScrapedRating {
  const objets = extraireJsonLd(html);
  let nom: string | null = null;
  let rating: number | null = null;
  let reviewCount: number | null = null;
  const reviews: ScrapedReview[] = [];

  parcourir(objets, (objet) => {
    const aggregate = objet.aggregateRating;
    if (aggregate && typeof aggregate === "object") {
      const donnees = aggregate as Record<string, unknown>;
      rating ??= nombre(donnees.ratingValue);
      reviewCount ??= nombre(donnees.reviewCount) ?? nombre(donnees.ratingCount);
    }

    if (!nom) nom = nettoyerTexte(objet.name);
    const texte = nettoyerTexte(objet.reviewBody ?? objet.description);
    const note = nombre(objet.reviewRating && typeof objet.reviewRating === "object"
      ? (objet.reviewRating as Record<string, unknown>).ratingValue
      : objet.ratingValue);
    if (texte && note != null && note >= 1 && note <= 5 && reviews.length < 3) {
      const auteur = objet.author && typeof objet.author === "object"
        ? nettoyerTexte((objet.author as Record<string, unknown>).name)
        : nettoyerTexte(objet.author);
      reviews.push({
        author: auteur ?? "Client",
        rating: note,
        text: texte,
        publishedAt: nettoyerTexte(objet.datePublished),
        url: nettoyerTexte(objet.url) ?? sourceUrl,
      });
    }
  });

  return { name: nom, url: sourceUrl, rating, reviewCount, reviews };
}

function depuisRegex(html: string, actuel: ScrapedRating): ScrapedRating {
  const ratingMatch = html.match(/(?:ratingValue|rating_value|rating)"?\s*:\s*"?([0-5](?:[.,][0-9])?)/i);
  const countMatch = html.match(/(?:reviewCount|review_count|ratingCount|review_count_display)"?\s*:\s*"?([0-9][0-9 .,]*)/i);
  return {
    ...actuel,
    rating: actuel.rating ?? (ratingMatch ? nombre(ratingMatch[1]) : null),
    reviewCount: actuel.reviewCount ?? (countMatch ? nombre(countMatch[1]) : null),
  };
}

export async function scraperFiche(
  source: "yelp" | "tripadvisor",
  sourceUrl: string,
  fraicheur = 0,
): Promise<ScrapedRating> {
  if (!domaineAutorise(source, sourceUrl)) {
    throw new Error(`URL ${source} non autorisée`);
  }

  const controleur = new AbortController();
  const temporisateur = setTimeout(() => controleur.abort(), TIMEOUT_MS);
  try {
    const reponse = await fetch(sourceUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
        "user-agent": USER_AGENT,
      },
      signal: controleur.signal,
      ...(fraicheur > 0
        ? { next: { revalidate: fraicheur } }
        : { cache: "no-store" }),
    });
    if (!reponse.ok) {
      throw new Error(`Page ${source} inaccessible : ${reponse.status}`);
    }
    const html = await reponse.text();
    return depuisRegex(html, depuisJsonLd(html, sourceUrl));
  } finally {
    clearTimeout(temporisateur);
  }
}
