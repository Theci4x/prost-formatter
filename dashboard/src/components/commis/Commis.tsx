"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Tour = { role: "user" | "assistant"; content: string };

const SUGGESTIONS_VISITEUR = [
  "Combien ça coûte ?",
  "Vous prenez une commission ?",
  "Qu'est-ce que Klarr ne fait pas ?",
];

const SUGGESTIONS_CLIENT = [
  "Comment bloquer un jour ?",
  "Comment me protéger des no-show ?",
  "Comment publier ma carte ?",
];

/**
 * Le Commis : l'assistant d'aide de Klarr.
 *
 * Il ne répond que sur Klarr, et uniquement à partir du mode d'emploi. Il
 * ne lit aucune donnée d'établissement — ni réservations, ni chiffres, ni
 * clients. Poser la question « combien de couverts vendredi » n'a donc pas
 * de réponse ici, et c'est voulu : un assistant branché sur la base doit
 * être irréprochable sur le cloisonnement entre restaurants, ce qui se
 * conçoit à part.
 */
export function Commis({ connecte = false }: { connecte?: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);

  const suggestions = connecte ? SUGGESTIONS_CLIENT : SUGGESTIONS_VISITEUR;

  useEffect(() => {
    fin.current?.scrollIntoView({ block: "end" });
  }, [tours, enCours]);

  useEffect(() => {
    if (ouvert) champ.current?.focus();
  }, [ouvert]);

  async function demander(question: string) {
    if (!question.trim() || enCours) return;
    const historique = tours;
    setTours([...historique, { role: "user", content: question }]);
    setSaisie("");
    setEnCours(true);

    try {
      const reponse = await fetch("/api/commis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, historique }),
      });

      if (!reponse.ok || !reponse.body) {
        const message = await reponse.text();
        setTours((t) => [
          ...t,
          {
            role: "assistant",
            content: message || "Je n'arrive pas à répondre pour le moment.",
          },
        ]);
        return;
      }

      // On affiche au fil de l'eau : une réponse qui se dessine se lit
      // pendant qu'elle arrive.
      setTours((t) => [...t, { role: "assistant", content: "" }]);
      const lecteur = reponse.body.getReader();
      const decodeur = new TextDecoder();
      let accumule = "";
      for (;;) {
        const { done, value } = await lecteur.read();
        if (done) break;
        accumule += decodeur.decode(value, { stream: true });
        setTours((t) => {
          const suite = [...t];
          suite[suite.length - 1] = {
            role: "assistant",
            content: accumule,
          };
          return suite;
        });
      }
    } catch {
      setTours((t) => [
        ...t,
        {
          role: "assistant",
          content: "Je n'arrive pas à répondre pour le moment.",
        },
      ]);
    } finally {
      setEnCours(false);
    }
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brand-navy px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-navy-hover"
      >
        <span aria-hidden="true">💬</span>
        Une question ?
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Le Commis, assistant Klarr"
      className="fixed inset-x-3 bottom-3 z-40 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[26rem]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900">
            Le Commis
          </span>
          <span className="text-xs text-zinc-500">
            Il répond sur Klarr, à partir de l&apos;aide
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          aria-label="Fermer"
          className="rounded-md px-2 py-1 text-lg leading-none text-zinc-400 transition-colors hover:text-zinc-900"
        >
          ×
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {tours.length === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-600">
              {connecte
                ? "Demande-moi comment faire quelque chose dans Klarr."
                : "Posez-moi vos questions sur Klarr."}
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => demander(suggestion)}
                  className="w-fit rounded-full border border-zinc-200 px-3 py-1.5 text-left text-sm text-zinc-600 transition-colors hover:border-brand-navy hover:text-brand-navy"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {tours.map((tour, index) => (
          <div
            key={index}
            className={
              tour.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-navy px-3.5 py-2.5 text-sm text-white"
                : "mr-auto max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-zinc-100 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-800"
            }
          >
            {tour.content ||
              (enCours && index === tours.length - 1 ? "…" : "")}
          </div>
        ))}
        <div ref={fin} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          demander(saisie);
        }}
        className="flex items-center gap-2 border-t border-zinc-200 px-3 py-3"
      >
        <input
          ref={champ}
          value={saisie}
          onChange={(event) => setSaisie(event.target.value)}
          disabled={enCours}
          placeholder={connecte ? "Ta question…" : "Votre question…"}
          aria-label="Votre question au Commis"
          className="min-w-0 flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-brand-navy disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={enCours || !saisie.trim()}
          className="shrink-0 rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-40"
        >
          {enCours ? "…" : "Envoyer"}
        </button>
      </form>

      <p className="border-t border-zinc-100 px-4 py-2 text-[11px] leading-snug text-zinc-400">
        {connecte
          ? "Le Commis ne lit aucune donnée de ton établissement. En cas de doute, "
          : "Le Commis ne lit aucune donnée d'établissement. En cas de doute, "}
        <Link href="/aide" className="underline underline-offset-2">
          {connecte ? "consulte l'aide" : "consultez l'aide"}
        </Link>
        .
      </p>
    </div>
  );
}
