import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Commis } from "@/components/commis/Commis";
import { CadreJournal, Separateur } from "@/components/blog/CadreJournal";
import { InvitationTest } from "@/components/blog/InvitationTest";
import { Couverture } from "@/components/blog/Couverture";
import {
  billetParSlug,
  dateLisible,
  memeRubrique,
  tousLesBillets,
} from "@/lib/blog/billets";
import { rendreBillet } from "@/lib/blog/rendu";
import { tempsDeLecture, titreCategorieBillet } from "@/types/blog";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";

type Params = { slug: string };

// Les billets ne changent qu'avec un déploiement : autant les construire
// une fois pour toutes.
export function generateStaticParams() {
  return tousLesBillets().map((billet) => ({ slug: billet.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const billet = billetParSlug(slug);
  if (!billet) return { title: "Le journal" };

  return {
    title: billet.titre,
    description: billet.resume,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: billet.titre,
      description: billet.resume,
      publishedTime: billet.publieLe,
      modifiedTime: billet.misAJourLe,
    },
  };
}

export default async function BilletPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const billet = billetParSlug(slug);
  if (!billet) notFound();

  // Le contenu vient du dépôt, pas d'un utilisateur : il n'y a pas de saisie
  // hostile à filtrer ici, seulement notre propre texte.
  const { html, sommaire } = await rendreBillet(billet.markdown);
  const voisins = memeRubrique(billet);
  const site = siteUrl();
  const couverture = `/blog/${billet.slug}/opengraph-image`;

  return (
    <>
      <CadreJournal
        fil={
          <>
            <Separateur />
            <Link href="/blog" style={{ fontSize: 14 }}>
              Le journal
            </Link>
            <Separateur />
            <span style={{ fontSize: 14 }}>
              {titreCategorieBillet(billet.categorie)}
            </span>
          </>
        }
      >
        {/* Le balisage d'article porte les deux dates : Google affiche la
            plus récente, et sur un texte réglementaire c'est elle qui dit
            au lecteur s'il peut s'y fier. */}
        <DonneesStructurees
          donnees={{
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: billet.titre,
            description: billet.resume,
            datePublished: billet.publieLe,
            dateModified: billet.misAJourLe,
            inLanguage: "fr-FR",
            image: `${site}${couverture}`,
            mainEntityOfPage: `${site}/blog/${billet.slug}`,
            publisher: {
              "@type": "Organization",
              name: "Klarr",
              url: site,
            },
            ...(billet.sources.length > 0
              ? { citation: billet.sources.map((source) => source.intitule) }
              : {}),
          }}
        />
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Le journal", url: `${site}/blog` },
            { nom: billet.titre, url: `${site}/blog/${billet.slug}` },
          ])}
        />

        <div className="flex flex-col gap-4">
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent-dark)",
            }}
          >
            {titreCategorieBillet(billet.categorie)}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 2.75rem)",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            {billet.titre}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6 }}>{billet.resume}</p>
          <p style={{ fontSize: 13.5 }}>
            Mis à jour le {dateLisible(billet.misAJourLe)} ·{" "}
            {tempsDeLecture(billet.markdown)} min de lecture
          </p>
        </div>

        <div
          style={{
            overflow: "hidden",
            borderRadius: "1rem",
            border: "1px solid var(--line)",
          }}
        >
          <Couverture
            slug={billet.slug}
            rubrique={titreCategorieBillet(billet.categorie)}
            image={billet.image}
            ratio={6}
            ratioPhoto={2}
          />
        </div>
        {billet.image?.credit && (
          <p style={{ marginTop: "-1.25rem", fontSize: 12.5 }}>
            {billet.image.credit}
          </p>
        )}

        {billet.essentiel && billet.essentiel.length > 0 && (
          <section
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              padding: "1.35rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            <h2
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              L&apos;essentiel
            </h2>
            <ul className="flex flex-col gap-2.5">
              {billet.essentiel.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5"
                  style={{ fontSize: 15.5, lineHeight: 1.6 }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      marginTop: 9,
                      width: 6,
                      height: 6,
                      borderRadius: 99,
                      background: "var(--accent)",
                    }}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Un article réglementaire se consulte plus qu'il ne se lit :
            quelqu'un cherche « l'agrément » et veut y aller directement. */}
        {sommaire.length > 2 && (
          <nav
            aria-label="Sommaire"
            style={{
              borderLeft: "2px solid var(--line)",
              paddingLeft: "1.1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.55rem",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink)",
              }}
            >
              Au sommaire
            </span>
            {sommaire.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{ fontSize: 15, lineHeight: 1.45 }}
              >
                {section.titre}
              </a>
            ))}
          </nav>
        )}

        <article
          className="billet"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Les sources ne sont pas une coquetterie : un article qui affirme
            une obligation légale sans dire d'où elle sort ne se vérifie pas,
            et ne se relit pas quand le texte change. */}
        {billet.sources.length > 0 && (
          <section
            style={{
              borderRadius: "1rem",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              padding: "1.35rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              Sources
            </h2>
            <ul className="flex flex-col gap-2">
              {billet.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 14.5,
                      color: "var(--accent-dark)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {source.intitule}
                  </a>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13 }}>
              Ces règles changent. Cet article est à jour au{" "}
              {dateLisible(billet.misAJourLe)} ; confirmez auprès de
              l&apos;administration concernée avant d&apos;engager une dépense.
            </p>
          </section>
        )}

        {voisins.length > 0 && (
          <section
            className="flex flex-col gap-3 pt-2"
            style={{ borderTop: "1px solid var(--line)", paddingTop: "1.5rem" }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              Dans la même rubrique
            </h2>
            <ul className="flex flex-col gap-2">
              {voisins.map((autre) => (
                <li key={autre.slug}>
                  <Link
                    href={`/blog/${autre.slug}`}
                    style={{
                      fontSize: 15,
                      color: "var(--accent-dark)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {autre.titre}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <InvitationTest categorie={billet.categorie} />
      </CadreJournal>
      <Commis />
    </>
  );
}
