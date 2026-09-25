"use client";

import { useActionState } from "react";
import {
  inviterMembre,
  type MembreState,
} from "@/app/dashboard/[id]/equipe/actions";
import { DESCRIPTIONS_ROLE, LIBELLES_ROLE } from "@/types/equipe";
import type { Langue } from "@/lib/i18n/langues";
import { traducteur, type T } from "@/lib/i18n/t";
import { EQUIPE } from "@/lib/i18n/pages/equipe";

const initialState: MembreState = { error: null, rendu: 0 };

const champ =
  "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-navy focus:bg-white";

/**
 * Le rôle en deux cartes plutôt qu'en liste déroulante : la liste cachait
 * la seule chose qui compte au moment de choisir — ce que la personne
 * verra, et surtout ce qu'elle ne verra pas.
 */
function Champs({ t }: { t: T }) {
  return (
    <div className="flex flex-col gap-4">
      <label
        className="flex flex-col gap-1.5 text-sm font-semibold text-ink"
        htmlFor="membre-email"
      >
        {t("Adresse e-mail")}
        <input
          id="membre-email"
          name="email"
          type="email"
          required
          placeholder={t("jean@exemple.fr")}
          className={`${champ} font-normal`}
        />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-ink">
          {t("Rôle")}
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {(["service", "gerant"] as const).map((role) => (
            <label
              key={role}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-300 has-[:checked]:border-brand-orange has-[:checked]:bg-brand-orange-soft"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  defaultChecked={role === "service"}
                  className="accent-brand-orange"
                />
                {t(LIBELLES_ROLE[role])}
              </span>
              <span className="text-xs leading-relaxed text-zinc-500">
                {t(DESCRIPTIONS_ROLE[role])}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function MembreForm({
  restaurantId,
  langue,
}: {
  restaurantId: string;
  langue: Langue;
}) {
  const t = traducteur(langue, EQUIPE);
  const [state, action, pending] = useActionState(inviterMembre, initialState);

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      {/* Voir EspaceForm : React vide le formulaire après l'action, la clé le
          remonte vierge une fois le membre ajouté. */}
      <Champs key={state.rendu} t={t} />

      {state.error && <p className="text-sm text-red-600">{t(state.error)}</p>}

      <p className="text-xs text-zinc-500">
        {t(
          "Klarr n'envoie pas encore d'e-mail : dis-lui de créer son compte sur klarr.net avec exactement cette adresse. Il retrouvera l'établissement à sa première connexion.",
        )}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? t("Ajout…") : t("Ajouter à l'équipe")}
      </button>
    </form>
  );
}
