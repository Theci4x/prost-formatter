"use client";

import { useActionState } from "react";
import {
  creerBonOffert,
  enregistrerReglagesBons,
  utiliserBon,
  type BonState,
} from "@/app/dashboard/[id]/bons-cadeaux/actions";

const initial: BonState = { erreur: null, succes: null };

const CHAMP =
  "rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white";
const PRIMAIRE =
  "rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-60";

function Retour({ state }: { state: BonState }) {
  if (state.erreur) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {state.erreur}
      </p>
    );
  }
  if (state.succes) {
    return (
      <p role="status" className="text-sm font-medium text-emerald-700">
        {state.succes}
      </p>
    );
  }
  return null;
}

export function ReglagesBons({
  restaurantId,
  actifs,
  montants,
  validite,
  texte,
}: {
  restaurantId: string;
  actifs: boolean;
  /** Déjà écrits en euros : « 50, 80, 100 ». */
  montants: string;
  validite: number;
  texte: string;
}) {
  const [state, action, pending] = useActionState(
    enregistrerReglagesBons,
    initial,
  );
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="actifs"
          defaultChecked={actifs}
          className="mt-0.5 h-4 w-4 accent-brand-navy"
        />
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">
            Vendre des bons cadeaux en ligne
          </span>
          <span className="text-zinc-500">
            Décoché, la page reste en ligne mais n&apos;accepte plus
            d&apos;achat.
          </span>
        </span>
      </label>
      <div className="grid gap-4">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            Montants proposés
          </span>
          <input
            name="montants"
            defaultValue={montants}
            className={CHAMP}
            placeholder="50, 80, 100"
          />
          <span className="text-xs text-zinc-500">
            En euros, séparés par des virgules. Le client peut aussi choisir un
            montant libre entre 20 et 500 €.
          </span>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            Durée de validité
          </span>
          <select name="validite" defaultValue={validite} className={CHAMP}>
            <option value={6}>6 mois</option>
            <option value={12}>12 mois</option>
            <option value={24}>24 mois</option>
          </select>
          <span className="text-xs text-zinc-500">
            À partir du jour de l&apos;achat.
          </span>
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">
          Un mot sur la page (facultatif)
        </span>
        <textarea
          name="texte"
          rows={3}
          maxLength={600}
          defaultValue={texte}
          placeholder="Valable midi et soir, boissons comprises. Pas valable le soir du 31 décembre."
          className={CHAMP}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={PRIMAIRE}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Retour state={state} />
      </div>
    </form>
  );
}

export function EncaisserBon({
  restaurantId,
  bonId,
  soldeEuros,
}: {
  restaurantId: string;
  bonId: string;
  soldeEuros: string;
}) {
  const [state, action, pending] = useActionState(utiliserBon, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="bon_id" value={bonId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            Montant à déduire
          </span>
          <span className="flex items-center gap-2">
            <input
              name="montant"
              inputMode="decimal"
              defaultValue={soldeEuros}
              className={`${CHAMP} w-32`}
            />
            <span className="text-sm text-zinc-500">€</span>
          </span>
        </label>
        <button type="submit" disabled={pending} className={PRIMAIRE}>
          {pending ? "Un instant…" : "Déduire du bon"}
        </button>
      </div>
      <Retour state={state} />
    </form>
  );
}

export function OffrirBon({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(creerBonOffert, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <div className="grid gap-4">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Montant (€)</span>
          <input name="montant" inputMode="decimal" className={CHAMP} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Pour qui</span>
          <input name="beneficiaire_nom" maxLength={120} className={CHAMP} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            Son e-mail (facultatif)
          </span>
          <input
            name="beneficiaire_email"
            type="email"
            maxLength={200}
            className={CHAMP}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">
          Un mot (facultatif)
        </span>
        <input name="message" maxLength={300} className={CHAMP} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={PRIMAIRE}>
          {pending ? "Création…" : "Créer le bon"}
        </button>
        <Retour state={state} />
      </div>
    </form>
  );
}
