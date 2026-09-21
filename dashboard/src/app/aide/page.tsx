import type { Metadata } from "next";
import { Commis } from "@/components/commis/Commis";
import Link from "next/link";
import { rubriques, tousLesArticles } from "@/lib/aide/articles";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Aide",
  description:
    "Le mode d'emploi de Klarr : réservations, plan de salle, carte, acomptes, équipe. Des réponses courtes, écrites pour des restaurateurs.",
  alternates: { canonical: "/aide" },
};

export default function AidePage() {
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
          <span className="text-base text-zinc-500">Aide</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
        <DonneesStructurees
          donnees={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: articles.map((article) => ({
              "@type": "Question",
              name: article.questions[0] ?? article.titre,
              acceptedAnswer: {
                "@type": "Answer",
                text: article.resume,
                url: `${siteUrl()}/aide/${article.slug}`,
              },
            })),
          }}
        />

        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-4xl text-ink">Aide</h1>
          <p className="max-w-xl text-base text-zinc-500">
            Comment se servir de Klarr, en clair. Chaque article répond à une
            question qu&apos;on se pose vraiment, et dit aussi ce que Klarr ne
            fait pas encore.
          </p>
        </div>

        {sections.map((rubrique) => (
          <section key={rubrique.cle} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl text-ink">{rubrique.titre}</h2>
              <p className="text-base text-zinc-500">{rubrique.resume}</p>
            </div>
            <ul className="flex flex-col divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
              {rubrique.articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/aide/${article.slug}`}
                    className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-zinc-50"
                  >
                    <span className="text-base font-medium text-zinc-900">
                      {article.titre}
                    </span>
                    <span className="text-base text-zinc-500">
                      {article.resume}
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
            Vous ne trouvez pas ?
          </h2>
          <p className="text-base text-zinc-500">
            Écrivez-nous : une vraie réponse, écrite à la main, dans la journée.
          </p>
          <Link
            href="/aide/contact"
            className="self-start text-base font-medium text-brand-orange hover:underline"
          >
            Écrire à Klarr
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 text-base text-zinc-400">
          <Link href="/" className="hover:text-zinc-700">
            Accueil
          </Link>
          <Link href="/mentions-legales" className="hover:text-zinc-700">
            Mentions légales
          </Link>
          <Link href="/cgu" className="hover:text-zinc-700">
            Conditions générales
          </Link>
          <Link href="/confidentialite" className="hover:text-zinc-700">
            Confidentialité
          </Link>
        </div>
      </footer>
      <Commis />
    </div>
  );
}
