import Image, { type StaticImageData } from "next/image";
import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";
import portraitAn from "../../../public/temoignages/an.jpg";
import portraitXuanmin from "../../../public/temoignages/xuanmin.jpg";
import portraitHuijun from "../../../public/temoignages/huijun.jpg";

// Des clients, avec leur visage et leur nom : juste sous les logos, la
// preuve qu'il y a quelqu'un derrière chaque enseigne.
const PORTRAITS: Record<string, StaticImageData> = {
  an: portraitAn,
  xuanmin: portraitXuanmin,
  huijun: portraitHuijun,
};

function Portrait({ id, nom }: { id: string; nom: string }) {
  const style = {
    width: 52,
    height: 52,
    borderRadius: "50%",
    flexShrink: 0,
    border: "2px solid var(--paper)",
    boxShadow: "0 0 0 1px var(--line)",
  } as const;
  const photo = PORTRAITS[id];
  if (photo) {
    return (
      <Image
        src={photo}
        alt={nom}
        width={52}
        height={52}
        sizes="52px"
        style={{ ...style, objectFit: "cover" }}
      />
    );
  }
  // Pas encore de photo : les initiales, plutôt qu'un visage générique.
  const initiales = nom
    .split(/\s+/)
    .map((mot) => mot[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--accent-soft)",
        color: "var(--accent-dark)",
        fontWeight: 700,
        fontSize: 17,
      }}
    >
      {initiales}
    </span>
  );
}

export function Temoignages({ t }: { t: ClesAccueilPublic["temoignages"] }) {
  return (
    <div
      className="px-5 py-14 sm:px-8 sm:py-16"
      style={{ background: "var(--bg)" }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <span
          style={{
            display: "block",
            marginBottom: 24,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--accent-dark)",
          }}
        >
          {t.surtitre}
        </span>
        <div className="grid gap-5 md:grid-cols-3">
          {t.liste.map((temoin) => (
            <figure
              key={temoin.id}
              style={{
                margin: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 22,
                padding: "26px 26px 22px",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 18,
              }}
            >
              <blockquote
                style={{
                  margin: 0,
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontWeight: 400,
                  fontSize: 22,
                  lineHeight: 1.35,
                }}
              >
                {temoin.citation}
              </blockquote>
              <figcaption
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <Portrait id={temoin.id} nom={temoin.nom} />
                <span
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15 }}>
                    {temoin.nom}
                  </span>
                  <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
                    {temoin.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
