"use client";

import { useActionState, useState } from "react";
import {
  ajouterReservation,
  type SaisieState,
} from "@/app/dashboard/[id]/reservations/actions";
import {
  formatCreneau,
  SAISIE_VIDE,
  type Espace,
  type SaisieValeurs,
  type Service,
} from "@/types/reservation";

const initialState: SaisieState = {
  error: null,
  rendu: 0,
  valeurs: SAISIE_VIDE,
};

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

function Champs({
  restaurantId,
  espaces,
  services,
  valeurs,
}: {
  restaurantId: string;
  espaces: Espace[];
  services: Service[];
  valeurs: SaisieValeurs;
}) {
  const [espaceId, setEspaceId] = useState(
    valeurs.espaceId || espaces[0]?.id || "",
  );
  const espace = espaces.find((e) => e.id === espaceId);

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="saisie-nom">
          Nom du client
          <input
            id="saisie-nom"
            name="client_nom"
            required
            defaultValue={valeurs.nom}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="saisie-tel">
          Téléphone{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            id="saisie-tel"
            name="client_telephone"
            defaultValue={valeurs.telephone}
            className={champ}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label} htmlFor="saisie-date">
          Date
          <input
            id="saisie-date"
            name="date_reservation"
            type="date"
            required
            defaultValue={valeurs.date}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="saisie-couverts">
          Couverts
          <input
            id="saisie-couverts"
            name="couverts"
            type="number"
            min="1"
            required
            defaultValue={valeurs.couverts}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="saisie-service">
          Service
          <select
            id="saisie-service"
            name="service_id"
            defaultValue={valeurs.serviceId || undefined}
            className={champ}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nom} —{" "}
                {formatCreneau(service.heure_debut, service.heure_fin)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="saisie-espace">
          Espace
          <select
            id="saisie-espace"
            name="espace_id"
            value={espaceId}
            onChange={(event) => setEspaceId(event.target.value)}
            className={champ}
          >
            {espaces.map((option) => (
              <option key={option.id} value={option.id}>
                {option.nom} — {option.capacite} couverts
              </option>
            ))}
          </select>
        </label>
        <label className={label} htmlFor="saisie-type">
          Type
          <select
            id="saisie-type"
            name="type"
            defaultValue={valeurs.type}
            className={champ}
          >
            {espace?.accepte_table !== false && (
              <option value="table">Réservation individuelle</option>
            )}
            {espace?.privatisation_minimum !== null && (
              <option value="privatisation">Privatisation de l&apos;espace</option>
            )}
          </select>
        </label>
      </div>

      <label className={label} htmlFor="saisie-note">
        Note interne{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <input
          id="saisie-note"
          name="note_interne"
          defaultValue={valeurs.note}
          placeholder="Table près de la fenêtre, allergie…"
          className={champ}
        />
      </label>

      <label className="flex items-start gap-2.5 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="forcer"
          defaultChecked={valeurs.forcer}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">Forcer</span> — enregistrer même si la
          jauge est pleine. À utiliser quand tu sais que ça passe.
        </span>
      </label>
    </>
  );
}

/**
 * Saisie d'une réservation prise au téléphone. Sans elle, les jauges
 * ignorent la majorité des réservations d'un restaurant et finissent par
 * promettre deux fois la même salle.
 */
export function SaisieReservation({
  restaurantId,
  espaces,
  services,
}: {
  restaurantId: string;
  espaces: Espace[];
  services: Service[];
}) {
  const [state, action, pending] = useActionState(
    ajouterReservation,
    initialState,
  );
  const [ouvert, setOuvert] = useState(false);

  if (espaces.length === 0 || services.length === 0) return null;

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="w-fit rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        + Réservation prise au téléphone
      </button>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        Réservation prise au téléphone
      </h3>

      {/* Voir EspaceForm : la clé remonte les champs avec les valeurs que
          l'action vient de renvoyer, saisie à corriger comprise. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        espaces={espaces}
        services={services}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer la réservation"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Fermer
        </button>
      </div>
    </form>
  );
}
