import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

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
