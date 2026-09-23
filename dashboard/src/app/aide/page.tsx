import type { Metadata } from "next";
import { Commis } from "@/components/commis/Commis";
import Link from "next/link";
import { rubriques, tousLesArticles } from "@/lib/aide/articles";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { siteUrl } from "@/lib/site-url";
import { langueIndexable } from "@/lib/i18n/langue";
import { AIDE, entreeArticle } from "@/lib/i18n/aide";
import { mots } from "@/lib/aide/texte";
import { CentreAide, type RubriqueIndexee } from "@/components/aide/CentreAide";
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

  // Ce que le navigateur reçoit pour chercher : les mots, pas le texte.
  // Le titre traduit s'y ajoute au français, pour qu'une recherche en
  // anglais trouve aussi quelque chose.
  const index: RubriqueIndexee[] = sections.map((rubrique) => ({
    cle: rubrique.cle,
    titre: a.rubriques[rubrique.cle].titre,
    resume: a.rubriques[rubrique.cle].resume,
    articles: rubrique.articles.map((article) => {
      const entree = entreeArticle(article, langue);
      const forts = new Set(
        mots(
          [
            article.titre,
            entree.titre,
            article.resume,
            entree.resume,
            ...article.questions,
          ].join(" "),
        ),
      );
      return {
        slug: article.slug,
        titre: entree.titre,
        resume: entree.resume,
        motsForts: [...forts],
        motsCorps: [...new Set(mots(article.markdown))].filter(
          (mot) => mot.length > 2 && !forts.has(mot),
        ),
      };
    }),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2">
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

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-12 px-6 py-12 sm:py-16">
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

        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-5xl text-ink sm:text-6xl">{a.aide}</h1>
          <p className="max-w-3xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            {a.chapo}
          </p>
        </div>

        <CentreAide langue={langue} rubriques={index} />

        {/* Ce que le mode d'emploi ne couvre pas doit avoir une porte,
            sinon il ne reste qu'un formulaire de contact perdu en pied de
            page — ou rien du tout. */}
        <section className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-brand-navy px-6 py-8 text-white shadow-sm sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl sm:text-4xl">
              {a.vousNeTrouvezPas}
            </h2>
            <p className="max-w-2xl text-base text-white/75">{a.ecrivezNous}</p>
          </div>
          <Link
            href="/aide/contact"
            className="shrink-0 rounded-lg bg-white px-6 py-3 text-base font-semibold text-brand-navy transition-colors hover:bg-brand-orange-soft"
          >
            {a.ecrireAKlarr}
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
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
