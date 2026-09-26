"use client";

import { useActionState, useState } from "react";
import {
  accepterDevis,
  refuserDevis,
  type ReponseState,
} from "@/app/devis/[jeton]/actions";
import type { Langue } from "@/lib/i18n/langues";
import { DEVIS } from "@/lib/i18n/devis";

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
  langue,
}: {
  jeton: string;
  /** Le montant à régler en acceptant, déjà mis en forme. Null s'il n'y en a pas. */
  acompte: string | null;
  langue: Langue;
}) {
  const d = DEVIS[langue];
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
        {d.reponseTransmise}
      </p>
    );
  }

  if (etatAccepte.fait) {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 print:hidden">
        {d.devisAccepte}
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
          {acceptation ? d.enregistrement : d.accepterCeDevis}
        </button>
        <span className="text-xs text-ink-soft">
          {acompte ? d.dirigeVersAcompte(acompte) : d.accordVautConfirmation}
        </span>
      </form>

      {refusOuvert ? (
        <form
          action={actionRefuser}
          className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-5"
        >
          <input type="hidden" name="jeton" value={jeton} />
          <label className="flex flex-col gap-1 text-sm font-medium text-ink">
            {d.ceQuiNeConvientPas}{" "}
            <span className="font-normal text-ink-soft">{d.facultatif}</span>
            <textarea
              name="motif"
              rows={3}
              placeholder={d.exemplesRefus}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal outline-none focus:border-brand-orange"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={occupe}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-red-300 hover:text-red-700 disabled:opacity-50"
            >
              {refus ? d.envoi : d.confirmerLeRefus}
            </button>
            <button
              type="button"
              onClick={() => setRefusOuvert(false)}
              className="rounded-lg px-4 py-2.5 text-sm text-ink-soft hover:text-ink"
            >
              {d.annuler}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setRefusOuvert(true)}
          className="w-fit text-sm text-ink-soft underline-offset-2 hover:text-ink hover:underline"
        >
          {d.neMeConvientPas}
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
