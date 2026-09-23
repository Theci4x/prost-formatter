import { nombre, type Synthese } from "@/lib/seo/synthese";

/**
 * Les quatre chiffres qu'on lit avant le reste.
 *
 * Les valeurs sont en serif, comme partout dans le tableau de bord : c'est
 * la règle de la maison — Instrument Serif pour ce qui se lit de loin —,
 * et une page qui s'en écarterait aurait l'air d'appartenir à un autre
 * produit. Le libellé, lui, reste en sans, en retrait.
 *
 * Pas de variation « vs semaine dernière » : Search Console ne nous donne
 * que la fenêtre courante, et une flèche inventée vaudrait moins que rien.
 */
export type LibellesKpis = {
  vus: string;
  clics: string;
  taux: string;
  premierePage: (n: number) => string;
  aPortee: (n: number) => string;
  sur: (n: number) => string;
};

/**
 * Le tableau de bord parle français ; la page d'accueil, elle, montre
 * ces mêmes tuiles à un visiteur anglais ou chinois. Les libellés
 * s'injectent donc, et le français reste le défaut pour ne rien changer
 * aux appelants existants.
 */
const FRANCAIS: LibellesKpis = {
  vus: "fois vu dans Google",
  clics: "clics vers vos pages",
  taux: "des vues ont cliqué",
  premierePage: (n) => `requête${n > 1 ? "s" : ""} en première page`,
  aPortee: (n) => `${n} à portée, en deuxième page`,
  sur: (n) => `sur ${n}`,
};

export function Kpis({
  s,
  libelles = FRANCAIS,
  tuiles: separees = false,
}: {
  s: Synthese;
  libelles?: LibellesKpis;
  /**
   * Des tuiles séparées et en grand, comme les compteurs des autres écrans
   * du tableau de bord. Sans, un bloc compact : c'est la version de la
   * maquette de la page d'accueil, où la place manque.
   */
  tuiles?: boolean;
}) {
  const tuiles: { valeur: string; libelle: string; detail?: string }[] = [
    { valeur: nombre(s.impressions), libelle: libelles.vus },
    { valeur: nombre(s.clics), libelle: libelles.clics },
    {
      valeur: `${s.ctr.toLocaleString("fr-FR")} %`,
      libelle: libelles.taux,
    },
    {
      valeur: `${s.enPremierePage}`,
      libelle: libelles.premierePage(s.enPremierePage),
      detail:
        s.presque > 0 ? libelles.aPortee(s.presque) : libelles.sur(s.requetes),
    },
  ];

  if (separees) {
    return (
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tuiles.map((t) => (
          <div
            key={t.libelle}
            className="flex flex-col gap-1 rounded-2xl border border-zinc-200/70 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5"
          >
            <dd className="order-1 font-serif text-3xl leading-none text-ink sm:text-5xl">
              {t.valeur}
            </dd>
            <dt className="order-2 text-xs leading-snug text-zinc-600 sm:text-sm">
              {t.libelle}
            </dt>
            {t.detail && (
              <dd className="order-3 text-xs text-zinc-400">{t.detail}</dd>
            )}
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
      {tuiles.map((t) => (
        <div key={t.libelle} className="flex flex-col gap-1 bg-paper px-5 py-4">
          <dd className="order-1 font-serif text-[2.1rem] leading-none text-ink">
            {t.valeur}
          </dd>
          <dt className="order-2 text-[13px] leading-snug text-ink-soft">
            {t.libelle}
          </dt>
          {t.detail && (
            <dd className="order-3 text-xs text-zinc-400">{t.detail}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
