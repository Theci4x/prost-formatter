import type { MetadataRoute } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { visibiliteOuvertePour } from "@/lib/abonnement/acces";
import { siteUrl } from "@/lib/site-url";
import { tousLesArticles } from "@/lib/aide/articles";
import { tousLesBillets } from "@/lib/blog/billets";
import { billetsPour } from "@/lib/blog/traductions";
import { cheminJournal } from "@/types/blog";

// Sans cette ligne, le plan du site est figé au moment du déploiement : une
// page de réservation ouverte après coup n'y entrerait jamais.
export const revalidate = 3600;

const PAGES_FIXES = [
  { chemin: "", priorite: 1 },
  { chemin: "/mentions-legales", priorite: 0.3 },
  { chemin: "/cgu", priorite: 0.3 },
  { chemin: "/confidentialite", priorite: 0.3 },
  { chemin: "/suppression-donnees", priorite: 0.3 },
  { chemin: "/sous-traitance", priorite: 0.3 },
  { chemin: "/aide", priorite: 0.6 },
  { chemin: "/aide/contact", priorite: 0.4 },
  { chemin: "/blog", priorite: 0.8 },
  { chemin: "/blog/en", priorite: 0.6 },
  { chemin: "/blog/zh", priorite: 0.6 },
  // Une page d'intention d'achat : quelqu'un qui compare est à deux
  // doigts de choisir.
  { chemin: "/comparatif-logiciels-reservation-restaurant", priorite: 0.9 },
  // Le calculateur vise la même intention que le comparatif — quelqu'un
  // qui paie déjà une commission et se demande ce qu'elle lui coûte —
  // mais il répond avec ses chiffres à lui.
  { chemin: "/calculateur-commissions-restaurant", priorite: 0.9 },
  // Le diagnostic vise plus tôt : quelqu'un qui n'a pas encore de
  // restaurant, donc pas encore de besoin. Priorité moindre, mais c'est
  // une requête qu'on tape une fois et à laquelle il faut répondre.
  { chemin: "/diagnostic-local-restaurant", priorite: 0.8 },
  { chemin: "/calendrier-ouverture-restaurant", priorite: 0.8 },
  // La porte de l'audit. Le formulaire lui-même reste hors de l'index :
  // il ne répond à aucune recherche, celle-ci si.
  { chemin: "/audit-fiche-google-restaurant", priorite: 0.9 },
  // Le fil qui relie les quatre outils. C'est lui qui répond à « ouvrir
  // un restaurant », la requête la plus large du lot.
  { chemin: "/ouvrir-un-restaurant", priorite: 0.9 },
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
    // Les traductions sont des pages à part entière : sans elles au plan
    // du site, Google ne les découvre que par les liens, c'est-à-dire
    // tard. Elles portent la date du texte français, qui fait foi.
    ...(["en", "zh"] as const).flatMap((langue) =>
      billetsPour(langue).map((billet) => ({
        url: `${site}${cheminJournal(langue)}/${billet.slug}`,
        lastModified: new Date(`${billet.misAJourLe}T12:00:00`),
        priority: 0.6,
      })),
    ),
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
      id: string;
      slug_reservation: string;
      created_at: string | null;
      acces_offert_jusqu_au?: string | null;
      carte_publique: boolean | null;
      site_publie: boolean | null;
    }[];

    // La page « la carte de X » exige le module de visibilité, comme la
    // vitrine. L'annoncer ici sans le vérifier remplirait le plan du site
    // d'adresses qui répondent 404 — ce qu'un moteur nous fait payer.
    const avecVisibilite = await visibiliteOuvertePour(
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        created_at: restaurant.created_at ?? new Date().toISOString(),
        acces_offert_jusqu_au: restaurant.acces_offert_jusqu_au ?? null,
      })),
      supabase,
    );

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
      .filter(
        (restaurant) =>
          restaurant.carte_publique && avecVisibilite.has(restaurant.id),
      )
      .flatMap((restaurant) => [
        {
          url: `${site}/carte/${restaurant.slug_reservation}`,
          lastModified: quand(restaurant),
          priority: 0.7,
        },
        // Le tableau des allergènes vit aux mêmes conditions que la carte
        // dont il est tiré. « Allergènes + nom du restaurant » est une
        // recherche que fait quelqu'un qui a une vraie raison de la
        // faire ; autant qu'il tombe sur le document et non sur un avis.
        {
          url: `${site}/carte/${restaurant.slug_reservation}/allergenes`,
          lastModified: quand(restaurant),
          priority: 0.4,
        },
      ]);

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
