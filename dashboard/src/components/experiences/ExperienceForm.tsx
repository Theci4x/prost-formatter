"use client";

import { useActionState, useState } from "react";
import {
  ajouterExperience,
  type ExperienceState,
} from "@/app/dashboard/[id]/experiences/actions";
import { EXPERIENCE_VIDE, type ExperienceValeurs } from "@/types/experience";
import { JOURS_ISO } from "@/types/reservation";

const initialState: ExperienceState = {
  error: null,
  rendu: 0,
  valeurs: EXPERIENCE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  valeurs,
}: {
  restaurantId: string;
  valeurs: ExperienceValeurs;
}) {
  // Le prépaiement décide de ce qu'on annonce au client : autant le montrer
  // pendant qu'on configure, pas seulement après.
  const [prepaiement, setPrepaiement] = useState(valeurs.prepaiement);

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="exp-nom">
          Nom
          <input
            id="exp-nom"
            name="nom"
            required
            defaultValue={valeurs.nom}
            placeholder="Cours de cocktails"
            className={champ}
          />
        </label>
        <label className={label} htmlFor="exp-prix">
          Prix par personne
          <span className="flex items-center gap-2">
            <input
              id="exp-prix"
              name="prix"
              inputMode="decimal"
              required
              defaultValue={valeurs.prix}
              placeholder="38"
              className={`${champ} max-w-32`}
            />
            <span className="text-sm font-normal text-zinc-500">€</span>
          </span>
        </label>
      </div>

      <label className={label} htmlFor="exp-description">
        Description{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <textarea
          id="exp-description"
          name="description"
          rows={2}
          defaultValue={valeurs.description}
          placeholder="Deux heures derrière le bar avec notre chef barman, trois cocktails à emporter dans les jambes."
          className={champ}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label} htmlFor="exp-places">
          Places par séance
          <input
            id="exp-places"
            name="places"
            type="number"
            min="1"
            required
            defaultValue={valeurs.places}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="exp-heure">
          Heure
          <input
            id="exp-heure"
            name="heure"
            type="time"
            required
            defaultValue={valeurs.heure}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="exp-duree">
          Durée{" "}
          <span className="font-normal text-zinc-400">(min, facultatif)</span>
          <input
            id="exp-duree"
            name="duree"
            type="number"
            min="1"
            defaultValue={valeurs.duree}
            placeholder="120"
            className={champ}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-zinc-700">
          Jours de la semaine
        </legend>
        <div className="flex flex-wrap gap-2">
          {JOURS_ISO.map((jour) => (
            <label
              key={jour.valeur}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 has-checked:border-brand-navy has-checked:bg-brand-orange-soft"
            >
              <input
                type="checkbox"
                name="jours"
                value={jour.valeur}
                defaultChecked={valeurs.jours.includes(jour.valeur)}
              />
              <span className="capitalize">{jour.long}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label} htmlFor="exp-debut">
          À partir du{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            id="exp-debut"
            name="date_debut"
            type="date"
            defaultValue={valeurs.dateDebut}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="exp-fin">
          Jusqu&apos;au{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            id="exp-fin"
            name="date_fin"
            type="date"
            defaultValue={valeurs.dateFin}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="exp-delai">
          Inscriptions closes
          <span className="flex items-center gap-2">
            <input
              id="exp-delai"
              name="delai_heures"
              type="number"
              min="0"
              defaultValue={valeurs.delai}
              className={`${champ} max-w-24`}
            />
            <span className="text-sm font-normal text-zinc-500">h avant</span>
          </span>
        </label>
      </div>

      <label className="flex items-start gap-2.5 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="prepaiement"
          checked={prepaiement}
          onChange={(event) => setPrepaiement(event.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">Paiement à l&apos;inscription</span>
          <span className="block text-xs text-zinc-500">
            {prepaiement
              ? "Le client paie en réservant, sur ton compte Stripe. Sa place n'est retenue qu'une fois payée."
              : "Le client réserve sans payer et règle sur place. Utile pour un atelier gratuit ou une découverte."}
          </span>
        </span>
      </label>
    </>
  );
}

export function ExperienceForm({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(
    ajouterExperience,
    initialState,
  );

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé le
          remonte avec les valeurs renvoyées. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Créer cette expérience"}
      </button>
    </form>
  );
}
