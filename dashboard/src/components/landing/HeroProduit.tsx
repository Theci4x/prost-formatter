import { FloatingChip, Tilt } from "@/components/landing/Tilt";
import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";

/**
 * Le visuel du hero : ce que voit un client, pas ce que voit le patron.
 *
 * L'ancienne carte montrait un faux tableau de bord (« Le Petit Bouchon »,
 * des mots-clés) sous un titre qui parle de réservations. Ici, c'est la
 * page de réservation elle-même, telle qu'un client la reçoit sur son
 * téléphone, avec la fiche Google qui dépasse derrière : les deux moitiés
 * de Klarr dans une seule image, et rien qui ne corresponde pas au produit.
 *
 * Aucun chiffre inventé sur une vraie maison : Prost est un client, sa
 * carte ne porte donc ni note ni nombre d'avis fabriqués.
 */

const CRENEAUX = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const CHOISI = "20:00";

// Les quantièmes ne se traduisent pas ; le nom du jour, si. On garde donc
// les nombres ici et on prend les abréviations dans le dictionnaire.
const JOURS = [
  { num: "19" },
  { num: "20", choisi: true },
  { num: "21" },
  { num: "22", ferme: true },
];

function Ligne({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 8,
        borderRadius: 100,
        background: "var(--bg-alt)",
        ...style,
      }}
    />
  );
}

export function HeroProduit({ t }: { t: ClesAccueilPublic["produit"] }) {
  return (
    <div style={{ position: "relative", padding: "28px 0 24px" }}>
      {/* La fiche Google, derrière : la moitié « visibilité ». */}
      <div
        aria-hidden="true"
        className="hidden sm:flex"
        style={{
          position: "absolute",
          top: -14,
          right: -26,
          width: 232,
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: 16,
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 24px 60px -30px oklch(20% 0.02 60 / 30%)",
          transform: "rotate(2.5deg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            P
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Prost</span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
              {t.lieu}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "oklch(62% 0.15 145)",
            }}
          />
          {t.ficheAJour}
        </div>
        <Ligne style={{ width: "90%" }} />
        <Ligne style={{ width: "70%" }} />
      </div>

      <Tilt>
        <FloatingChip depth={80} style={{ top: -16, left: -22 }}>
          <span
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: 18,
              lineHeight: 1,
              color: "var(--accent-dark)",
            }}
          >
            0 %
          </span>
          {t.commission}
        </FloatingChip>
        <FloatingChip depth={60} style={{ bottom: -16, right: -14 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "oklch(62% 0.15 145)",
              flex: "none",
            }}
          />
          {t.tableConfirmee}
        </FloatingChip>

        {/* La page de réservation, telle que la reçoit un client. */}
        <div
          style={{
            position: "relative",
            width: "min(100%, 400px)",
            margin: "0 auto",
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 22,
            boxShadow: "0 40px 90px -34px oklch(20% 0.02 60 / 42%)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 22,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                }}
              >
                PROST
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.26em",
                  color: "var(--ink-soft)",
                }}
              >
                GERMAN · FRENCH
              </span>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--ink-soft)",
                background: "var(--bg-alt)",
                borderRadius: 100,
                padding: "5px 10px",
              }}
            >
              {t.reserver}
            </span>
          </div>

          <div
            style={{
              padding: "20px 20px 34px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {JOURS.map((j, rang) => (
                <div
                  key={j.num}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    padding: "8px 0",
                    borderRadius: 12,
                    border: `1px solid ${j.choisi ? "var(--ink)" : "var(--line)"}`,
                    background: j.choisi ? "var(--ink)" : "var(--paper)",
                    color: j.choisi ? "var(--paper)" : "var(--ink)",
                    opacity: j.ferme ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 600 }}>
                    {t.jours[rang]}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{j.num}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--ink-soft)" }}>{t.service}</span>
              <span
                style={{
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                {t.couverts}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
              }}
            >
              {CRENEAUX.map((h) => {
                const choisi = h === CHOISI;
                return (
                  <span
                    key={h}
                    style={{
                      textAlign: "center",
                      padding: "9px 0",
                      borderRadius: 10,
                      fontSize: 13.5,
                      fontWeight: 600,
                      border: `1px solid ${choisi ? "var(--accent)" : "var(--line)"}`,
                      background: choisi ? "var(--accent-soft)" : "var(--paper)",
                      color: choisi ? "var(--accent-dark)" : "var(--ink)",
                    }}
                  >
                    {h}
                  </span>
                );
              })}
            </div>

            <div
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                textAlign: "center",
                padding: "13px 0",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {t.demander}
            </div>
            <span
              style={{
                textAlign: "center",
                fontSize: 11.5,
                color: "var(--ink-soft)",
              }}
            >
              {t.mention}
            </span>
          </div>
        </div>
      </Tilt>
    </div>
  );
}
