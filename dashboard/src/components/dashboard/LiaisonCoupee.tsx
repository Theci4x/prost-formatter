import { SESSION } from "@/lib/i18n/session";
import type { Langue } from "@/lib/i18n/langues";

/**
 * Ce qu'on affiche quand on n'a pas pu vérifier qui est connecté.
 *
 * Volontairement sans JavaScript : le bouton est un lien ordinaire qui
 * recharge la page. Au moment où le réseau flanche, c'est justement ce
 * qu'il ne faut pas attendre d'un paquet de plus.
 */
export function LiaisonCoupee({
  langue,
  chemin,
}: {
  langue: Langue;
  /** Où revenir. Le même écran, pour reprendre où l'on en était. */
  chemin: string;
}) {
  const s = SESSION[langue];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <h1 className="font-serif text-2xl text-ink">{s.titre}</h1>
        <p className="text-sm leading-relaxed text-ink-soft">{s.chapo}</p>
        <p className="text-sm leading-relaxed text-ink-soft">{s.rassurance}</p>
        <a
          href={chemin}
          className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover"
        >
          {s.reessayer}
        </a>
      </div>
    </div>
  );
}
