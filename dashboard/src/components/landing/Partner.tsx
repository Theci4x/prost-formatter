// Les chiffres avancés ici sont ceux de l'extrait Kbis d'EDIREF : début
// d'activité au 1er avril 2008, objet social « hébergement et développement
// de sites internet, leur optimisation et référencement ». Rien qui ne soit
// vérifiable au registre du commerce.
const FAITS = [
  { valeur: "2008", libelle: "Début d'activité" },
  { valeur: "Paris 8e", libelle: "Siège social" },
  { valeur: "SEO & web", libelle: "Métier d'origine" },
];

export function Partner() {
  return (
    <div style={{ background: "var(--bg)", padding: "90px 32px" }}>
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
            L&apos;autre moitié de Klarr
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
            Une agence de référencement qui fait ça depuis dix-huit ans.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            Klarr est édité par <strong>EDIREF</strong>, société parisienne
            spécialisée depuis 2008 dans le développement de sites internet,
            leur optimisation et leur référencement. Là où beaucoup
            découvrent le SEO en même temps que leurs clients, Thomas Bavoil
            et son équipe le pratiquent depuis avant que Google Business
            Profile ne s&apos;appelle ainsi.
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            C&apos;est ce qui fait la différence entre un outil qui affiche
            des chiffres et un outil qui sait lesquels comptent : le métier
            d&apos;un restaurateur d&apos;un côté, dix-huit ans de
            référencement de l&apos;autre.
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
            Découvrir EDIREF →
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
            {FAITS.map((fait) => (
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
              EDIREF, SARL au capital de 1 000 € — RCS Paris 503 428 369.
              Vérifiable au registre du commerce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
