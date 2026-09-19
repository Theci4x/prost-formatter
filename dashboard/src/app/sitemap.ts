import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { siteUrl } from "@/lib/site-url";
import { tousLesArticles } from "@/lib/aide/articles";
import { tousLesBillets } from "@/lib/blog/billets";

// Sans cette ligne, le plan du site est figé au moment du déploiement : une
// page de réservation ouverte après coup n'y entrerait jamais.
export const revalidate = 3600;

const PAGES_FIXES = [
  { chemin: "", priorite: 1 },
  { chemin: "/mentions-legales", priorite: 0.3 },
  { chemin: "/cgu", priorite: 0.3 },
  { chemin: "/confidentialite", priorite: 0.3 },
  { chemin: "/suppression-donnees", priorite: 0.3 },
  { chemin: "/aide", priorite: 0.6 },
  { chemin: "/aide/contact", priorite: 0.4 },
  { chemin: "/blog", priorite: 0.8 },
  // Une page d'intention d'achat : quelqu'un qui compare est à deux
  // doigts de choisir.
  { chemin: "/comparatif-logiciels-reservation-restaurant", priorite: 0.9 },
];

/**
 * Les pages de réservation ouvertes font partie du plan du site : une page
 * que Google ne connaît pas ne fait venir personne, et c'est précisément ce
 * que Klarr vend au restaurateur.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();
  const fixes = [
    ...PAGES_FIXES.map((page) => ({
      url: `${site}${page.chemin}`,
      lastModified: new Date(),
      priority: page.priorite,
    })),
    // Le mode d'emploi répond à des questions qu'on tape dans Google
    // (« comment bloquer un jour de réservation »). Autant qu'il soit trouvé.
    ...tousLesArticles().map((article) => ({
      url: `${site}/aide/${article.slug}`,
      lastModified: new Date(),
      priority: 0.5,
    })),
    // Le journal vise des recherches qu'on ne fait qu'une fois dans sa vie
    // (« diagnostic amiante avant travaux restaurant ») : sa date de mise à
    // jour est celle du texte, pas celle du déploiement.
    ...tousLesBillets().map((billet) => ({
      url: `${site}/blog/${billet.slug}`,
      lastModified: new Date(`${billet.misAJourLe}T12:00:00`),
      priority: 0.7,
    })),
  ];

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("restaurants")
      // Toutes les colonnes : nommer « site_publie » avant que la migration
      // ne soit passée ferait échouer la requête, et le plan du site
      // perdrait d'un coup toutes les pages de restaurants.
      .select("*")
      .not("slug_reservation", "is", null);

    const restaurants = (data ?? []) as {
      slug_reservation: string;
      created_at: string | null;
      carte_publique: boolean | null;
      site_publie: boolean | null;
    }[];

    const quand = (restaurant: { created_at: string | null }) =>
      restaurant.created_at ? new Date(restaurant.created_at) : new Date();

    const pages = restaurants.map((restaurant) => ({
      url: `${site}/reserver/${restaurant.slug_reservation}`,
      lastModified: quand(restaurant),
      priority: 0.8,
    }));

    // « La carte du restaurant X » est une recherche courante, et c'est une
    // page que Klarr sait servir. Seules les cartes publiées y entrent :
    // les autres renvoient une 404.
    const cartes = restaurants
      .filter((restaurant) => restaurant.carte_publique)
      .map((restaurant) => ({
        url: `${site}/carte/${restaurant.slug_reservation}`,
        lastModified: quand(restaurant),
        priority: 0.7,
      }));

    // La vitrine est la page que Klarr vend comme « votre site » : c'est
    // elle qui doit être trouvée sur « restaurant + quartier », donc elle
    // qui porte la priorité la plus haute du lot.
    const vitrines = restaurants
      .filter((restaurant) => restaurant.site_publie)
      .map((restaurant) => ({
        url: `${site}/restaurant/${restaurant.slug_reservation}`,
        lastModified: quand(restaurant),
        priority: 0.9,
      }));

    return [...fixes, ...vitrines, ...pages, ...cartes];
  } catch (erreur) {
    // Une base injoignable ne doit pas rendre le plan du site indisponible :
    // mieux vaut les pages fixes que rien du tout.
    console.error("[sitemap]", erreur);
    return fixes;
  }
}
