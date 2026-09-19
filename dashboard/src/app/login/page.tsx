import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { ChoixLangue } from "@/components/dashboard/ChoixLangue";
import { AUTH } from "@/lib/i18n/authentification";
import { langueVisiteur } from "@/lib/i18n/langue";
import { choisirLangueVisiteur } from "@/app/langue-actions";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { LoginIllustration } from "@/components/brand/LoginIllustration";

import type { Metadata } from "next";

// Une page de connexion ou de formulaire technique n'a rien à faire dans
// un index : elle ne répond à aucune recherche et dilue le site.
// Le titre de l'onglet suit la langue lui aussi : un visiteur chinois
// qui ouvre trois onglets doit reconnaître le sien.
export async function generateMetadata(): Promise<Metadata> {
  const t = AUTH[await langueVisiteur()];
  return {
    title: t.titreConnexion,
    description: t.sousTitre,
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string; email?: string }>;
}) {
  const langue = await langueVisiteur();
  const t = AUTH[langue];
  const { confirm, email } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <div className="hidden md:flex md:w-2/5">
        <LoginIllustration accroche={t.accroche} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-brand-cream px-5 py-16">
        <div className="flex w-full max-w-sm justify-end">
          <ChoixLangue
            courante={langue}
            libelle={t.langue}
            action={choisirLangueVisiteur}
          />
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Un seul h1, dont le contenu s'adapte : deux titres dans la
              page, même si l'un est masqué en CSS, en font deux pour un
              moteur de recherche. */}
          <h1 className="flex flex-col items-center gap-3 text-2xl font-semibold text-ink">
            <span className="flex flex-col items-center gap-3 md:hidden">
              <KlarrMark size={40} />
              <span className="flex items-baseline gap-2">
                <KlarrWordmark />
                <span className="text-zinc-400">— {t.titreConnexion}</span>
              </span>
            </span>
            <span className="hidden font-serif text-4xl md:inline">
              {t.titreConnexion}
            </span>
          </h1>
          <p className="max-w-sm text-sm text-zinc-500">{t.sousTitre}</p>
        </div>

        {confirm && (
          <p className="max-w-sm rounded-md bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            Compte créé ! Vérifie tes emails pour confirmer ton adresse avant de
            te connecter.
          </p>
        )}

        <LoginForm t={t} emailInitial={email} />

        {/* Sans ce lien, le visiteur arrivé sur la connexion n'a aucun chemin
            de retour vers la page qui explique ce qu'est Klarr. */}
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ← {t.retourSite}
        </Link>
      </div>
    </div>
  );
}
