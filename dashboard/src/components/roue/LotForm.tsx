"use client";

import { useActionState, useState } from "react";
import {
  ajouterLot,
  modifierLot,
  type LotState,
} from "@/app/dashboard/[id]/roue/actions";
import { LOT_VIDE, type LotRoue, type LotValeurs } from "@/types/roue";
import type { Langue } from "@/lib/i18n/langues";
import { COMMUN, traducteur, type T } from "@/lib/i18n/t";
import { ROUE } from "@/lib/i18n/pages/roue";

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  valeurs,
  prefixe = "lot",
  lotId,
  t,
}: {
  restaurantId: string;
  valeurs: LotValeurs;
  prefixe?: string;
  lotId?: string;
  t: T;
}) {
  // Une case perdante n'a ni stock ni précision pour la salle : rien n'est
  // remis, il n'y a rien à décompter.
  const [gagnant, setGagnant] = useState(valeurs.gagnant);

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {lotId && <input type="hidden" name="lot_id" value={lotId} />}

      <label className="flex items-start gap-2.5 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="gagnant"
          checked={gagnant}
          onChange={(e) => setGagnant(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">{t("Case gagnante")}</span>{" "}
          {t(
            "— décoche pour une case qui ne donne rien. Le client voit « Perdu », et c'est ce qui rend les autres cases désirables.",
          )}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`${prefixe}-libelle`}>
          {gagnant
            ? t("Le lot, tel que le client le lit")
            : t("Ce que le client lit")}
          <input
            id={`${prefixe}-libelle`}
            name="libelle"
            required
            maxLength={80}
            defaultValue={valeurs.libelle}
            placeholder={
              gagnant ? t("Un café offert") : t("Perdu — retentez demain")
            }
            className={champ}
          />
        </label>

        <label className={label} htmlFor={`${prefixe}-poids`}>
          {t("Fréquence")}
          <input
            id={`${prefixe}-poids`}
            name="poids"
            inputMode="numeric"
            required
            defaultValue={valeurs.poids}
            className={`${champ} max-w-28`}
          />
          <span className="text-xs font-normal text-zinc-500">
            {t(
              "Un poids, pas un pourcentage : une case à 70 sort sept fois plus souvent qu'une case à 10. Mets 0 pour retirer la case du tirage sans la supprimer.",
            )}
          </span>
        </label>
      </div>

      {gagnant && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label} htmlFor={`${prefixe}-precision`}>
            {t("Précision pour la salle")}{" "}
            <span className="font-normal text-zinc-400">
              {t("(facultatif)")}
            </span>
            <input
              id={`${prefixe}-precision`}
              name="precision"
              maxLength={120}
              defaultValue={valeurs.precision}
              placeholder={t("Expresso ou allongé, pas un dessert")}
              className={champ}
            />
            <span className="text-xs font-normal text-zinc-500">
              {t(
                "Jamais montrée au client. C'est ce que lit le serveur quand on lui présente le code.",
              )}
            </span>
          </label>

          <label className={label} htmlFor={`${prefixe}-stock`}>
            {t("Stock")}{" "}
            <span className="font-normal text-zinc-400">
              {t("(facultatif)")}
            </span>
            <input
              id={`${prefixe}-stock`}
              name="stock"
              inputMode="numeric"
              defaultValue={valeurs.stock}
              placeholder={t("illimité")}
              className={`${champ} max-w-32`}
            />
            <span className="text-xs font-normal text-zinc-500">
              {t(
                "Combien tu acceptes d'en offrir en tout. Une fois atteint, la case ne sort plus et les autres se repartagent le tirage.",
              )}
            </span>
          </label>
        </div>
      )}
    </>
  );
}

export function LotForm({
  restaurantId,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
}) {
  const t = traducteur(langue, ROUE, COMMUN);
  const [state, action, pending] = useActionState(ajouterLot, {
    error: null,
    rendu: 0,
    valeurs: LOT_VIDE,
  } as LotState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé
          le remonte avec les valeurs renvoyées. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        valeurs={state.valeurs}
        t={t}
      />

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {t(state.error)}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? t("Enregistrement…") : t("Ajouter cette case")}
      </button>
    </form>
  );
}

function valeursDe(lot: LotRoue): LotValeurs {
  return {
    libelle: lot.libelle,
    precision: lot.precision_interne ?? "",
    gagnant: lot.gagnant,
    poids: String(lot.poids),
    stock: lot.stock === null ? "" : String(lot.stock),
  };
}

export function LotModifiable({
  restaurantId,
  lot,
  children,
  langue,
}: {
  restaurantId: string;
  lot: LotRoue;
  langue: Langue;
  /** Ce qu'on affiche tant que le formulaire est fermé. */
  children: React.ReactNode;
}) {
  const t = traducteur(langue, ROUE, COMMUN);
  const [ouvertDepuis, setOuvertDepuis] = useState<number | null>(null);
  const [state, action, pending] = useActionState(modifierLot, {
    error: null,
    rendu: 0,
    valeurs: valeursDe(lot),
  } as LotState);

  // Même raisonnement que pour les espaces : l'état ouvert se déduit du
  // rendu, pour qu'un enregistrement réussi referme le formulaire et qu'un
  // échec le laisse ouvert avec son message.
  const ouvert =
    ouvertDepuis !== null && !(state.rendu > ouvertDepuis && !state.error);

  if (!ouvert) {
    return (
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        {children}
        <button
          type="button"
          onClick={() => setOuvertDepuis(state.rendu)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy active:border-brand-navy"
        >
          {t("Modifier")}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        lotId={lot.id}
        prefixe={`mod-${lot.id}`}
        valeurs={state.valeurs}
        t={t}
      />

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {t(state.error)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? t("Enregistrement…") : t("Enregistrer")}
        </button>
        <button
          type="button"
          onClick={() => setOuvertDepuis(null)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {t("Fermer")}
        </button>
      </div>
    </form>
  );
}
