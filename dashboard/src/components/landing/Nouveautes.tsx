import type { ClesAccueilPublic } from "@/lib/i18n/accueilPublic";
import type { Langue } from "@/lib/i18n/langue";
import { Reveal } from "@/components/landing/Reveal";
import { Etiquette } from "@/components/landing/MaquetteIa";
import {
  AVIS_ETRANGER,
  COLONNES_EXPORT,
  MAISON,
  PRESENCE,
  PRESENCE_A_JOUR,
  PRESENCE_TOTAL,
} from "@/lib/demo/maison";

/**
 * « Nouveau sur Klarr ».
 *
 * Quatre choses arrivées d'un coup, montrées comme le reste de la page :
 * chacune avec son écran, sur la maison fictive. La présence en ligne
 * prend toute la largeur — c'est celle qui répond à « et ailleurs que
 * sur Google ? », la question que pose tout restaurateur qui compare
 * avec les agences. Les trois autres tiennent sur une rangée.
 *
 * Les écrans ne promettent rien de plus que le produit : pas de bouton
 * « synchroniser » sur la présence, une réponse « proposée » et un
 * « J'ai publié » sur l'avis.
 */

const LOCALE: Record<Langue, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-CN",
};

const CADRE =
  "flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_30px_70px_-40px_oklch(20%_0.02_60/40%)]";

function EnTete({ surtitre, exemple }: { surtitre: string; exemple: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-5">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand-orange-dark">
        {surtitre}
      </span>
      <span className="text-ink-soft">
        <Etiquette>{exemple}</Etiquette>
      </span>
    </div>
  );
}

