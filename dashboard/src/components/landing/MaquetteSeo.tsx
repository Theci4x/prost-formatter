import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";
import { Kpis } from "@/components/seo/Kpis";
import { GraphiqueRequetes } from "@/components/seo/GraphiqueRequetes";
import { Etiquette } from "@/components/landing/MaquetteIa";
import { REQUETES } from "@/lib/demo/maison";
import { aDessiner, synthese } from "@/lib/seo/synthese";

/**
 * La page SEO, telle qu'elle est dans le tableau de bord — les mêmes
 * composants, sur la maison d'exemple. Pas une image : le jour où
 * l'écran change, la démonstration suit.
 */
export function MaquetteSeo({
  t,
  exemple,
}: {
  t: ClesAccueilPublic["vitrine"]["seo"];
  exemple: string;
}) {
  const s = synthese(REQUETES);
  return (
    <div
      aria-label={`${exemple} — ${t.surtitre}`}
      className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-5 shadow-[0_40px_90px_-40px_oklch(20%_0.02_60/40%)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-orange-dark">
          {t.surtitre}
        </span>
        <span className="text-ink-soft">
          <Etiquette>{exemple}</Etiquette>
        </span>
      </div>
      <Kpis
        s={s}
        libelles={{
          vus: t.vus,
          clics: t.clics,
          taux: t.taux,
          premierePage: () => t.premierePage,
          aPortee: (n) => t.aPortee.replace("{n}", String(n)),
          sur: (n) => `${n}`,
        }}
      />
      <GraphiqueRequetes
        requetes={aDessiner(REQUETES, 6)}
        id="vitrine-requetes"
        libelles={{ titre: t.titre, vu: t.vu, clique: t.clique }}
        statique
      />
    </div>
  );
}
