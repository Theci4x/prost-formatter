import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CadreJournal } from "@/components/blog/CadreJournal";
import { Commis } from "@/components/commis/Commis";
import { siteUrl } from "@/lib/site-url";
import { VISIBILITE_IA } from "@/lib/visibilite-ia/contenu";
import { langueIndexable } from "@/lib/i18n/langue";

const CHEMIN = "/visibilite-restaurant-ia";

/** Les médias vivent dans `public/`, un dossier par langue d'interface. */
const MEDIAS = "/visibilite-ia";

// Captures prises à 1280 × 800, densité 1,5.
const LARGEUR_CAPTURE = 1920;
const HAUTEUR_CAPTURE = 1200;

// Comme le comparatif : `langueIndexable`, pour qu'un robot lise la
// version française à l'adresse canonique.
export async function generateMetadata(): Promise<Metadata> {
  const c = VISIBILITE_IA[await langueIndexable()];
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
  tester,
  essayer,
  sombre = false,
}: {
  tester: string;
  essayer: string;
  sombre?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* Le test gratuit d'abord : quelqu'un qui arrive par cette question
          veut savoir où il en est avant de savoir ce qu'on vend. */}
      <Link
        href="/test-presence-google"
        style={{
          borderRadius: "0.75rem",
          background: sombre ? "var(--accent)" : "var(--ink)",
          color: sombre ? "#fff" : "var(--paper)",
          padding: "0.85rem 1.4rem",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {tester}
      </Link>
      <Link
        href="/login"
        style={{
          borderRadius: "0.75rem",
          border: sombre
            ? "1px solid rgba(255,255,255,0.5)"
            : "1px solid var(--ink)",
          color: sombre ? "var(--paper)" : "var(--ink)",
          padding: "0.85rem 1.4rem",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {essayer}
      </Link>
    </div>
  );
}

export default async function VisibiliteIaPage() {
  const langue = await langueIndexable();
  const c = VISIBILITE_IA[langue];
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
      thumbnailUrl: `${siteUrl()}${dossier}/demo.jpg`,
      contentUrl: `${siteUrl()}${dossier}/demo.mp4`,
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
          <Boutons tester={c.tester} essayer={c.essayer} />
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            {c.sousBoutons}
          </p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.changeTitre}
          </h2>
          {c.change.map((paragraphe) => (
            <p key={paragraphe} style={TEXTE_DOUX}>
              {paragraphe}
            </p>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif" style={TITRE_SECTION}>
              {c.criteresTitre}
            </h2>
            <p style={TEXTE_DOUX}>{c.criteresChapo}</p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {c.criteres.map((critere, rang) => (
              <li
                key={critere.titre}
                className="flex gap-3"
                style={{ ...CARTE, padding: "1.1rem 1.2rem" }}
              >
                <span
                  aria-hidden
                  className="font-serif"
                  style={{
                    flex: "none",
                    fontSize: "1.6rem",
                    lineHeight: 1,
                    color: "var(--accent-dark)",
                  }}
                >
                  {rang + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span style={{ fontWeight: 700 }}>{critere.titre}</span>
                  <span
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: "var(--ink-soft)",
                    }}
                  >
                    {critere.texte}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.mesurerTitre}
          </h2>
          {c.mesurer.map((paragraphe) => (
            <p key={paragraphe} style={TEXTE_DOUX}>
              {paragraphe}
            </p>
          ))}
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="video">
          <h2 id="video" className="font-serif" style={TITRE_SECTION}>
            {c.video.titre}
          </h2>
          {/* Muette et sous-titrée à l'image, chargée au clic seulement :
              même règle que la vidéo de la page réservations. */}
          <video
            controls
            muted
            playsInline
            preload="none"
            poster={`${dossier}/demo.jpg`}
            aria-describedby="video-description"
            style={{
              width: "100%",
              aspectRatio: "16 / 10",
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--bg-alt)",
            }}
          >
            <source src={`${dossier}/demo.mp4`} type="video/mp4" />
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
              {c.klarrTitre}
            </h2>
            <p style={TEXTE_DOUX}>{c.klarrChapo}</p>
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

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.fonctionsTitre}
          </h2>
          <ul
            className="flex flex-col gap-2.5"
            style={{ ...CARTE, padding: "1.2rem 1.4rem" }}
          >
            {c.fonctions.map((ligne) => (
              <li
                key={ligne}
                className="flex gap-2.5"
                style={{ fontSize: 15, lineHeight: 1.6 }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: "none",
                    marginTop: "0.7em",
                    width: 10,
                    height: 1.5,
                    background: "var(--accent-dark)",
                  }}
                />
                <span>{ligne}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif" style={TITRE_SECTION}>
            {c.assistantsTitre}
          </h2>
          <p style={TEXTE_DOUX}>{c.assistants}</p>
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
          <ul className="flex flex-col gap-2" style={{ fontSize: 15.5 }}>
            {c.frais.map((ligne) => (
              <li key={ligne} style={{ lineHeight: 1.6 }}>
                — {ligne}
              </li>
            ))}
          </ul>
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
          <Boutons tester={c.tester} essayer={c.essayer} sombre />
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
