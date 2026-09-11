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
  images: {
    remotePatterns: supabaseImagePattern,
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
