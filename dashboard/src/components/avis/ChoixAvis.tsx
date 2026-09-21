"use client";

import { useActionState, useState } from "react";
import { envoyerRetour, type RetourState } from "@/app/avis/[slug]/actions";
import type { Langue } from "@/lib/i18n/langues";
import { AVIS } from "@/lib/i18n/avis";

const initial: RetourState = { error: null, envoye: false };

/**
 * Les deux chemins, à égalité.
 *
 * Même taille, même poids, même rang — et surtout, aucune note demandée
 * avant. On n'oriente personne : le client sait mieux que nous s'il a
 * quelque chose à dire en public ou en privé, et celui qui a passé une
 * mauvaise soirée choisit de lui-même le canal où il sera lu.
 */
export function ChoixAvis({
  slug,
  nom,
  lienGoogle,
  langue,
}: {
  slug: string;
  nom: string;
  lienGoogle: string | null;
  langue: Langue;
}) {
  const a = AVIS[langue];
  const [ouvert, setOuvert] = useState(false);
  const [state, action, pending] = useActionState(envoyerRetour, initial);

  if (state.envoye) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-base font-medium text-emerald-900">
          {a.messageTransmis}
        </p>
        <p className="text-sm text-emerald-800">{a.messageLu(nom)}</p>
      </div>
    );
  }

  if (ouvert) {
    return (
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="slug" value={slug} />

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          {a.ceQueVousAvezADire}
          <textarea
            name="message"
            rows={5}
            autoFocus
            placeholder={a.exemplesRetour}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-base font-normal outline-none focus:border-brand-navy"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          {a.emailOuTelephone}{" "}
          <span className="font-normal text-zinc-400">{a.facultatif}</span>
          <input
            name="contact"
            className="rounded-xl border border-zinc-300 px-4 py-3 text-base font-normal outline-none focus:border-brand-navy"
          />
          <span className="text-xs font-normal text-zinc-500">
            {a.seulementSiReponse}
          </span>
        </label>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-brand-navy px-5 py-3.5 text-base font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
        >
          {pending ? a.envoi : a.envoyer}
        </button>

        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="text-sm text-zinc-500 underline underline-offset-2"
        >
          {a.retour}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {lienGoogle && (
        <a
          href={lienGoogle}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-center text-base font-medium text-zinc-900 transition-colors hover:border-brand-navy hover:text-brand-navy"
        >
          {a.laisserUnAvisGoogle}
        </a>
      )}

      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-center text-base font-medium text-zinc-900 transition-colors hover:border-brand-navy hover:text-brand-navy"
      >
        {a.direEnPrive}
      </button>
    </div>
  );
}
