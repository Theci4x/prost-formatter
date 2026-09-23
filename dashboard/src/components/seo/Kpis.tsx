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
export function Kpis({ s }: { s: Synthese }) {
  const tuiles: { valeur: string; libelle: string; detail?: string }[] = [
    { valeur: nombre(s.impressions), libelle: "fois vu dans Google" },
    { valeur: nombre(s.clics), libelle: "clics vers vos pages" },
    {
      valeur: `${s.ctr.toLocaleString("fr-FR")} %`,
      libelle: "des vues ont cliqué",
    },
    {
      valeur: `${s.enPremierePage}`,
      libelle: `requête${s.enPremierePage > 1 ? "s" : ""} en première page`,
      detail:
        s.presque > 0
          ? `${s.presque} à portée, en deuxième page`
          : `sur ${s.requetes}`,
    },
  ];

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
