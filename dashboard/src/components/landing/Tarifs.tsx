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
// Les montants ne sont plus écrits ici : ils viennent des constantes
// d'abonnement, formatées dans la langue lue (voir `accueilPublic.ts`).
// Un tarif écrit à la main dans trois langues finit faux dans deux.
import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";

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

export function Tarifs({ t }: { t: ClesAccueilPublic["tarifs"] }) {
  return (
    <div
      id="tarifs"
      className="px-5 py-20 sm:px-8 sm:py-24"
      style={{ background: "var(--bg)" }}
    >
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
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--ink-soft)",
            }}
          >
            {t.chapo}
          </p>
        </div>

        <div
          className="flex-col sm:flex-row"
          style={{ display: "flex", gap: 24, alignItems: "stretch" }}
        >
          {t.offres.map((offre, rang) => (
            <div
              key={offre.nom}
              style={{
                flex: 1,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderTop: `3px solid ${rang === 1 ? "var(--accent)" : "var(--line)"}`,
                borderRadius: 16,
                padding: "32px 30px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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

              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: 52,
                    lineHeight: 1,
                  }}
                >
                  {offre.prix}
                </span>
                <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                  {t.parMois}
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  marginTop: -12,
                }}
              >
                {offre.ttcEtEssai}
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

              {rang === 1 && (
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
                  {t.commission}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Le pack sous les deux cartes plutôt qu'en troisième colonne :
            il n'ajoute rien à la liste, il dit seulement que les deux
            ensemble coûtent moins cher, et une carte de plus donnerait à
            croire à une offre de plus.
            
            Mais un paragraphe gris en faisait une note de bas de page,
            alors que c'est l'offre la plus avantageuse. D'où ce bandeau :
            le poids visuel d'une offre, la forme d'un complément. */}
        <div
          className="flex-col sm:flex-row"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 20,
            padding: "26px 30px",
            borderRadius: 16,
            border: "1px solid var(--accent)",
            background: "var(--brand-cream, var(--paper))",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--accent-dark)",
              }}
            >
              {t.pack.etiquette}
            </span>
            <span style={{ fontSize: 16, color: "var(--ink)" }}>
              {t.pack.resume}
            </span>
            {/* L'économie en toutes lettres : « onze pour cent » ne parle
                à personne, « 90 € sur l'année » se décide. */}
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--accent-dark)",
              }}
            >
              {t.pack.economie}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 44,
                  lineHeight: 1,
                  color: "var(--ink)",
                }}
              >
                {t.pack.prix}
              </span>
              <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                {t.parMois}
              </span>
            </span>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {t.pack.ttc}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
