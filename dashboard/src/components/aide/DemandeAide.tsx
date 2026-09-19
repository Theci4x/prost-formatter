"use client";

import { useActionState } from "react";
import { usePathname } from "next/navigation";
import {
  envoyerDemandeAide,
  type DemandeAideState,
} from "@/app/aide/actions";

const initial: DemandeAideState = { status: "idle" };

const ERREURS: Record<string, string> = {
  missing: "Écrivez d'abord votre question.",
  email: "Il nous faut une adresse pour vous répondre.",
  trop: "Vous avez déjà écrit plusieurs fois aujourd'hui. Nous vous répondons.",
  generic: "L'envoi a échoué. Écrivez-nous à contact@klarr.net.",
};

/**
 * Le formulaire d'aide. Il joint l'écran d'où il part, pour ne pas avoir
 * à demander « vous étiez où ? » dans la réponse.
 */
export function DemandeAide({ connecte }: { connecte: boolean }) {
  const [state, action, pending] = useActionState(envoyerDemandeAide, initial);
  // Lu côté serveur comme côté client : `window.location` pendant le
  // rendu ferait diverger l'hydratation.
  const ecran = usePathname();

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6">
        <p className="text-sm font-medium text-emerald-900">
          C&apos;est envoyé.
        </p>
        <p className="mt-1 text-sm text-emerald-800">
          Nous répondons dans la journée, à l&apos;adresse de votre compte.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm"
    >
      <input
        type="hidden"
        name="ecran"
        value={ecran}
      />

      {!connecte && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">
            Votre adresse e-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-zinc-700">
          Votre question
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Ce que vous cherchez à faire, et ce qui bloque."
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">
          {ERREURS[state.error ?? "generic"]}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Envoi…" : "Écrire à Klarr"}
      </button>
    </form>
  );
}
