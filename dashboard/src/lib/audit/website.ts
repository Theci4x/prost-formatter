import type { WebsiteSignals } from "@/lib/audit/scoring";

const RESTAURANT_SCHEMA_TYPES = [
  "restaurant",
  "foodestablishment",
  "localbusiness",
  "cafeorcoffeeshop",
  "bakery",
  "bar",
];

function findJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const regex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // JSON-LD malformé, on l'ignore plutôt que de faire planter l'audit.
    }
  }

  return blocks;
}

function hasRestaurantType(blocks: unknown[]): boolean {
  return blocks.some((block) => {
    if (typeof block !== "object" || block === null) return false;
    const type = (block as Record<string, unknown>)["@type"];
    const types = Array.isArray(type) ? type : [type];
    return types.some(
      (t) =>
        typeof t === "string" &&
        RESTAURANT_SCHEMA_TYPES.includes(t.toLowerCase()),
    );
  });
}

function hasSameAsLinks(blocks: unknown[], html: string): boolean {
  const inJsonLd = blocks.some((block) => {
    if (typeof block !== "object" || block === null) return false;
    return Array.isArray((block as Record<string, unknown>)["sameAs"]);
  });
  if (inJsonLd) return true;

  return /(facebook\.com|instagram\.com)\/[a-z0-9._-]+/i.test(html);
}

export async function checkWebsite(
  url: string | null,
): Promise<WebsiteSignals> {
  if (!url) {
    return {
      checked: false,
      reachable: false,
      hasJsonLd: false,
      hasRestaurantSchema: false,
      hasSameAs: false,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KlarrAuditBot/1.0)" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        checked: true,
        reachable: false,
        hasJsonLd: false,
        hasRestaurantSchema: false,
        hasSameAs: false,
      };
    }

    const html = await res.text();
    const jsonLdBlocks = findJsonLdBlocks(html);

    return {
      checked: true,
      reachable: true,
      hasJsonLd: jsonLdBlocks.length > 0,
      hasRestaurantSchema: hasRestaurantType(jsonLdBlocks),
      hasSameAs: hasSameAsLinks(jsonLdBlocks, html),
    };
  } catch {
    return {
      checked: true,
      reachable: false,
      hasJsonLd: false,
      hasRestaurantSchema: false,
      hasSameAs: false,
    };
  }
}
