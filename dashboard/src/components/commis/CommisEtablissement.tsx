"use client";

import { useEffect, useRef, useState } from "react";

type Tour = { role: "user" | "assistant"; content: string };

/**
 * L'assistant d'un restaurant, sur sa page de réservation.
 *
 * Il répond aux questions qu'on pose avant de réserver — horaires,
 * terrasse, carte, privatisation — à partir de la seule fiche publique de
 * la maison. Il ne sait rien du carnet et ne dira donc jamais s'il reste
 * une table : c'est le formulaire, juste au-dessus, qui le sait.
 *
 * Il ne s'ouvre pas tout seul. Une bulle qui saute au visage de quelqu'un
 * venu réserver le détourne de ce qu'il faisait, et ce qu'il faisait est
 * précisément ce qu'on veut.
 */
export function CommisEtablissement({
  restaurantId,
  nom,
  suggestions,
}: {
  restaurantId: string;
  nom: string;
  suggestions: string[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [saisie, setSaisie] = useState("");
  const [enCours, setEnCours] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);

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
      const reponse = await fetch("/api/commis/etablissement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant: restaurantId,
          question,
          historique,
        }),
      });

      if (!reponse.ok || !reponse.body) {
        const message = await reponse.text();
        setTours((t) => [
          ...t,
          {
            role: "assistant",
            content: message || "Je n'arrive pas à répondre.",
          },
        ]);
        return;
      }

      // Au fil de l'eau : une réponse qui se dessine se lit pendant
      // qu'elle arrive, au lieu d'un curseur immobile.
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
          suite[suite.length - 1] = { role: "assistant", content: accumule };
          return suite;
        });
      }
    } catch {
      setTours((t) => [
        ...t,
        { role: "assistant", content: "Je n'arrive pas à répondre." },
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
      aria-label={`Poser une question à ${nom}`}
      className="fixed inset-x-3 bottom-3 z-40 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[26rem]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900">{nom}</span>
          <span className="text-xs text-zinc-500">
            Vos questions avant de réserver
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
              Posez-moi vos questions sur {nom}. Pour savoir s&apos;il reste une
              table, c&apos;est le formulaire au-dessus qui fait foi.
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
            {tour.content || (enCours && index === tours.length - 1 ? "…" : "")}
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
          placeholder="Votre question…"
          aria-label={`Votre question à ${nom}`}
          className="min-w-0 flex-1 rounded-full border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-brand-navy disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={enCours || !saisie.trim()}
          className="shrink-0 rounded-full bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-40"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
