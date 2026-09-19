"use client";

import { useActionState, useRef, useState } from "react";
import { draftReply, type DraftState } from "@/app/dashboard/[id]/avis/actions";

const initialState: DraftState = { draft: null, error: null, version: 0 };

export function ReviewReplyDraft({
  restaurantId,
  author,
  rating,
  text,
  reviewUrl,
}: {
  restaurantId: string;
  author: string;
  rating: number;
  text: string;
  reviewUrl: string | null;
}) {
  const [state, action, pending] = useActionState(draftReply, initialState);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const value = textareaRef.current?.value;
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <form action={action}>
        <input type="hidden" name="restaurant_id" value={restaurantId} />
        <input type="hidden" name="author" value={author} />
        <input type="hidden" name="rating" value={rating} />
        <input type="hidden" name="text" value={text} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
        >
          {pending
            ? "Rédaction…"
            : state.draft
              ? "Proposer une autre réponse"
              : "Proposer une réponse"}
        </button>
      </form>

      {state.error && <p className="text-xs text-red-600">{state.error}</p>}

      {state.draft && (
        <div className="flex flex-col gap-2">
          {/* key : sans elle, React garde l'ancien texte quand une nouvelle
              proposition arrive, le champ n'étant pas contrôlé. Elle porte sur
              le numéro de proposition et non sur le texte, sinon deux
              propositions identiques laisseraient les retouches en place. */}
          <textarea
            key={state.version}
            ref={textareaRef}
            defaultValue={state.draft}
            rows={7}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-zinc-500"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="rounded-md bg-brand-navy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-navy-hover"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-brand-orange hover:underline"
              >
                Ouvrir l&apos;avis pour coller la réponse →
              </a>
            )}
            <span className="text-xs text-zinc-400">
              Relis avant de publier.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
