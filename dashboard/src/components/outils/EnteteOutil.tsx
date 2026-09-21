import Link from "next/link";
import { KlarrMark, KlarrWordmark } from "@/components/brand/KlarrMark";

/**
 * L'en-tête des pages d'outils : le nom, et la sortie.
 *
 * Ces pages se rejoignent par une recherche Google, pas par la page
 * d'accueil. Leur visiteur arrive donc directement, sans savoir ce
 * qu'est Klarr — et, jusqu'ici, sans aucun moyen d'aller le découvrir :
 * elles n'avaient pas de tête, seulement un `<main>`. Un outil gratuit
 * qui ne mène nulle part est une impasse, et une impasse ne vend rien.
 *
 * Deux éléments, pas trois. La marque à gauche, qui dit chez qui on est
 * et ramène à l'accueil ; le retour explicite à droite, pour ceux qui
 * ne pensent pas à cliquer un logo. Pas de menu : ces pages ont une
 * tâche, et un menu complet inviterait à la quitter avant de l'avoir
 * finie.
 */
export function EnteteOutil({
  retour = "Retour à l'accueil",
}: {
  /** Le libellé du lien de sortie, si la page n'est pas en français. */
  retour?: string;
}) {
  return (
    <header className="border-b border-zinc-200/70 bg-white px-5 py-4">
      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <KlarrMark size={26} />
          <KlarrWordmark className="text-lg text-zinc-900" />
        </Link>
        <Link
          href="/"
          className="text-sm text-brand-navy underline-offset-2 hover:underline"
        >
          {retour} →
        </Link>
      </div>
    </header>
  );
}
