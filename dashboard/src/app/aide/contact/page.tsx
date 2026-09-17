import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DemandeAide } from "@/components/aide/DemandeAide";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

export const metadata: Metadata = {
  title: "Écrire à Klarr",
  description:
    "Une question que l'aide ne couvre pas ? Écrivez-nous : nous répondons dans la journée.",
  alternates: { canonical: "/aide/contact" },
};

/**
 * La page qui reste quand le mode d'emploi et le Commis n'ont pas suffi.
 *
 * Elle est à part de /aide, qui est servie en statique : lire la session
 * pour savoir qui écrit rendrait dynamique une page que Google visite
 * souvent et qui ne change jamais.
 */
export default async function ContactAidePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <header className="border-b border-zinc-200/70 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <KlarrMark size={20} />
            <KlarrWordmark className="text-zinc-700" />
          </Link>
          <span className="text-zinc-300">/</span>
          <Link href="/aide" className="text-sm text-zinc-500 hover:text-zinc-700">
            Aide
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm text-zinc-500">Écrire</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Écrire à Klarr
          </h1>
          <p className="text-sm text-zinc-500">
            {user
              ? "Votre établissement et l'écran d'où vous écrivez sont joints au message : vous n'avez rien à expliquer de tout ça."
              : "Une question sur Klarr, avant ou après l'inscription. Nous répondons dans la journée, par une vraie réponse écrite à la main."}
          </p>
        </div>

        <DemandeAide connecte={Boolean(user)} />

        <p className="text-sm text-zinc-500">
          Vous préférez votre messagerie ?{" "}
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
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
          <Link href="/aide" className="hover:text-zinc-700">
            Retour à l&apos;aide
          </Link>
          <Link href="/mentions-legales" className="hover:text-zinc-700">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-zinc-700">
            Confidentialité
          </Link>
        </div>
      </footer>
    </div>
  );
}
