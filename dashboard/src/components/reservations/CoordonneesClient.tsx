"use client";

import { useActionState, useState } from "react";
import {
  corrigerCoordonnees,
  renvoyerConfirmation,
} from "@/app/dashboard/[id]/reservations/actions";
import type { DecisionState } from "@/app/dashboard/[id]/reservations/actions";
import { BoutonAction } from "@/components/reservations/BoutonAction";

/**
 * Les coordonnées du client, et de quoi les corriger.
 *
 * Elles se lisent bien plus souvent qu'elles ne se corrigent : l'adresse
 * et le téléphone restent donc des liens qu'on touche pour appeler ou
 * écrire, et la correction se demande. Trois champs ouverts en
 * permanence sur chaque carte du carnet feraient d'une liste de
 * réservations un formulaire.
 *
 * Mais quand une adresse est fausse, tout le reste tombe : la
 * confirmation part dans le vide, le devis aussi. Il fallait pouvoir la
 * reprendre sans rappeler le client pour qu'il recommence sa réservation.
 */

const initial: DecisionState = { error: null };

export function CoordonneesClient({
  reservationId,
  restaurantId,
  nom,
  email,
  telephone,
  renvoyable,
}: {
  reservationId: string;
  restaurantId: string;
  nom: string;
  email: string;
  telephone: string | null;
  /**
   * Faux sur une réservation annulée, refusée ou expirée : il n'y a plus
   * rien à confirmer, et proposer de le renvoyer serait un piège.
   */
  renvoyable: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);
  // Une soumission a-t-elle eu lieu ? Sans ce drapeau, « Enregistré » ne
  // se distingue pas de l'état neuf — et le déduire dans un effet ferait
  // poser l'état pendant le rendu.
  const [tente, setTente] = useState(false);
  const [state, action, pending] = useActionState(corrigerCoordonnees, initial);

  const champ =
    "min-w-0 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none transition-colors focus:border-brand-orange";

  if (!ouvert) {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-600">
        <a
          href={`mailto:${email}`}
          className="text-brand-orange hover:underline"
        >
          {email}
        </a>
        {telephone && (
          <a href={`tel:${telephone}`} className="hover:underline">
            {telephone}
          </a>
        )}
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-900"
        >
          Corriger
        </button>
        {/* Le compagnon de la correction : une adresse rectifiée ne fait
            pas repartir ce qui est déjà parti dans le vide. C'est ici
            qu'on le rattrape, au moment où on regarde l'adresse. */}
        {renvoyable && (
          <BoutonAction
            action={renvoyerConfirmation}
            champs={{
              reservation_id: reservationId,
              restaurant_id: restaurantId,
            }}
            libelle="Renvoyer l'e-mail"
            enCours="Envoi…"
            className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-900"
          />
        )}
      </div>
    );
  }

  return (
    <form
      action={action}
      onSubmit={() => setTente(true)}
      className="flex flex-col gap-2 rounded-xl border border-line bg-brand-cream p-3"
    >
      <input type="hidden" name="reservation_id" value={reservationId} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />

      <div className="flex flex-wrap gap-2">
        <input
          name="client_nom"
          defaultValue={nom}
          aria-label="Nom du client"
          placeholder="Nom"
          className={`${champ} w-full basis-full sm:w-auto sm:flex-1 sm:basis-40`}
        />
        <input
          name="client_email"
          defaultValue={email}
          type="email"
          inputMode="email"
          aria-label="Adresse e-mail du client"
          placeholder="adresse@exemple.fr"
          className={`${champ} w-full basis-full sm:w-auto sm:flex-1 sm:basis-56`}
        />
        <input
          name="client_telephone"
          defaultValue={telephone ?? ""}
          type="tel"
          inputMode="tel"
          aria-label="Téléphone du client"
          placeholder="06 12 34 56 78"
          className={`${champ} w-full basis-full sm:w-44 sm:basis-auto`}
        />
      </div>

      {state.error && (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-ink px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Fermer
        </button>
        {/* Le formulaire ne se referme pas tout seul : refermé à l'envoi,
            il emporterait le message d'erreur d'une adresse refusée. */}
        {tente && !pending && !state.error && (
          <span className="text-xs font-medium text-emerald-700">
            Enregistré.
          </span>
        )}
        {/* Ce qui est déjà parti est parti : le dire ici évite de croire
            qu'une adresse corrigée renvoie la confirmation. */}
        <span className="text-xs text-ink-soft">
          Les e-mails déjà envoyés ne repartent pas. Un devis, lui, se
          renvoie.
        </span>
      </div>
    </form>
  );
}
