import type { Metadata } from "next";
import { Commis } from "@/components/commis/Commis";
import Link from "next/link";
import { rubriques, tousLesArticles } from "@/lib/aide/articles";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { siteUrl } from "@/lib/site-url";
import { langueIndexable } from "@/lib/i18n/langue";
import { AIDE, entreeArticle } from "@/lib/i18n/aide";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";

// La page porte du référencement : elle lit `langueIndexable`, jamais
// l'en-tête du visiteur — un robot doit toujours tomber sur le français.
export async function generateMetadata(): Promise<Metadata> {
  const a = AIDE[await langueIndexable()];
  return {
    title: a.aide,
    description: a.metaDescription,
    alternates: { canonical: "/aide" },
  };
}

export default async function AidePage() {
  const langue = await langueIndexable();
  const a = AIDE[langue];
  const sections = rubriques();
  const articles = tousLesArticles();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <KlarrMark size={20} />
            <KlarrWordmark className="text-zinc-700" />
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-base text-zinc-500">{a.aide}</span>
          <span className="ml-auto">
            <ChoixLangueSite courante={langue} />
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
        <DonneesStructurees
          donnees={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: articles.map((article) => ({
              "@type": "Question",
              // Le balisage suit le texte visible : un balisage qui le
              // contredit est une raison documentée de perdre l'affichage
              // enrichi.
              name:
                langue === "fr"
                  ? (article.questions[0] ?? article.titre)
                  : entreeArticle(article, langue).titre,
              acceptedAnswer: {
                "@type": "Answer",
                text: entreeArticle(article, langue).resume,
                url: `${siteUrl()}/aide/${article.slug}`,
              },
            })),
          }}
        />

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-ink">{a.aide}</h1>
          <p className="max-w-xl text-base text-zinc-500">{a.chapo}</p>
        </div>

        {sections.map((rubrique) => (
          <section key={rubrique.cle} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl text-ink">
                {a.rubriques[rubrique.cle].titre}
              </h2>
              <p className="text-base text-zinc-500">
                {a.rubriques[rubrique.cle].resume}
              </p>
            </div>
            <ul className="flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              {rubrique.articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/aide/${article.slug}`}
                    className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-zinc-50"
                  >
                    <span className="text-base font-medium text-zinc-900">
                      {entreeArticle(article, langue).titre}
                    </span>
                    <span className="text-base text-zinc-500">
                      {entreeArticle(article, langue).resume}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {/* Ce que le mode d'emploi ne couvre pas doit avoir une porte,
            sinon il ne reste qu'un formulaire de contact perdu en pied de
            page — ou rien du tout. */}
        <section className="flex flex-col gap-2 rounded-2xl border border-zinc-200/70 bg-white px-5 py-6 shadow-sm">
          <h2 className="font-serif text-2xl text-ink">
            {a.vousNeTrouvezPas}
          </h2>
          <p className="text-base text-zinc-500">{a.ecrivezNous}</p>
          <Link
            href="/aide/contact"
            className="self-start text-base font-medium text-brand-orange hover:underline"
          >
            {a.ecrireAKlarr}
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 text-base text-zinc-400">
          <Link href="/" className="hover:text-zinc-700">
            {a.accueil}
          </Link>
          <Link href="/mentions-legales" className="hover:text-zinc-700">
            {a.mentionsLegales}
          </Link>
          <Link href="/cgu" className="hover:text-zinc-700">
            {a.conditionsGenerales}
          </Link>
          <Link href="/confidentialite" className="hover:text-zinc-700">
            {a.confidentialite}
          </Link>
        </div>
      </footer>
      <Commis />
    </div>
  );
}
