import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";

// Les chiffres avancés ici sont ceux de l'extrait Kbis d'EDIREF : début
// d'activité au 1er avril 2008, objet social « hébergement et développement
// de sites internet, leur optimisation et référencement ». Rien qui ne soit
// vérifiable au registre du commerce. Ils ne se traduisent pas : seule
// leur étiquette change de langue, la valeur reste ce que dit le Kbis.
export function Partner({ t }: { t: ClesAccueilPublic["editeur"] }) {
  return (
    <div
      className="px-5 py-16 sm:px-8 sm:py-20"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="flex-col sm:flex-row"
        style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 56 }}
      >
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}
        >
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
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            {t.p1}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            {t.p2}
          </p>
          <a
            href="https://www.ediref.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--accent-dark)",
              width: "fit-content",
            }}
          >
            {t.lien}
          </a>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "100%",
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "30px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            {t.faits.map((fait) => (
              <div
                key={fait.libelle}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                  {fait.libelle}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: 26,
                    lineHeight: 1,
                  }}
                >
                  {fait.valeur}
                </span>
              </div>
            ))}
            <p
              style={{
                margin: 0,
                paddingTop: 6,
                borderTop: "1px solid var(--line)",
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--ink-soft)",
              }}
            >
              {t.mention}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
