const WITH_KLARR = [
  "Fiche Google, avis, réseaux sociaux et menu au même endroit",
  "Des mots-clés choisis à partir d'une analyse, pas au hasard",
  "Les avis Google, Yelp et Tripadvisor centralisés",
  "Photos et carte mises à jour en quelques clics",
  "Vous restez autonome, sans dépendre de personne",
];

const WITHOUT_KLARR = [
  "Un outil et un mot de passe différents par plateforme",
  "Des mots-clés au doigt mouillé, quand il y en a",
  "Des avis dispersés, et des réponses qui passent à la trappe",
  "Des informations périmées sur la moitié des sites",
  "Une agence à payer, ou des heures perdues chaque semaine",
];

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 1 }}
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function Column({
  title,
  highlight,
  items,
  positive,
}: {
  title: string;
  highlight: string;
  items: string[];
  positive: boolean;
}) {
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 16,
        padding: 32,
        background: positive ? "var(--paper)" : "transparent",
        border: `1px solid ${positive ? "var(--accent)" : "var(--line)"}`,
        boxShadow: positive ? "0 12px 32px -20px rgba(0,0,0,0.35)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: positive ? "var(--ink)" : "var(--ink-soft)",
        }}
      >
        {title}{" "}
        <span style={{ color: positive ? "var(--accent-dark)" : "var(--ink-soft)" }}>
          {highlight}
        </span>
      </h3>
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {items.map((item) => (
          <li
            key={item}
            style={{
              display: "flex",
              gap: 12,
              fontSize: 15,
              lineHeight: 1.55,
              color: positive ? "var(--ink)" : "var(--ink-soft)",
            }}
          >
            <span style={{ color: positive ? "var(--accent-dark)" : "var(--ink-soft)" }}>
              {positive ? <CheckIcon /> : <CrossIcon />}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Comparison() {
  return (
    <div style={{ background: "var(--bg)", padding: "90px 32px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            maxWidth: 560,
            marginBottom: 48,
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
            La différence
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
            Ce que ça change, concrètement.
          </h2>
        </div>
        <div className="flex-col sm:flex-row" style={{ display: "flex", gap: 24 }}>
          <Column title="Avec" highlight="Klarr" items={WITH_KLARR} positive />
          <Column title="Sans" highlight="Klarr" items={WITHOUT_KLARR} positive={false} />
        </div>
      </div>
    </div>
  );
}
