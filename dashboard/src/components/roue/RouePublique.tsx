"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { JEU_INITIAL, jouer } from "@/app/avis/[slug]/roue-actions";

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

  return (
    <g>
      <path
        d={`M50 50 L${x1} ${y1} A50 50 0 ${grand} 1 ${x2} ${y2} Z`}
        fill={COULEURS[index % COULEURS.length]}
      />
      <text
        x="50"
        y="50"
        fill="#fff"
        fontSize={total > 8 ? 3.4 : 4}
        fontWeight="600"
        textAnchor="end"
        dominantBaseline="middle"
        transform={`rotate(${milieu} 50 50) translate(0 -30) rotate(90)`}
      >
        {libelle.length > 22 ? `${libelle.slice(0, 21)}…` : libelle}
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
}: {
  slug: string;
  titre: string;
  sousTitre: string | null;
  /** Les libellés, dans l'ordre exact que le serveur indexe. */
  cases: string[];
  lienGoogle: string | null;
}) {
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
          aria-label={`Roue à ${cases.length} cases`}
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
              <p className="text-sm text-zinc-600">
                Le code part aussi par e-mail. Présente-le lors de ta prochaine
                visite.
              </p>
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
              Laisser un avis sur Google
            </a>
          )}
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="slug" value={slug} />
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Ton e-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="prenom@exemple.fr"
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
            <span>
              J&apos;accepte de recevoir mon lot par e-mail, et des nouvelles de
              la maison. Je peux me désinscrire à tout moment.
            </span>
          </label>

          {state.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || resultat !== null}
            className="rounded-md bg-brand-navy px-4 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending || resultat ? "La roue tourne…" : "Tourner la roue"}
          </button>
        </form>
      )}
    </div>
  );
}
