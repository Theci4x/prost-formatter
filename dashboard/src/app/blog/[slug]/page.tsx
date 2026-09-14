import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { Commis } from "@/components/commis/Commis";
import {
  billetParSlug,
  dateLisible,
  memeRubrique,
  tousLesBillets,
} from "@/lib/blog/billets";
import { tempsDeLecture, titreCategorieBillet } from "@/types/blog";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
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
  const html = await marked.parse(billet.markdown);
  const voisins = memeRubrique(billet);
  const site = siteUrl();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <KlarrMark size={20} />
            <KlarrWordmark className="text-zinc-700" />
          </Link>
          <span className="text-zinc-300">/</span>
          <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900">
            Le journal
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500">
            {titreCategorieBillet(billet.categorie)}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
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

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {billet.titre}
          </h1>
          <p className="text-sm text-zinc-500">{billet.resume}</p>
          <p className="text-xs text-zinc-400">
            Mis à jour le {dateLisible(billet.misAJourLe)} ·{" "}
            {tempsDeLecture(billet.markdown)} min de lecture
          </p>
        </div>

        <article
          className="flex flex-col gap-4 text-sm leading-relaxed text-zinc-700 [&_a]:text-brand-navy [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2 [&_em]:text-zinc-500 [&_hr]:border-zinc-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Les sources ne sont pas une coquetterie : un article qui affirme
            une obligation légale sans dire d'où elle sort ne se vérifie pas,
            et ne se relit pas quand le texte change. */}
        {billet.sources.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Sources</h2>
            <ul className="flex flex-col gap-2">
              {billet.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-navy underline-offset-2 hover:underline"
                  >
                    {source.intitule}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-zinc-500">
              Ces règles changent. Cet article est à jour au{" "}
              {dateLisible(billet.misAJourLe)} ; confirmez auprès de
              l&apos;administration concernée avant d&apos;engager une
              dépense.
            </p>
          </section>
        )}

        {voisins.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold text-zinc-900">
              Dans la même rubrique
            </h2>
            <ul className="flex flex-col gap-2">
              {voisins.map((autre) => (
                <li key={autre.slug}>
                  <Link
                    href={`/blog/${autre.slug}`}
                    className="text-sm text-brand-navy underline-offset-2 hover:underline"
                  >
                    {autre.titre}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Une seule mention de Klarr, à la fin, et sans transition forcée :
            quelqu'un venu chercher une obligation réglementaire n'est pas
            venu acheter un logiciel. Le lui rappeler trois fois dans
            l'article le ferait partir. */}
        <aside className="rounded-2xl border border-zinc-200/70 bg-white p-5 text-sm text-zinc-600 shadow-sm">
          Klarr est un outil de réservation pour restaurants indépendants :
          une page de réservation, une carte en ligne, un carnet. Si vous
          ouvrez bientôt,{" "}
          <Link
            href="/"
            className="font-medium text-brand-navy underline-offset-2 hover:underline"
          >
            voyez à quoi ça ressemble
          </Link>
          .
        </aside>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
          <Link href="/blog" className="hover:text-zinc-700">
            Le journal
          </Link>
          <Link href="/aide" className="hover:text-zinc-700">
            Aide
          </Link>
          <Link href="/mentions-legales" className="hover:text-zinc-700">
            Mentions légales
          </Link>
        </div>
      </footer>
      <Commis />
    </div>
  );
}
