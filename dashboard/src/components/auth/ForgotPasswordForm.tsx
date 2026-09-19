"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetState } from "@/app/login/actions";

const initialState: ResetState = { error: null, sent: false };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.sent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Si un compte existe avec cette adresse, un e-mail vient d&apos;être
          envoyé avec un lien pour choisir un nouveau mot de passe. Pense à
          regarder dans les indésirables.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-hover disabled:opacity-50"
      >
        {pending ? "Envoi..." : "Recevoir un lien"}
      </button>

      <Link
        href="/login"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
      >
        ← Retour à la connexion
      </Link>
    </form>
  );
}
