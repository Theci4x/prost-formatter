import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { CadreJournal, Separateur } from "@/components/blog/CadreJournal";
import { Couverture } from "@/components/blog/Couverture";
import { rubriquesBlog, tousLesBillets, dateLisible } from "@/lib/blog/billets";
import {
  LANGUES_JOURNAL,
  tempsDeLecture,
  titreCategorieBillet,
} from "@/types/blog";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Le journal",
  description:
    "Ouvrir un restaurant, remplir sa salle, tenir la maison. Des articles écrits à partir de ce qu'on a vu marcher — et de ce qu'on a raté.",
  alternates: {
    canonical: "/blog",
    // Les index anglais et chinois désignent déjà celui-ci. Un lien
    // « hreflang » ne compte que s'il est rendu : Google écarte tout le
    // groupe quand la page pointée ne renvoie pas vers celles qui la
    // citent — les trois index se seraient concurrencés en silence.
    languages: { fr: "/blog", en: "/blog/en", zh: "/blog/zh" },
  },
};

export default function BlogPage() {
  const rubriques = rubriquesBlog();
  const billets = tousLesBillets();
  const site = siteUrl();
  const [premier, ...suivants] = billets;

  return (
    <>
      <CadreJournal
        large
        langue="fr"
        // L'index existe dans les trois langues : d'où qu'on vienne, le
        // sélecteur a une page à proposer.
        journal={{ langues: LANGUES_JOURNAL }}
        fil={
          <>
            <Separateur />
            <span style={{ fontSize: 14 }}>Le journal</span>
          </>
        }
      >
        <DonneesStructurees
          donnees={{
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Le journal de Klarr",
            url: `${site}/blog`,
            blogPost: billets.map((billet) => ({
              "@type": "BlogPosting",
              headline: billet.titre,
              description: billet.resume,
              datePublished: billet.publieLe,
              dateModified: billet.misAJourLe,
              image: `${site}/blog/${billet.slug}/opengraph-image`,
              url: `${site}/blog/${billet.slug}`,
            })),
          }}
        />

        <div className="flex flex-col gap-3">
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(2.25rem, 7vw, 3.25rem)",
              lineHeight: 1.05,
              color: "var(--ink)",
            }}
          >
            Le journal
          </h1>
          <p style={{ maxWidth: "36rem", fontSize: 17, lineHeight: 1.65 }}>
            Ce qu&apos;on aurait aimé lire avant d&apos;ouvrir un restaurant, et
            ce qu&apos;on a appris depuis. Les articles qui affirment une
            obligation légale citent leurs sources et portent leur date : ces
            règles changent.
          </p>
        </div>

        {/* Le premier article en grand. Un sommaire où tout se vaut ne dit
            pas par où commencer ; celui-ci le dit. */}
        {premier && (
          <Link
            href={`/blog/${premier.slug}`}
            className="group flex flex-col overflow-hidden"
            style={{
              borderRadius: "1.25rem",
              border: "1px solid var(--line)",
              background: "var(--paper)",
            }}
          >
            <Couverture
              slug={premier.slug}
              rubrique={titreCategorieBillet(premier.categorie)}
              image={premier.image}
              ratio={5}
              ratioPhoto={2}
            />
            <div className="flex flex-col gap-2 p-6">
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--accent-dark)",
                }}
              >
                À lire en premier
              </span>
              <span
                style={{
                  fontFamily: "var(--font-instrument-serif), Georgia, serif",
                  fontSize: "1.75rem",
                  lineHeight: 1.15,
                  color: "var(--ink)",
                }}
              >
                {premier.titre}
              </span>
              <span style={{ fontSize: 15.5, lineHeight: 1.6 }}>
                {premier.resume}
              </span>
              <span style={{ fontSize: 13 }}>
                {dateLisible(premier.misAJourLe)} ·{" "}
                {tempsDeLecture(premier.markdown)} min de lecture
              </span>
            </div>
          </Link>
        )}

        {rubriques.map((rubrique) => {
          const restants = rubrique.billets.filter((billet) =>
            suivants.some((autre) => autre.slug === billet.slug),
          );
          if (restants.length === 0) return null;

          return (
            <section key={rubrique.cle} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <h2
                  style={{
                    fontFamily: "var(--font-instrument-serif), Georgia, serif",
                    fontSize: "1.65rem",
                    lineHeight: 1.15,
                    color: "var(--ink)",
                  }}
                >
                  {rubrique.titre}
                </h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.6 }}>
                  {rubrique.resume}
                </p>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2">
                {restants.map((billet) => (
                  <li key={billet.slug} className="flex">
                    <Link
                      href={`/blog/${billet.slug}`}
                      className="flex w-full flex-col overflow-hidden"
                      style={{
                        borderRadius: "1.1rem",
                        border: "1px solid var(--line)",
                        background: "var(--paper)",
                      }}
                    >
                      <Couverture
                        slug={billet.slug}
                        rubrique={titreCategorieBillet(billet.categorie)}
                        image={billet.image}
                      />
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <span
                          style={{
                            fontSize: 16.5,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            color: "var(--ink)",
                          }}
                        >
                          {billet.titre}
                        </span>
                        <span style={{ fontSize: 14.5, lineHeight: 1.6 }}>
                          {billet.resume}
                        </span>
                        <span style={{ marginTop: "auto", fontSize: 12.5 }}>
                          {dateLisible(billet.misAJourLe)} ·{" "}
                          {tempsDeLecture(billet.markdown)} min de lecture
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </CadreJournal>
      <Commis />
    </>
  );
}
