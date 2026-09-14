import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Le tableau de bord et les routes techniques n'ont rien à faire dans un
 * index. Les pages de réservation, elles, y ont toute leur place : c'est
 * exactement ce que Klarr promet au restaurateur, être trouvable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/api/",
        "/auth/",
        "/nouveau-mot-de-passe",
        // L'adresse porte le jeton de paiement du client : l'indexer le
        // publierait. Les pages elles-mêmes portent aussi un noindex —
        // robots.txt empêche la visite, la balise empêche l'indexation si
        // l'adresse fuite par un autre chemin.
        "/paiement/",
        // Une page de connexion ne répond à aucune recherche.
        "/login",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
