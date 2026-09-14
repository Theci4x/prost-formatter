import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { billetParSlug, tousLesBillets } from "@/lib/blog/billets";
import { titreCategorieBillet } from "@/types/blog";
import { teinteBillet } from "@/lib/blog/teintes";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Le journal de Klarr";

export function generateStaticParams() {
  return tousLesBillets().map((billet) => ({ slug: billet.slug }));
}

/**
 * La couverture d'un billet.
 *
 * Elle sert deux fois : en tête de l'article et sur la carte du sommaire,
 * et comme aperçu quand le lien est partagé. Dessinée plutôt que
 * photographiée, faute de photothèque — et une photo de banque d'images
 * sur un article qui explique une obligation légale ferait exactement
 * l'effet inverse de celui qu'on cherche.
 *
 * Chaque billet a sa teinte, tirée de son slug : la série se reconnaît,
 * les articles se distinguent. Sur le site lui-même, la couverture est
 * dessinée sans titre (voir Couverture.tsx) — ici il le faut, puisque
 * l'aperçu partagé voyage seul.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const billet = billetParSlug(slug);
  const { fond, trait } = teinteBillet(slug);
  const photo = billet?.image ? await photoEnBase64(billet.image.fichier) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: fond,
          padding: "68px 76px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Quand l'article a une photo, elle devient le fond, assombrie :
            un aperçu partagé se lit à la taille d'une vignette dans une
            conversation, et du texte blanc sur une photo claire n'y est
            tout simplement pas lisible. */}
        {photo && (
          <img
            src={photo}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {photo && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: `linear-gradient(to top, ${fond} 18%, rgba(0,0,0,0.42) 100%)`,
            }}
          />
        )}
        {/* Un trait de couleur en haut : c'est ce qui donne à la série son
            air de série, une fois les cartes alignées sur le sommaire. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 10,
            background: trait,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#fff",
              color: fond,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <span style={{ fontSize: 25, fontWeight: 700, color: "#fff" }}>
            Klarr
          </span>
          <span style={{ fontSize: 25, color: "rgba(255,255,255,0.35)" }}>/</span>
          <span style={{ fontSize: 21, color: "rgba(255,255,255,0.7)" }}>
            {billet ? titreCategorieBillet(billet.categorie) : "Le journal"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              fontSize: billet && billet.titre.length > 52 ? 54 : 64,
              lineHeight: 1.12,
              color: "#fff",
              maxWidth: 1000,
            }}
          >
            {billet?.titre ?? "Le journal"}
          </span>
          <span
            style={{
              fontSize: 23,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.62)",
              maxWidth: 880,
            }}
          >
            {billet?.resume ?? ""}
          </span>
        </div>
      </div>
    ),
    size,
  );
}

/**
 * La photo, lue sur le disque et inlinée.
 *
 * `ImageResponse` ne sait pas aller chercher une adresse relative : à la
 * construction, il n'y a pas encore de serveur à interroger. On lit donc
 * le fichier dans /public. Une image annoncée mais absente ne doit pas
 * faire échouer la construction de tout le site pour autant — l'aperçu
 * retombe sur la couverture dessinée, et l'article reste en ligne.
 */
async function photoEnBase64(chemin: string): Promise<string | null> {
  try {
    const fichier = await readFile(join(process.cwd(), "public", chemin));
    const type = chemin.endsWith(".png")
      ? "image/png"
      : chemin.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return `data:${type};base64,${fichier.toString("base64")}`;
  } catch {
    console.error(`[journal] photo introuvable : ${chemin}`);
    return null;
  }
}
