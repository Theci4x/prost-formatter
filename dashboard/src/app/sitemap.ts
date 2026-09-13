import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { siteUrl } from "@/lib/site-url";

// Sans cette ligne, le plan du site est figé au moment du déploiement : une
// page de réservation ouverte après coup n'y entrerait jamais.
export const revalidate = 3600;

const PAGES_FIXES = [
  { chemin: "", priorite: 1 },
  { chemin: "/mentions-legales", priorite: 0.3 },
  { chemin: "/cgu", priorite: 0.3 },
  { chemin: "/confidentialite", priorite: 0.3 },
  { chemin: "/suppression-donnees", priorite: 0.3 },
];

/**
 * Les pages de réservation ouvertes font partie du plan du site : une page
 * que Google ne connaît pas ne fait venir personne, et c'est précisément ce
 * que Klarr vend au restaurateur.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  const fixes = PAGES_FIXES.map((page) => ({
    url: `${site}${page.chemin}`,
    lastModified: new Date(),
    priority: page.priorite,
  }));

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("restaurants")
      .select("slug_reservation, created_at")
      .not("slug_reservation", "is", null);

    const pages = ((data ?? []) as {
      slug_reservation: string;
      created_at: string | null;
    }[]).map((restaurant) => ({
      url: `${site}/reserver/${restaurant.slug_reservation}`,
      lastModified: restaurant.created_at
        ? new Date(restaurant.created_at)
        : new Date(),
      priority: 0.8,
    }));

    return [...fixes, ...pages];
  } catch (erreur) {
    // Une base injoignable ne doit pas rendre le plan du site indisponible :
    // mieux vaut les pages fixes que rien du tout.
    console.error("[sitemap]", erreur);
    return fixes;
  }
}
