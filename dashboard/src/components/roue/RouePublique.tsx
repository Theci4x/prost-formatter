"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { jouer } from "@/app/avis/[slug]/roue-actions";
import { JEU_INITIAL } from "@/lib/roue/jeu";
import type { Langue } from "@/lib/i18n/langues";
import { AVIS } from "@/lib/i18n/avis";

/**
 * La roue, côté client.
 *
 * Elle ne décide de rien. Le serveur rend une case, et l'animation vient
 * se poser dessus : c'est l'ordre qui compte, parce qu'une roue qui
 * choisit dans le navigateur se truque depuis la console.
 *
 * L'animation est en CSS, pas en JavaScript image par image. Sur un
 * téléphone qui a trois onglets ouverts et le service en cours, une
 * boucle d'animation saccade ; une rotation confiée au navigateur, non.
 */

const COULEURS = [
  "#1B2A41",
  "#E8763A",
  "#2F4A63",
  "#F0A868",
  "#3E5C76",
  "#D9542B",
  "#5B7794",
  "#F5C08A",
  "#243B53",
  "#C9491F",
  "#748DA6",
  "#FFD9A8",
];

/** Trois tours complets avant de s'arrêter : moins, ça ne fait pas roue. */
const TOURS = 3;

function Secteur({
  libelle,
  index,
  total,
}: {
  libelle: string;
  index: number;
  total: number;
}) {
  const angle = 360 / total;
  const debut = index * angle;
  // Un secteur au-delà d'un demi-tour a besoin du grand arc.
  const grand = angle > 180 ? 1 : 0;
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = 50 + 50 * Math.cos(rad(debut));
  const y1 = 50 + 50 * Math.sin(rad(debut));
  const x2 = 50 + 50 * Math.cos(rad(debut + angle));
  const y2 = 50 + 50 * Math.sin(rad(debut + angle));
  const milieu = debut + angle / 2;

  // Le texte court le long du rayon, centré à mi-distance du bord.
  const rayonTexte = 30;
  const tx = 50 + rayonTexte * Math.cos(rad(milieu));
  const ty = 50 + rayonTexte * Math.sin(rad(milieu));
  // Au-delà d'un demi-tour, le rayon pointe vers la gauche et le texte se
  // lirait à l'envers : on le retourne. La bascule est à 180°, pas à 90 —
  // la première version coupait au mauvais endroit et retournait quatre
  // cases sur huit.
  const retourne = milieu > 180;

  // Plus il y a de cases, plus les parts sont étroites : la taille suit.
  const taille = total > 8 ? 2.6 : total > 5 ? 3 : 3.4;
  // Ce qui dépasse la part déborde sur la voisine. Le libellé entier
  // reste lisible dans l'annonce du résultat, juste en dessous.
  const maxSignes = Math.max(8, Math.floor(34 / (taille * 0.55)));
  const court =
    libelle.length > maxSignes
      ? `${libelle.slice(0, maxSignes - 1)}…`
      : libelle;

  return (
    <g>
      <path
        d={`M50 50 L${x1} ${y1} A50 50 0 ${grand} 1 ${x2} ${y2} Z`}
        fill={COULEURS[index % COULEURS.length]}
      />
      {/* Le texte est posé à sa place, puis pivoté autour de lui-même.
          Un `rotate` enchaîné après un `translate` tourne autour de
          l'origine du repère et non du texte : il l'expédie hors du
          cadre, ce qui s'est vu. */}
      <text
        x={tx}
        y={ty}
        fill="#fff"
        fontSize={taille}
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${retourne ? milieu + 90 : milieu - 90} ${tx} ${ty})`}
      >
        {court}
      </text>
    </g>
  );
}

export function RouePublique({
  slug,
  titre,
  sousTitre,
  cases,
  lienGoogle,
  langue,
}: {
  slug: string;
  /**
   * Le titre et les libellés des lots sont tapés par le restaurateur : ils
   * restent tels quels. S'il veut une roue en anglais, il l'écrit en
   * anglais — c'est sa voix, on ne la double pas.
   */
  titre: string;
  sousTitre: string | null;
  /** Les libellés, dans l'ordre exact que le serveur indexe. */
  cases: string[];
  lienGoogle: string | null;
  langue: Langue;
}) {
  const a = AVIS[langue];
  const [state, action, pending] = useActionState(jouer, JEU_INITIAL);
  const [angle, setAngle] = useState(0);
  const [arretee, setArretee] = useState(false);
  const derniere = useRef<string | null>(null);

  // Le résultat arrive, la roue va s'y poser. On vise le milieu de la
  // case pour que l'aiguille ne tombe jamais sur une frontière.
  useEffect(() => {
    const resultat = state.resultat;
    if (!resultat) return;
    const cle = `${resultat.index}-${resultat.code ?? ""}`;
    if (derniere.current === cle) return;
    derniere.current = cle;

    const parCase = 360 / Math.max(cases.length, 1);
    const milieu = resultat.index * parCase + parCase / 2;
    setArretee(false);
    setAngle(TOURS * 360 - milieu);
    const minuteur = setTimeout(() => setArretee(true), 4200);
    return () => clearTimeout(minuteur);
  }, [state.resultat, cases.length]);

  const resultat = state.resultat;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-serif text-2xl text-ink">{titre}</h2>
        {sousTitre && <p className="text-sm text-zinc-500">{sousTitre}</p>}
      </div>

      <div className="relative mx-auto w-full max-w-[280px]">
        {/* L'aiguille, en haut, fixe. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-brand-navy"
        />
        <svg
          viewBox="0 0 100 100"
          className="w-full"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: resultat
              ? "transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)"
              : undefined,
          }}
          role="img"
          aria-label={a.roueACases(cases.length)}
        >
          {cases.map((libelle, index) => (
            <Secteur
              key={`${libelle}-${index}`}
              libelle={libelle}
              index={index}
              total={cases.length}
            />
          ))}
          <circle cx="50" cy="50" r="6" fill="#fff" />
        </svg>
      </div>

      {/* Tant que la roue tourne, on ne dit rien : l'annoncer avant qu'elle
          s'arrête gâche les quatre secondes qui font tout l'intérêt. */}
      {resultat && arretee ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-brand-cream p-5 text-center"
          role="status"
        >
          {resultat.gagnant ? (
            <>
              <p className="text-lg font-semibold text-ink">
                {resultat.libelle}
              </p>
              <p className="font-mono text-3xl font-bold tracking-[0.18em] text-brand-navy">
                {resultat.code}
              </p>
              <p className="text-sm text-zinc-600">{a.codeParEmail}</p>
            </>
          ) : (
            <p className="text-base font-medium text-ink">{resultat.libelle}</p>
          )}

          {lienGoogle && (
            <a
              href={lienGoogle}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 w-full rounded-md border border-zinc-300 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              {a.laisserUnAvisSurGoogle}
            </a>
          )}
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="slug" value={slug} />
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            {a.tonEmail}
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={a.exempleEmail}
              // 16 px au moins : en dessous, iOS zoome sur le champ et le
              // client se retrouve avec une page décadrée.
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-brand-navy"
            />
          </label>

          <label className="flex items-start gap-2.5 text-sm text-zinc-600">
            <input
              type="checkbox"
              name="consentement"
              className="mt-0.5"
              required
            />
            <span>{a.consentementLot}</span>
          </label>

          {state.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || Boolean(resultat)}
            className="rounded-md bg-brand-navy px-4 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending || resultat ? a.laRoueTourne : a.tournerLaRoue}
          </button>
        </form>
      )}
    </div>
  );
}
