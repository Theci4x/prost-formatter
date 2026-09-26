import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DemandeAide } from "@/components/aide/DemandeAide";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { langueVisiteur } from "@/lib/i18n/langue";
import { AIDE } from "@/lib/i18n/aide";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";

export async function generateMetadata(): Promise<Metadata> {
  const a = AIDE[await langueVisiteur()];
  return {
    title: a.ecrireAKlarr,
    description: a.contactMetaDescription,
    alternates: { canonical: "/aide/contact" },
  };
}

/**
 * La page qui reste quand le mode d'emploi et le Commis n'ont pas suffi.
 *
 * Elle est à part de /aide, qui est servie en statique : lire la session
 * pour savoir qui écrit rendrait dynamique une page que Google visite
 * souvent et qui ne change jamais.
 */
export default async function ContactAidePage() {
  // Déjà dynamique — elle lit la session pour savoir qui écrit — donc rien
  // à perdre à suivre la langue du navigateur.
  const langue = await langueVisiteur();
  const a = AIDE[langue];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <KlarrMark size={20} />
            <KlarrWordmark className="text-zinc-700" />
          </Link>
          <span className="text-zinc-300">/</span>
          <Link
            href="/aide"
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            {a.aide}
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500">{a.ecrire}</span>
          <span className="ml-auto">
            <ChoixLangueSite courante={langue} />
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-5xl text-ink sm:text-6xl">
            {a.ecrireAKlarr}
          </h1>
          <p className="text-base leading-relaxed text-zinc-600">
            {user ? a.contactConnecte : a.contactVisiteur}
          </p>
        </div>

        <DemandeAide connecte={Boolean(user)} langue={langue} />

        <p className="text-sm text-zinc-500">
          {a.preferezVotreMessagerie}{" "}
          <a
            href="mailto:contact@klarr.net"
            className="text-brand-orange hover:underline"
          >
            contact@klarr.net
          </a>
          .
        </p>
      </main>

      <footer className="border-t border-zinc-200/70 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
          <Link href="/aide" className="hover:text-zinc-700">
            {a.retourALAide}
          </Link>
          <Link href="/mentions-legales" className="hover:text-zinc-700">
            {a.mentionsLegales}
          </Link>
          <Link href="/confidentialite" className="hover:text-zinc-700">
            {a.confidentialite}
          </Link>
        </div>
      </footer>
    </div>
  );
}
