import type { MetadataRoute } from "next";

/**
 * Le manifeste : ce qui permet d'installer Klarr sur un écran d'accueil.
 *
 * Il ne sert pas qu'au confort. Sur iPhone, les notifications ne sont
 * autorisées **que** pour une application ajoutée à l'écran d'accueil :
 * sans ce fichier, aucun restaurateur sous iOS ne peut être prévenu
 * d'une réservation.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klarr — votre restaurant, au clair",
    short_name: "Klarr",
    description:
      "Vos réservations, vos avis et votre fiche Google au même endroit.",
    // On ouvre sur le tableau de bord : celui qui installe Klarr est un
    // restaurateur, pas un visiteur de la page de vente.
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#faf7f0",
    theme_color: "#0f1e3d",
    lang: "fr",
    icons: [
      { src: "/icone-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icone-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icone-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
