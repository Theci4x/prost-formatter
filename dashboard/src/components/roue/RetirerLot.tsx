"use client";

import { useActionState, useState } from "react";
import {
  chercherCode,
  marquerRetire,
} from "@/app/dashboard/[id]/roue/retirer/actions";
import { RETRAIT_INITIAL, type RetraitState } from "@/lib/roue/retrait";

/**
 * Le retrait d'un lot, en salle.
 *
 * Tout est dimensionné pour un pouce et un coup d'œil : le champ est
 * grand, le lot s'affiche en gros, et le bouton de confirmation est loin
 * du bord. On ne lit pas cet écran assis.
 *
 * Deux temps, jamais un : on cherche, on montre, puis on confirme. Une
 * faute de frappe ne doit pas brûler le lot d'un client qui l'a sous les
 * yeux.
 */

function jourLisible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function RetirerLot({
  restaurantId,
  aujourdhui,
}: {
  restaurantId: string;
  /** Calculé par le serveur : le téléphone du serveur peut être à l'heure d'ailleurs. */
  aujourdhui: string;
}) {
  const [etat, chercher, cherchePending] = useActionState(
    chercherCode,
    RETRAIT_INITIAL,
  );
  const [retrait, retirer, retraitPending] = useActionState(
    marquerRetire,
    RETRAIT_INITIAL,
  );

  // Le retrait renvoie son propre état ; tant qu'il n'a rien dit, c'est
  // la recherche qui fait foi.
  const courant: RetraitState =
    retrait.retire || retrait.error ? retrait : etat;
  const trouvaille = courant.trouvaille ?? etat.trouvaille;
  const [code, setCode] = useState("");

  if (retrait.retire && trouvaille) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-emerald-800">
          Lot remis
        </p>
        <p className="text-2xl font-semibold text-emerald-900">
          {trouvaille.libelle}
        </p>
        {trouvaille.precision && (
          <p className="text-base text-emerald-800">{trouvaille.precision}</p>
        )}
        <a
          href="?"
          className="w-fit rounded-md bg-brand-navy px-4 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover"
        >
          Code suivant
        </a>
      </div>
    );
  }

  if (trouvaille && !courant.error) {
    const perime = trouvaille.expireLe < aujourdhui;
    const dejaPris = trouvaille.utiliseLe !== null;
    const remisable = trouvaille.gagnant && !perime && !dejaPris;

    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm">
        <p className="font-mono text-sm tracking-[0.18em] text-zinc-400">
          {trouvaille.code}
        </p>
        <p className="text-3xl font-semibold text-ink">{trouvaille.libelle}</p>
        {trouvaille.precision && (
          <p className="rounded-xl bg-brand-cream px-4 py-3 text-base text-ink-soft">
            {trouvaille.precision}
          </p>
        )}

        {!trouvaille.gagnant && (
          <p className="text-base font-medium text-zinc-500">
            Cette partie n&apos;a rien gagné. Il n&apos;y a rien à remettre.
          </p>
        )}
        {dejaPris && (
          <p className="text-base font-medium text-amber-700">
            Déjà retiré le{" "}
            {new Date(trouvaille.utiliseLe!).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
            .
          </p>
        )}
        {perime && !dejaPris && (
          <p className="text-base font-medium text-amber-700">
            Périmé depuis le {jourLisible(trouvaille.expireLe)}.
          </p>
        )}
        {remisable && (
          <p className="text-sm text-zinc-500">
            Valable jusqu&apos;au {jourLisible(trouvaille.expireLe)}.
          </p>
        )}

        {courant.error && (
          <p className="text-base font-medium text-red-600" role="alert">
            {courant.error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {remisable && (
            <form action={retirer}>
              <input type="hidden" name="restaurant_id" value={restaurantId} />
              <input type="hidden" name="partie_id" value={trouvaille.id} />
              <button
                type="submit"
                disabled={retraitPending}
                className="rounded-md bg-brand-navy px-5 py-3 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover disabled:opacity-50"
              >
                {retraitPending ? "…" : "Je l'ai remis"}
              </button>
            </form>
          )}
          <a href="?" className="text-base text-zinc-500 hover:text-zinc-900">
            Chercher un autre code
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      action={chercher}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <label
        className="flex flex-col gap-2 text-sm font-medium text-zinc-700"
        htmlFor="code"
      >
        Le code du client
        <input
          id="code"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          // Un clavier de lettres et de chiffres, en majuscules, sans
          // correction automatique : le téléphone ne doit pas « corriger »
          // un code en un mot du dictionnaire.
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          maxLength={8}
          required
          placeholder="H7KM2P"
          className="w-full rounded-md border border-zinc-300 px-4 py-4 text-center font-mono text-3xl tracking-[0.18em] uppercase outline-none focus:border-brand-navy"
        />
      </label>

      {etat.error && (
        <p className="text-base font-medium text-red-600" role="alert">
          {etat.error}
        </p>
      )}

      <button
        type="submit"
        disabled={cherchePending}
        className="rounded-md bg-brand-navy px-5 py-3.5 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover active:bg-brand-navy-hover disabled:opacity-50"
      >
        {cherchePending ? "Recherche…" : "Chercher"}
      </button>
    </form>
  );
}
