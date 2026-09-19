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
import { Faq } from "@/components/landing/Faq";
import { balisageAccueil } from "@/lib/seo/klarr";
import { ACCUEIL_PUBLIC } from "@/lib/i18n/accueilPublic";
import { langueIndexable } from "@/lib/i18n/langue";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";
import { HeroBackdrop } from "@/components/landing/HeroBackdrop";
import { HeroProduit } from "@/components/landing/HeroProduit";
import { Reveal } from "@/components/landing/Reveal";

import type { Metadata } from "next";
import { Commis } from "@/components/commis/Commis";

// Le titre et la description suivent la langue lue, l'adresse canonique
// non : klarr.net et www.klarr.net se feraient concurrence dans l'index,
// et les trois langues vivent à la même adresse — il n'y a donc qu'une
// page à déclarer, pas trois.
export async function generateMetadata(): Promise<Metadata> {
  const t = ACCUEIL_PUBLIC[await langueIndexable()].meta;
  return {
    title: { absolute: t.titre },
    description: t.description,
    alternates: { canonical: "/" },
  };
}

const ACCENT = "#E8871E";

// Une icône par bénéfice, dans l'ordre des cartes du dictionnaire. Elles
// vivent hors de la boucle parce qu'un dessin ne se traduit pas — et
// hors du composant parce qu'elles ne dépendent de rien.
const ICONES_BENEFICES = [
  <svg
    key="1"
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
  </svg>,
  <svg
    key="2"
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
  </svg>,
  <svg
    key="3"
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
  </svg>,
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  // Le témoin seul, jamais « Accept-Language » : voir `langueIndexable`.
  // Un robot doit toujours tomber sur la même page, sinon le balisage
  // FAQ et la fiche de résultat cessent de correspondre au texte.
  const langue = await langueIndexable();
  const t = ACCUEIL_PUBLIC[langue];

  return (
    <div
      // Les trois langues partagent une adresse ; c'est donc l'attribut
      // qui dit laquelle est servie, au lecteur d'écran comme au moteur.
      lang={langue}
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
      {/* Ce que Klarr déclare aux moteurs et aux assistants. La doc de
          Next le veut dans la page et non dans le <head>, et l'échappement
          de « < » évite qu'une chaîne du balisage ne ferme le script. */}
      {balisageAccueil(langue).map((bloc, rang) => (
        <script
          key={rang}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(bloc).replace(/</g, "\\u003c"),
          }}
        />
      ))}

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
            {t.nav.fonctionnement}
          </a>
          <a
            href="#test-presence"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            {t.nav.test}
          </a>
          <a
            href="#tarifs"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            {t.nav.tarifs}
          </a>
          <Link
            href="/login"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            {t.nav.connexion}
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avant le bouton d'essai et visible dès le téléphone : quelqu'un
              qui ne lit pas le français doit pouvoir en sortir sans avoir
              à faire défiler toute la page. */}
          <ChoixLangueSite courante={langue} />
          <Link
            href="/login"
            className="sm:hidden"
            style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-soft)" }}
          >
            {t.nav.connexion}
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
            <span className="sm:hidden">{t.nav.essayerCourt}</span>
            <span className="hidden sm:inline">{t.nav.essayer}</span>
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
                {t.hero.badge}
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
              {t.hero.titreDebut}{" "}
              <em style={{ fontStyle: "italic", color: "var(--accent-dark)" }}>
                {t.hero.titreAccent}
              </em>
              {t.hero.titreFin}
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
              {t.hero.chapo}
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
                {t.hero.ctaTest}
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
                {t.hero.ctaEssai}
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
              {t.hero.garanties.map((garantie, rang) => (
                <span key={garantie} style={{ display: "contents" }}>
                  {rang > 0 && <span aria-hidden="true">·</span>}
                  <span>{garantie}</span>
                </span>
              ))}
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
            <HeroProduit t={t.produit} />
          </div>
        </div>
      </div>

      <Reveal>
        <ClientLogos confiance={t.clients.confiance} />
      </Reveal>

      <Reveal>
        <Problem t={t.probleme} />
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
              {t.benefices.surtitre}
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
              {t.benefices.titre}
            </h2>
          </div>
          <div
            className="flex-col sm:flex-row"
            style={{ display: "flex", gap: 20 }}
          >
            {t.benefices.cartes.map((carte, rang) => (
              <div
                key={carte.titre}
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
                  0{rang + 1}
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
                  {ICONES_BENEFICES[rang]}
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
                  {carte.titre}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "var(--ink-soft)",
                  }}
                >
                  {carte.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Reveal>
        <Comparison t={t.difference} />
      </Reveal>

      <Reveal>
        <Reservation t={t.reservations} />
      </Reveal>

      <Reveal>
        <Tarifs t={t.tarifs} />
      </Reveal>

      <Reveal>
        <Faq t={t.faq} />
      </Reveal>

      <Reveal>
        <Founder t={t.fondateur} />
      </Reveal>

      <Reveal>
        <Partner t={t.editeur} />
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
              {t.test.surtitre}
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
              {t.test.titre}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink-soft)",
              }}
            >
              {t.test.texte}
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
            {t.test.bouton}
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
              {t.bientot.surtitre}
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
              {t.bientot.titre}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.65,
                color: "var(--ink-soft)",
              }}
            >
              {t.bientot.texte}
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
            {t.bientot.puces.map((puce) => (
              <span
                key={puce}
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
                {puce}
              </span>
            ))}
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
              {t.cta.titre}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                lineHeight: 1.6,
                color: "oklch(80% 0.01 60)",
              }}
            >
              {t.cta.texte}
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
              {t.cta.bouton}
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Les articles sont écrits en français et ne sont pas traduits :
          trois cartes françaises au milieu d'une page chinoise donnent
          l'impression d'une page à moitié cassée. Le lien du pied de page
          reste, avec la mention de la langue. Un robot, lui, lit toujours
          la version française — le maillage vers le journal est donc
          intact. */}
      {langue === "fr" && (
        <Reveal>
          <Journal />
        </Reveal>
      )}

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
            {t.pied.journal}
          </Link>
          <Link href="/aide" style={{ color: "inherit" }}>
            {t.pied.aide}
          </Link>
          <Link href="/mentions-legales" style={{ color: "inherit" }}>
            {t.pied.mentions}
          </Link>
          <Link href="/cgu" style={{ color: "inherit" }}>
            {t.pied.cgu}
          </Link>
          <Link href="/confidentialite" style={{ color: "inherit" }}>
            {t.pied.confidentialite}
          </Link>
          <Link href="/suppression-donnees" style={{ color: "inherit" }}>
            {t.pied.suppression}
          </Link>
          <a href="mailto:contact@klarr.net" style={{ color: "inherit" }}>
            contact@klarr.net
          </a>
          <span>{t.pied.copyright}</span>
        </div>
      </div>
      {/* Le Commis ne répond qu'à partir du mode d'emploi, qui est en
          français : lui ouvrir la bulle dans une autre langue, c'est
          promettre une réponse qu'il donnera en français. Même règle que
          pour le journal. */}
      {langue === "fr" && <Commis />}
    </div>
  );
}
