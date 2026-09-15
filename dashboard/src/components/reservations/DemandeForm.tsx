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

/**
 * Le formulaire de demande, pour un type déjà décidé.
 *
 * Le choix « table ou privatisation » ne se fait plus ici : il est fait en
 * amont, par deux boutons distincts. Un client qui veut juste dîner ne doit
 * pas avoir à lire une explication de ce qu'est une privatisation, ni à
 * choisir une salle qu'il ne connaît pas.
 */
export function DemandeForm({
  slug,
  espaceId,
  serviceId,
  heure,
  date,
  couverts,
  type,
  libelle,
  restaurantNom,
  principal = false,
}: {
  slug: string;
  espaceId: string;
  serviceId: string;
  /** L'heure d'arrivée choisie, telle que le moteur l'a proposée. */
  heure: string;
  date: string;
  couverts: number;
  type: "table" | "privatisation";
  /** Le texte du bouton fermé — c'est lui qui annonce ce qu'on demande. */
  libelle: string;
  restaurantNom: string;
  /** L'action principale du créneau : pleine, sombre, impossible à rater. */
  principal?: boolean;
}) {
  const [state, action, pending] = useActionState(
    demanderReservation,
    initialState,
  );
  const [ouvert, setOuvert] = useState(false);

  // Plusieurs formulaires cohabitent sur la page (deux salles privatisables,
  // deux services) : les identifiants des champs combinent type, salle et
  // service, sans quoi un « label for » désignerait le mauvais champ.
  // Deux créneaux du même service partagent la salle et le service : sans
  // l'heure dans la clé, les identifiants de champs se répéteraient d'un
  // horaire à l'autre sur la même page.
  const cle = `${type}-${espaceId}-${serviceId}-${heure}`;

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={
          principal
            ? "mt-3 w-full rounded-md bg-brand-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover sm:w-auto"
            : "mt-3 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
        }
      >
        {libelle}
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="espace_id" value={espaceId} />
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="heure" value={heure} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="couverts" value={couverts} />
      <input type="hidden" name="type" value={type} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label} htmlFor={`nom-${cle}`}>
          Ton nom
          <input id={`nom-${cle}`} name="client_nom" required className={champ} />
        </label>
        <label className={label} htmlFor={`email-${cle}`}>
          E-mail
          <input
            id={`email-${cle}`}
            name="client_email"
            type="email"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`tel-${cle}`}>
          Téléphone{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input id={`tel-${cle}`} name="client_telephone" className={champ} />
        </label>
        <label className={label} htmlFor={`occasion-${cle}`}>
          Occasion{" "}
          <span className="font-normal text-zinc-400">(facultatif)</span>
          <input
            id={`occasion-${cle}`}
            name="occasion"
            placeholder="Anniversaire, repas d'équipe…"
            className={champ}
          />
        </label>
      </div>

      <label className={label} htmlFor={`message-${cle}`}>
        Un mot pour l&apos;établissement{" "}
        <span className="font-normal text-zinc-400">(facultatif)</span>
        <textarea id={`message-${cle}`} name="message" rows={3} className={champ} />
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
