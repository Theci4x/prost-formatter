import type { Metadata } from "next";
import Link from "next/link";
import { Commis } from "@/components/commis/Commis";
import { rubriquesBlog, tousLesBillets, dateLisible } from "@/lib/blog/billets";
import { tempsDeLecture } from "@/types/blog";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { DonneesStructurees } from "@/components/seo/DonneesStructurees";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Le journal",
  description:
    "Ouvrir un restaurant, remplir sa salle, tenir la maison. Des articles écrits à partir de ce qu'on a vu marcher — et de ce qu'on a raté.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const rubriques = rubriquesBlog();
  const billets = tousLesBillets();
  const site = siteUrl();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <KlarrMark size={20} />
            <KlarrWordmark className="text-zinc-700" />
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500">Le journal</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
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
              url: `${site}/blog/${billet.slug}`,
            })),
          }}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Le journal</h1>
          <p className="max-w-xl text-sm text-zinc-500">
            Ce qu&apos;on aurait aimé lire avant d&apos;ouvrir un restaurant,
            et ce qu&apos;on a appris depuis. Les articles qui affirment une
            obligation légale citent leurs sources et portent leur date : ces
            règles changent.
          </p>
        </div>

        {rubriques.map((rubrique) => (
          <section key={rubrique.cle} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-zinc-900">
                {rubrique.titre}
              </h2>
              <p className="text-sm text-zinc-500">{rubrique.resume}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {rubrique.billets.map((billet) => (
                <li key={billet.slug}>
                  <Link
                    href={`/blog/${billet.slug}`}
                    className="flex flex-col gap-1.5 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-colors hover:border-brand-navy"
                  >
                    <span className="font-medium text-zinc-900">
                      {billet.titre}
                    </span>
                    <span className="text-sm leading-relaxed text-zinc-600">
                      {billet.resume}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {dateLisible(billet.misAJourLe)} ·{" "}
                      {tempsDeLecture(billet.markdown)} min de lecture
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
          <Link href="/" className="hover:text-zinc-700">
            Accueil
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
