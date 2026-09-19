"use client";

import { useActionState, useRef, useState } from "react";
import {
  ajouterQuestion,
  type FaqState,
} from "@/app/dashboard/[id]/faq/actions";

const initial: FaqState = { error: null, ajoutee: false };

/**
 * L'ajout d'une question fréquente.
 *
 * Les suggestions ne sont pas de la décoration : devant un champ vide, un
 * restaurateur ne sait pas quoi écrire, et devine mal ce qu'on lui
 * demande vraiment. Un clic remplit la question, il n'a plus qu'à
 * répondre — et il répond dans ses mots, ce qui est tout l'intérêt.
 */
export function FormulaireQuestion({
  restaurantId,
  suggestions,
  dejaPosees,
}: {
  restaurantId: string;
  suggestions: string[];
  dejaPosees: string[];
}) {
  const [state, action, pending] = useActionState(ajouterQuestion, initial);
  const [question, setQuestion] = useState("");
  const reponseRef = useRef<HTMLTextAreaElement>(null);

  const restantes = suggestions.filter(
    (s) => !dejaPosees.some((d) => d.trim().toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
      {restantes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500">
            Les plus demandées — clique pour la reprendre
          </p>
          <div className="flex flex-wrap gap-2">
            {restantes.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuestion(suggestion);
                  reponseRef.current?.focus();
                }}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <form action={action} className="flex flex-col gap-3">
        <input type="hidden" name="restaurant_id" value={restaurantId} />

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          La question, telle qu&apos;on te la pose
          <input
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Avez-vous une terrasse ?"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-navy"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ta réponse
          <textarea
            ref={reponseRef}
            name="reponse"
            rows={2}
            placeholder="Oui, une terrasse de vingt couverts, chauffée jusqu'en novembre."
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-normal outline-none focus:border-brand-navy"
          />
          <span className="text-xs font-normal text-zinc-500">
            Une ou deux phrases. C&apos;est ce texte que les assistants
            reprendront, souvent mot pour mot.
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Ajouter"}
          </button>
          {state.error ? (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          ) : (
            state.ajoutee &&
            !pending && (
              <p className="text-sm text-emerald-700">Question ajoutée.</p>
            )
          )}
        </div>
      </form>
    </div>
  );
}
