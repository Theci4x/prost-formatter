"use client";

import { useActionState, useState } from "react";
import {
  accepterDevis,
  refuserDevis,
  type ReponseState,
} from "@/app/devis/[jeton]/actions";

const initial: ReponseState = { erreur: null, fait: false };

/**
 * La réponse du client : accepter, ou refuser en disant pourquoi.
 *
 * Le refus demande une confirmation en deux temps. Pas pour le compliquer
 * — pour éviter qu'un pouce qui glisse ferme une privatisation de trente
 * couverts, et parce que le motif, lui, vaut de l'or au restaurateur.
 */
export function ReponseDevis({
  jeton,
  acompte,
}: {
  jeton: string;
  /** Le montant à régler en acceptant, déjà mis en forme. Null s'il n'y en a pas. */
  acompte: string | null;
}) {
  const [refusOuvert, setRefusOuvert] = useState(false);
  const [etatAccepte, actionAccepter, acceptation] = useActionState(
    accepterDevis,
    initial,
  );
  const [etatRefuse, actionRefuser, refus] = useActionState(
    refuserDevis,
    initial,
  );

  const erreur = etatAccepte.erreur ?? etatRefuse.erreur;
  const occupe = acceptation || refus;

  if (etatRefuse.fait) {
    return (
      <p className="rounded-2xl border border-line bg-brand-cream p-5 text-sm text-ink-soft print:hidden">
        Votre réponse est transmise. Merci d&apos;avoir pris le temps de nous
        le dire.
      </p>
    );
  }

  if (etatAccepte.fait) {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 print:hidden">
        Devis accepté. L&apos;établissement est prévenu et revient vers vous.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <form action={actionAccepter} className="flex flex-col gap-2">
        <input type="hidden" name="jeton" value={jeton} />
        <button
          type="submit"
          disabled={occupe}
          className="rounded-xl bg-ink px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-navy disabled:opacity-50"
        >
          {acceptation ? "Enregistrement…" : "Accepter ce devis"}
        </button>
        <span className="text-xs text-ink-soft">
          {acompte
            ? `Vous serez ensuite dirigé vers le règlement de l'acompte de ${acompte}.`
            : "Votre accord vaut confirmation de la réservation."}
        </span>
      </form>

      {refusOuvert ? (
        <form
          action={actionRefuser}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5"
        >
          <input type="hidden" name="jeton" value={jeton} />
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            Ce qui ne convient pas{" "}
            <span className="font-normal text-ink-soft">(facultatif)</span>
            <textarea
              name="motif"
              rows={3}
              placeholder="Le budget, la date, le nombre de convives…"
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm font-normal outline-none focus:border-brand-orange"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={occupe}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
            >
              {refus ? "Envoi…" : "Confirmer le refus"}
            </button>
            <button
              type="button"
              onClick={() => setRefusOuvert(false)}
              className="rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:text-ink"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setRefusOuvert(true)}
          className="w-fit text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
        >
          Ce devis ne me convient pas
        </button>
      )}

      {erreur && (
        <p className="text-sm text-red-600" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}
