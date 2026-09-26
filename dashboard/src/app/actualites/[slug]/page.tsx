import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CadreJournal, Separateur } from "@/components/blog/CadreJournal";
import { Commis } from "@/components/commis/Commis";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import {
  actualiteParSlug,
  CHEMIN_ACTUALITES,
  toutesLesActualites,
} from "@/lib/actualites";
import { dateLisible } from "@/lib/blog/billets";
import { rendreBillet } from "@/lib/blog/rendu";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";

type Params = { slug: string };

// Une actualité ne change qu'avec un déploiement.
export function generateStaticParams() {
  return toutesLesActualites().map((actualite) => ({ slug: actualite.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const actualite = actualiteParSlug((await params).slug);
  if (!actualite) return { title: "Klarr" };
  return {
    title: actualite.titre,
    description: actualite.resume,
    alternates: { canonical: `${CHEMIN_ACTUALITES}/${actualite.slug}` },
    openGraph: {
      type: "article",
      title: actualite.titre,
      description: actualite.resume,
      publishedTime: actualite.publieLe,
      modifiedTime: actualite.misAJourLe,
      images: [{ url: actualite.image.fichier, width: 1600, height: 900 }],
    },
  };
}

export default async function PageActualite({
  params,
}: {
  params: Promise<Params>;
}) {
  const actualite = actualiteParSlug((await params).slug);
  if (!actualite) notFound();

  const { html } = await rendreBillet(actualite.markdown);
  const site = siteUrl();
  const adresse = `${site}${CHEMIN_ACTUALITES}/${actualite.slug}`;
  const autres = toutesLesActualites()
    .filter((autre) => autre.slug !== actualite.slug)
    .slice(0, 3);

  return (
    <>
      <CadreJournal
        large
        fil={
          <>
            <Separateur />
            <Link href={CHEMIN_ACTUALITES} style={{ fontSize: 14 }}>
              Actualités
            </Link>
          </>
        }
      >
        {/* NewsArticle plutôt que BlogPosting : c'est ce qui permet à
            Google de la ranger parmi les actualités, avec sa date. */}
        <DonneesStructurees
          donnees={{
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: actualite.titre,
            description: actualite.resume,
            datePublished: actualite.publieLe,
            dateModified: actualite.misAJourLe,
            inLanguage: "fr",
            mainEntityOfPage: adresse,
            image: `${site}${actualite.image.fichier}`,
            author: { "@type": "Organization", name: "Klarr", url: site },
            publisher: { "@type": "Organization", name: "Klarr", url: site },
            citation: actualite.sources.map((source) => source.intitule),
          }}
        />
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Actualités", url: `${site}${CHEMIN_ACTUALITES}` },
            { nom: actualite.titre, url: adresse },
          ])}
        />

        <header className="flex flex-col gap-4">
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent-dark)",
            }}
          >
            Actualité · {dateLisible(actualite.publieLe)}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), Georgia, serif",
              fontSize: "clamp(2rem, 6vw, 2.75rem)",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            {actualite.titre}
          </h1>
          <p
            style={{
              fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)",
              lineHeight: 1.6,
            }}
          >
            {actualite.resume}
          </p>
          {actualite.misAJourLe !== actualite.publieLe && (
            <p style={{ fontSize: 13.5 }}>
              Mis à jour le {dateLisible(actualite.misAJourLe)}
            </p>
          )}
        </header>

        <figure className="flex flex-col gap-1.5">
          <Image
            src={actualite.image.fichier}
            alt={actualite.image.alt}
            width={1600}
            height={900}
            priority
            sizes="(min-width: 960px) 896px, 100vw"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "1rem",
              border: "1px solid var(--line)",
            }}
          />
          {actualite.image.credit && (
            <figcaption style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              {actualite.image.credit}
            </figcaption>
          )}
        </figure>

        {/* L'essentiel d'abord : une actualité se lit souvent entre deux
            services, et c'est parfois tout ce qu'on en lira. */}
        <section
          style={{
            borderRadius: "1rem",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            padding: "1.25rem 1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.7rem",
            }}
          >
            L&apos;essentiel
          </h2>
          <ul className="flex flex-col gap-2" style={{ fontSize: 15.5 }}>
            {actualite.essentiel.map((ligne) => (
              <li
                key={ligne}
                className="flex gap-2.5"
                style={{ lineHeight: 1.6 }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: "none",
                    marginTop: "0.75em",
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

        <article
          className="billet"
          dangerouslySetInnerHTML={{ __html: html }}
        />

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
            {actualite.sources.map((source) => (
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
            Informations à jour au {dateLisible(actualite.misAJourLe)}. Une
            erreur, une évolution ? Écrivez-nous à{" "}
            <a href="mailto:contact@klarr.net">contact@klarr.net</a>, nous
            corrigerons.
          </p>
        </section>

        {autres.length > 0 && (
          <section
            className="flex flex-col gap-3"
            style={{ borderTop: "1px solid var(--line)", paddingTop: "1.5rem" }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
              Les autres actualités
            </h2>
            <ul className="flex flex-col gap-3">
              {autres.map((autre) => (
                <li key={autre.slug}>
                  <Link
                    href={`${CHEMIN_ACTUALITES}/${autre.slug}`}
                    style={{
                      fontSize: 15.5,
                      fontWeight: 600,
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
      </CadreJournal>
      <Commis />
    </>
  );
}
