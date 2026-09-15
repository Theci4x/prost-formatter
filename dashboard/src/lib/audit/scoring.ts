// Algorithme de scoring maison pour l'audit de visibilité (inspiré du
// concept "Local SEO / E-réputation / GEO" courant dans l'outillage SEO
// local, pas une reproduction d'un algorithme tiers). Fonctions pures,
// testables sans réseau.

export type PlaceSignals = {
  nationalPhoneNumber: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  hasOpeningHours: boolean;
  photoCount: number;
  reviews: { publishTime: string }[];
};

export type WebsiteSignals = {
  checked: boolean;
  reachable: boolean;
  hasJsonLd: boolean;
  hasRestaurantSchema: boolean;
  hasSameAs: boolean;
};

export function scoreLocalSeo(p: PlaceSignals): number {
  let score = 0;
  if (p.nationalPhoneNumber) score += 15;
  if (p.websiteUri) score += 15;
  if (p.hasOpeningHours) score += 15;
  score += Math.min(p.photoCount, 15) * (25 / 15);
  if (p.rating !== null && p.rating >= 4) score += 15;
  else if (p.rating !== null && p.rating >= 3.5) score += 8;
  const reviewCount = p.userRatingCount ?? 0;
  if (reviewCount >= 100) score += 15;
  else if (reviewCount >= 20) score += 8;
  return Math.round(Math.min(score, 100));
}

export function scoreEReputation(p: PlaceSignals): number {
  const ratingScore = p.rating !== null ? (p.rating / 5) * 55 : 0;
  const countScore = (Math.min(p.userRatingCount ?? 0, 200) / 200) * 25;

  const sixMonthsMs = 1000 * 60 * 60 * 24 * 182;
  const now = Date.now();
  const recentCount = p.reviews.filter(
    (r) => now - new Date(r.publishTime).getTime() < sixMonthsMs,
  ).length;
  const freshnessScore =
    p.reviews.length > 0 ? (recentCount / p.reviews.length) * 20 : 0;

  return Math.round(Math.min(ratingScore + countScore + freshnessScore, 100));
}

export function scoreGeo(w: WebsiteSignals): number {
  if (!w.checked || !w.reachable) return 0;
  let score = 25;
  if (w.hasJsonLd) score += 30;
  if (w.hasRestaurantSchema) score += 25;
  if (w.hasSameAs) score += 20;
  return Math.round(Math.min(score, 100));
}

export function scoreGlobal(
  localSeo: number,
  eReputation: number,
  geo: number,
): number {
  return Math.round(localSeo * 0.35 + eReputation * 0.35 + geo * 0.3);
}

export function scoreLabel(
  score: number,
): "excellent" | "bon" | "moyen" | "critique" {
  if (score >= 80) return "excellent";
  if (score >= 60) return "bon";
  if (score >= 40) return "moyen";
  return "critique";
}
