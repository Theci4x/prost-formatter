import Link from "next/link";
import { redirect } from "next/navigation";
import { Instrument_Serif, Manrope } from "next/font/google";
import { createClient } from "@/lib/supabase/server";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

const ACCENT = "oklch(58% 0.14 55)";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div
      className={`${instrumentSerif.variable} ${manrope.variable}`}
      style={{
        // @ts-expect-error -- CSS custom properties aren't in React's style typings.
        "--bg": "oklch(98% 0.006 80)",
        "--bg-alt": "oklch(95.5% 0.012 75)",
        "--ink": "oklch(19% 0.012 60)",
        "--ink-soft": "oklch(46% 0.02 60)",
        "--line": "oklch(89% 0.012 70)",
        "--accent-dark": "oklch(46% 0.13 50)",
        "--paper": "oklch(100% 0 0)",
        "--accent": ACCENT,
        "--accent-soft": `color-mix(in oklch, ${ACCENT} 12%, white)`,
        width: "100%",
        flexShrink: 0,
        overflowX: "hidden",
        background: "var(--bg)",
        fontFamily: "var(--font-manrope), system-ui, sans-serif",
        color: "var(--ink)",
      }}
    >
      {/* NAV */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "28px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 22,
              letterSpacing: "0.01em",
            }}
          >
            Klarr
          </span>
        </div>
        <div
          className="hidden gap-9 sm:flex"
          style={{ alignItems: "center" }}
        >
          <a
            href="#benefices"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Fonctionnalités
          </a>
          <a
            href="#test-presence"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Tester ma présence Google
          </a>
          <a
            href="#bientot"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            À venir
          </a>
          <Link
            href="/login"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Connexion
          </Link>
        </div>
        <Link
          href="/login"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 20px",
            borderRadius: 8,
          }}
        >
          Essayer gratuitement
        </Link>
      </div>

      {/* HERO */}
      <div
        className="flex-col sm:flex-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 64,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "56px 32px 100px",
        }}
      >
        <div
          style={{
            flex: "1 1 480px",
            display: "flex",
            flexDirection: "column",
            gap: 26,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              alignSelf: "flex-start",
              background: "var(--accent-soft)",
              border: "1px solid var(--line)",
              borderRadius: 100,
              padding: "6px 14px 6px 10px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--ink-soft)",
                letterSpacing: "0.02em",
              }}
            >
              Pensé pour les restaurateurs indépendants et petits groupes
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: 56,
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              textWrap: "pretty",
            }}
          >
            Votre présence en ligne,{" "}
            <em style={{ fontStyle: "italic", color: "var(--accent-dark)" }}>
              enfin claire
            </em>
            .
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 18,
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              maxWidth: 480,
            }}
          >
            Klarr réunit votre fiche Google Business Profile et votre
            référencement local dans un seul tableau de bord — pensé pour un
            restaurateur, pas pour une agence marketing.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 8,
            }}
          >
            <Link
              href="/login"
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                fontSize: 15,
                fontWeight: 600,
                padding: "14px 26px",
                borderRadius: 9,
              }}
            >
              Essayer gratuitement
            </Link>
            <a
              href="#benefices"
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Voir comment ça marche
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div style={{ flex: "1 1 420px", minWidth: 0, width: "100%" }}>
          <div
            style={{
              background: "var(--paper)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 24px 60px -20px oklch(20% 0.02 60 / 22%)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 18px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--line)",
                }}
              />
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--line)",
                }}
              />
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--line)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  marginLeft: 8,
                }}
              >
                Mes restaurants
              </span>
            </div>
            <div
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    Le Petit Bouchon
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--accent-soft)",
                      borderRadius: 100,
                      padding: "4px 10px",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "oklch(62% 0.15 145)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: "var(--ink-soft)",
                      }}
                    >
                      Google connecté
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: "var(--ink-soft)",
                      background: "var(--bg-alt)",
                      borderRadius: 100,
                      padding: "4px 10px",
                    }}
                  >
                    bistrot lyonnais
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: "var(--ink-soft)",
                      background: "var(--bg-alt)",
                      borderRadius: 100,
                      padding: "4px 10px",
                    }}
                  >
                    restaurant Lyon 6
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: "var(--ink-soft)",
                      background: "var(--bg-alt)",
                      borderRadius: 100,
                      padding: "4px 10px",
                    }}
                  >
                    +3
                  </span>
                </div>
              </div>
              <div
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: 0.55,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>
                  Chez Marcel
                </span>
                <span
                  style={{ fontSize: 11.5, fontWeight: 500, color: "var(--ink-soft)" }}
                >
                  2 mots-clés
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BENEFITS */}
      <div id="benefices" style={{ background: "var(--bg-alt)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              maxWidth: 560,
              marginBottom: 56,
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
              Fonctionnalités
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
              Trois choses à faire. Rien à apprendre.
            </h2>
          </div>
          <div
            className="flex-col sm:flex-row"
            style={{ display: "flex", gap: 40 }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-dark)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 21,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Votre fiche Google, sous contrôle
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
                Connectez votre compte Google Business Profile en un clic et
                gardez la main sur votre présence, restaurant par restaurant.
              </p>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-dark)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 21,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Un SEO qui avance vraiment
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
                Ciblez vos mots-clés locaux et laissez Claude, l&apos;IA
                d&apos;Anthropic, en évaluer la pertinence et vous en suggérer
                de nouveaux.
              </p>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 11,
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-dark)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 21,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Tout centralisé, zéro prise de tête
              </h3>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
                Un espace unique pour tous vos restaurants, sans jongler entre
                dix outils et dix mots de passe différents.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FREE GOOGLE PRESENCE TEST */}
      <div id="test-presence" style={{ maxWidth: 1180, margin: "0 auto", padding: "90px 32px" }}>
        <div
          className="flex-col sm:flex-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 32,
            background: "var(--accent-soft)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: "44px 48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent-dark)",
              }}
            >
              Gratuit, sans engagement
            </span>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: 30,
                lineHeight: 1.25,
              }}
            >
              Pas encore client ? Testez votre présence sur Google.
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
              En 2 minutes, on analyse la fiche Google de votre restaurant et
              on vous envoie un score de visibilité détaillé, gratuitement.
            </p>
          </div>
          <Link
            href="/test-presence-google"
            className="btn-primary"
            style={{
              flexShrink: 0,
              background: "var(--ink)",
              color: "var(--paper)",
              fontSize: 15,
              fontWeight: 600,
              padding: "15px 28px",
              borderRadius: 9,
              whiteSpace: "nowrap",
            }}
          >
            Faire mon test gratuit
          </Link>
        </div>
      </div>

      {/* COMING SOON */}
      <div id="bientot" style={{ maxWidth: 1180, margin: "0 auto", padding: "0px 32px 90px" }}>
        <div
          className="flex-col sm:flex-row"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink-soft)",
              }}
            >
              Bientôt sur Klarr
            </span>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontWeight: 400,
                margin: 0,
                fontSize: 30,
                lineHeight: 1.25,
              }}
            >
              Et la suite est déjà en préparation.
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
              Réponses automatiques aux avis Google, création et programmation
              de posts avec photos, statistiques de fréquentation de votre
              fiche.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", maxWidth: 420 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-soft)",
                background: "var(--bg-alt)",
                border: "1px solid var(--line)",
                borderRadius: 100,
                padding: "8px 16px",
              }}
            >
              Réponses aux avis
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-soft)",
                background: "var(--bg-alt)",
                border: "1px solid var(--line)",
                borderRadius: 100,
                padding: "8px 16px",
              }}
            >
              Posts programmés
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ink-soft)",
                background: "var(--bg-alt)",
                border: "1px solid var(--line)",
                borderRadius: 100,
                padding: "8px 16px",
              }}
            >
              Statistiques de vues
            </span>
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div id="cta" style={{ background: "var(--ink)", padding: "90px 32px" }}>
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 24,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: 38,
              lineHeight: 1.2,
              color: "var(--paper)",
            }}
          >
            Prêt à y voir plus clair ?
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "oklch(80% 0.01 60)" }}>
            Créez votre compte et connectez votre premier restaurant en moins
            de cinq minutes.
          </p>
          <Link
            href="/login"
            style={{
              background: "var(--accent)",
              color: "var(--paper)",
              fontSize: 15,
              fontWeight: 600,
              padding: "15px 30px",
              borderRadius: 9,
            }}
          >
            Essayer gratuitement
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "36px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-instrument-serif), serif", fontSize: 16 }}>
            Klarr
          </span>
        </div>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          © Klarr — fait pour les restaurateurs indépendants et petits groupes.
        </span>
      </div>
    </div>
  );
}
