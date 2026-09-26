import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";
import type { Langue } from "@/lib/i18n/langue";
import { Reveal } from "@/components/landing/Reveal";
import { MaquetteIa } from "@/components/landing/MaquetteIa";
import { MaquetteSeo } from "@/components/landing/MaquetteSeo";
import { MaquetteAlerte } from "@/components/landing/MaquetteAlerte";

/**
 * « Comment ça marche », prouvé.
 *
 * Les trois cartes de texte disaient « la donnée brute », « l'historique »,
 * « ce qui cloche » — et le restaurateur devait le croire sur parole,
 * alors que les écrans existent. Chaque promesse a maintenant son écran
 * en face, recodé sur une maison fictive : ce que répond une IA, ce que
 * les gens tapent, ce que le matin signale.
 *
 * Texte et écran alternent de côté d'une ligne à l'autre : l'œil descend
 * en zigzag, et trois blocs identiques ne se confondent pas.
 */
export function Showcase({
  t,
  v,
  langue,
  icones,
  lieu,
}: {
  t: ClesAccueilPublic["benefices"];
  v: ClesAccueilPublic["vitrine"];
  langue: Langue;
  icones: React.ReactNode[];
  lieu: string;
}) {
  const ecrans = [
    <MaquetteIa key="ia" t={v.ia} exemple={v.exemple} />,
    <MaquetteSeo key="seo" t={v.seo} exemple={v.exemple} />,
    <MaquetteAlerte
      key="alerte"
      t={v.alerte}
      exemple={v.exemple}
      langue={langue}
      lieu={lieu}
    />,
  ];

  return (
    <div
      id="benefices"
      className="px-5 py-20 sm:px-8 sm:py-28"
      style={{ background: "var(--bg-alt)" }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-16 sm:gap-24">
        <div className="flex max-w-[620px] flex-col gap-4">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
            {t.surtitre}
          </span>
          <h2 className="m-0 font-serif text-4xl leading-[1.15] sm:text-5xl">
            {t.titre}
          </h2>
        </div>

        {t.cartes.map((carte, rang) => {
          const inverse = rang % 2 === 1;
          return (
            <Reveal key={carte.titre}>
              <div
                className={`grid items-center gap-8 lg:grid-cols-12 lg:gap-14 ${
                  inverse ? "" : ""
                }`}
              >
                <div
                  className={`flex flex-col gap-5 lg:col-span-5 ${
                    inverse ? "lg:order-2 lg:col-start-8" : "lg:order-1"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-paper text-ink">
                      {icones[rang]}
                    </div>
                    <span
                      aria-hidden="true"
                      className="font-serif text-4xl leading-none text-brand-orange-dark/60"
                    >
                      0{rang + 1}
                    </span>
                  </div>
                  <h3 className="m-0 text-2xl font-bold leading-tight sm:text-[1.7rem]">
                    {carte.titre}
                  </h3>
                  <p className="m-0 max-w-prose text-[15px] leading-[1.7] text-ink-soft sm:text-base">
                    {carte.texte}
                  </p>
                </div>
                <div
                  className={`lg:col-span-7 ${inverse ? "lg:order-1 lg:col-start-1" : "lg:order-2"}`}
                >
                  {ecrans[rang]}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
