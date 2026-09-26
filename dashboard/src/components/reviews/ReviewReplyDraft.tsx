"use client";

import { useActionState, useRef, useState } from "react";
import {
  annulerReponse,
  draftReply,
  marquerRepondu,
  publierReponseGoogle,
  retirerReponseDeGoogle,
  type DraftState,
  type PublicationState,
} from "@/app/dashboard/[id]/avis/actions";
import type { Langue } from "@/lib/i18n/langues";
import { localeDe } from "@/lib/i18n/seo";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { AVIS } from "@/lib/i18n/pages/avis";

const initialState: DraftState = { draft: null, error: null, version: 0 };
const publicationInitiale: PublicationState = {
  ok: false,
  error: null,
  version: 0,
};

/** Google limite une réponse à 4 096 caractères. */
const LONGUEUR_GOOGLE = 4096;

function quand(iso: string, langue: Langue): string {
  return new Date(iso).toLocaleDateString(localeDe(langue), {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
}

/**
 * Répondre à un avis, en attendant que Klarr puisse publier lui-même.
 *
 * Klarr propose, le restaurateur retouche, copie, colle sur la plateforme,
 * puis dit « j'ai publié ». Ce dernier geste compte : sans lui, l'avis
 * reste « sans réponse » et l'écran le reproposera. La réponse gardée
 * servira aussi le jour où la publication directe arrivera.
 *
 * Sans `cle` (un avis collé à la main, que Klarr ne voit pas), rien ne
 * s'enregistre : il n'y a pas d'avis auquel rattacher la réponse.
 *
 * Avec `googleName` (un avis lu sur la fiche Google du restaurateur),
 * plus de copier-coller : Klarr publie la réponse sous l'avis, la remplace
 * ou la retire.
 */
export function ReviewReplyDraft({
  restaurantId,
  cle,
  plateforme,
  author,
  rating,
  text,
  reviewUrl,
  enregistree,
  googleName,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
  cle?: string;
  plateforme?: string;
  author: string;
  rating: number;
  text: string;
  reviewUrl: string | null;
  enregistree?: { reponse: string; reponduLe: string } | null;
  /** L'avis sur la fiche Google : Klarr peut y publier la réponse. */
  googleName?: string;
}) {
  const t = traducteur(langue, AVIS, COMMUN);
  const [state, action, pending] = useActionState(draftReply, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  // D'où vient le texte en cours : une proposition de Klarr, une saisie à
  // la main (vide, ou la réponse déjà publiée qu'on retouche), ou rien.
  const [source, setSource] = useState<"aucune" | "ia" | "main">("aucune");
  const [depart, setDepart] = useState("");
  const [edition, setEdition] = useState(0);
  const [publication, publier, publicationEnCours] = useActionState(
    publierReponseGoogle,
    publicationInitiale,
  );
  // Une réponse publiée referme l'éditeur : la page revient avec l'avis
  // marqué « répondu ». Réglé pendant le rendu, à l'arrivée du résultat.
  const [publicationVue, setPublicationVue] = useState(0);
  if (publication.version !== publicationVue) {
    setPublicationVue(publication.version);
    if (publication.ok) setSource("aucune");
  }
  const direct = Boolean(googleName && cle);

  async function copy() {
    const value = textareaRef.current?.value;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers refusé : le texte reste sélectionnable à la main.
    }
  }

  const texteEnCours =
    source === "ia" ? state.draft : source === "main" ? depart : null;

  if (enregistree && source === "aucune") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-emerald-500"
          />
          {direct
            ? t("Publiée sur Google le {date}", {
                date: quand(enregistree.reponduLe, langue),
              })
            : t("Répondu le {date}", {
                date: quand(enregistree.reponduLe, langue),
              })}
        </span>
        <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
          {enregistree.reponse}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setDepart(enregistree.reponse);
              setEdition((n) => n + 1);
              setSource("main");
            }}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
          >
            {t("Modifier la réponse")}
          </button>
          {direct ? (
            <form
              action={retirerReponseDeGoogle}
              onSubmit={(event) => {
                if (!confirm(t("Retirer cette réponse de Google ?"))) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="restaurant_id" value={restaurantId} />
              <input type="hidden" name="cle" value={cle} />
              <input type="hidden" name="avis_name" value={googleName} />
              <button
                type="submit"
                className="text-sm text-zinc-500 transition-colors hover:text-red-700"
              >
                {t("Retirer de Google")}
              </button>
            </form>
          ) : (
            cle && (
              <form action={annulerReponse}>
                <input
                  type="hidden"
                  name="restaurant_id"
                  value={restaurantId}
                />
                <input type="hidden" name="cle" value={cle} />
                <button
                  type="submit"
                  className="text-sm text-zinc-500 transition-colors hover:text-ink"
                >
                  {t("Remettre dans « sans réponse »")}
                </button>
              </form>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <form action={action} onSubmit={() => setSource("ia")}>
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          <input type="hidden" name="author" value={author} />
          <input type="hidden" name="rating" value={rating} />
          <input type="hidden" name="text" value={text} />
          <input type="hidden" name="plateforme" value={plateforme ?? ""} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
          >
            {pending
              ? t("Rédaction…")
              : source === "ia" && state.draft
                ? t("Proposer une autre réponse")
                : t("Proposer une réponse")}
          </button>
        </form>
        {source === "aucune" && (
          <button
            type="button"
            onClick={() => {
              setDepart("");
              setEdition((n) => n + 1);
              setSource("main");
            }}
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-ink"
          >
            {t("Écrire moi-même")}
          </button>
        )}
      </div>

      {state.error && source === "ia" && (
        <p className="text-sm text-red-600" role="alert">
          {t(state.error)}
        </p>
      )}

      {texteEnCours !== null && (
        <form
          action={direct ? publier : marquerRepondu}
          onSubmit={() => {
            if (!direct) setSource("aucune");
          }}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="restaurant_id" value={restaurantId} />
          {direct && (
            <input type="hidden" name="avis_name" value={googleName} />
          )}
          <input type="hidden" name="cle" value={cle ?? ""} />
          <input type="hidden" name="plateforme" value={plateforme ?? ""} />
          <input type="hidden" name="auteur" value={author} />
          <input type="hidden" name="note" value={rating} />
          {/* key : le champ n'est pas contrôlé, et sans elle React garde
              l'ancien texte quand une nouvelle proposition arrive. Elle
              porte sur le numéro de proposition et non sur le texte, sinon
              deux propositions identiques laisseraient les retouches. */}
          <textarea
            key={`${source}-${source === "ia" ? state.version : edition}`}
            ref={textareaRef}
            name="reponse"
            defaultValue={texteEnCours ?? ""}
            rows={7}
            required
            maxLength={direct ? LONGUEUR_GOOGLE : undefined}
            placeholder={t("Merci pour votre visite…")}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-brand-navy focus:bg-white"
          />
          {direct ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={publicationEnCours}
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
              >
                {publicationEnCours
                  ? t("Publication…")
                  : enregistree
                    ? t("Remplacer sur Google")
                    : t("Publier sur Google")}
              </button>
              <button
                type="button"
                onClick={() => setSource("aucune")}
                className="text-sm text-zinc-500 transition-colors hover:text-ink"
              >
                {t("Annuler")}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={copy}
                className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
              >
                {copied ? t("Copiée ✓") : t("Copier")}
              </button>
              {reviewUrl && (
                <a
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-brand-orange-dark hover:underline"
                >
                  {t("Ouvrir l'avis pour coller la réponse ↗")}
                </a>
              )}
              {cle && (
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {t("J'ai publié cette réponse")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSource("aucune")}
                className="text-sm text-zinc-500 transition-colors hover:text-ink"
              >
                {t("Annuler")}
              </button>
            </div>
          )}
          {direct && publication.error && !publication.ok && (
            <p className="text-sm text-red-600" role="alert">
              {t(publication.error)}
            </p>
          )}
          <span className="text-xs text-zinc-500">
            {t("Relis avant de publier : c'est ton nom sous la réponse.")}
          </span>
        </form>
      )}
    </div>
  );
}
