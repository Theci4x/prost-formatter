"use client";

import { useActionState, useState } from "react";
import type { ClesReservations } from "@/lib/i18n/reservations";
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
  r,
  valeurs,
}: {
  restaurantId: string;
  espaces: Espace[];
  services: Service[];
  r: ClesReservations;
  valeurs: SaisieValeurs;
}) {
  // Le type commande le reste : une réservation ordinaire n'a pas à choisir
  // sa salle — c'est le travail de Klarr de la placer. Seule une
  // privatisation désigne un espace, puisqu'elle le prend en entier.
  const privatisables = espaces.filter(
    (espace) => espace.privatisation_minimum !== null,
  );
  const ordinaires = espaces.filter((espace) => espace.accepte_table);
  const [type, setType] = useState<"table" | "privatisation">(
    ordinaires.length > 0 ? valeurs.type : "privatisation",
  );

  return (
    <>
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className={label} htmlFor="saisie-nom">
          {r.champNom}
          <input
            id="saisie-nom"
            name="client_nom"
            required
            defaultValue={valeurs.nom}
            className={champ}
          />
        </label>
        {/* Demandée au téléphone, au même titre que le nom. C'est elle qui
            porte la confirmation, le rappel de la veille et le lien pour
            rendre la table : sans elle, la réservation est muette. */}
        <label className={label} htmlFor="saisie-email">
          {r.champEmail}
          <input
            id="saisie-email"
            name="client_email"
            type="email"
            required
            defaultValue={valeurs.email}
            placeholder={r.placeholderEmailClient}
            className={champ}
          />
        </label>
        <label className={label} htmlFor="saisie-tel">
          {/* Un seul élément de colonne : `label` est un flex-col, et deux
              nœuds frères y passeraient l'un sous l'autre — le champ se
              retrouverait décalé d'une ligne par rapport à ses voisins. */}
          <span>
            Téléphone{" "}
            <span className="font-normal text-zinc-400">(facultatif)</span>
          </span>
          <input
            id="saisie-tel"
            name="client_telephone"
            defaultValue={valeurs.telephone}
            className={champ}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className={label} htmlFor="saisie-date">
          {r.champDate}
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
          {r.champCouverts}
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
          {r.champService}
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
        {/* L'heure d'arrivée : c'est elle qui décide contre quelles autres
            tables celle-ci se compare. Laissée vide, elle retombe sur
            l'ouverture du service — au téléphone, on la note souvent après
            coup, et bloquer la saisie pour si peu serait pénible. */}
        <label className={label} htmlFor="saisie-heure">
          Heure d&apos;arrivée
          <input
            id="saisie-heure"
            name="heure"
            type="time"
            step={900}
            defaultValue={valeurs.heure}
            className={champ}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor="saisie-type">
          {r.champType}
          <select
            id="saisie-type"
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as "table" | "privatisation")
            }
            className={champ}
          >
            {ordinaires.length > 0 && (
              <option value="table">{r.typeTable}</option>
            )}
            {privatisables.length > 0 && (
              <option value="privatisation">{r.typePrivatisation}</option>
            )}
          </select>
        </label>

        {type === "privatisation" ? (
          <label className={label} htmlFor="saisie-espace">
            {r.champEspace}
            <select
              id="saisie-espace"
              name="espace_id"
              defaultValue={valeurs.espaceId}
              className={champ}
            >
              {privatisables.map((option) => (
                <option key={option.id} value={option.id}>
                  {r.espaceOption(option.nom, option.capacite)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          // Espace laissé vide : l'action place la réservation dans la
          // première salle qui accepte les tables et qui a la place.
          <input type="hidden" name="espace_id" value="" />
        )}
      </div>

      <label className={label} htmlFor="saisie-note">
        <span>
          {r.noteInterne}{" "}
          <span className="font-normal text-zinc-400">{r.facultatif}</span>
        </span>
        <input
          id="saisie-note"
          name="note_interne"
          defaultValue={valeurs.note}
          placeholder={r.placeholderNoteSaisie}
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
  r,
}: {
  restaurantId: string;
  espaces: Espace[];
  services: Service[];
  r: ClesReservations;
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
        {r.saisieOuvrir}
      </button>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-zinc-900">{r.saisieTitre}</h3>

      {/* Voir EspaceForm : la clé remonte les champs avec les valeurs que
          l'action vient de renvoyer, saisie à corriger comprise. */}
      <Champs
        key={state.rendu}
        restaurantId={restaurantId}
        espaces={espaces}
        services={services}
        r={r}
        valeurs={state.valeurs}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? r.enCours.enregistrement : r.enregistrerReservation}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          {r.fermer}
        </button>
      </div>
    </form>
  );
}
