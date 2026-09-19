import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";

export function Problem({ t }: { t: ClesAccueilPublic["probleme"] }) {
  return (
    <div className="px-5 py-16 sm:px-8 sm:py-20" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--accent-dark)",
          }}
        >
          {t.surtitre}
        </span>
        <h2
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontWeight: 400,
            margin: 0,
            fontSize: 36,
            lineHeight: 1.2,
          }}
        >
          {t.titre}
        </h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)" }}>
          {t.p1}
        </p>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)" }}>
          {t.p2}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 19,
            lineHeight: 1.6,
            fontWeight: 700,
          }}
        >
          {t.chute}
        </p>
      </div>
    </div>
  );
}

export function Founder({ t }: { t: ClesAccueilPublic["fondateur"] }) {
  return (
    <div className="px-5 py-16 sm:px-8 sm:py-20" style={{ background: "var(--bg-alt)" }}>
      <div
        className="flex-col sm:flex-row"
        style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 56 }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent-dark)",
            }}
          >
            {t.surtitre}
          </span>
          <h2
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: 32,
              lineHeight: 1.2,
            }}
          >
            {t.titre}
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--ink-soft)" }}>
            {t.p1}
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--ink-soft)" }}>
            {t.p2}
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <figure
            style={{
              margin: 0,
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderLeft: "3px solid var(--accent)",
              borderRadius: 14,
              padding: "28px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <blockquote
              style={{
                margin: 0,
                fontSize: 18,
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              {t.citation}
            </blockquote>
            <figcaption style={{ fontSize: 14, color: "var(--ink-soft)" }}>
              {t.legende}
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
