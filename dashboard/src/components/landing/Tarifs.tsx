// Le HT en grand, le TTC en dessous — et pas l'inverse.
//
// Le code de la consommation impose le TTC quand on s'adresse à des
// particuliers. Ici les clients sont des professionnels assujettis : ils
// récupèrent la TVA, raisonnent en HT, et tous les logiciels du secteur
// affichent du HT. Annoncer « 45 € » en gros à côté d'un concurrent qui
// annonce « 49 € HT » nous faisait passer pour plus cher, alors qu'on est
// un quart en dessous.
//
// Le TTC reste juste en dessous : c'est le montant réellement prélevé, et
// une surprise au débit coûte plus cher qu'une ligne de plus.
const OFFRES = [
  {
    nom: "Klarr",
    ht: "37,50 €",
    ttc: "45 € TTC",
    essai: "14 jours d'essai",
    resume: "Votre visibilité, en clair.",
    lignes: [
      "Votre fiche Google, vos avis, vos réseaux au même endroit",
      "Les mots-clés sur lesquels vous sortez vraiment",
      "Ce que répondent ChatGPT, Gemini et les autres quand on cherche où manger",
      "Une alerte quand un avis tombe ou que la note bouge",
    ],
    accent: false,
  },
  {
    nom: "Réservations",
    ht: "29 €",
    ttc: "34,80 € TTC",
    essai: "30 jours d'essai",
    resume: "Votre page de réservation, sans intermédiaire.",
    lignes: [
      "Une adresse à votre nom, à partager où vous voulez",
      "Réservations individuelles et privatisation d'espaces",
      "Jauges par service : jamais deux groupes dans la même salle",
      "Photos de vos espaces, vues avant de réserver",
    ],
    accent: true,
  },
];

function Coche() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent-dark)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "none", marginTop: 3 }}
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function Tarifs() {
  return (
    <div id="tarifs" className="px-5 py-20 sm:px-8 sm:py-24" style={{ background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 48,
        }}
      >
        <div
          style={{
            maxWidth: 560,
            display: "flex",
            flexDirection: "column",
            gap: 16,
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
            Tarifs
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
            Deux offres, affichées. Pas de devis à demander.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            Par établissement, sans engagement, résiliable en un clic depuis
            votre tableau de bord. Prenez l&apos;une, l&apos;autre, ou les
            deux.
          </p>
        </div>

        <div
          className="flex-col sm:flex-row"
          style={{ display: "flex", gap: 24, alignItems: "stretch" }}
        >
          {OFFRES.map((offre) => (
            <div
              key={offre.nom}
              style={{
                flex: 1,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderTop: `3px solid ${offre.accent ? "var(--accent)" : "var(--line)"}`,
                borderRadius: 16,
                padding: "32px 30px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--ink-soft)",
                  }}
                >
                  {offre.nom}
                </span>
                <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                  {offre.resume}
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "baseline", gap: 8 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: 52,
                    lineHeight: 1,
                  }}
                >
                  {offre.ht}
                </span>
                <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                  HT / mois
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  marginTop: -12,
                }}
              >
                soit {offre.ttc} · {offre.essai}
              </span>

              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {offre.lignes.map((ligne) => (
                  <li
                    key={ligne}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 15,
                      lineHeight: 1.55,
                      color: "var(--ink-soft)",
                    }}
                  >
                    <Coche />
                    <span>{ligne}</span>
                  </li>
                ))}
              </ul>

              {offre.accent && (
                <span
                  style={{
                    marginTop: "auto",
                    paddingTop: 16,
                    borderTop: "1px solid var(--line)",
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: "var(--accent-dark)",
                  }}
                >
                  0 % de commission par couvert
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
