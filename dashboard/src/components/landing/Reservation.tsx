// Formulations volontairement limitées à ce qui existe : page publique,
// tables et privatisation, jauges, aucune commission. Pas un mot sur la
// publication automatique chez Google ni sur les paiements, qui n'existent
// pas encore.
const POINTS = [
  {
    titre: "Votre page de réservation, à votre nom",
    texte:
      "Une adresse à vous, à partager sur votre fiche Google, votre Instagram ou votre page Facebook. Vos clients réservent en deux clics, sans créer de compte.",
  },
  {
    titre: "Une table, ou toute une salle",
    texte:
      "Le même outil prend une table pour deux et la privatisation de votre cave pour un anniversaire de trente. Vous fixez le minimum de couverts à partir duquel vous privatisez.",
  },
  {
    titre: "Jamais deux groupes dans la même salle",
    texte:
      "Chaque espace a sa capacité et chaque service sa jauge. Une demande non tranchée pose une option qui expire, pour qu'un curieux ne gèle pas votre vendredi soir.",
  },
];

export function Reservation() {
  return (
    <div style={{ background: "var(--bg-alt)", padding: "100px 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          className="flex-col sm:flex-row"
          style={{ display: "flex", gap: 56, alignItems: "flex-start" }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
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
              Réservations
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
              Vos réservations vous appartiennent.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--ink-soft)",
                maxWidth: 520,
              }}
            >
              Les plateformes prennent une commission sur chaque couvert
              qu&apos;elles vous envoient — y compris sur les clients qui
              seraient venus de toute façon. Klarr ne prend rien. Vos clients
              réservent chez vous, pas chez un intermédiaire.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
                marginTop: 10,
              }}
            >
              {POINTS.map((point) => (
                <div
                  key={point.titre}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontFamily: "var(--font-manrope), sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    {point.titre}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 15,
                      lineHeight: 1.65,
                      color: "var(--ink-soft)",
                      maxWidth: 520,
                    }}
                  >
                    {point.texte}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderTop: "3px solid var(--accent)",
                borderRadius: 16,
                padding: "40px 36px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                alignItems: "center",
                textAlign: "center",
                maxWidth: 380,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 84,
                  lineHeight: 0.9,
                  color: "var(--accent-dark)",
                }}
              >
                0 %
              </span>
              <span style={{ fontSize: 17, fontWeight: 600 }}>
                de commission sur vos réservations
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--ink-soft)",
                }}
              >
                Ni sur les couverts, ni sur les privatisations. Le module
                Réservations coûte 35 € TTC par mois, et rien d&apos;autre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
