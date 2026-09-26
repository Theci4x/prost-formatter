import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";
import type { Langue } from "@/lib/i18n/langue";
import { DETAILS } from "@/lib/i18n/detailsAccueil";
import { Etiquette } from "@/components/landing/MaquetteIa";
import { MAISON, MATIN } from "@/lib/demo/maison";

/**
 * La carte du matin, avec ce qui cloche.
 *
 * Quatre chiffres qu'on lit en ouvrant le téléphone — et une ligne
 * orange qui dit ce que personne n'aurait vu : un avis à deux étoiles est
 * tombé dans la nuit et attend une réponse. Les libellés des chiffres sont
 * ceux du vrai tableau de bord, dans ses trois langues ; la ligne orange,
 * elle, est écrite pour la démonstration — la vraie alerte « fiche fermée »
 * ne parle à personne qui envisage de s'abonner.
 */
export function MaquetteAlerte({
  t,
  exemple,
  langue,
  lieu,
}: {
  t: ClesAccueilPublic["vitrine"]["alerte"];
  exemple: string;
  langue: Langue;
  /** « Bistrot · Lyon 2e », dans la langue du visiteur. */
  lieu: string;
}) {
  const d = DETAILS[langue];
  const chiffres: { valeur: string; libelle: string; attention?: boolean }[] = [
    {
      valeur: `${MATIN.couvertsMidi} · ${MATIN.couvertsSoir}`,
      libelle: d.couvertsMidiSoir,
    },
    {
      valeur: String(MATIN.demandes),
      // Le libellé ne porte pas le nombre : le chiffre au-dessus s'en
      // charge, comme sur la vraie carte.
      libelle: d.demandesAConfirmer(MATIN.demandes),
      attention: true,
    },
    {
      valeur: String(MATIN.retours),
      libelle: d.retoursClientsALire(MATIN.retours),
    },
    {
      valeur: MATIN.note.toLocaleString("fr-FR"),
      libelle: d.surGoogleAvis(MATIN.avis),
    },
  ];

  return (
    <div
      aria-label={`${exemple} — ${t.surtitre}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_40px_90px_-40px_oklch(20%_0.02_60/40%)]"
    >
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-orange-dark">
          {t.surtitre}
        </span>
        <span className="text-ink-soft">
          <Etiquette>{exemple}</Etiquette>
        </span>
      </div>

      {/* L'en-tête de la carte, comme sur l'accueil du tableau de bord. */}
      <div className="flex items-end justify-between gap-4 bg-gradient-to-br from-brand-orange-soft/70 to-paper px-5 pb-4 pt-4 sm:px-6">
        <div className="flex flex-col gap-0.5">
          <span className="font-serif text-3xl leading-none text-ink">
            {MAISON.nom}
          </span>
          <span className="text-xs text-ink-soft">{lieu}</span>
        </div>
        <span className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink">
          ★ {MATIN.note.toLocaleString("fr-FR")}
          <span className="text-ink-soft"> · {MATIN.avis}</span>
        </span>
      </div>

      <div className="border-t border-line px-5 pb-2 pt-3 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
          {t.aujourdhui}
        </p>
        <div className="grid grid-cols-2 gap-x-4 sm:grid-cols-4">
          {chiffres.map((c) => (
            <div key={c.libelle} className="flex flex-col gap-1 py-3">
              <span className="flex items-baseline gap-2">
                <span className="font-serif text-[1.9rem] leading-none text-ink">
                  {c.valeur}
                </span>
                {c.attention && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-brand-orange"
                  />
                )}
              </span>
              <span className="text-[12px] leading-snug text-ink-soft">
                {c.libelle}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ce qui cloche : la seule ligne colorée de la carte. */}
      <div className="flex items-center gap-3 border-t border-brand-orange/30 bg-brand-orange-soft px-5 py-3.5 text-sm text-ink sm:px-6">
        <span aria-hidden="true" className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="klarr-etape absolute inline-flex h-full w-full rounded-full bg-brand-orange/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange" />
        </span>
        <span className="font-medium">{t.signal}</span>
      </div>
    </div>
  );
}
