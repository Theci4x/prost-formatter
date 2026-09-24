"use client";

import { useActionState } from "react";
import {
  creerBonOffert,
  enregistrerReglagesBons,
  utiliserBon,
  type BonState,
} from "@/app/dashboard/[id]/bons-cadeaux/actions";
import { BONS_CAISSE } from "@/lib/i18n/bonsCaisse";
import type { Langue } from "@/lib/i18n/langues";

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
  langue = "fr",
}: {
  restaurantId: string;
  actifs: boolean;
  /** Déjà écrits en euros : « 50, 80, 100 ». */
  montants: string;
  validite: number;
  texte: string;
  langue?: Langue;
}) {
  const t = BONS_CAISSE[langue];
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
          <span className="font-semibold">{t.vendreEnLigne}</span>
          <span className="text-zinc-500">{t.vendreAide}</span>
        </span>
      </label>
      <div className="grid gap-4">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            {t.montantsProposes}
          </span>
          <input
            name="montants"
            defaultValue={montants}
            className={CHAMP}
            placeholder="50, 80, 100"
          />
          <span className="text-xs text-zinc-500">{t.montantsAide}</span>
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t.duree}</span>
          <select name="validite" defaultValue={validite} className={CHAMP}>
            {[6, 12, 24].map((n) => (
              <option key={n} value={n}>
                {t.mois(n)}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">{t.dureeAide}</span>
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{t.motPage}</span>
        <textarea
          name="texte"
          rows={3}
          maxLength={600}
          defaultValue={texte}
          placeholder={t.motExemple}
          className={CHAMP}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={PRIMAIRE}>
          {pending ? t.enregistrement : t.enregistrer}
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
  langue = "fr",
}: {
  restaurantId: string;
  bonId: string;
  soldeEuros: string;
  langue?: Langue;
}) {
  const t = BONS_CAISSE[langue];
  const [state, action, pending] = useActionState(utiliserBon, initial);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="bon_id" value={bonId} />
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">
            {t.montantADeduire}
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
          {pending ? t.unInstant : t.deduire}
        </button>
      </div>
      <Retour state={state} />
    </form>
  );
}

export function OffrirBon({
  restaurantId,
  langue = "fr",
}: {
  restaurantId: string;
  langue?: Langue;
}) {
  const t = BONS_CAISSE[langue];
  const [state, action, pending] = useActionState(creerBonOffert, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <div className="grid gap-4">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t.montantEuros}</span>
          <input name="montant" inputMode="decimal" className={CHAMP} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t.pourQui}</span>
          <input name="beneficiaire_nom" maxLength={120} className={CHAMP} />
        </label>
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t.sonEmail}</span>
          <input
            name="beneficiaire_email"
            type="email"
            maxLength={200}
            className={CHAMP}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{t.unMot}</span>
        <input name="message" maxLength={300} className={CHAMP} />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={PRIMAIRE}>
          {pending ? t.creation : t.creer}
        </button>
        <Retour state={state} />
      </div>
    </form>
  );
}
