"use client";

import { useActionState, useRef, useState } from "react";
import {
  ajouterQuestion,
  type FaqState,
} from "@/app/dashboard/[id]/faq/actions";
import type { Langue } from "@/lib/i18n/langues";
import { COMMUN, traducteur } from "@/lib/i18n/t";
import { FAQ } from "@/lib/i18n/pages/faq";

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
  langue,
}: {
  restaurantId: string;
  suggestions: string[];
  dejaPosees: string[];
  langue: Langue;
}) {
  const t = traducteur(langue, FAQ, COMMUN);
  const [state, action, pending] = useActionState(ajouterQuestion, initial);
  const [question, setQuestion] = useState("");
  const reponseRef = useRef<HTMLTextAreaElement>(null);

  const restantes = suggestions.filter(
    (s) => !dejaPosees.some((d) => d.trim().toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
      {restantes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-500">
            {t("Les plus demandées — clique pour la reprendre")}
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
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
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
          {t("La question, telle qu'on te la pose")}
          <input
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t("Avez-vous une terrasse ?")}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          {t("Ta réponse")}
          <textarea
            ref={reponseRef}
            name="reponse"
            rows={2}
            placeholder={t(
              "Oui, une terrasse de vingt couverts, chauffée jusqu'en novembre.",
            )}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-normal outline-none transition-colors focus:border-brand-navy focus:bg-white"
          />
          <span className="text-xs font-normal text-zinc-500">
            {t(
              "Une ou deux phrases. C'est ce texte que les assistants reprendront, souvent mot pour mot.",
            )}
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
          >
            {pending ? t("Enregistrement…") : t("Ajouter")}
          </button>
          {state.error ? (
            <p className="text-sm text-red-600" role="alert">
              {t(state.error)}
            </p>
          ) : (
            state.ajoutee &&
            !pending && (
              <p className="text-sm text-emerald-700">
                {t("Question ajoutée.")}
              </p>
            )
          )}
        </div>
      </form>
    </div>
  );
}
