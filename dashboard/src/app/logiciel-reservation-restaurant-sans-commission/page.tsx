import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CadreJournal } from "@/components/blog/CadreJournal";
import { Commis } from "@/components/commis/Commis";
import { siteUrl } from "@/lib/site-url";
import { SANS_COMMISSION } from "@/lib/sans-commission/contenu";
import { langueIndexable } from "@/lib/i18n/langue";

const CHEMIN = "/logiciel-reservation-restaurant-sans-commission";

/** Les médias vivent dans `public/`, un dossier par langue d'interface. */
const MEDIAS = "/sans-commission";

// Mêmes proportions pour toutes les captures : 1280 × 800, prises à
// densité 1,5. Les déclarer évite que la page saute à leur chargement.
const LARGEUR_CAPTURE = 1920;
const HAUTEUR_CAPTURE = 1200;

// Comme le comparatif : `langueIndexable` et non l'en-tête du visiteur,
// pour qu'un robot lise la version française à l'adresse canonique.
export async function generateMetadata(): Promise<Metadata> {
  const c = SANS_COMMISSION[await langueIndexable()];
  return {
    title: c.titreSeo,
    description: c.descriptionSeo,
    alternates: { canonical: CHEMIN },
    openGraph: {
      title: c.titreSeo,
      description: c.descriptionSeo,
      url: CHEMIN,
      type: "website",
    },
  };
}

const TITRE_SECTION = { fontSize: "1.7rem" } as const;
const TEXTE_DOUX = {
  fontSize: 15.5,
  lineHeight: 1.7,
  color: "var(--ink-soft)",
} as const;
const CARTE = {
  borderRadius: "1rem",
  border: "1px solid var(--line)",
  background: "var(--paper)",
} as const;

