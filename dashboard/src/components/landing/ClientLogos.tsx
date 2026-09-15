// Bandeau "ils nous font confiance" : les enseignes sont composées
// typographiquement (pas de fichier image), pour rester lisibles et
// homogènes sur le fond clair de la landing page.
const CLIENTS: { name: string; node: React.ReactNode }[] = [
  {
    name: "炭TAN Barbeq",
    node: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>炭</span>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1 }}>
            TAN
          </span>
        </div>
        <span
          style={{
            fontSize: 8,
            fontWeight: 600,
            letterSpacing: "0.34em",
            paddingTop: 3,
            borderTop: "1px solid currentColor",
          }}
        >
          BARBEQ
        </span>
      </div>
    ),
  },
  {
    name: "Prost",
    node: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-instrument-serif), Georgia, serif",
            fontSize: 27,
            letterSpacing: "0.16em",
            lineHeight: 1,
          }}
        >
          PROST
        </span>
        <span style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: "0.3em" }}>
          GERMAN · FRENCH
        </span>
      </div>
    ),
  },
  {
    name: "404 Not Found Speakeasy",
    node: (
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1.5px solid currentColor",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          404
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1 }}>
            NOT FOUND
          </span>
          <span style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: "0.28em" }}>
            SPEAKEASY
          </span>
        </span>
      </div>
    ),
  },
  {
    name: "Joayo 13",
    node: (
      <span style={{ fontSize: 22, fontWeight: 400, letterSpacing: "0.2em", lineHeight: 1 }}>
        JOAYO 13
      </span>
    ),
  },
  {
    name: "Kokodak",
    node: (
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: "1.5px solid currentColor",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          KK
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em" }}>
          KOKODAK
        </span>
      </div>
    ),
  },
  {
    name: "Korean Crousty",
    node: (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1.1 }}>
          korean
        </span>
        <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "0.03em", lineHeight: 1.1 }}>
          CROUSTY
        </span>
      </div>
    ),
  },
];

function LogoRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
    >
      {CLIENTS.map((client) => (
        <div
          key={client.name}
          title={client.name}
          style={{
            flexShrink: 0,
            padding: "0 40px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink)",
            opacity: 0.68,
          }}
        >
          {client.node}
        </div>
      ))}
    </div>
  );
}

export function ClientLogos() {
  return (
    <div style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 32px 38px" }}>
        <p
          style={{
            margin: "0 0 22px",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          Ils nous font déjà confiance
        </p>
        <div
          className="klarr-marquee"
          style={{
            overflow: "hidden",
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="klarr-marquee-track" style={{ display: "flex", width: "max-content" }}>
            <LogoRow />
            <LogoRow ariaHidden />
          </div>
        </div>
      </div>
    </div>
  );
}
