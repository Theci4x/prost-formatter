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
 * L'aperçu partagé d'un billet — WhatsApp, LinkedIn, iMessage.
 *
 * Contrairement à la couverture affichée sur le site, celui-ci porte le
 * titre : il voyage seul, sans la page autour.
 *
 * Deux contraintes de Satori, le moteur derrière `ImageResponse`, ont
 * dicté la structure. Il ne positionne pas `inset: 0` comme un
 * navigateur — les couches se dessinent donc avec des dimensions
 * explicites — et il ne fait pas de dégradé fiable en `background`
 * raccourci. D'où un voile uni par-dessus la photo plutôt qu'un
 * dégradé : moins joli, mais lisible à coup sûr, et c'est tout ce qu'on
 * demande à une vignette dans une conversation.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const billet = billetParSlug(slug);
  const { fond, trait } = teinteBillet(slug);
  const photo = billet?.image
    ? await photoEnBase64(billet.image.fichier)
    : null;

  const couche = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: size.width,
    height: size.height,
    display: "flex",
  };

  return new ImageResponse(
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        background: fond,
        position: "relative",
      }}
    >
      {photo && (
        <img
          src={photo}
          alt=""
          width={size.width}
          height={size.height}
          style={{ ...couche, objectFit: "cover" }}
        />
      )}
      {/* Un voile uni pour le contraste général, puis un dégradé vers le
            bas, là où se posent le titre et le résumé. En `backgroundImage`
            et pas en raccourci `background` : Satori ne lit le dégradé que
            sous cette forme. */}
      {photo && (
        <div style={{ ...couche, backgroundColor: "rgba(12,16,26,0.42)" }} />
      )}
      {photo && (
        <div
          style={{
            ...couche,
            backgroundImage:
              "linear-gradient(to bottom, rgba(12,16,26,0) 30%, rgba(12,16,26,0.72) 78%)",
          }}
        />
      )}

      <div
        style={{
          ...couche,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "62px 72px",
        }}
      >
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
          <span style={{ fontSize: 25, color: "rgba(255,255,255,0.4)" }}>
            /
          </span>
          <span style={{ fontSize: 21, color: "rgba(255,255,255,0.78)" }}>
            {billet ? titreCategorieBillet(billet.categorie) : "Le journal"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
              color: "rgba(255,255,255,0.88)",
              maxWidth: 900,
            }}
          >
            {billet?.resume ?? ""}
          </span>
        </div>
      </div>

      {/* Le trait de couleur de l'article, au-dessus de tout : c'est lui
            qui fait reconnaître la série d'un aperçu à l'autre. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size.width,
          height: 10,
          background: trait,
          display: "flex",
        }}
      />
    </div>,
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
 * retombe sur le fond uni, et l'article reste en ligne.
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
