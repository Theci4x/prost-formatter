"use client";

import { useActionState, useRef, useState } from "react";
import {
  annulerReponse,
  draftReply,
  marquerRepondu,
  type DraftState,
} from "@/app/dashboard/[id]/avis/actions";

const initialState: DraftState = { draft: null, error: null, version: 0 };

function quand(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
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
}: {
  restaurantId: string;
  cle?: string;
  plateforme?: string;
  author: string;
  rating: number;
  text: string;
  reviewUrl: string | null;
  enregistree?: { reponse: string; reponduLe: string } | null;
}) {
  const [state, action, pending] = useActionState(draftReply, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  // D'où vient le texte en cours : une proposition de Klarr, une saisie à
  // la main (vide, ou la réponse déjà publiée qu'on retouche), ou rien.
  const [source, setSource] = useState<"aucune" | "ia" | "main">("aucune");
  const [depart, setDepart] = useState("");
  const [edition, setEdition] = useState(0);

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
          Répondu le {quand(enregistree.reponduLe)}
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
            Modifier la réponse
          </button>
          {cle && (
            <form action={annulerReponse}>
              <input type="hidden" name="restaurant_id" value={restaurantId} />
              <input type="hidden" name="cle" value={cle} />
              <button
                type="submit"
                className="text-sm text-zinc-500 transition-colors hover:text-ink"
              >
                Remettre dans « sans réponse »
              </button>
            </form>
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
              ? "Rédaction…"
              : source === "ia" && state.draft
                ? "Proposer une autre réponse"
                : "Proposer une réponse"}
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
            Écrire moi-même
          </button>
        )}
      </div>

      {state.error && source === "ia" && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      {texteEnCours !== null && (
        <form
          action={marquerRepondu}
          onSubmit={() => setSource("aucune")}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="restaurant_id" value={restaurantId} />
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
            placeholder="Merci pour votre visite…"
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-brand-navy focus:bg-white"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover"
            >
              {copied ? "Copiée ✓" : "Copier"}
            </button>
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-orange-dark hover:underline"
              >
                Ouvrir l&apos;avis pour coller la réponse ↗
              </a>
            )}
            {cle && (
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                J&apos;ai publié cette réponse
              </button>
            )}
            <button
              type="button"
              onClick={() => setSource("aucune")}
              className="text-sm text-zinc-500 transition-colors hover:text-ink"
            >
              Annuler
            </button>
          </div>
          <span className="text-xs text-zinc-500">
            Relis avant de publier : c&apos;est ton nom sous la réponse.
          </span>
        </form>
      )}
    </div>
  );
}
