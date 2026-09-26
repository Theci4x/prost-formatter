"use client";

import { useSyncExternalStore } from "react";
import { langueDuNavigateur, type Langue } from "@/lib/i18n/langues";

/**
 * « Les articles sont en français. »
 *
 * Dite ici plutôt que découverte au premier titre. Une partie du journal
 * est traduite, pas tout : là où elle ne l'est pas, mieux vaut l'annoncer
 * que le laisser croire.
 *
 * D'où `disponibles` : quand la page existe dans la langue du lecteur, le
 * sélecteur l'y emmène en un clic et cette ligne n'aurait rien à dire —
 * elle démentirait même le bouton juste au-dessus.
 *
 * Rien en français, évidemment — et rien non plus au rendu serveur, ce
 * qui laisse la page pré-générée strictement identique à ce qu'elle
 * était. La ligne apparaît après l'hydratation, pour qui en a besoin.
 */
const NOTE: Record<Exclude<Langue, "fr">, string> = {
  en: "The journal is written in French.",
  zh: "专栏文章为法语。",
};

function sabonner(): () => void {
  return () => {};
}

function lire(): Langue {
  return langueDuNavigateur() ?? "fr";
}

function auServeur(): Langue {
  return "fr";
}

export function NoteLangueJournal({
  disponibles,
}: {
  /** Les langues dans lesquelles cette page-ci existe. */
  disponibles?: Langue[];
}) {
  const langue = useSyncExternalStore(sabonner, lire, auServeur);
  if (langue === "fr") return null;
  if (disponibles?.includes(langue)) return null;

  return (
    <p
      className="mx-auto w-full max-w-3xl px-6 pb-3"
      style={{ fontSize: 13, color: "var(--ink-soft)" }}
    >
      {NOTE[langue]}
    </p>
  );
}