function Coche() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-brand-orange-dark"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Une ligne orange qui pulse : ce que le restaurateur n'aurait pas vu. */
function Signal({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-brand-orange/30 bg-brand-orange-soft px-5 py-3.5 text-sm text-ink">
      <span aria-hidden="true" className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="klarr-etape absolute inline-flex h-full w-full rounded-full bg-brand-orange/60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-orange" />
      </span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function MaquettePresence({
  t,
  exemple,
}: {
  t: ClesAccueilPublic["nouveautes"]["presence"]["maquette"];
  exemple: string;
}) {
  // Le statut se lit en toutes lettres, la couleur ne fait que suivre.
  const STATUT = {
    a_jour: {
      libelle: t.aJour,
      point: "bg-emerald-500",
      texte: "text-emerald-700",
    },
    a_corriger: {
      libelle: t.aCorriger,
      point: "bg-brand-orange",
      texte: "text-brand-orange-dark",
    },
    absente: {
      libelle: t.absente,
      point: "bg-zinc-300",
      texte: "text-ink-soft",
    },
  } as const;
  const part = Math.round((PRESENCE_A_JOUR / PRESENCE_TOTAL) * 100);

  return (
    <div aria-label={`${exemple} — ${t.surtitre}`} className={CADRE}>
      <EnTete surtitre={t.surtitre} exemple={exemple} />
      <div className="flex flex-col gap-2 px-5 pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-serif text-2xl leading-none text-ink">
            {MAISON.nom}
          </span>
          <span className="text-sm font-semibold text-ink">
            {t.compte
              .replace("{n}", String(PRESENCE_A_JOUR))
              .replace("{total}", String(PRESENCE_TOTAL))}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-alt)]"
        >
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${part}%` }}
          />
        </div>
      </div>
      <ul className="grid gap-x-6 px-5 pb-3 pt-2 sm:grid-cols-2">
        {PRESENCE.map((ligne) => {
          const nom = ligne.nom ?? t.apple;
          const statut = STATUT[ligne.statut];
          return (
            <li
              key={nom}
              className="flex min-w-0 items-center justify-between gap-3 border-b border-line/70 py-2.5 text-sm"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-[var(--bg-alt)] text-[11px] font-bold text-ink-soft"
                >
                  {nom.charAt(0)}
                </span>
                <span className="truncate font-medium text-ink">{nom}</span>
              </span>
              <span
                className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold ${statut.texte}`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${statut.point}`}
                />
                {statut.libelle}
              </span>
            </li>
          );
        })}
      </ul>
      <Signal>{t.alerte}</Signal>
    </div>
  );
}

function MaquetteAvis({
  t,
  exemple,
}: {
  t: ClesAccueilPublic["nouveautes"]["avis"]["maquette"];
  exemple: string;
}) {
  const a = AVIS_ETRANGER;
  return (
    <div aria-label={`${exemple} — ${t.surtitre}`} className={CADRE}>
      <EnTete surtitre={t.surtitre} exemple={exemple} />
      <div className="flex flex-col gap-3 px-5 pb-5 pt-4">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-ink">
              {a.auteur}
              <span className="font-normal text-ink-soft">
                {" "}
                · {a.plateforme}
              </span>
            </span>
            <span
              className="tracking-[0.1em] text-brand-orange"
              aria-label={`${a.note}/5`}
            >
              {"★".repeat(a.note)}
              <span className="text-line">{"★".repeat(5 - a.note)}</span>
            </span>
          </span>
          <p lang="it" className="m-0 text-[13.5px] leading-relaxed text-ink">
            {a.texte}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-brand-orange/25 bg-brand-orange-soft/60 p-3.5">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
              {t.proposee}
            </span>
            <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-medium text-ink-soft">
              {t.langue}
            </span>
          </span>
          <p lang="it" className="m-0 text-[13px] leading-relaxed text-ink">
            {a.reponse}
          </p>
        </div>
        {/* Des boutons dessinés, pas des boutons : rien ne se clique ici. */}
        <div aria-hidden="true" className="flex gap-2">
          <span className="rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink">
            {t.copier}
          </span>
          <span className="rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white">
            {t.publiee}
          </span>
        </div>
      </div>
    </div>
  );
}

function MaquetteBilan({
  t,
  exemple,
}: {
  t: ClesAccueilPublic["nouveautes"]["bilan"]["maquette"];
  exemple: string;
}) {
  return (
    <div aria-label={`${exemple} — ${t.surtitre}`} className={CADRE}>
      <EnTete surtitre={t.surtitre} exemple={exemple} />
      <div className="flex flex-col gap-0.5 px-5 pt-4">
        <span className="font-serif text-2xl leading-tight text-ink">
          {t.objet}
        </span>
        <span className="text-xs text-ink-soft">{MAISON.nom}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 px-5 pb-5 pt-4">
        {t.tuiles.map((tuile) => (
          <div
            key={tuile.libelle}
            className="flex flex-col gap-1 rounded-xl border border-line bg-[var(--bg-alt)] px-3.5 py-3"
          >
            <span className="font-serif text-[1.6rem] leading-none text-ink">
              {tuile.valeur}
            </span>
            <span className="text-[12px] leading-snug text-ink-soft">
              {tuile.libelle}
            </span>
          </div>
        ))}
      </div>
      <Signal>{t.aFaire}</Signal>
    </div>
  );
}

function MaquetteImport({
  t,
  exemple,
  langue,
}: {
  t: ClesAccueilPublic["nouveautes"]["import"]["maquette"];
  exemple: string;
  langue: Langue;
}) {
  const nombre = (n: number) => n.toLocaleString(LOCALE[langue]);
  const bilan = [
    { valeur: nombre(1842), libelle: t.clients },
    { valeur: nombre(96), libelle: t.reservations },
    { valeur: nombre(37), libelle: t.dejaLa },
  ];
  return (
    <div aria-label={`${exemple} — ${t.surtitre}`} className={CADRE}>
      <EnTete surtitre={t.surtitre} exemple={exemple} />
      <div className="flex flex-col gap-2 px-5 pt-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
          {t.colonnes}
        </span>
        <ul className="flex flex-col">
          {COLONNES_EXPORT.map((colonne, rang) => (
            <li
              key={colonne}
              className="flex items-center justify-between gap-3 border-b border-line/70 py-1.5 text-[13px]"
            >
              <span className="truncate rounded-md bg-[var(--bg-alt)] px-2 py-0.5 font-mono text-[12px] text-ink-soft">
                {colonne}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 font-semibold text-ink">
                <span aria-hidden="true" className="text-ink-soft">
                  →
                </span>
                {t.champs[rang]}
                <span aria-hidden="true" className="text-emerald-600">
                  ✓
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-3 gap-3 px-5 pb-5 pt-4">
        {bilan.map((ligne) => (
          <div key={ligne.libelle} className="flex flex-col gap-1">
            <span className="font-serif text-[1.6rem] leading-none text-ink">
              {ligne.valeur}
            </span>
            <span className="text-[11.5px] leading-snug text-ink-soft">
              {ligne.libelle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Nouveautes({
  t,
  exemple,
  langue,
}: {
  t: ClesAccueilPublic["nouveautes"];
  exemple: string;
  langue: Langue;
}) {
  const cartes = [
    {
      titre: t.avis.titre,
      texte: t.avis.texte,
      ecran: <MaquetteAvis t={t.avis.maquette} exemple={exemple} />,
    },
    {
      titre: t.bilan.titre,
      texte: t.bilan.texte,
      ecran: <MaquetteBilan t={t.bilan.maquette} exemple={exemple} />,
    },
    {
      titre: t.import.titre,
      texte: t.import.texte,
      ecran: (
        <MaquetteImport
          t={t.import.maquette}
          exemple={exemple}
          langue={langue}
        />
      ),
    },
  ];

  return (
    <div id="nouveautes" className="px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-10 sm:gap-14">
        <Reveal>
          <div className="flex max-w-[680px] flex-col gap-4">
            <span className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.08em] text-brand-orange-dark">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-brand-orange"
              />
              {t.surtitre}
            </span>
            <h2 className="m-0 font-serif text-4xl leading-[1.15] sm:text-5xl">
              {t.titre}
            </h2>
            <p className="m-0 text-[17px] leading-[1.65] text-ink-soft">
              {t.chapo}
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid items-center gap-8 rounded-3xl border border-line bg-[var(--bg-alt)] p-5 sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-12">
            <div className="flex flex-col gap-5 lg:col-span-5">
              <h3 className="m-0 text-2xl font-bold leading-tight sm:text-[1.7rem]">
                {t.presence.titre}
              </h3>
              <p className="m-0 text-[15px] leading-[1.7] text-ink-soft sm:text-base">
                {t.presence.texte}
              </p>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {t.presence.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-[15px] leading-snug text-ink"
                  >
                    <Coche />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <MaquettePresence t={t.presence.maquette} exemple={exemple} />
            </div>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {cartes.map((carte) => (
            <Reveal key={carte.titre}>
              <div className="flex h-full flex-col gap-6 rounded-3xl border border-line bg-[var(--bg-alt)] p-5 sm:p-6">
                <div className="flex flex-col gap-2.5">
                  <h3 className="m-0 text-xl font-bold leading-tight">
                    {carte.titre}
                  </h3>
                  <p className="m-0 text-[15px] leading-[1.65] text-ink-soft">
                    {carte.texte}
                  </p>
                </div>
                <div className="mt-auto">{carte.ecran}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
