"use client";

import { useActionState, useState } from "react";
import {
  demanderReservation,
  type DemandeState,
} from "@/app/reserver/[slug]/actions";

const initialState: DemandeState = { error: null };

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-sm font-medium text-zinc-700";

export function DemandeForm({
  slug,
  espaceId,
  espaceNom,
  serviceId,
  date,
  couverts,
  peutRecevoirTable,
  peutEtrePrivatise,
  restaurantNom,
}: {
  slug: string;
  espaceId: string;
  espaceNom: string;
  serviceId: string;
  date: string;
  couverts: number;
  peutRecevoirTable: boolean;
  peutEtrePrivatise: boolean;
  restaurantNom: string;
}) {
  const [state, action, pending] = useActionState(
    demanderReservation,
    initialState,
  );
  const [ouvert, setOuvert] = useState(false);
  // Quand les deux sont possibles, le client choisit ; sinon le seul type
  // possible est imposé sans lui poser une question sans réponse.
  const [type, setType] = useState(peutRecevoirTable ? "table" : "privatisation");

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mt-3 rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover"
      >
        Demander {espaceNom}
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="espace_id" value={espaceId} />
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="couverts" value={couverts} />
      <input type="hidden" name="type" value={type} />

      {peutRecevoirTable && peutEtrePrivatise && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-1 text-sm font-medium text-zinc-700">
            Que souhaites-tu ?
          </legend>
          {[
            { valeur: "table", texte: "Une table" },
            { valeur: "privatisation", texte: "Privatiser l'espace" },
          ].map((choix) => (
            <button
              key={choix.valeur}
              type="button"
              onClick={() => setType(choix.valeur)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                type === choix.valeur
                  ? "border-brand-navy bg-brand-orange-soft font-medium text-brand-navy"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}
            >
              {choix.texte}
            </button>
          ))}
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`nom-${espaceId}`}>
          Ton nom
          <input
            id={`nom-${espaceId}`}
            name="client_nom"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`email-${espaceId}`}>
          E-mail
          <input
            id={`email-${espaceId}`}
            name="client_email"
            type="email"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`tel-${espaceId}`}>
          Téléphone{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input id={`tel-${espaceId}`} name="client_telephone" className={champ} />
        </label>
        <label className={label} htmlFor={`occasion-${espaceId}`}>
          Occasion{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            id={`occasion-${espaceId}`}
            name="occasion"
            placeholder="Anniversaire, repas d'équipe…"
            className={champ}
          />
        </label>
      </div>

      <label className={label} htmlFor={`message-${espaceId}`}>
        Un mot pour l&apos;établissement{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <textarea
          id={`message-${espaceId}`}
          name="message"
          rows={3}
          className={champ}
        />
      </label>

      {/* Décochée par défaut : le RGPD interdit de déduire un consentement
          commercial d'une réservation, et une case pré-cochée ne vaut pas
          consentement. */}
      <label className="flex items-start gap-2.5 text-sm text-zinc-600">
        <input
          type="checkbox"
          name="accepte_communications"
          className="mt-0.5"
        />
        <span>
          J&apos;accepte de recevoir les actualités et offres de{" "}
          {restaurantNom} par e-mail. Je peux me désinscrire à tout moment.
        </span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Envoyer ma demande"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          Annuler
        </button>
      </div>

      <p className="text-xs text-zinc-400">
        Ta demande n&apos;est pas encore confirmée : l&apos;établissement la
        valide sous 48 h. Aucun paiement n&apos;est demandé à cette étape.
      </p>
    </form>
  );
}
