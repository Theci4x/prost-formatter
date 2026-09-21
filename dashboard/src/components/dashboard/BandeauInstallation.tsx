"use client";

import { useEffect, useState } from "react";

/**
 * L'invitation à poser Klarr sur l'écran d'accueil.
 *
 * Installé, Klarr s'ouvre en plein écran, en un geste, et peut prévenir
 * d'une réservation — sur iPhone, Apple ne l'autorise même qu'à cette
 * condition. Mais le chemin pour y arriver (« Partager », puis « Sur
 * l'écran d'accueil ») ne se devine pas : il s'explique aujourd'hui au
 * téléphone, un restaurateur à la fois. Cet écran le fait à notre place.
 *
 * Trois règles pour qu'il ne devienne pas une publicité qu'on subit :
 * il ne paraît jamais quand Klarr est déjà installé, il se ferme
 * définitivement d'un clic, et il ne revient pas avant un mois.
 */

const CLE_REFUS = "klarr-installation-refusee";
const REPIT_JOURS = 30;

type Plateforme = "ios" | "android" | "bureau";

/**
 * L'invite native d'Android et de Chrome. Le navigateur la propose quand
 * il juge le site installable ; on la met de côté pour la déclencher au
 * moment choisi par le restaurateur, pas au sien.
 */
type InvitePossible = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function refusRecent(): boolean {
  try {
    const trace = window.localStorage.getItem(CLE_REFUS);
    if (!trace) return false;
    const depuis = Date.now() - Number(trace);
    return depuis < REPIT_JOURS * 86400000;
  } catch {
    // Navigation privée, stockage bloqué : on préfère ne pas insister.
    return true;
  }
}

/**
 * Ce que le navigateur permet, ici et maintenant. Null quand il n'y a
 * rien à proposer : déjà installé, refusé récemment, ou sur un ordinateur
 * — l'installation n'y apporte presque rien, et on ne dérange pas
 * quelqu'un devant son clavier pour un raccourci.
 */
function detecter(): Plateforme | null {
  const installe =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (installe || refusRecent()) return null;

  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return null;
}

export function BandeauInstallation() {
  const [plateforme, setPlateforme] = useState<Plateforme | null>(null);
  const [ferme, setFerme] = useState(false);
  const [invite, setInvite] = useState<InvitePossible | null>(null);
  const [gestesOuverts, setGestesOuverts] = useState(false);

  useEffect(() => {
    // La détection lit le navigateur, ce qui n'a rien à faire pendant le
    // rendu : elle rend un verdict, et une microtâche le pose — un seul
    // état, une seule fois.
    let vivant = true;
    Promise.resolve()
      .then(detecter)
      .then((verdict) => {
        if (vivant) setPlateforme(verdict);
      });
    return () => {
      vivant = false;
    };
  }, []);

  useEffect(() => {
    function retenir(evenement: Event) {
      // Sans ça, Chrome affiche sa propre bannière au moment qui lui
      // plaît, souvent en plein travail.
      evenement.preventDefault();
      setInvite(evenement as InvitePossible);
    }
    window.addEventListener("beforeinstallprompt", retenir);
    return () => window.removeEventListener("beforeinstallprompt", retenir);
  }, []);

  function refuser() {
    try {
      window.localStorage.setItem(CLE_REFUS, String(Date.now()));
    } catch {
      // Tant pis : le bandeau reparaîtra au prochain passage.
    }
    setFerme(true);
  }

  async function installer() {
    if (!invite) {
      // Aucune invite native (tout iPhone, et Android qui n'en propose
      // pas) : on montre les gestes, et le même bouton les referme.
      setGestesOuverts((ouverts) => !ouverts);
      return;
    }
    await invite.prompt();
    const choix = await invite.userChoice;
    if (choix.outcome === "accepted") setFerme(true);
    setInvite(null);
  }

  if (!plateforme || ferme) return null;

  return (
    <div className="border-b border-line bg-brand-orange-soft">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 pr-12 sm:px-6 sm:pr-12">
        {/* Le « × » se pose dans le coin plutôt que dans la rangée : au
            téléphone, trois éléments sur une ligne réduisent le texte à
            une colonne de trois mots. */}
        <button
          type="button"
          onClick={refuser}
          aria-label="Masquer cette proposition"
          className="absolute right-2 top-2 rounded-lg p-2 text-ink-soft transition-colors hover:text-ink"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-brand-navy"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <path d="M11 18h2" />
            </svg>
          </span>

          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-[15px] font-semibold text-ink">
              Posez Klarr sur votre écran d&apos;accueil
            </p>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              {plateforme === "ios"
                ? "Votre carnet en un geste, et les réservations qui arrivent même téléphone verrouillé — Apple ne les autorise que pour les applications installées."
                : "Votre carnet en un geste, et les réservations qui arrivent même téléphone verrouillé."}
            </p>
          </div>

          <button
            type="button"
            onClick={installer}
            className="shrink-0 self-start rounded-lg bg-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand-navy sm:ml-auto sm:self-center"
          >
            {plateforme === "ios"
              ? gestesOuverts
                ? "Masquer"
                : "Comment faire"
              : "Installer"}
          </button>
        </div>

        {/* Les gestes, montrés seulement quand on les demande : sur
            iPhone il n'existe aucune invite native, il faut les décrire. */}
        {(plateforme === "ios" && gestesOuverts) ||
        (plateforme === "android" && gestesOuverts && !invite) ? (
          <ol className="flex flex-col gap-1.5 rounded-xl bg-paper/70 px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
            {plateforme === "ios" ? (
              <>
                <li>
                  <strong className="font-semibold text-ink">1.</strong> Touchez
                  le bouton{" "}
                  <strong className="font-semibold text-ink">Partager</strong>{" "}
                  en bas de l&apos;écran — le carré avec une flèche vers le
                  haut.
                </li>
                <li>
                  <strong className="font-semibold text-ink">2.</strong> Faites
                  défiler, puis touchez{" "}
                  <strong className="font-semibold text-ink">
                    Sur l&apos;écran d&apos;accueil
                  </strong>
                  .
                </li>
                <li>
                  <strong className="font-semibold text-ink">3.</strong> Touchez{" "}
                  <strong className="font-semibold text-ink">Ajouter</strong>,
                  puis ouvrez Klarr depuis sa nouvelle icône.
                </li>
                <li className="pt-1 text-ink-soft/80">
                  Depuis Safari uniquement : Apple ne le permet pas depuis un
                  autre navigateur.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong className="font-semibold text-ink">1.</strong> Ouvrez
                  le menu <strong className="font-semibold text-ink">⋮</strong>{" "}
                  de votre navigateur, en haut à droite.
                </li>
                <li>
                  <strong className="font-semibold text-ink">2.</strong> Touchez{" "}
                  <strong className="font-semibold text-ink">
                    Installer l&apos;application
                  </strong>{" "}
                  ou{" "}
                  <strong className="font-semibold text-ink">
                    Ajouter à l&apos;écran d&apos;accueil
                  </strong>
                  .
                </li>
              </>
            )}
          </ol>
        ) : null}
      </div>
    </div>
  );
}
