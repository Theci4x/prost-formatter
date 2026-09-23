/**
 * Quand Search Console répond, et n'a rien à dire.
 *
 * Ce n'est pas une panne, et l'écran ne doit pas en avoir l'air. Une page
 * récente, un établissement fermé, et trois jours de retard sur les
 * données : Google n'a simplement rien mesuré sur les pages de la maison
 * ces quatre dernières semaines.
 *
 * On le dit comme ça, avec le site suivi sous les yeux — parce que la
 * première chose qu'on vérifie devant un zéro, c'est qu'on regarde au bon
 * endroit.
 */
export function EtatVide({ site }: { site: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-8 sm:flex-row sm:items-center sm:gap-6">
      <svg
        aria-hidden="true"
        width="56"
        height="56"
        viewBox="0 0 56 56"
        fill="none"
        className="shrink-0"
      >
        {/* Trois barres pâles et une loupe : ce que la page montrera. */}
        <rect
          x="8"
          y="30"
          width="6"
          height="14"
          rx="2"
          fill="var(--color-line)"
        />
        <rect
          x="18"
          y="22"
          width="6"
          height="22"
          rx="2"
          fill="var(--color-line)"
        />
        <rect
          x="28"
          y="34"
          width="6"
          height="10"
          rx="2"
          fill="var(--color-line)"
        />
        <circle
          cx="38"
          cy="20"
          r="8"
          stroke="var(--color-brand-orange)"
          strokeWidth="2"
        />
        <path
          d="M44 26l6 6"
          stroke="var(--color-brand-orange)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-ink">
          Pas encore de requête mesurée sur tes pages
        </p>
        <p className="max-w-prose text-sm leading-relaxed text-ink-soft">
          Google n&apos;a rien enregistré ces quatre dernières semaines pour les
          pages de ton établissement. C&apos;est le cas d&apos;une page récente,
          ou d&apos;une maison fermée. Les chiffres arriveront ici
          d&apos;eux-mêmes, avec trois jours de retard — c&apos;est le rythme de
          Search Console.
        </p>
        <p className="text-xs text-zinc-400">Site suivi : {site}</p>
      </div>
    </div>
  );
}
