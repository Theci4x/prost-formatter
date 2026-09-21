"use client";

import { useActionState, useState } from "react";
import {
  addService,
  type ServiceState,
} from "@/app/dashboard/[id]/reservations/actions";
import { SERVICE_VIDE, type ServiceValeurs } from "@/types/reservation";
import { CONFIGURATION } from "@/lib/i18n/configuration";
import type { Langue } from "@/lib/i18n/langues";
import { joursSemaine } from "@/lib/i18n/jours";

const initialState: ServiceState = {
  error: null,
  rendu: 0,
  valeurs: SERVICE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  valeurs,
  langue,
}: {
  restaurantId: string;
  valeurs: ServiceValeurs;
  /** Les jours de la semaine viennent d'`Intl`, pas du dictionnaire. */
  langue: Langue;
}) {
  const cfg = CONFIGURATION[langue];
  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label} htmlFor="service-nom">
          {cfg.nomDuService}
          <input
            id="service-nom"
            name="nom"
            required
            defaultValue={valeurs.nom}
            placeholder={cfg.nomServicePlaceholder}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="service-debut">
          {cfg.debut}
          <input
            id="service-debut"
            name="heure_debut"
            type="time"
            required
            defaultValue={valeurs.heureDebut}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="service-fin">
          {cfg.fin}
          <input
            id="service-fin"
            name="heure_fin"
            type="time"
            required
            defaultValue={valeurs.heureFin}
            className={champ}
          />
        </label>
      </div>

      <p className="-mt-2 text-xs text-zinc-500">{cfg.apresMinuit}</p>

      {/* Sans cette durée, une salle de 92 places ne vendrait que 92
          couverts pour toute la soirée. C'est elle qui fait tourner les
          tables. */}
      <label className={label} htmlFor="service-duree">
        {cfg.dureeMoyenne}
        <input
          id="service-duree"
          name="duree_minutes"
          type="number"
          min={15}
          max={720}
          step={15}
          required
          defaultValue={valeurs.duree}
          className={champ}
        />
        <span className="text-xs font-normal text-zinc-500">
          {cfg.dureeAide}
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700">
          {cfg.joursConcernes}
        </legend>
        <div className="flex flex-wrap gap-2">
          {joursSemaine(langue).map((jour) => (
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

      <label className={label} htmlFor="service-delai">
        {cfg.delaiPrevenance}
        <input
          id="service-delai"
          name="delai_heures"
          type="number"
          min="0"
          defaultValue={valeurs.delai}
          className={`${champ} max-w-32`}
        />
        <span className="text-xs font-normal text-zinc-500">
          {cfg.delaiAide}
        </span>
      </label>
    </>
  );
}

export function ServiceForm({
  restaurantId,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
}) {
  const cfg = CONFIGURATION[langue];
  const [state, action, pending] = useActionState(addService, initialState);
  // Quand le navigateur refuse d'envoyer le formulaire — un champ horaire
  // incomplet, par exemple —, il n'affiche qu'une infobulle fugace. Sans ce
  // message, on croit avoir enregistré alors que rien n'est parti.
  const [bloque, setBloque] = useState<string | null>(null);

  return (
    <form
      action={action}
      onInvalidCapture={(event) => {
        const champ = event.target as HTMLInputElement;
        setBloque(
          champ.type === "time" ? cfg.heuresIncompletes : cfg.champManquant,
        );
      }}
      onSubmit={() => setBloque(null)}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      {/* Voir EspaceForm : la clé remonte les champs avec les valeurs que
          l'action vient de renvoyer. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        valeurs={state.valeurs}
        langue={langue}
      />

      {(state.error || bloque) && (
        <p className="text-sm text-red-600" role="alert">
          {state.error ?? bloque}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? cfg.enregistrement : cfg.ajouterCeService}
      </button>
    </form>
  );
}
