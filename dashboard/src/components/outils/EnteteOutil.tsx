import Link from "next/link";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";
import { ENTETE, t } from "@/lib/i18n/outils";
import type { Langue } from "@/lib/i18n/langues";
import { ChoixLangueSite } from "@/components/landing/ChoixLangueSite";

/**
 * L'en-tête des pages d'outils : le nom, et la sortie.
 *
 * Ces pages se rejoignent par une recherche Google, pas par la page
 * d'accueil. Leur visiteur arrive donc directement, sans savoir ce
 * qu'est Klarr — et, jusqu'ici, sans aucun moyen d'aller le découvrir :
 * elles n'avaient pas de tête, seulement un `<main>`. Un outil gratuit
 * qui ne mène nulle part est une impasse, et une impasse ne vend rien.
 *
 * La marque à gauche, qui dit chez qui on est et ramène à l'accueil ;
 * à droite, le choix de langue et le retour explicite, pour ceux qui ne
 * pensent pas à cliquer un logo. Pas de menu au-delà : ces pages ont
 * une tâche, et un menu complet inviterait à la quitter avant de
 * l'avoir finie.
 *
 * **Le sélecteur de langue n'est pas un menu de plus, et il manquait.**
 * Ces pages se traduisent en trois langues, mais la langue se choisit
 * sur la page d'accueil — or personne n'y passe : on arrive ici par une
 * recherche. Un lecteur chinois tombait donc sur une page française,
 * avec pour seule issue un lien « Retour à l'accueil » qu'il ne pouvait
 * pas lire. C'est le seul élément d'interface qui sert précisément à
 * celui qui ne comprend pas le reste de l'écran.
 */
export function EnteteOutil({ langue }: { langue: Langue }) {
  const retour = t(ENTETE.retour, langue);
  return (
    <header className="border-b border-zinc-200/70 bg-white px-5 py-4">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <KlarrMark size={26} />
          <KlarrWordmark className="text-lg text-zinc-900" />
        </Link>
        <div className="flex items-center gap-4">
          <ChoixLangueSite courante={langue} />
          <Link
            href="/"
            className="text-base text-brand-navy underline-offset-2 hover:underline"
          >
            {retour} →
          </Link>
        </div>
      </div>
    </header>
  );
}
