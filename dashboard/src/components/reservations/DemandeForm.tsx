"use client";

import type { Langue } from "@/lib/i18n/langues";
import { RESERVER } from "@/lib/i18n/reserver";

import { useActionState, useState } from "react";
import {
  demanderReservation,
  type DemandeState,
} from "@/app/reserver/[slug]/actions";

const initialState: DemandeState = { error: null };

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-brand-navy";
const label = "flex flex-col gap-1 text-base font-medium text-zinc-700";

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
  langue,
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
  langue: Langue;
}) {
  const r = RESERVER[langue];
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
            : "mt-3 rounded-md border border-zinc-300 px-4 py-2 text-base font-medium text-zinc-700 transition-colors hover:border-brand-navy hover:text-brand-navy"
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
          {r.tonNom}
          <input
            id={`nom-${cle}`}
            name="client_nom"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`email-${cle}`}>
          {r.email}
          <input
            id={`email-${cle}`}
            name="client_email"
            type="email"
            required
            className={champ}
          />
        </label>
        <label className={label} htmlFor={`tel-${cle}`}>
          {r.telephone}{" "}
          <span className="font-normal text-zinc-400">{r.facultatif}</span>
          <input id={`tel-${cle}`} name="client_telephone" className={champ} />
        </label>
        <label className={label} htmlFor={`occasion-${cle}`}>
          {r.occasion}{" "}
          <span className="font-normal text-zinc-400">{r.facultatif}</span>
          <input
            id={`occasion-${cle}`}
            name="occasion"
            placeholder={r.occasionExemple}
            className={champ}
          />
        </label>
      </div>

      <label className={label} htmlFor={`message-${cle}`}>
        {r.unMotPour}{" "}
        <span className="font-normal text-zinc-400">{r.facultatif}</span>
        <textarea
          id={`message-${cle}`}
          name="message"
          rows={3}
          className={champ}
        />
      </label>

      {/* Décochée par défaut : le RGPD interdit de déduire un consentement
          commercial d'une réservation, et une case pré-cochée ne vaut pas
          consentement. */}
      <label className="flex items-start gap-2.5 text-base text-zinc-600">
        <input
          type="checkbox"
          name="accepte_communications"
          className="mt-0.5"
        />
        <span>{r.accepteActualites(restaurantNom)}</span>
      </label>

      {state.error && <p className="text-base text-red-600">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? r.envoi : r.envoyerMaDemande}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-base text-zinc-500 hover:text-zinc-900"
        >
          {r.annuler}
        </button>
      </div>

      {/* La confirmation se décide côté serveur, avec les réglages de
          l'établissement, l'heure et le type : la page publique ne les
          connaît pas et ne doit pas les deviner. On annonce donc ce qui
          est vrai dans tous les cas — un e-mail part tout de suite —,
          sauf pour la privatisation, qui passe toujours par le patron. */}
      <p className="text-sm text-zinc-400">
        {type === "privatisation" ? r.apresPrivatisation : r.apresTable}
      </p>
    </form>
  );
}
