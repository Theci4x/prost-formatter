"use client";

import { useActionState, useState } from "react";
import {
  modifierService,
  type ServiceState,
} from "@/app/dashboard/[id]/reservations/actions";
import {
  JOURS_ISO,
  formatCreneau,
  formatJours,
  type Service,
  type ServiceValeurs,
} from "@/types/reservation";

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function valeursDe(service: Service): ServiceValeurs {
  return {
    nom: service.nom,
    // PostgreSQL renvoie « 19:00:00 » ; un champ horaire attend « 19:00 ».
    heureDebut: service.heure_debut.slice(0, 5),
    heureFin: service.heure_fin.slice(0, 5),
    delai: String(service.delai_heures),
    jours: service.jours,
  };
}

function Champs({
  restaurantId,
  service,
  valeurs,
}: {
  restaurantId: string;
  service: Service;
  valeurs: ServiceValeurs;
}) {
  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <input type="hidden" name="service_id" value={service.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`mod-nom-${service.id}`}>
          Nom
          <input
            id={`mod-nom-${service.id}`}
            name="nom"
            required
            defaultValue={valeurs.nom}
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`mod-delai-${service.id}`}>
          Délai de prévenance (heures)
          <input
            id={`mod-delai-${service.id}`}
            name="delai_heures"
            type="number"
            min={0}
            required
            defaultValue={valeurs.delai}
            className={champ}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`mod-debut-${service.id}`}>
          Début
          <input
            id={`mod-debut-${service.id}`}
            name="heure_debut"
            type="time"
            required
            defaultValue={valeurs.heureDebut}
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`mod-fin-${service.id}`}>
          Fin
          <input
            id={`mod-fin-${service.id}`}
            name="heure_fin"
            type="time"
            required
            defaultValue={valeurs.heureFin}
            className={champ}
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700">
          Jours concernés
        </legend>
        <div className="flex flex-wrap gap-3">
          {JOURS_ISO.map((jour) => (
            <label
              key={jour.valeur}
              className="flex items-center gap-2 text-sm text-zinc-700"
            >
              <input
                type="checkbox"
                name="jours"
                value={jour.valeur}
                defaultChecked={valeurs.jours.includes(jour.valeur)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="first-letter:capitalize">{jour.long}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

/**
 * Un service affiché, et modifiable sur place. Le supprimer pour le recréer
 * détachait les réservations déjà prises dessus : une heure de fin corrigée
 * ne doit pas vider l'écran du jour.
 */
export function ServiceModifiable({
  restaurantId,
  service,
}: {
  restaurantId: string;
  service: Service;
}) {
  // On retient le numéro de rendu auquel le formulaire a été ouvert plutôt
  // qu'un simple booléen : l'état « ouvert » se déduit alors du résultat de
  // l'action, sans effet de bord — un enregistrement réussi le referme, un
  // échec le laisse ouvert avec son message.
  const [ouvertDepuis, setOuvertDepuis] = useState<number | null>(null);
  const initialState: ServiceState = {
    error: null,
    rendu: 0,
    valeurs: valeursDe(service),
  };
  const [state, action, pending] = useActionState(
    modifierService,
    initialState,
  );

  // Laisser le formulaire ouvert après un enregistrement réussi cacherait le
  // service mis à jour derrière ses propres champs : on ne verrait pas ce
  // qu'on vient de changer.
  const ouvert =
    ouvertDepuis !== null && !(state.rendu > ouvertDepuis && !state.error);

  if (!ouvert) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="font-medium text-zinc-900">
            {service.nom}{" "}
            <span className="font-normal text-zinc-500">
              {formatCreneau(service.heure_debut, service.heure_fin)}
            </span>
          </span>
          <span className="text-sm text-zinc-500 first-letter:capitalize">
            {formatJours(service.jours)}
          </span>
          <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
            {service.delai_heures === 0
              ? "Dernière minute acceptée"
              : `Prévenance ${service.delai_heures} h`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOuvertDepuis(state.rendu)}
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          Modifier
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé le
          remonte avec les valeurs renvoyées. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        service={service}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvertDepuis(null)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Fermer
        </button>
      </div>
    </form>
  );
}