function Boutons({
  essayer,
  demo,
  sujet,
}: {
  essayer: string;
  demo: string;
  sujet: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/login"
        style={{
          borderRadius: "0.75rem",
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "0.85rem 1.4rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {essayer}
      </Link>
      {/* Pas de formulaire de prise de rendez-vous : un e-mail arrive chez
          quelqu'un qui répond, un formulaire de plus finirait dans une
          table que personne ne lit. */}
      <a
        href={`mailto:contact@klarr.net?subject=${encodeURIComponent(sujet)}`}
        style={{
          borderRadius: "0.75rem",
          border: "1px solid var(--ink)",
          color: "var(--ink)",
          padding: "0.85rem 1.4rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {demo}
      </a>
    </div>
  );
}

export default async function SansCommissionPage() {
  const langue = await langueIndexable();
  const c = SANS_COMMISSION[langue];
  const dossier = `${MEDIAS}/${langue}`;

  const balisage = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: c.titreSeo,
      description: c.descriptionSeo,
      url: `${siteUrl()}${CHEMIN}`,
      inLanguage: langue === "zh" ? "zh-CN" : langue,
      publisher: { "@type": "Organization", name: "Klarr", url: siteUrl() },
    },
    {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: c.video.titre,
      description: c.video.description,
      thumbnailUrl: `${siteUrl()}${dossier}/parcours.jpg`,
      contentUrl: `${siteUrl()}${dossier}/parcours.mp4`,
      uploadDate: "2026-09-26",
      duration: "PT45S",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.questions.map(({ question, reponse }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: reponse },
      })),
    },
  ];

  return (
    <>
      <CadreJournal fil={c.fil} large langue={langue}>
        {balisage.map((bloc, rang) => (
          <script
            key={rang}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(bloc).replace(/</g, "\\u003c"),
            }}
          />
        ))}

        <header className="flex flex-col gap-5">
          <h1
            className="font-serif"
            style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)", lineHeight: 1.1 }}
          >
            {c.titre}
          </h1>
          <p
            style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)" }}
          >
            {c.chapo}
          </p>
          <Boutons essayer={c.essayer} demo={c.demo} sujet={c.sujetDemo} />
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            {c.sousBoutons}
          </p>
        </header>

        <section className="flex flex-col gap-3" aria-labelledby="video">
          <h2 id="video" className="font-serif" style={TITRE_SECTION}>
            {c.video.titre}
          </h2>
          {/* Sans son et sous-titrée à l'image : elle peut démarrer seule,
              et se comprend dans un open space comme dans le métro. Elle
              ne se charge qu'au clic — quatre mégaoctets imposés à chaque
              visiteur ralentiraient la page pour ceux qui ne la regardent
              pas. */}
          <video
            controls
            muted
            playsInline
            preload="none"
            poster={`${dossier}/parcours.jpg`}
            aria-describedby="video-description"
            style={{
              width: "100%",
              aspectRatio: "16 / 10",
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--bg-alt)",
            }}
          >
            <source src={`${dossier}/parcours.mp4`} type="video/mp4" />
          </video>
          <p id="video-description" className="sr-only">
            {c.video.description}
          </p>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            {c.video.legende}
          </p>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif" style={TITRE_SECTION}>
              {c.commentTitre}
            </h2>
            <p style={TEXTE_DOUX}>{c.commentChapo}</p>
          </div>
          <ol className="flex flex-col gap-8">
            {c.etapes.map((etape) => (
              <li key={etape.capture} className="flex flex-col gap-3">
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{etape.titre}</h3>
                <p style={TEXTE_DOUX}>{etape.texte}</p>
                <figure className="flex flex-col gap-1.5">
                  <a
                    href={`${dossier}/${etape.capture}.jpg`}
                    target="_blank"
                    rel="noopener"
                  >
                    {/* Sur un téléphone, la capture tient en 350 pixels : on la
                        laisse s'ouvrir en grand. */}
                    <Image
                      src={`${dossier}/${etape.capture}.jpg`}
                      alt={etape.alt}
                      width={LARGEUR_CAPTURE}
                      height={HAUTEUR_CAPTURE}
                      sizes="(min-width: 960px) 896px, 100vw"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "0.9rem",
                        border: "1px solid var(--line)",
                      }}
                    />
                  </a>
                  <figcaption
                    style={{ fontSize: 12.5, color: "var(--ink-soft)" }}
                  >
                    {c.captureDemo}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.fonctionsTitre}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {c.fonctions.map((groupe) => (
              <div
                key={groupe.titre}
                style={{ ...CARTE, padding: "1.2rem 1.3rem" }}
              >
                <p style={{ fontWeight: 700, marginBottom: "0.7rem" }}>
                  {groupe.titre}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {groupe.lignes.map((ligne) => (
                    <li
                      key={ligne}
                      className="flex gap-2.5"
                      style={{ fontSize: 14.5, lineHeight: 1.55 }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flex: "none",
                          marginTop: "0.6em",
                          width: 10,
                          height: 1.5,
                          background: "var(--accent-dark)",
                        }}
                      />
                      <span>{ligne}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.limitesTitre}
          </h2>
          {c.limites.map((limite) => (
            <div
              key={limite.titre}
              style={{ ...CARTE, padding: "1.2rem 1.4rem" }}
            >
              <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
                {limite.titre}
              </p>
              <p style={{ ...TEXTE_DOUX, fontSize: 15 }}>{limite.texte}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.tarifsTitre}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {c.tarifs.map((tarif) => (
              <div
                key={tarif.nom}
                style={{ ...CARTE, padding: "1.2rem 1.4rem" }}
              >
                <p style={{ fontWeight: 600 }}>{tarif.nom}</p>
                <p
                  className="font-serif"
                  style={{ fontSize: "1.6rem", margin: "0.3rem 0" }}
                >
                  {tarif.prix}
                </p>
                <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                  {tarif.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <p style={{ fontWeight: 600 }}>{c.fraisTitre}</p>
            <ul className="flex flex-col gap-2" style={{ fontSize: 15.5 }}>
              {c.frais.map((ligne) => (
                <li key={ligne} style={{ lineHeight: 1.6 }}>
                  — {ligne}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.questionsTitre}
          </h2>
          <div
            className="flex flex-col divide-y"
            style={{ ...CARTE, borderColor: "var(--line)" }}
          >
            {c.questions.map(({ question, reponse }) => (
              <details key={question} className="group px-5 py-4">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between gap-4"
                  style={{ fontSize: 15, fontWeight: 600 }}
                >
                  {question}
                  <span
                    aria-hidden
                    className="transition-transform group-open:rotate-45"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    +
                  </span>
                </summary>
                <p style={{ ...TEXTE_DOUX, fontSize: 15, marginTop: "0.6rem" }}>
                  {reponse}
                </p>
              </details>
            ))}
          </div>
        </section>

        <aside
          className="flex flex-col gap-4"
          style={{
            borderRadius: "1rem",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "1.8rem 1.6rem",
          }}
        >
          <h2 className="font-serif" style={{ fontSize: "1.8rem" }}>
            {c.finTitre}
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, opacity: 0.85 }}>
            {c.finTexte}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              style={{
                borderRadius: "0.75rem",
                background: "var(--accent)",
                color: "#fff",
                padding: "0.85rem 1.4rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {c.essayer}
            </Link>
            <a
              href={`mailto:contact@klarr.net?subject=${encodeURIComponent(c.sujetDemo)}`}
              style={{
                borderRadius: "0.75rem",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "var(--paper)",
                padding: "0.85rem 1.4rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {c.demo}
            </a>
          </div>
        </aside>

        <nav className="flex flex-col gap-2" aria-label={c.pourAllerPlusLoin}>
          <p style={{ fontWeight: 600 }}>{c.pourAllerPlusLoin}</p>
          <ul className="flex flex-col gap-1.5" style={{ fontSize: 15 }}>
            {c.liens.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  style={{ color: "var(--accent-dark)", fontWeight: 600 }}
                >
                  {lien.texte} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </CadreJournal>
      <Commis />
    </>
  );
}
