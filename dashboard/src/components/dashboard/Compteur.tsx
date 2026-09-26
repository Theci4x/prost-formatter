/**
 * Le chiffre en tête d'écran : grand, en serif, et son libellé dessous.
 *
 * Toutes les pages du tableau de bord ouvrent sur deux à quatre de ces
 * tuiles. `accent` les passe en orange quand elles signalent quelque
 * chose à faire — une tuile orange se lit avant d'être comprise, c'est
 * ce qu'on veut, et c'est pourquoi elle ne sert qu'à ça.
 */
export function Compteur({
  valeur,
  libelle,
  accent = false,
}: {
  valeur: number | string;
  libelle: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 ${
        accent
          ? "border-brand-orange/60 bg-brand-orange-soft"
          : "border-zinc-200/70 bg-white shadow-sm"
      }`}
    >
      <span className="font-serif text-3xl leading-none text-ink sm:text-5xl">
        {valeur}
      </span>
      <span className="text-xs leading-snug text-zinc-600 sm:text-sm">
        {libelle}
      </span>
    </div>
  );
}

/** Un titre de section, le même partout. */
export function TitreSection({
  children,
  aside,
}: {
  children: React.ReactNode;
  /** Une précision à droite : un compte, une date. */
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2 className="font-serif text-2xl text-ink">{children}</h2>
      {aside && <span className="text-xs text-zinc-500">{aside}</span>}
    </div>
  );
}
