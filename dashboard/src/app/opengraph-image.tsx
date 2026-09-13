import { ImageResponse } from "next/og";

export const alt = "Klarr — la clarté pour votre restaurant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * L'aperçu affiché quand on partage klarr.net — WhatsApp, LinkedIn,
 * Instagram, iMessage. Sans lui, un lien envoyé à un restaurateur arrive nu,
 * et un lien nu se clique beaucoup moins.
 *
 * Image générée plutôt que fichier déposé : elle suit l'accroche du site et
 * ne se désynchronise pas au premier changement de discours.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF7F0",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#0f1e3d",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            K
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#0f1e3d" }}>
            Klarr
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              fontSize: 62,
              lineHeight: 1.1,
              color: "#1a1614",
              maxWidth: 900,
            }}
          >
            On vous montre ce que voient vos clients.
          </span>
          <span style={{ fontSize: 30, color: "#6b625c", maxWidth: 860 }}>
            Votre fiche Google, vos avis, votre visibilité dans les IA. Et vos
            réservations, sans commission par couvert.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 64, height: 5, background: "#E8871E" }} />
          <span style={{ fontSize: 26, color: "#6b625c" }}>klarr.net</span>
        </div>
      </div>
    ),
    size,
  );
}
