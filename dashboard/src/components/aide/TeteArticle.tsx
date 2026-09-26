"use client";

import { useSyncExternalStore } from "react";
import { langueDuNavigateur } from "@/lib/i18n/langues";
import { AIDE, entreeDuSlug } from "@/lib/i18n/aide";

/**
 * Le titre d'un article d'aide, corrigé dans le navigateur.
 *
 * Les pages d'articles sont pré-générées : c'est ce qui les fait remonter
 * dans Google, et lire le témoin de langue côté serveur les rendrait
 * dynamiques. Elles sortent donc du serveur en français, et ce composant
 * pose la traduction du titre et du résumé après l'hydratation, pour qui
 * a choisi l'anglais ou le chinois. Il dit aussi que le corps reste en
 * français — mieux vaut l'annoncer que laisser croire à un oubli.
 *
 * Le français ne voit rien de ce mécanisme : `entreeDuSlug` rend `null`,
 * et c'est le texte du serveur qui reste à l'écran.
 */
export function TeteArticle({
  slug,
  titre,
  resume,
}: {
  slug: string;
  /** Ce que le serveur a rendu : le français du fichier de contenu. */
  titre: string;
  resume: string;
}) {
  const langue = useSyncExternalStore(sabonner, lire, serveur);
  const traduit = entreeDuSlug(slug, langue);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-serif text-4xl leading-[1.1] text-ink sm:text-5xl">
        {traduit?.titre ?? titre}
      </h1>
      <p className="text-base text-ink-soft sm:text-lg">
        {traduit?.resume ?? resume}
      </p>
      {traduit && (
        <p className="text-[13px] text-zinc-400">
          {AIDE[langue].articleEnFrancais}
        </p>
      )}
    </div>
  );
}

/** Le témoin ne prévient de rien : il n'y a rien à quoi s'abonner. */
function sabonner(): () => void {
  return () => {};
}

function lire() {
  return langueDuNavigateur() ?? "fr";
}

function serveur() {
  return "fr" as const;
}
