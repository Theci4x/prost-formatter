export function Problem() {
  return (
    <div style={{ background: "var(--bg)", padding: "90px 32px" }}>
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
          Le problème
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
          Vous avez déjà vu un tableau de bord vous annoncer «&nbsp;1er sur
          Google&nbsp;» pendant que vos clients, eux, vous trouvent en page
          2&nbsp;?
        </h2>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)" }}>
          Un score flatteur ne remplit pas votre restaurant. Une donnée que
          vous pouvez vérifier, si.
        </p>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)" }}>
          La plupart des outils marketing vivent de votre satisfaction, pas de
          vos résultats. Plus vous êtes content, plus vous restez abonné. Alors
          le chiffre qu&apos;on vous montre a tendance à… vous arranger.
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 19,
            lineHeight: 1.6,
            fontWeight: 700,
          }}
        >
          Klarr ne vend pas de la satisfaction. Klarr montre ce qui est là,
          même quand ça ne fait pas plaisir.
        </p>
      </div>
    </div>
  );
}

export function Founder() {
  return (
    <div style={{ background: "var(--bg-alt)", padding: "90px 32px" }}>
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
            Qui est derrière Klarr
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
            Un restaurateur, pas une startup qui a découvert le métier dans un
            pitch deck.
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--ink-soft)" }}>
            Klarr est fait par un restaurateur avec vingt ans de métier. On
            sait ce que c&apos;est de vérifier soi-même sa fiche Google entre
            deux services, de se faire vendre un score qui ne colle pas à la
            réalité, et de perdre du temps sur des outils pensés pour
            impressionner des investisseurs plutôt que des restaurateurs.
          </p>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "var(--ink-soft)" }}>
            Sans engagement, résiliable en un clic. Vous partez quand vous
            voulez, sans avoir à écrire à personne.
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
              «&nbsp;On nous annonçait 1ers sur “restaurant allemand”. En
              navigation privée, on était 4e. J&apos;ai vérifié avec
              d&apos;autres restaurateurs — même souci partout.&nbsp;»
            </blockquote>
            <figcaption style={{ fontSize: 14, color: "var(--ink-soft)" }}>
              Ce qui a donné l&apos;idée de Klarr.
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
