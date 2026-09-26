import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";
import { SignatureKlarr } from "@/components/brand/SignatureKlarr";
import { FormulaireBon } from "@/components/bons/FormulaireBon";
import { langueVisiteur } from "@/lib/i18n/langue";
import { BONS } from "@/lib/i18n/bons";
import { chargerMaisonCadeau } from "@/lib/bons/maison";

/**
 * La page où l'on offre un repas.
 *
 * Même habit que la page de réservation — c'est la même maison, et on y
 * arrive par le même lien partagé sur Instagram ou dans la fiche Google.
 * Le paiement part sur le compte Stripe du restaurant, jamais sur le
 * nôtre.
 */

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const maison = await chargerMaisonCadeau(slug);
  const b = BONS[await langueVisiteur()];
  return {
    title: maison ? b.titreOnglet(maison.nom) : b.bonCadeau,
    // Une maison qui ne vend pas encore n'a rien à faire dans l'index.
    robots: maison?.ouvert ? undefined : { index: false, follow: false },
  };
}

export default async function CadeauPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const langue = await langueVisiteur();
  const b = BONS[langue];
  const maison = await chargerMaisonCadeau(slug);
  if (!maison) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white/90 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3">
            {maison.logo_url && (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={maison.logo_url}
                  alt=""
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </span>
            )}
            <span className="truncate font-serif text-2xl text-ink">
              {maison.nom}
            </span>
          </span>
          <ChoixLangueSite courante={langue} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
            {b.surtitre}
          </span>
          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            {b.titre(maison.nom)}
          </h1>
          <p className="text-base leading-relaxed text-zinc-600">
            {b.chapo(maison.validite)}
          </p>
          {maison.texte && (
            <p className="whitespace-pre-line text-base leading-relaxed text-zinc-600">
              {maison.texte}
            </p>
          )}
        </div>

        {maison.ouvert ? (
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm sm:p-8">
            <FormulaireBon
              slug={slug}
              montants={maison.montants}
              langue={langue}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">
              {b.indisponibleTitre}
            </h2>
            <p className="mt-2 text-base text-zinc-600">
              {b.indisponibleTexte(maison.nom)}
            </p>
          </div>
        )}

        {maison.ouvert && (
          <p className="text-sm text-zinc-500">{b.mention(maison.nom)}</p>
        )}
      </main>

      <footer className="px-6 pb-8">
        <SignatureKlarr texte={b.signature} />
      </footer>
    </div>
  );
}
