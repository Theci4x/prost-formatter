"use client";

import type { Langue } from "@/lib/i18n/langues";
import { AUTH } from "@/lib/i18n/authentification";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup, type AuthState } from "@/app/login/actions";

const initialState: AuthState = { error: null };

/**
 * @param emailInitial L'adresse déjà connue, quand on arrive d'ailleurs —
 *   du test de présence, par exemple. Un prospect qui vient de laisser son
 *   adresse deux écrans plus tôt et à qui on la redemande se dit qu'on ne
 *   l'a pas écouté, et la moitié abandonne là.
 */
export function LoginForm({
  emailInitial,
  langue,
  suite,
}: {
  emailInitial?: string;
  langue: Langue;
  /** Le chemin où revenir une fois connecté, déjà vérifié par la page. */
  suite?: string;
}) {
  const t = AUTH[langue];
  const [loginState, loginAction, loginPending] = useActionState(
    login,
    initialState,
  );
  const [signupState, signupAction, signupPending] = useActionState(
    signup,
    initialState,
  );

  const error = loginState.error ?? signupState.error;

  return (
    <form className="flex w-full max-w-sm flex-col gap-4">
      {suite && <input type="hidden" name="suite" value={suite} />}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={emailInitial}
          autoComplete="email"
          className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          {t.motDePasse}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="rounded-lg border border-line bg-paper px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand-orange"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Link
        href="/mot-de-passe-oublie"
        className="w-fit text-sm text-zinc-500 hover:text-zinc-900"
      >
        {t.oublie}
      </Link>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <button
          formAction={loginAction}
          disabled={loginPending || signupPending}
          className="flex-1 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy disabled:opacity-50"
        >
          {loginPending ? t.connexionEnCours : t.seConnecter}
        </button>
        <button
          formAction={signupAction}
          disabled={loginPending || signupPending}
          className="flex-1 rounded-lg border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
        >
          {signupPending ? t.inscriptionEnCours : t.creerCompte}
        </button>
      </div>
    </form>
  );
}
