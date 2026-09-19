"use client";

import { useSyncExternalStore } from "react";
import { langueDuNavigateur, type Langue } from "@/lib/i18n/langues";

/**
 * « Les articles sont en français. »
 *
 * Dite ici plutôt que découverte au premier titre. Le journal ne sera pas
 * traduit : vingt articles de fond, avec leurs sources et leurs dates,
 * passés à la machine, feraient un contenu que personne ne relit et que
 * Google classe comme tel. Mieux vaut l'annoncer que le laisser croire.
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

export function NoteLangueJournal() {
  const langue = useSyncExternalStore(sabonner, lire, auServeur);
  if (langue === "fr") return null;

  return (
    <p
      className="mx-auto w-full max-w-3xl px-6 pb-3"
      style={{ fontSize: 13, color: "var(--ink-soft)" }}
    >
      {NOTE[langue]}
    </p>
  );
}
