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

// Ce qui se passe une fois la table prise. Quatre lignes courtes : c'est
// la partie du métier qu'on connaît déjà, on n'a pas à la raconter.
const ENSUITE = [
  {
    titre: "Le carnet",
    texte:
      "Demandes, confirmations, plan de salle et écran de service pour le coup de feu.",
  },
  {
    titre: "Moins de no-show",
    texte:
      "Rappel la veille, annulation en un clic, acompte quand la table le mérite.",
  },
  {
    titre: "Les privatisations",
    texte:
      "Minimum de couverts, minimum de consommation, conditions annoncées avant de réserver.",
  },
  {
    titre: "Rien à relancer",
    texte:
      "Le lien de paiement part seul, se relance avant l'échéance, et ce qui rate se rejoue.",
  },
];

/**
 * La section sombre de la page.
 *
 * Douze sections crème qui se suivent finissent par se ressembler, quel
 * que soit leur contenu. Celle-ci est en encre : c'est l'argument qu'on
 * veut qu'un restaurateur retienne s'il n'en retient qu'un — ses
 * réservations lui appartiennent, et personne ne prend de pourcentage
 * dessus. Le « 0 % » reste sur une carte blanche, la seule de la section,
 * pour que l'œil tombe dessus.
 */
export function Reservation() {
  return (
    <div
      id="reservations"
      style={{
        background: "var(--ink)",
        color: "var(--paper)",
        position: "relative",
        overflow: "hidden",
      }}
      className="px-5 py-20 sm:px-8 sm:py-24"
    >
      {/* Une lueur orange en haut à droite : la même que derrière le hero,
          pour que la section appartienne à la page et non à un autre site. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -180,
          right: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "var(--accent)",
          opacity: 0.18,
          filter: "blur(120px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 56,
        }}
      >
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
                color: "#F0A93C",
              }}
            >
              Réservations
            </span>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: "clamp(32px, 3.4vw, 42px)",
                lineHeight: 1.12,
                textWrap: "balance",
              }}
            >
              Vos réservations vous appartiennent.{" "}
              <em style={{ fontStyle: "italic", color: "#F0A93C" }}>
                Klarr ne touche rien dessus.
              </em>
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16.5,
                lineHeight: 1.7,
                color: "oklch(80% 0.01 60)",
                maxWidth: 520,
              }}
            >
              Les plateformes prennent une commission sur chaque couvert
              qu&apos;elles vous envoient — y compris sur les clients qui
              seraient venus de toute façon. Klarr ne prend rien. Les acomptes
              vont sur votre compte Stripe, pas sur le nôtre.
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
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      flex: "none",
                      marginTop: 9,
                      width: 18,
                      height: 1.5,
                      background: "#F0A93C",
                    }}
                  />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 5 }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 17,
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
                        color: "oklch(74% 0.012 60)",
                        maxWidth: 500,
                      }}
                    >
                      {point.texte}
                    </p>
                  </div>
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
                color: "var(--ink)",
                borderTop: "4px solid var(--accent)",
                borderRadius: 20,
                padding: "44px 38px 38px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
                textAlign: "center",
                maxWidth: 380,
                width: "100%",
                boxShadow: "0 40px 90px -40px oklch(0% 0 0 / 60%)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 112,
                  lineHeight: 0.85,
                  letterSpacing: "-0.02em",
                  color: "var(--accent-dark)",
                }}
              >
                0 %
              </span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>
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
              <span
                style={{
                  marginTop: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                  background: "var(--bg-alt)",
                  borderRadius: 100,
                  padding: "6px 12px",
                }}
              >
                Sur 400 couverts par mois, une plateforme à 2&nbsp;€ le couvert prend 800&nbsp;€.
              </span>
            </div>
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            borderTop: "1px solid oklch(100% 0 0 / 14%)",
            paddingTop: 40,
          }}
        >
          {ENSUITE.map((bloc) => (
            <div
              key={bloc.titre}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {bloc.titre}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "oklch(74% 0.012 60)",
                }}
              >
                {bloc.texte}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
