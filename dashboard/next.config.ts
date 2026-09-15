import type { NextConfig } from "next";

// Les photos vivent dans Supabase Storage. next/image refuse d'optimiser un
// domaine distant non déclaré : on le dérive de l'URL du projet plutôt que
// de le figer, l'URL différant entre la base réelle et celle des tests.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePattern = supabaseUrl
  ? [
      {
        protocol: new URL(supabaseUrl).protocol.replace(
          ":",
          "",
        ) as "http" | "https",
        hostname: new URL(supabaseUrl).hostname,
        port: new URL(supabaseUrl).port,
        pathname: "/storage/v1/object/public/**",
      },
    ]
  : [];

const nextConfig: NextConfig = {
  // Une action serveur reçoit 1 Mo par défaut. Un logo ou une photo de plat
  // sortis d'un téléphone pèsent couramment 2 à 4 Mo : la requête était
  // rejetée avant même d'entrer dans le code, et l'écran ne montrait rien.
  // 4 Mo plutôt que davantage : au-delà, c'est l'hébergeur qui refuse le
  // corps de la requête, et on retomberait sur le même silence.
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },

  images: {
    remotePatterns: supabaseImagePattern,
    // next/image refuse d'aller chercher une image sur une IP privée, pour
    // qu'une URL hostile ne fasse pas sonder le réseau interne du serveur.
    // La garde est juste, mais elle rend les photos intestables en local,
    // où la fausse base Supabase tourne sur 127.0.0.1. Cette variable n'est
    // définie que sur la machine de test : en production elle est absente,
    // la garde reste donc active — et de toute façon `remotePatterns`
    // n'autorise déjà que le domaine Supabase du projet.
    dangerouslyAllowLocalIP: process.env.KLARR_IMAGES_LOCALES === "1",
  },

  /**
   * Les en-têtes de sécurité, sur toutes les pages.
   *
   * « frame-ancestors » est le seul qui ne peut pas se poser en balise meta,
   * et c'est le plus utile ici : sans lui, le tableau de bord peut être
   * chargé dans une iframe sur un site tiers, qui superpose ses propres
   * boutons aux nôtres — un restaurateur croit accepter un cookie et
   * supprime son établissement.
   *
   * Pas de politique de contenu complète : Next pose ses propres scripts en
   * ligne, une CSP stricte les casserait, et une CSP permissive donnerait
   * l'illusion d'une protection. Et pas de « payment=() » dans les
   * permissions : Stripe s'en sert pour Apple Pay et Google Pay.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },

  // Empêche la redirection 308 automatique de Next sur les URLs avec un
  // "/" final, pour que les rewrites ci-dessous servent directement le
  // fichier (200) au lieu de rediriger — le vérificateur TikTok ne suit
  // pas les redirections.
  skipTrailingSlashRedirect: true,

  // TikTok demande la vérification de domaine avec un "/" final après le
  // nom de fichier (ex: /cgu/tiktok....txt/), ce que le dossier public/
  // ne sert pas nativement (404). On réécrit vers le fichier réel.
  async rewrites() {
    return [
      {
        source: "/cgu/tiktokRyT3UCnwAysHWo0eqXVYJy7ljG8NzmOL.txt/",
        destination: "/cgu/tiktokRyT3UCnwAysHWo0eqXVYJy7ljG8NzmOL.txt",
      },
      {
        source: "/confidentialite/tiktok69Eu9CmXzSvXSjuwxYgKrEaudj3P3iy8.txt/",
        destination: "/confidentialite/tiktok69Eu9CmXzSvXSjuwxYgKrEaudj3P3iy8.txt",
      },
    ];
  },
};

export default nextConfig;
