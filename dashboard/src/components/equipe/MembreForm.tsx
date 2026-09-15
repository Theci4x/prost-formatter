"use client";

import { useActionState } from "react";
import {
  inviterMembre,
  type MembreState,
} from "@/app/dashboard/[id]/equipe/actions";
import { DESCRIPTIONS_ROLE } from "@/types/equipe";

const initialState: MembreState = { error: null, rendu: 0 };

const champ =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy";

function Champs() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label
        className="flex flex-col gap-1 text-sm font-medium text-zinc-700"
        htmlFor="membre-email"
      >
        Adresse e-mail
        <input
          id="membre-email"
          name="email"
          type="email"
          required
          placeholder="jean@exemple.fr"
          className={champ}
        />
      </label>
      <label
        className="flex flex-col gap-1 text-sm font-medium text-zinc-700"
        htmlFor="membre-role"
      >
        Rôle
        <select
          id="membre-role"
          name="role"
          defaultValue="service"
          className={champ}
        >
          <option value="service">Service — {DESCRIPTIONS_ROLE.service}</option>
          <option value="gerant">Gérant — {DESCRIPTIONS_ROLE.gerant}</option>
        </select>
      </label>
    </div>
  );
}

export function MembreForm({ restaurantId }: { restaurantId: string }) {
  const [state, action, pending] = useActionState(inviterMembre, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé le
          remonte vierge une fois le membre ajouté. */}
      <Champs key={state.rendu} />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <p className="text-xs text-zinc-500">
        Klarr n&apos;envoie pas encore d&apos;e-mail : dis-lui de créer son
        compte sur klarr.net avec exactement cette adresse. Il retrouvera
        l&apos;établissement à sa première connexion.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Ajout…" : "Ajouter à l'équipe"}
      </button>
    </form>
  );
}
