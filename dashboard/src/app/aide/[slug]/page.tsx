import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import {
  articleParSlug,
  rubriques,
  tousLesArticles,
} from "@/lib/aide/articles";
import { titreCategorie } from "@/types/aide";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { filAriane } from "@/lib/seo/donnees-structurees";
import { siteUrl } from "@/lib/site-url";
import { TeteArticle } from "@/components/aide/TeteArticle";

type Params = { slug: string };

// Le mode d'emploi ne change qu'avec le produit : autant le construire une
// fois pour toutes plutôt qu'à chaque visite.
export function generateStaticParams() {
  return tousLesArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) return { title: "Aide" };

  return {
    title: article.titre,
    description: article.resume,
    alternates: { canonical: `/aide/${slug}` },
    openGraph: {
      type: "article",
      title: `${article.titre} — Aide Klarr`,
      description: article.resume,
    },
  };
}

export default async function ArticleAidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = articleParSlug(slug);
  if (!article) notFound();

  // Le contenu vient du dépôt, pas d'un utilisateur : il n'y a pas de saisie
  // hostile à filtrer ici, seulement notre propre texte.
  const html = await marked.parse(article.markdown);

  const memeRubrique =
    rubriques()
      .find((rubrique) => rubrique.cle === article.categorie)
      ?.articles.filter((autre) => autre.slug !== article.slug) ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <KlarrMark size={20} />
            <KlarrWordmark className="text-zinc-700" />
          </Link>
          <span className="text-zinc-300">/</span>
          <Link
            href="/aide"
            className="text-base text-zinc-500 hover:text-zinc-900"
          >
            Aide
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-base text-zinc-500">
            {titreCategorie(article.categorie)}
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 items-start gap-10 px-6 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-16">
        <DonneesStructurees
          donnees={filAriane([
            { nom: "Aide", url: `${siteUrl()}/aide` },
            { nom: article.titre, url: `${siteUrl()}/aide/${article.slug}` },
          ])}
        />

        <div className="flex min-w-0 max-w-3xl flex-col gap-8">
          {/* La page est pré-générée : son titre sort du serveur en
            français, et se corrige dans le navigateur pour qui lit
            l'anglais ou le chinois. Le corps, lui, reste en français —
            le composant le dit. */}
          <TeteArticle
            slug={article.slug}
            titre={article.titre}
            resume={article.resume}
          />

          <article
            className="flex flex-col gap-4 text-[17px] leading-relaxed text-zinc-700 [&_a]:text-brand-navy [&_a]:underline-offset-2 hover:[&_a]:underline [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-semibold [&_strong]:text-zinc-900 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <Link
            href="/aide"
            className="w-fit text-base text-zinc-500 hover:text-zinc-900"
          >
            ← Toute l&apos;aide
          </Link>
        </div>

        {/* La colonne de côté : la suite de la rubrique, et la porte de
            sortie quand l'article ne suffit pas. */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-8">
          {memeRubrique.length > 0 && (
            <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-ink">
                Dans la même rubrique
              </h2>
              <ul className="flex flex-col divide-y divide-zinc-100">
                {memeRubrique.map((autre) => (
                  <li key={autre.slug}>
                    <Link
                      href={`/aide/${autre.slug}`}
                      className="group flex items-start justify-between gap-3 py-2.5 text-sm font-medium text-ink hover:text-brand-navy"
                    >
                      {autre.titre}
                      <span
                        aria-hidden="true"
                        className="text-zinc-300 group-hover:text-ink"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="flex flex-col gap-3 rounded-2xl bg-brand-navy p-6 text-white shadow-sm">
            <h2 className="font-serif text-2xl">Vous ne trouvez pas ?</h2>
            <p className="text-sm leading-relaxed text-white/75">
              Écrivez-nous : une vraie réponse, écrite à la main, dans la
              journée.
            </p>
            <Link
              href="/aide/contact"
              className="w-fit rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-orange-soft"
            >
              Écrire à Klarr
            </Link>
          </section>
        </aside>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm text-zinc-400">
          <KlarrMark size={16} />
          <span>
            Aide de <KlarrWordmark className="text-zinc-500" />
          </span>
        </div>
      </footer>
    </div>
  );
}
