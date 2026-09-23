"use client";

import { useEffect, useState } from "react";

/**
 * L'attente, pendant que l'analyse s'écrit.
 *
 * Une vingtaine de secondes, et un bouton grisé tout seul se lit comme
 * une panne. On montre trois choses : ce que l'outil est en train de
 * faire — quatre étapes nommées, qui avancent —, une rangée d'icônes de
 * cuisine et de recherche qui défile lentement, et la forme du texte à
 * venir sous un balayage clair.
 *
 * Les étapes avancent à l'horloge, pas au vrai avancement : on ne sait
 * pas où en est le modèle, et une barre qui prétend le savoir se fige à
 * 90 % et inquiète. Quatre étapes de cinq secondes couvrent une analyse
 * ordinaire ; la dernière reste allumée si elle traîne, sans jamais
 * annoncer « terminé » avant que le texte arrive.
 */

const ETAPES = [
  "Lecture de la fiche et des requêtes mesurées",
  "Repérage du quartier, des concurrents, des intentions",
  "Croisement avec les mots-clés ciblés",
  "Rédaction des recommandations",
] as const;

const CADENCE_MS = 5000;

export function Patience({ aUneAnalyse }: { aUneAnalyse: boolean }) {
  const [etape, setEtape] = useState(0);

  useEffect(() => {
    const minuterie = setInterval(
      () => setEtape((e) => Math.min(e + 1, ETAPES.length - 1)),
      CADENCE_MS,
    );
    return () => clearInterval(minuterie);
  }, []);

  return (
    <div
      className="flex flex-col gap-6 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm sm:p-6"
      role="status"
      aria-live="polite"
    >
      {/* La rangée qui défile. Deux copies : la translation de -50 %
          boucle sans saut. Masquée aux lecteurs d'écran, qui ont l'étape
          en toutes lettres juste en dessous. */}
      <div
        aria-hidden="true"
        className="relative -mx-5 overflow-hidden sm:-mx-6"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="klarr-defile flex w-max items-center gap-10 px-5 text-zinc-300 sm:px-6">
          {[0, 1].map((copie) => (
            <div key={copie} className="flex items-center gap-10">
              {ICONES.map((icone, i) => (
                <span key={i} className="shrink-0">
                  {icone}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Les étapes. Celle en cours respire et porte l'accent ; les
          passées sont cochées ; les suivantes attendent, en retrait. */}
      <ol className="flex flex-col gap-2.5">
        {ETAPES.map((libelle, i) => {
          const passee = i < etape;
          const enCours = i === etape;
          return (
            <li
              key={libelle}
              className={`flex items-center gap-3 text-sm transition-colors ${
                enCours
                  ? "text-ink"
                  : passee
                    ? "text-ink-soft"
                    : "text-zinc-400"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  passee
                    ? "border-brand-orange-dark bg-brand-orange-dark text-white"
                    : enCours
                      ? "klarr-etape border-brand-orange bg-brand-orange-soft"
                      : "border-line"
                }`}
              >
                {passee && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5.2l2.2 2.2L8 3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {enCours && (
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                )}
              </span>
              <span>{libelle}</span>
              {enCours && <span className="sr-only"> (en cours)</span>}
            </li>
          );
        })}
      </ol>

      {/* La forme du texte à venir, balayée. */}
      <div aria-hidden="true" className="relative overflow-hidden rounded-lg">
        <div className="flex flex-col gap-2.5">
          <div className="h-3.5 w-2/5 rounded bg-zinc-200/80" />
          <div className="h-2.5 w-full rounded bg-zinc-100" />
          <div className="h-2.5 w-11/12 rounded bg-zinc-100" />
          <div className="h-2.5 w-4/5 rounded bg-zinc-100" />
          <div className="mt-1.5 h-3.5 w-1/3 rounded bg-zinc-200/80" />
          <div className="h-2.5 w-full rounded bg-zinc-100" />
          <div className="h-2.5 w-3/4 rounded bg-zinc-100" />
        </div>
        <div
          className="klarr-balaie pointer-events-none absolute inset-y-0 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)",
          }}
        />
      </div>

      <p className="text-xs text-zinc-500">
        Une analyse prend une vingtaine de secondes.
        {aUneAnalyse ? " La précédente revient si celle-ci échoue." : ""}
      </p>
    </div>
  );
}

/* Trait fin, 24 px, couleur héritée. Cuisine et recherche en alternance,
   pour que la rangée dise « restaurant » et « analyse » d'un même souffle. */
const trait = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONES = [
  // Loupe
  <svg key="loupe" {...trait}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-3.8-3.8" />
  </svg>,
  // Cloche de service
  <svg key="cloche" {...trait}>
    <path d="M3 17h18" />
    <path d="M5 17a7 7 0 0 1 14 0" />
    <path d="M12 10V8" />
    <circle cx="12" cy="7" r="1" />
  </svg>,
  // Étincelles (l'IA)
  <svg key="etincelles" {...trait}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </svg>,
  // Poêle
  <svg key="poele" {...trait}>
    <circle cx="10" cy="13" r="6" />
    <path d="M16 13h5" />
  </svg>,
  // Repère de carte (le quartier)
  <svg key="repere" {...trait}>
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
    <circle cx="12" cy="11" r="2" />
  </svg>,
  // Couteau et fourchette
  <svg key="couverts" {...trait}>
    <path d="M7 3v18" />
    <path d="M5 3v5a2 2 0 0 0 4 0V3" />
    <path d="M16 3c-1.5 2-2 4.5-2 7 0 1.5 1 2 2 2v9" />
  </svg>,
  // Courbe qui monte
  <svg key="courbe" {...trait}>
    <path d="M3 17l5-5 4 4 8-8" />
    <path d="M15 8h5v5" />
  </svg>,
  // Toque
  <svg key="toque" {...trait}>
    <path d="M7 14a4 4 0 0 1 .7-7.9A5 5 0 0 1 17 7a4 4 0 0 1 0 7" />
    <path d="M7 14v6h10v-6" />
    <path d="M7 17h10" />
  </svg>,
  // Bulle (l'avis, la question)
  <svg key="bulle" {...trait}>
    <path d="M4 5h16v10H9l-5 4z" />
  </svg>,
  // Verre
  <svg key="verre" {...trait}>
    <path d="M7 3h10l-1 8a4 4 0 0 1-8 0z" />
    <path d="M12 15v6M9 21h6" />
  </svg>,
];
