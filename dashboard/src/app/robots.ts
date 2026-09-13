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
      disallow: ["/dashboard", "/admin", "/api/", "/auth/", "/nouveau-mot-de-passe"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
