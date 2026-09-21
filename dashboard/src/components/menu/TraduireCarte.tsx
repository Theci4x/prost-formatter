"use client";

import { useState, useTransition } from "react";
import type { ClesCarte } from "@/lib/i18n/carte";
import { traduireCarte } from "@/app/dashboard/[id]/menu/actions";
import { NOM_LANGUE } from "@/lib/i18n/langues";
import { LANGUES_TRADUITES, type Langue } from "@/types/menu";

/**
 * Traduire la carte, langue par langue.
 *
 * Un bouton par langue, et pas une case à cocher « traduire partout » :
 * chaque traduction est un appel au modèle, donc du temps et de
 * l'argent, et un restaurateur qui n'a aucun client chinois n'a aucune
 * raison de payer la carte en chinois. Le compte à côté du bouton dit ce
 * qu'il reste à faire dans cette langue-là — les traductions sont
 * indépendantes, et corriger un plat en français les rend caduques
 * toutes les deux mais se rattrape séparément.
 *
 * Ne renvoie au modèle que ce qui n'est pas déjà traduit, ou ce dont le
 * français a changé depuis : retraduire quarante plats parce qu'on a
 * corrigé une virgule n'a pas de sens.
 */
export function TraduireCarte({
  restaurantId,
  aTraduire,
  c,
}: {
  restaurantId: string;
  /** Ce qu'il reste à traduire, par langue. */
  aTraduire: Record<Exclude<Langue, "fr">, number>;
  c: ClesCarte;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<Langue | null>(null);
  const [, startTransition] = useTransition();

  function traduire(langue: Exclude<Langue, "fr">) {
    const donnees = new FormData();
    donnees.set("restaurant_id", restaurantId);
    donnees.set("langue", langue);
    setMessage(null);
    setErreur(null);
    setEnCours(langue);
    startTransition(async () => {
      const reponse = await traduireCarte(donnees);
      setEnCours(null);
      if (reponse.error) {
        setErreur(reponse.error);
        return;
      }
      setMessage(
        reponse.traduits === 0
          ? c.dejaTraduit(NOM_LANGUE[langue])
          : c.platsTraduits(reponse.traduits, NOM_LANGUE[langue]),
      );
    });
  }

  return (
    <span className="flex flex-col items-start gap-1.5">
      <span className="flex flex-wrap gap-2">
        {LANGUES_TRADUITES.map((langue) => {
          const reste = aTraduire[langue] ?? 0;
          return (
            <button
              key={langue}
              type="button"
              onClick={() => traduire(langue)}
              disabled={enCours !== null || reste === 0}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy disabled:opacity-50"
            >
              {enCours === langue
                ? c.traductionEnCours
                : reste === 0
                  ? c.aJour(NOM_LANGUE[langue])
                  : c.traduireReste(NOM_LANGUE[langue], reste)}
            </button>
          );
        })}
      </span>
      {message && <span className="text-xs text-zinc-500">{message}</span>}
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </span>
  );
}
