import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KlarrMark } from "@/components/brand/KlarrMark";
import { ClientLogos } from "@/components/landing/ClientLogos";
import { Comparison } from "@/components/landing/Comparison";
import { Founder, Problem } from "@/components/landing/Manifesto";
import { Partner } from "@/components/landing/Partner";
import { Journal } from "@/components/landing/Journal";
import { Reservation } from "@/components/landing/Reservation";
import { Tarifs } from "@/components/landing/Tarifs";
import { HeroBackdrop } from "@/components/landing/HeroBackdrop";
import { HeroProduit } from "@/components/landing/HeroProduit";
import { Reveal } from "@/components/landing/Reveal";

import type { Metadata } from "next";
import { Commis } from "@/components/commis/Commis";

export const metadata: Metadata = {
  // La page d'accueil garde le titre par défaut du gabarit, mais elle a
  // droit à sa propre adresse canonique : sans elle, klarr.net et
  // www.klarr.net se font concurrence dans l'index de Google.
  alternates: { canonical: "/" },
};

const ACCENT = "#E8871E";

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
      className="klarr-grain"
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
        position: "relative",
      }}
    >
      {/* Tache décorative derrière le hero, même esprit que le panneau de connexion */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -120,
          right: -160,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "var(--accent)",
          opacity: 0.14,
          filter: "blur(110px)",
          pointerEvents: "none",
        }}
      />

      {/* NAV */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1180,
          margin: "0 auto",
          gap: 12,
        }}
        className="px-5 py-6 sm:px-8 sm:py-7"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <KlarrMark size={28} />
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
        <div className="hidden gap-9 sm:flex" style={{ alignItems: "center" }}>
          <a
            href="#benefices"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Comment ça marche
          </a>
          <a
            href="#test-presence"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Tester ma présence Google
          </a>
          <a
            href="#tarifs"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Tarifs
          </a>
          <Link
            href="/login"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Connexion
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link
            href="/login"
            className="sm:hidden"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            Connexion
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap px-4 py-2.5 sm:px-5"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            {/* « gratuitement » ne tient pas à côté de « Connexion » sur un
                téléphone étroit, et le bouton sortait de l'écran. */}
            <span className="sm:hidden">Essayer</span>
            <span className="hidden sm:inline">Essayer gratuitement</span>
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative" }}>
        <HeroBackdrop />
        <div
          className="flex-col px-5 pt-8 pb-16 sm:flex-row sm:px-8 sm:pt-12 sm:pb-24"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 56,
            maxWidth: 1180,
            margin: "0 auto",
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
                fontSize: "clamp(40px, 5vw, 66px)",
                lineHeight: 1.04,
                letterSpacing: "-0.015em",
                textWrap: "pretty",
              }}
            >
              Vos réservations sans commission.{" "}
              <em style={{ fontStyle: "italic", color: "var(--accent-dark)" }}>
                Votre visibilité sans y penser
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
              Le carnet, la vitrine, les avis et la fiche Google au même
              endroit. Les acomptes vont sur votre compte, pas le nôtre. Et
              chaque chiffre vient avec la donnée brute derrière, que vous
              pouvez vérifier vous-même.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px 22px",
                marginTop: 8,
              }}
            >
              <Link
                href="/test-presence-google"
                className="btn-primary"
                style={{
                  background: "var(--ink)",
                  color: "var(--paper)",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "15px 26px",
                  borderRadius: 10,
                  boxShadow: "0 14px 30px -14px oklch(20% 0.02 60 / 50%)",
                }}
              >
                Tester ma présence Google — gratuit
              </Link>
              <Link
                href="/login"
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Essayer Klarr gratuitement
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
              </Link>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--ink-soft)",
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 10px",
              }}
            >
              <span>Sans carte bancaire</span>
              <span aria-hidden="true">·</span>
              <span>Sans engagement</span>
              <span aria-hidden="true">·</span>
              <span>Résiliable en un clic</span>
            </p>
          </div>

          <div
            style={{
              flex: "1 1 420px",
              minWidth: 0,
              width: "100%",
              position: "relative",
            }}
          >
            <HeroProduit />
          </div>
        </div>
      </div>

      <Reveal>
        <ClientLogos />
      </Reveal>

      <Reveal>
        <Problem />
      </Reveal>

      {/* BENEFITS */}
      <div
        id="benefices"
        className="px-5 py-20 sm:px-8 sm:py-24"
        style={{ background: "var(--bg-alt)" }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              maxWidth: 560,
              marginBottom: 44,
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
              Comment ça marche
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
              La donnée brute, l&apos;historique, et ce qui cloche.
            </h2>
          </div>
          <div
            className="flex-col sm:flex-row"
            style={{ display: "flex", gap: 20 }}
          >
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: "30px 28px 32px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 22,
                  right: 26,
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 40,
                  lineHeight: 1,
                  color: "var(--accent-dark)",
                  opacity: 0.55,
                }}
              >
                01
              </span>
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
                  fontSize: 20,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  margin: 0,
                  paddingRight: 56,
                }}
              >
                La donnée brute
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "var(--ink-soft)",
                }}
              >
                Votre fiche Google telle qu&apos;elle est, vos avis tels
                qu&apos;ils sont écrits, et la réponse exacte que donne une IA
                quand un client demande où manger. Vous pouvez reposer la même
                question de votre côté et retomber sur la même chose.
              </p>
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: "30px 28px 32px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 22,
                  right: 26,
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 40,
                  lineHeight: 1,
                  color: "var(--accent-dark)",
                  opacity: 0.55,
                }}
              >
                02
              </span>
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
                  fontSize: 20,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  margin: 0,
                  paddingRight: 56,
                }}
              >
                L&apos;historique, pas le pipeau
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "var(--ink-soft)",
                }}
              >
                Chaque analyse est horodatée et conservée. Même quand c&apos;est
                mauvais. Surtout quand c&apos;est mauvais — vous voyez si vous
                montez ou si vous descendez.
              </p>
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 20,
                padding: "30px 28px 32px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 22,
                  right: 26,
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: 40,
                  lineHeight: 1,
                  color: "var(--accent-dark)",
                  opacity: 0.55,
                }}
              >
                03
              </span>
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
                  fontSize: 20,
                  fontFamily: "var(--font-manrope), sans-serif",
                  fontWeight: 700,
                  margin: 0,
                  paddingRight: 56,
                }}
              >
                Ce qui cloche, pas la tape dans le dos
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "var(--ink-soft)",
                }}
              >
                On ne vous félicite pas. On vous montre les questions où vous
                n&apos;apparaissez pas, et ce qui manque sur votre fiche. Utile
                plutôt qu&apos;agréable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Reveal>
        <Comparison />
      </Reveal>

      <Reveal>
        <Reservation />
      </Reveal>

      <Reveal>
        <Tarifs />
      </Reveal>

      <Reveal>
        <Founder />
      </Reveal>

      <Reveal>
        <Partner />
      </Reveal>

      {/* FREE GOOGLE PRESENCE TEST */}
      <div
        id="test-presence"
        style={{ maxWidth: 1180, margin: "0 auto", padding: "90px 32px" }}
      >
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxWidth: 560,
            }}
          >
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
                <path d="M18 10c0 5-6 11-6 11s-6-6-6-11a6 6 0 0 1 12 0z" />
                <circle cx="12" cy="10" r="4.2" />
                <path d="M20.5 20.5l-3-3" />
              </svg>
            </div>
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
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink-soft)",
              }}
            >
              En 2 minutes, on analyse la fiche Google de votre restaurant et on
              vous envoie un score de visibilité détaillé, gratuitement.
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
      <div
        id="bientot"
        style={{ maxWidth: 1180, margin: "0 auto", padding: "0px 32px 90px" }}
      >
        <div
          className="flex-col sm:flex-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxWidth: 480,
            }}
          >
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
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink-soft)",
              }}
            >
              Les réponses aux avis, les posts programmés et le suivi de
              position sont arrivés. Voilà ce qui manque encore — et on le dit
              aussi franchement.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              maxWidth: 420,
            }}
          >
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
              Statistiques du carnet
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
              Fichier client
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
              Statistiques de la fiche Google
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
              Liste d&apos;attente
            </span>
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <Reveal>
        <div
          id="cta"
          style={{ background: "var(--ink)", padding: "90px 32px" }}
        >
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
              Votre fiche Google, sans filtre marketing.
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.6,
                color: "oklch(80% 0.01 60)",
              }}
            >
              Pas de carte bancaire. Pas d&apos;engagement. Pas de discours.
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
              Vérifier ma visibilité — gratuit, 2 minutes
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <Journal />
      </Reveal>

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
          <KlarrMark size={20} />
          <span
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 16,
            }}
          >
            Klarr
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 18,
            fontSize: 13,
            color: "var(--ink-soft)",
          }}
        >
          {/* Le journal en tête du pied de page : c'est la porte d'entrée
              de ceux qui arrivent par une recherche, et la seule page du
              site qui leur parle avant qu'ils sachent ce qu'est Klarr. */}
          <Link href="/blog" style={{ color: "inherit" }}>
            Le journal
          </Link>
          <Link href="/aide" style={{ color: "inherit" }}>
            Aide
          </Link>
          <Link href="/mentions-legales" style={{ color: "inherit" }}>
            Mentions légales
          </Link>
          <Link href="/cgu" style={{ color: "inherit" }}>
            Conditions d&apos;utilisation
          </Link>
          <Link href="/confidentialite" style={{ color: "inherit" }}>
            Confidentialité
          </Link>
          <Link href="/suppression-donnees" style={{ color: "inherit" }}>
            Suppression des données
          </Link>
          <a href="mailto:contact@klarr.net" style={{ color: "inherit" }}>
            contact@klarr.net
          </a>
          <span>© 2026 Klarr — édité par EDIREF.</span>
        </div>
      </div>
      <Commis />
    </div>
  );
}
