import "server-only";

const TIMEOUT_MS = 12_000;
const USER_AGENT = "Klarr presence monitor/1.0 (+https://klarr.net)";

export type AuditField = {
  nom: string | null;
  adresse: string | null;
  telephone: string | null;
  site: string | null;
  horaires: string | null;
  note: number | null;
  nombreAvis: number | null;
};

export type AuditResult = {
  statut: "coherente" | "incoherence" | "inaccessible" | "donnees_insuffisantes";
  url: string;
  donnees: AuditField;
  ecarts: string[];
  note: number | null;
  nombreAvis: number | null;
  erreur?: string;
};

const vide: AuditField = { nom: null, adresse: null, telephone: null, site: null, horaires: null, note: null, nombreAvis: null };

function texte(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const result = value.replace(/\s+/g, " ").trim();
  return result || null;
}

function nombre(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const result = Number(value.replace(/[^0-9.,]/g, "").replace(",", "."));
  return Number.isFinite(result) ? result : null;
}

function jsonLd(html: string): unknown[] {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .flatMap((match) => {
      try {
        const value = JSON.parse(match[1].trim()) as unknown;
        return Array.isArray(value) ? value : [value];
      } catch { return []; }
    });
}

function parcourir(value: unknown, visit: (object: Record<string, unknown>) => void) {
  if (Array.isArray(value)) return value.forEach((item) => parcourir(item, visit));
  if (!value || typeof value !== "object") return;
  const object = value as Record<string, unknown>;
  visit(object);
  Object.values(object).forEach((item) => parcourir(item, visit));
}

function extraire(html: string): AuditField {
  const result = { ...vide };
  parcourir(jsonLd(html), (object) => {
    result.nom ??= texte(object.name);
    result.telephone ??= texte(object.telephone);
    result.site ??= texte(object.url);
    const address = object.address;
    if (address && typeof address === "object") {
      const a = address as Record<string, unknown>;
      result.adresse ??= [a.streetAddress, a.postalCode, a.addressLocality].map(texte).filter(Boolean).join(" ") || null;
    }
    const rating = object.aggregateRating;
    if (rating && typeof rating === "object") {
      const a = rating as Record<string, unknown>;
      result.note ??= nombre(a.ratingValue);
      result.nombreAvis ??= nombre(a.reviewCount) ?? nombre(a.ratingCount);
    }
  });
  const rating = html.match(/(?:ratingValue|rating_value|reviewRating)[^0-9]{0,30}([0-5](?:[.,][0-9])?)/i);
  const count = html.match(/(?:reviewCount|review_count|ratingCount)[^0-9]{0,30}([0-9][0-9 .]*)/i);
  result.note ??= rating ? nombre(rating[1]) : null;
  result.nombreAvis ??= count ? nombre(count[1]) : null;
  return result;
}

function normaliser(value: string | null): string {
  return (value ?? "").toLocaleLowerCase("fr-FR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function comparer(label: string, attendu: string | null, observe: string | null): string | null {
  if (!attendu || !observe) return null;
  return normaliser(attendu) === normaliser(observe) ? null : label;
}

export async function auditerFiche(url: string, attendu: Omit<AuditField, "note" | "nombreAvis">): Promise<AuditResult> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { statut: "inaccessible", url, donnees: vide, ecarts: ["URL invalide"], note: null, nombreAvis: null }; }
  if (!["http:", "https:"].includes(parsed.protocol)) return { statut: "inaccessible", url, donnees: vide, ecarts: ["URL non supportée"], note: null, nombreAvis: null };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: { accept: "text/html,application/xhtml+xml", "accept-language": "fr-FR,fr;q=0.9,en;q=0.8", "user-agent": USER_AGENT }, signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const donnees = extraire(await response.text());
    const ecarts = [
      comparer("nom", attendu.nom, donnees.nom),
      comparer("adresse", attendu.adresse, donnees.adresse),
      comparer("telephone", attendu.telephone, donnees.telephone),
      comparer("site", attendu.site, donnees.site),
      comparer("horaires", attendu.horaires, donnees.horaires),
    ].filter((value): value is string => Boolean(value));
    const champsLus = [donnees.nom, donnees.adresse, donnees.telephone, donnees.site, donnees.horaires, donnees.note, donnees.nombreAvis].filter((value) => value != null).length;
    return { statut: ecarts.length ? "incoherence" : champsLus ? "coherente" : "donnees_insuffisantes", url, donnees, ecarts, note: donnees.note, nombreAvis: donnees.nombreAvis };
  } catch (error) {
    return { statut: "inaccessible", url, donnees: vide, ecarts: [error instanceof Error ? error.message : "Page inaccessible"], note: null, nombreAvis: null };
  } finally { clearTimeout(timer); }
}
